import Job from "../models/Job.js";
import mongoose from "mongoose";
import { formatJobForResponse, formatDate } from "../utils/formatJob.js";

const safeUserId = (id) => {
  if (!id || typeof id !== "string") return null;
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
};

// Get all jobs for authenticated user
export const getAllJobs = async (req, res) => {
  try {
    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: "Invalid or missing user context" });
    }

    const jobs = await Job.find({ user: userId })
      .sort({ dateApplied: -1, createdAt: -1 })
      .lean();

    const formattedJobs = jobs.map((job) => formatJobForResponse(job));
    res.json(formattedJobs);
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get job stats
export const getStats = async (req, res) => {
  try {
    const userIdStr = safeUserId(req.user?.id);
    if (!userIdStr) {
      return res.status(401).json({ error: "Invalid or missing user context" });
    }
    const userId = new mongoose.Types.ObjectId(userIdStr);

    // Total count
    const total = await Job.countDocuments({ user: userId });

    // Count by status using aggregation
    const byStatusResult = await Job.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const byStatus = byStatusResult.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Recent jobs (last 5)
    const recentJobs = await Job.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const recent = recentJobs.map((job) => formatJobForResponse(job));

    // Weekly stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyResult = await Job.aggregate([
      {
        $match: {
          user: userId,
          dateApplied: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$dateApplied" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const weekly = weeklyResult.map((item) => ({
      date: item._id,
      count: item.count,
    }));

    // Interviews scheduled: Count applications that have an interview scheduled
    // Count if ANY of the following is true:
    // 1. status === "interview"
    // 2. interviewDate exists AND is in the future
    // 3. interviewRounds has at least one round with status === "scheduled"
    const now = new Date();

    // Get unique job IDs that match any condition to avoid double counting
    const uniqueJobIds = new Set();

    // Get jobs with interview status
    const interviewStatusJobs = await Job.find({
      user: userId,
      status: "interview",
    })
      .select("_id")
      .lean();
    interviewStatusJobs.forEach((job) => uniqueJobIds.add(job._id.toString()));

    // Get jobs with future interview date
    const futureDateJobs = await Job.find({
      user: userId,
      interviewDate: { $ne: null, $gte: now },
    })
      .select("_id")
      .lean();
    futureDateJobs.forEach((job) => uniqueJobIds.add(job._id.toString()));

    // Get jobs with scheduled rounds using aggregation
    const scheduledRoundsJobs = await Job.aggregate([
      { $match: { user: userId } },
      {
        $addFields: {
          hasScheduledRound: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: { $ifNull: ["$interviewRounds", []] },
                    as: "round",
                    cond: { $eq: ["$$round.status", "scheduled"] },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          hasScheduledRound: true,
        },
      },
      { $project: { _id: 1 } },
    ]);
    scheduledRoundsJobs.forEach((job) =>
      uniqueJobIds.add(job._id.toString()),
    );

    const interviewsScheduled = uniqueJobIds.size;

    // Upcoming interviews (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingInterviews = await Job.find({
      user: userId,
      interviewDate: { $gte: now, $lte: sevenDaysFromNow },
    })
      .sort({ interviewDate: 1 })
      .limit(10)
      .lean();

    const upcoming = upcomingInterviews
      .filter((job) => job.interviewDate)
      .map((job) => ({
        id: job._id.toString(),
        company: job.company,
        position: job.position,
        interview_date: formatDate(job.interviewDate),
      }));

    // Calculate conversion rates
    const appliedCount = byStatus.applied || 0;
    const interviewCount = byStatus.interview || 0;
    const offerCount = byStatus.offer || 0;
    const onlineTestCount = byStatus.online_test || 0;
    const rejectedCount = byStatus.rejected || 0;
    const withdrawnCount = byStatus.withdrawn || 0;

    // Interview Conversion Rate Calculation:
    // Count unique job applications that reached at least the "Interview" stage
    // Statuses that count as "interview-converted": ["interview", "offer", "rejected"]
    // Statuses that do NOT count: ["applied", "online_test", "withdrawn"]
    const interviewConvertedStatuses = ["interview", "offer", "rejected"];
    const jobsReachedInterviewStage = await Job.countDocuments({
      user: userId,
      status: { $in: interviewConvertedStatuses },
    });

    // Total number of job applications (excluding withdrawn applications)
    // This represents all applications that were actually submitted
    const totalApplicationsExcludingWithdrawn = total - withdrawnCount;

    // Calculate interview conversion rate as percentage
    // Formula: (Jobs that reached interview stage / Total applications) × 100
    // Handle division-by-zero safely (return 0% if total applications = 0)
    const interviewConversionRate =
      totalApplicationsExcludingWithdrawn > 0
        ? parseFloat(
            (
              (jobsReachedInterviewStage /
                totalApplicationsExcludingWithdrawn) *
              100
            ).toFixed(1)
          )
        : 0.0;

    const offerRatio = total > 0 ? ((offerCount / total) * 100).toFixed(1) : 0;

    // Applications per week (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const weeklyApplications = await Job.aggregate([
      {
        $match: {
          user: userId,
          dateApplied: { $gte: fourWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-W%V", date: "$dateApplied" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 4 },
    ]);

    const applicationsPerWeek = weeklyApplications.map((item) => ({
      week: item._id,
      count: item.count,
    }));

    res.json({
      total,
      byStatus,
      recent,
      weekly,
      interviewsScheduled,
      upcomingInterviews: upcoming,
      interviewConversionRate: parseFloat(interviewConversionRate),
      offerRatio: parseFloat(offerRatio),
      applicationsPerWeek,
    });
  } catch (error) {
    console.error("Get stats error:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single job
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: "Invalid or missing user context" });
    }

    const job = await Job.findOne({ _id: id, user: userId }).lean();

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(formatJobForResponse(job));
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create job
export const createJob = async (req, res) => {
  try {
    const {
      company,
      position,
      location,
      status,
      application_type,
      date_applied,
      interview_date,
      application_source,
      notes,
      resume_link,
      portfolio_link,
      interview_rounds,
      interview_questions,
      preparation_notes,
      interview_difficulty,
      interview_status,
    } = req.body;

    // Log incoming request for debugging
    console.log("CreateJob: Received request:", {
      company,
      position,
      status,
      date_applied,
      application_type,
    });

    // Validate required fields
    if (!company || !company.trim()) {
      return res
        .status(400)
        .json({ error: "Company name is required" });
    }
    if (!position || !position.trim()) {
      return res
        .status(400)
        .json({ error: "Position/job role is required" });
    }
    if (!date_applied) {
      return res
        .status(400)
        .json({ error: "Date applied is required" });
    }

    // Validate status against enum (if provided)
    const validStatuses = [
      "applied",
      "online_test",
      "interview",
      "offer",
      "rejected",
      "withdrawn",
    ];
    if (status && !validStatuses.includes(status)) {
      console.error("CreateJob: Invalid status value:", status);
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Filter out empty questions (questions with no text)
    const filteredQuestions = (interview_questions || [])
      .filter((q) => q && q.question && q.question.trim())
      .map((q) => ({
        question: q.question.trim(),
        notes_or_answer: q.notes_or_answer ?? q.answer ?? null,
        round: q.round || null,
      }));

    // Prepare job data with trimmed strings
    const jobData = {
      user: req.user.id,
      company: company.trim(),
      position: position.trim(),
      location: location ? location.trim() : null,
      status: status || "applied",
      applicationType: application_type || "off_campus",
      dateApplied: new Date(date_applied),
      interviewDate: interview_date ? new Date(interview_date) : null,
      applicationSource: application_source ? application_source.trim() : null,
      notes: notes ? notes.trim() : null,
      resumeLink: resume_link ? resume_link.trim() : null,
      portfolioLink: portfolio_link ? portfolio_link.trim() : null,
      interviewRounds: interview_rounds || [],
      interviewQuestions: filteredQuestions,
      preparationNotes: preparation_notes
        ? preparation_notes.trim()
        : null,
      interviewDifficulty: interview_difficulty || null,
      interviewStatus: interview_status || "pending",
    };

    console.log("CreateJob: Creating job with data:", {
      ...jobData,
      user: "[REDACTED]",
    });

    const job = await Job.create(jobData);

    console.log("CreateJob: Job created successfully:", job._id.toString());
    res.status(201).json(formatJobForResponse(job));
  } catch (error) {
    console.error("CreateJob: Error creating job:", {
      error: error.message,
      name: error.name,
      stack: error.stack,
      validationErrors: error.errors,
    });

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors || {}).map(
        (err) => err.message,
      );
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors.join(", "),
      });
    }

    // Handle duplicate key errors or other MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate entry. This job may already exist.",
      });
    }

    // Generic error response
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company,
      position,
      location,
      status,
      application_type,
      date_applied,
      interview_date,
      application_source,
      notes,
      resume_link,
      portfolio_link,
      interview_rounds,
      interview_questions,
      preparation_notes,
      interview_difficulty,
      interview_status,
    } = req.body;

    if (!company || !position || !date_applied) {
      return res
        .status(400)
        .json({ error: "Company, position, and date_applied are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    // Filter out empty questions (questions with no text)
    const filteredQuestions = (interview_questions || [])
      .filter((q) => q && q.question && q.question.trim())
      .map((q) => ({
        question: q.question.trim(),
        notes_or_answer: q.notes_or_answer ?? q.answer ?? null,
        round: q.round || null,
      }));

    const updateData = {
      company,
      position,
      location: location || null,
      status,
      applicationType: application_type || "off_campus",
      dateApplied: new Date(date_applied),
      interviewDate: interview_date ? new Date(interview_date) : null,
      applicationSource: application_source || null,
      notes: notes || null,
      resumeLink: resume_link || null,
      portfolioLink: portfolio_link || null,
      interviewRounds: interview_rounds || [],
      interviewQuestions: filteredQuestions,
      preparationNotes: preparation_notes || null,
      interviewDifficulty: interview_difficulty || null,
      interviewStatus: interview_status || "pending",
    };

    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: "Invalid or missing user context" });
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true, runValidators: true },
    ).lean();

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(formatJobForResponse(job));
  } catch (error) {
    console.error("Update job error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: "Invalid or missing user context" });
    }

    const job = await Job.findOneAndDelete({ _id: id, user: userId });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
