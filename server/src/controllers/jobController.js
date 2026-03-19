import Job from '../models/Job.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { createWorker } from 'tesseract.js';
import { formatJobForResponse, formatDate } from '../utils/formatJob.js';

const safeUserId = (id) => {
  if (!id || typeof id !== 'string') return null;
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
};

// Get all jobs for authenticated user
export const getAllJobs = async (req, res) => {
  try {
    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const jobs = await Job.find({ user: userId })
      .sort({ dateApplied: -1, createdAt: -1 })
      .lean();

    const formattedJobs = jobs.map((job) => formatJobForResponse(job));
    res.json(formattedJobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get captured jobs (screenshot-based) for authenticated user
export const getCapturedJobs = async (req, res) => {
  try {
    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const jobs = await Job.find({ user: userId, isCaptured: true })
      .sort({ dateApplied: -1, createdAt: -1 })
      .lean();

    const formattedJobs = jobs.map((job) => formatJobForResponse(job));
    res.json(formattedJobs);
  } catch (error) {
    console.error('Get captured jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get job stats
export const getStats = async (req, res) => {
  try {
    const userIdStr = safeUserId(req.user?.id);
    if (!userIdStr) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }
    const userId = new mongoose.Types.ObjectId(userIdStr);

    // Total count
    const total = await Job.countDocuments({ user: userId });

    // Count by status using aggregation
    const byStatusResult = await Job.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
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
            $dateToString: { format: '%Y-%m-%d', date: '$dateApplied' },
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
      status: 'interview',
    })
      .select('_id')
      .lean();
    interviewStatusJobs.forEach((job) => uniqueJobIds.add(job._id.toString()));

    // Get jobs with future interview date
    const futureDateJobs = await Job.find({
      user: userId,
      interviewDate: { $ne: null, $gte: now },
    })
      .select('_id')
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
                    input: { $ifNull: ['$interviewRounds', []] },
                    as: 'round',
                    cond: { $eq: ['$$round.status', 'scheduled'] },
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
    scheduledRoundsJobs.forEach((job) => uniqueJobIds.add(job._id.toString()));

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
    const interviewConvertedStatuses = ['interview', 'offer', 'rejected'];
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
            ).toFixed(1),
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
            $dateToString: { format: '%Y-W%V', date: '$dateApplied' },
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
    console.error('Get stats error:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get single job
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const job = await Job.findOne({ _id: id, user: userId }).lean();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(formatJobForResponse(job));
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      job_url,
    } = req.body;

    // Log incoming request for debugging
    console.log('CreateJob: Received request:', {
      company,
      position,
      status,
      date_applied,
      application_type,
    });

    // Validate required fields
    if (!company || !company.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!position || !position.trim()) {
      return res.status(400).json({ error: 'Position/job role is required' });
    }
    if (!date_applied) {
      return res.status(400).json({ error: 'Date applied is required' });
    }

    // Validate status against enum (if provided)
    const validStatuses = [
      'applied',
      'online_test',
      'interview',
      'offer',
      'rejected',
      'withdrawn',
    ];
    if (status && !validStatuses.includes(status)) {
      console.error('CreateJob: Invalid status value:', status);
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
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
      status: status || 'applied',
      applicationType: application_type || 'off_campus',
      dateApplied: new Date(date_applied),
      interviewDate: interview_date ? new Date(interview_date) : null,
      applicationSource: application_source ? application_source.trim() : null,
      notes: notes ? notes.trim() : null,
      resumeLink: resume_link ? resume_link.trim() : null,
      portfolioLink: portfolio_link ? portfolio_link.trim() : null,
      interviewRounds: interview_rounds || [],
      interviewQuestions: filteredQuestions,
      preparationNotes: preparation_notes ? preparation_notes.trim() : null,
      interviewDifficulty: interview_difficulty || null,
      interviewStatus: interview_status || 'pending',
      jobUrl: job_url ? job_url.trim() : null,
      isCaptured: false,
    };

    console.log('CreateJob: Creating job with data:', {
      ...jobData,
      user: '[REDACTED]',
    });

    const job = await Job.create(jobData);

    console.log('CreateJob: Job created successfully:', job._id.toString());
    res.status(201).json(formatJobForResponse(job));
  } catch (error) {
    console.error('CreateJob: Error creating job:', {
      error: error.message,
      name: error.name,
      stack: error.stack,
      validationErrors: error.errors,
    });

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map(
        (err) => err.message,
      );
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors.join(', '),
      });
    }

    // Handle duplicate key errors or other MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate entry. This job may already exist.',
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Capture job from browser extension (Smart Job Capture System)
export const captureJob = async (req, res) => {
  try {
    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const {
      jobTitle,
      company,
      location,
      salary,
      description,
      jobUrl,
      companyLogo,
      notes,
      source,
      screenshot,
    } = req.body || {};

    if (!company || !company.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!jobTitle || !jobTitle.trim()) {
      return res.status(400).json({ error: 'Job title is required' });
    }

    // Duplicate detection:
    // 1. Prefer exact match on jobUrl
    // 2. Fallback to same company + position + optional location
    let existingJob = null;
    if (jobUrl && jobUrl.trim()) {
      existingJob = await Job.findOne({
        user: userId,
        jobUrl: jobUrl.trim(),
      }).lean();
    }

    if (!existingJob) {
      const query = {
        user: userId,
        company: company.trim(),
        position: jobTitle.trim(),
      };
      if (location && location.trim()) {
        query.location = location.trim();
      }
      existingJob = await Job.findOne(query).lean();
    }

    if (existingJob) {
      return res.status(200).json({
        duplicated: true,
        message: 'This job already exists in your HustleMap.',
        job: formatJobForResponse(existingJob),
      });
    }

    const now = new Date();

    const jobData = {
      user: userId,
      company: company.trim(),
      position: jobTitle.trim(),
      location: location ? location.trim() : null,
      status: 'saved',
      applicationType: 'off_campus',
      dateApplied: now,
      interviewDate: null,
      applicationSource: source || (jobUrl ? new URL(jobUrl).hostname : null),
      notes: notes
        ? notes.trim()
        : description
          ? description.slice(0, 2000)
          : null,
      resumeLink: null,
      portfolioLink: null,
      interviewRounds: [],
      interviewQuestions: [],
      preparationNotes: null,
      interviewDifficulty: null,
      interviewStatus: 'pending',
      jobUrl: jobUrl ? jobUrl.trim() : null,
      salary: salary ? salary.trim() : null,
      companyLogo: companyLogo ? companyLogo.trim() : null,
      screenshot:
        screenshot && typeof screenshot === 'string' ? screenshot : null,
    };

    const created = await Job.create(jobData);
    return res.status(201).json({
      duplicated: false,
      job: formatJobForResponse(created),
    });
  } catch (error) {
    console.error('CaptureJob error:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Extension screenshot save: userId + screenshot + jobUrl + timestamp (no auth)
export const saveScreenshotFromExtension = async (req, res) => {
  try {
    const { userId, screenshotBase64, jobUrl, timestamp } = req.body || {};

    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const uid = userId.trim();
    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!screenshotBase64 || typeof screenshotBase64 !== 'string') {
      return res.status(400).json({ error: 'Screenshot data is required' });
    }

    const dateApplied = timestamp ? new Date(timestamp) : new Date();
    const applicationSource = jobUrl
      ? (() => {
          try {
            return new URL(jobUrl).hostname;
          } catch {
            return null;
          }
        })()
      : null;

    const jobData = {
      user: uid,
      company: 'Captured',
      position: 'Job capture',
      location: null,
      status: 'saved',
      applicationType: 'off_campus',
      dateApplied,
      interviewDate: null,
      applicationSource,
      notes: null,
      resumeLink: null,
      portfolioLink: null,
      interviewRounds: [],
      interviewQuestions: [],
      preparationNotes: null,
      interviewDifficulty: null,
      interviewStatus: 'pending',
      jobUrl: jobUrl && typeof jobUrl === 'string' ? jobUrl.trim() : null,
      salary: null,
      companyLogo: null,
      screenshot: screenshotBase64,
      isCaptured: true,
    };

    const created = await Job.create(jobData);
    return res.status(201).json({
      job: formatJobForResponse(created),
      message: 'Screenshot saved.',
    });
  } catch (error) {
    console.error('Save screenshot (extension) error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Minimal save endpoint for simple Chrome extension:
// accepts { userId, screenshot, jobUrl } and creates a basic "saved" job.
export const saveSimpleExtensionJob = async (req, res) => {
  try {
    const { userId, screenshot, jobUrl } = req.body || {};

    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const uid = userId.trim();
    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!screenshot || typeof screenshot !== 'string') {
      return res.status(400).json({ error: 'Screenshot is required' });
    }

    const now = new Date();

    let applicationSource = null;
    let normalizedJobUrl = null;
    if (jobUrl && typeof jobUrl === 'string' && jobUrl.trim()) {
      normalizedJobUrl = jobUrl.trim();
      try {
        const urlObj = new URL(normalizedJobUrl);
        applicationSource = urlObj.hostname || null;
      } catch {
        applicationSource = null;
      }
    }

    const jobData = {
      user: uid,
      company: 'Captured Job',
      position: 'Saved from extension',
      location: null,
      status: 'saved',
      applicationType: 'off_campus',
      dateApplied: now,
      interviewDate: null,
      applicationSource,
      notes: null,
      resumeLink: null,
      portfolioLink: null,
      interviewRounds: [],
      interviewQuestions: [],
      preparationNotes: null,
      interviewDifficulty: null,
      interviewStatus: 'pending',
      jobUrl: normalizedJobUrl,
      salary: null,
      companyLogo: null,
      screenshot,
      isCaptured: true,
    };

    const created = await Job.create(jobData);

    return res.status(201).json({
      message: 'Job saved from extension',
      job: formatJobForResponse(created),
    });
  } catch (error) {
    console.error('saveSimpleExtensionJob error:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Extension screenshot save with structured job data (no auth; uses userId in body)
export const saveScreenshotJob = async (req, res) => {
  try {
    console.log("Incoming request to /api/jobs/screenshot:", {
      userId: req.body?.userId || req.body?.extensionId,
      hasScreenshot: !!req.body?.screenshotBase64,
      jobUrl: req.body?.jobUrl,
      source: req.body?.source,
      company: req.body?.company,
      position: req.body?.position
    });

    const {
      userId,
      extensionId,
      company,
      position,
      location,
      jobUrl,
      screenshotBase64,
      timestamp,
      source,
    } = req.body || {};

    // Backward compatible: accept either userId (preferred) or extensionId.
    let uid = null;
    if (userId && typeof userId === 'string' && userId.trim()) {
      const candidate = userId.trim();
      if (!mongoose.Types.ObjectId.isValid(candidate)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }
      uid = candidate;
    } else if (extensionId && typeof extensionId === 'string' && extensionId.trim()) {
      const user = await User.findOne({ extensionId: extensionId.trim() })
        .select('_id')
        .lean();
      if (!user?._id) {
        return res.status(404).json({ error: 'User not found for extensionId' });
      }
      uid = user._id.toString();
    } else {
      return res
        .status(400)
        .json({ error: 'Missing required fields: userId (or extensionId)' });
    }

    if (!screenshotBase64 || typeof screenshotBase64 !== 'string') {
      return res
        .status(400)
        .json({ error: 'Missing required fields: screenshotBase64' });
    }

    // timestamp can be a number (ms) or ISO string; Date handles both.
    const dateApplied = timestamp ? new Date(timestamp) : new Date();

    const normalizedSource =
      typeof source === 'string' && source.trim()
        ? source.trim().toLowerCase()
        : (() => {
            if (jobUrl) {
              try {
                const host = new URL(jobUrl).hostname || '';
                if (host.includes('linkedin.com')) return 'linkedin';
                if (host.includes('indeed.com')) return 'indeed';
                if (host.includes('glassdoor.com')) return 'glassdoor';
              } catch {
                // ignore URL parse errors
              }
            }
            return 'other';
          })();

    const job = await Job.create({
      user: uid,
      company: company && company.trim() ? company.trim() : 'Captured',
      position: position && position.trim() ? position.trim() : 'Job Capture',
      location: location && location.trim() ? location.trim() : '',
      status: 'saved',
      applicationType: 'off_campus',
      dateApplied,
      interviewDate: null,
      applicationSource: normalizedSource,
      notes: null,
      resumeLink: null,
      portfolioLink: null,
      interviewRounds: [],
      interviewQuestions: [],
      preparationNotes: null,
      interviewDifficulty: null,
      interviewStatus: 'pending',
      jobUrl: jobUrl && typeof jobUrl === 'string' ? jobUrl.trim() : '',
      salary: null,
      companyLogo: null,
      screenshot: screenshotBase64,
      isCaptured: true,
    });

    return res.status(201).json({
      message: 'Screenshot job saved successfully',
      job: formatJobForResponse(job),
    });
  } catch (error) {
    console.error('saveScreenshotJob error:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Save from extension with DOM extraction or OCR fallback
export const saveFromExtension = async (req, res) => {
  try {
    const {
      extensionId,
      screenshot,
      source,
      url,
      jobTitle,
      company,
      location,
      description,
    } = req.body;

    if (!extensionId) {
      return res.status(400).json({ error: 'Extension ID required' });
    }

    let user = null;
    const cleanId = extensionId.trim();
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      user = await User.findById(cleanId);
    }
    if (!user) {
      user = await User.findOne({ extensionId: cleanId });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let jobData = {};

    if (jobTitle || company) {
      // Use provided extracted data
      jobData = {
        position: jobTitle || 'Captured Job',
        company: company || 'Unknown Company',
        location: location || '',
        description: description || '',
        applicationSource: source || 'other',
        jobUrl: url,
        screenshot: screenshot || null,
      };
    } else if (screenshot) {
      // Fallback to OCR
      if (!screenshot) {
        return res
          .status(400)
          .json({ error: 'Screenshot required for OCR fallback' });
      }

      // Validate screenshot size
      const screenshotSize = Buffer.from(screenshot, 'base64').length;
      if (screenshotSize > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Screenshot too large' });
      }

      // Auto-detect source
      let detectedSource = source;
      if (!detectedSource && url) {
        if (url.includes('linkedin')) detectedSource = 'linkedin';
        else if (url.includes('indeed')) detectedSource = 'indeed';
        else if (url.includes('glassdoor')) detectedSource = 'glassdoor';
      }

      // OCR the screenshot with fallback
      try {
        const worker = await createWorker('eng');
        const {
          data: { text },
        } = await worker.recognize(screenshot);
        await worker.terminate();

        // Parse extracted text
        const extracted = parseJobDetails(text);

        jobData = {
          position: extracted.jobTitle || 'Captured Job',
          company: extracted.company || 'Unknown Company',
          location: extracted.location || '',
          salary: extracted.salary || '',
          description: extracted.jobDescription || text,
          screenshot: screenshot,
          applicationSource: detectedSource || 'other',
          jobUrl: url,
        };
      } catch (ocrError) {
        console.error('OCR failed, falling back to basic capture:', ocrError);
        jobData = {
          position: 'Captured Job',
          company: 'Unknown Company',
          location: '',
          salary: '',
          description: '',
          screenshot: screenshot,
          applicationSource: detectedSource || 'other',
          jobUrl: url,
        };
      }
    } else {
      return res
        .status(400)
        .json({ error: 'Either extracted data or screenshot required' });
    }

    const job = await Job.create({
      user: user._id,
      ...jobData,
      status: 'saved',
      dateApplied: new Date(),
      isCaptured: true,
    });

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
    });
  } catch (error) {
    console.error('saveFromExtension error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Simple parser for job details from OCR text
function parseJobDetails(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);
  const result = {
    jobTitle: null,
    company: null,
    location: null,
    salary: null,
    jobDescription: null,
  };

  // Look for common patterns
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('job title') || lower.includes('position')) {
      result.jobTitle = line.split(':')[1]?.trim() || line;
    } else if (lower.includes('company') && !result.company) {
      result.company = line.split(':')[1]?.trim() || line;
    } else if (lower.includes('location') && !result.location) {
      result.location = line.split(':')[1]?.trim() || line;
    } else if (
      lower.includes('salary') ||
      lower.includes('pay') ||
      lower.includes('$')
    ) {
      result.salary = line.split(':')[1]?.trim() || line;
    }
  }

  // Description as remaining text
  result.jobDescription = lines.join('\n');

  return result;
}

// Update job
export const updateJob = async (req, res) => {
  try {
    console.log("Incoming body:", req.body);
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
      job_url,
    } = req.body;

    if (!company || !position || !date_applied) {
      return res
        .status(400)
        .json({ error: 'Company, position, and date_applied are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    // Validate interview_questions structure safely
    const rawQuestions = interview_questions || [];
    const safeQuestions = Array.isArray(rawQuestions) ? rawQuestions : [];
    
    const parsedQuestions = safeQuestions.map((q) => {
      const safeQ = q || {};
      return {
        round: safeQ.round || '',
        question: safeQ.question || '',
        answer: safeQ.answer || '',
        notes_or_answer: safeQ.notes_or_answer || '',
      };
    });

    const updateData = {
      company,
      position,
      location: location || null,
      status,
      applicationType: application_type || 'off_campus',
      dateApplied: new Date(date_applied),
      interviewDate: interview_date ? new Date(interview_date) : null,
      applicationSource: application_source || null,
      notes: notes || null,
      resumeLink: resume_link || null,
      portfolioLink: portfolio_link || null,
      interviewRounds: interview_rounds || [],
      interviewQuestions: parsedQuestions,
      preparationNotes: preparation_notes || null,
      interviewDifficulty: interview_difficulty || null,
      interviewStatus: interview_status || 'pending',
      jobUrl: job_url ? job_url.trim() : null,
      // Once edited via the main form, treat as a normal job
      isCaptured: false,
    };

    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true, runValidators: true },
    ).lean();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(formatJobForResponse(job));
  } catch (error) {
    console.error('Update job error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ message: 'Failed to update job', error: error.message || error });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const job = await Job.findOneAndDelete({ _id: id, user: userId });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
