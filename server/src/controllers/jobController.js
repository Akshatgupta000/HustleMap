import Job from '../models/Job.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { createWorker } from 'tesseract.js';
import { formatJobForResponse, formatDate } from '../utils/formatJob.js';
import { clearCacheByPrefix, getCache, setCache } from '../utils/memoryCache.js';

const safeUserId = (id) => {
  if (!id || typeof id !== 'string') return null;
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
};

const STATS_CACHE_TTL_MS = 30 * 1000;
const LIST_MAX_LIMIT = 100;
const DEFAULT_LIST_LIMIT = 25;
const JOB_LIST_SELECT =
  '_id company position location status applicationType dateApplied interviewDate applicationSource notes resumeLink portfolioLink interviewRounds interviewQuestions preparationNotes interviewDifficulty interviewStatus jobUrl salary companyLogo screenshot isCaptured createdAt updatedAt';

const getPagination = (query = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const rawLimit = Number.parseInt(query.limit, 10) || DEFAULT_LIST_LIMIT;
  const limit = Math.min(Math.max(rawLimit, 1), LIST_MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};

const statsCacheKey = (userId) => `jobStats:${userId}`;
const invalidateUserStatsCache = (userId) => {
  if (!userId) return;
  clearCacheByPrefix(`jobStats:${userId}`);
};

// Get all jobs for authenticated user
export const getAllJobs = async (req, res) => {
  try {
    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const { skip, limit } = getPagination(req.query);
    const jobs = await Job.find({ user: userId })
      .select(JOB_LIST_SELECT)
      .sort({ dateApplied: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
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

    const { skip, limit } = getPagination(req.query);
    const jobs = await Job.find({ user: userId, isCaptured: true })
      .select(JOB_LIST_SELECT)
      .sort({ dateApplied: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
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
    const cacheKey = statsCacheKey(userIdStr);
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const [
      total,
      byStatusResult,
      recentJobs,
      weeklyResult,
      upcomingInterviews,
      interviewsScheduled,
      weeklyApplications,
    ] = await Promise.all([
      Job.countDocuments({ user: userId }),
      Job.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Job.find({ user: userId })
        .select('_id company position interviewDate updatedAt')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      Job.aggregate([
        { $match: { user: userId, dateApplied: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateApplied' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),
      Job.find({
        user: userId,
        interviewDate: { $gte: now, $lte: sevenDaysFromNow },
      })
        .select('_id company position interviewDate')
        .sort({ interviewDate: 1 })
        .limit(10)
        .lean(),
      Job.countDocuments({
        user: userId,
        $or: [
          { status: 'interview' },
          { interviewDate: { $ne: null, $gte: now } },
          { interviewRounds: { $elemMatch: { status: 'scheduled' } } },
        ],
      }),
      Job.aggregate([
        { $match: { user: userId, dateApplied: { $gte: fourWeeksAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-W%V', date: '$dateApplied' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 4 },
      ]),
    ]);

    const byStatus = byStatusResult.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const recent = recentJobs.map((job) => formatJobForResponse(job));
    const weekly = weeklyResult.map((item) => ({ date: item._id, count: item.count }));
    const upcoming = upcomingInterviews
      .filter((job) => job.interviewDate)
      .map((job) => ({
        id: job._id.toString(),
        company: job.company,
        position: job.position,
        interview_date: formatDate(job.interviewDate),
      }));

    const withdrawnCount = byStatus.withdrawn || 0;
    const offerCount = byStatus.offer || 0;
    const jobsReachedInterviewStage =
      (byStatus.interview || 0) + (byStatus.offer || 0) + (byStatus.rejected || 0);
    const totalApplicationsExcludingWithdrawn = total - withdrawnCount;
    const interviewConversionRate =
      totalApplicationsExcludingWithdrawn > 0
        ? Number(
          (
            (jobsReachedInterviewStage / totalApplicationsExcludingWithdrawn) *
            100
          ).toFixed(1),
        )
        : 0;
    const offerRatio = total > 0 ? Number(((offerCount / total) * 100).toFixed(1)) : 0;
    const applicationsPerWeek = weeklyApplications.map((item) => ({
      week: item._id,
      count: item.count,
    }));

    const payload = {
      total,
      byStatus,
      recent,
      weekly,
      interviewsScheduled,
      upcomingInterviews: upcoming,
      interviewConversionRate,
      offerRatio,
      applicationsPerWeek,
    };

    setCache(cacheKey, payload, STATS_CACHE_TTL_MS);
    res.json(payload);
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

    const job = await Job.create(jobData);
    invalidateUserStatsCache(req.user?.id);
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
    invalidateUserStatsCache(userId);
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
    invalidateUserStatsCache(uid);
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
    invalidateUserStatsCache(uid);

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
      screenshot: null,  // screenshot not saved — text details only
      isCaptured: true,
    });
    invalidateUserStatsCache(uid);

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

        // If location or description is missing, enrich using OCR from screenshot if available
        if ((!jobData.location || !jobData.description) && screenshot) {
          try {
            const worker = await createWorker('eng');
            const {
              data: { text },
            } = await worker.recognize(screenshot);
            await worker.terminate();

            const extracted = parseJobDetails(text);
            if (!jobData.location && extracted.location) {
              jobData.location = extracted.location;
            }
            if (!jobData.description && extracted.jobDescription) {
              jobData.description = extracted.jobDescription;
            }
            if (extracted.salary) {
              jobData.salary = extracted.salary;
            }
          } catch (ocrErr) {
            console.warn('OCR enrichment failed:', ocrErr);
          }
        }
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
          screenshot: screenshot || null,
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
          screenshot: screenshot || null,
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
    invalidateUserStatsCache(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
    });
  } catch (error) {
    console.error('saveFromExtension error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function cleanLocation(raw) {
  if (!raw) return null;
  let loc = raw;
  if (loc.includes('·')) loc = loc.split('·')[0];
  if (loc.includes('•')) loc = loc.split('•')[0];
  if (loc.includes('|')) loc = loc.split('|')[0];
  loc = loc.replace(/\d+\s+(day|week|month|year|hr|hour)s?\s+ago.*/i, '');
  loc = loc.replace(/over\s+\d+.*click.*/i, '');
  loc = loc.replace(/responses\s+managed.*/i, '');
  loc = loc.trim();
  return loc.length > 0 ? loc : null;
}

// Smart parser for job details from OCR text
function parseJobDetails(text) {
  if (!text) return { jobTitle: null, company: null, location: null, salary: null, jobDescription: null };

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  const result = {
    jobTitle: null,
    company: null,
    location: null,
    salary: null,
    jobDescription: lines.join('\n'),
  };

  // 1. Look for common explicit key-value patterns
  for (const line of lines) {
    const lower = line.toLowerCase();
    if ((lower.includes('job title') || lower.includes('position')) && !result.jobTitle) {
      result.jobTitle = line.split(':')[1]?.trim() || line;
    } else if (lower.includes('company') && !result.company) {
      result.company = line.split(':')[1]?.trim() || line;
    } else if (lower.includes('location') && !result.location) {
      result.location = cleanLocation(line.split(':')[1]?.trim() || line);
    } else if (
      (lower.includes('salary') || lower.includes('pay') || lower.includes('$')) && !result.salary
    ) {
      result.salary = line.split(':')[1]?.trim() || line;
    }
  }

  // 2. Heuristic search for location if not found explicitly
  if (!result.location) {
    for (const line of lines) {
      const cleaned = cleanLocation(line);
      if (!cleaned) continue;
      const lower = cleaned.toLowerCase();
      if (
        lower.includes('developer') ||
        lower.includes('engineer') ||
        lower.includes('manager') ||
        lower.includes('full-time') ||
        lower.includes('part-time') ||
        lower.includes('apply') ||
        lower.includes('save')
      ) {
        continue;
      }
      const hasComma = cleaned.includes(',');
      const isRemoteOrHybrid = lower.includes('remote') || lower.includes('hybrid') || lower.includes('on-site');
      const commonCities = ['hyderabad', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'pune', 'chennai', 'noida', 'gurgaon', 'gurugram', 'london', 'new york', 'san francisco', 'india', 'usa', 'uk', 'ca', 'ny', 'tx', 'telangana'];
      const matchesCommonCity = commonCities.some((city) => lower.includes(city));

      if (hasComma || isRemoteOrHybrid || matchesCommonCity) {
        result.location = cleaned;
        break;
      }
    }
  }

  return result;
}

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

    invalidateUserStatsCache(req.user?.id);
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

    invalidateUserStatsCache(req.user?.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete all jobs for user
export const deleteAllJobs = async (req, res) => {
  try {
    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    await Job.deleteMany({ user: userId });

    invalidateUserStatsCache(req.user?.id);
    res.json({ message: 'All jobs deleted successfully' });
  } catch (error) {
    console.error('Delete all jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete all captured jobs for user
export const deleteAllCapturedJobs = async (req, res) => {
  try {
    const userId = safeUserId(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    await Job.deleteMany({ user: userId, isCaptured: true });

    invalidateUserStatsCache(req.user?.id);
    res.json({ message: 'All captured jobs deleted successfully' });
  } catch (error) {
    console.error('Delete all captured jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get dashboard feed (recent activity & action items)
export const getDashboardFeed = async (req, res) => {
  try {
    const userIdStr = safeUserId(req.user?.id);
    if (!userIdStr) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }
    const userId = new mongoose.Types.ObjectId(userIdStr);

    const recentJobs = await Job.find({ user: userId })
      .select('_id company position status updatedAt isCaptured')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Action items logic:
    // 1. "Applied" > 7 days ago based on dateApplied
    // 2. "Interview" without an interviewDate
    const actionJobs = await Job.find({
      user: userId,
      $or: [
        { status: 'applied', dateApplied: { $lt: sevenDaysAgo } },
        { status: 'interview', interviewDate: null }
      ]
    })
      .select('_id company position status updatedAt interviewDate')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const actionItems = actionJobs.map(job => {
      let description = '';
      if (job.status === 'applied') {
        description = `Follow up with ${job.company}`;
      } else if (job.status === 'interview') {
        description = `Schedule interview for ${job.company}`;
      }
      return {
        id: job._id.toString(),
        company: job.company,
        position: job.position,
        description,
        jobId: job._id.toString()
      };
    });

    const activityDates = await Job.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    let streak = 0;
    const nowObj = new Date();
    const todayStr = nowObj.toISOString().split('T')[0];
    const yesterdayObj = new Date(nowObj.getTime() - 86400000);
    const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

    const dateStrings = activityDates.map(d => d._id);
    if (dateStrings.includes(todayStr) || dateStrings.includes(yesterdayStr)) {
      let startIdx = dateStrings.indexOf(todayStr);
      if (startIdx === -1) startIdx = dateStrings.indexOf(yesterdayStr);
      
      let currentCheck = new Date(dateStrings[startIdx]);
      streak = 1;
      for (let i = startIdx + 1; i < dateStrings.length; i++) {
        currentCheck.setDate(currentCheck.getDate() - 1);
        if (dateStrings[i] === currentCheck.toISOString().split('T')[0]) {
          streak++;
        } else {
          break;
        }
      }
    }

    res.json({
      recentActivity: recentJobs.map(job => ({
        id: job._id.toString(),
        company: job.company,
        position: job.position,
        status: job.status,
        updatedAt: job.updatedAt,
        isCaptured: job.isCaptured
      })),
      actionItems,
      streak
    });
  } catch (error) {
    console.error('Get dashboard feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get weekly progress (applications created this week vs target)
export const getWeeklyProgress = async (req, res) => {
  try {
    const userIdStr = safeUserId(req.user?.id);
    if (!userIdStr) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }
    const userId = new mongoose.Types.ObjectId(userIdStr);

    const now = new Date();
    // Calculate start of current week (Monday)
    const day = now.getDay() || 7; // Get current day number, converting Sunday to 7
    if (day !== 1) {
      now.setHours(-24 * (day - 1));
    }
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const count = await Job.countDocuments({
      user: userId,
      createdAt: { $gte: weekStart, $lte: weekEnd }
    });

    res.json({
      applied: count,
      target: 10,
      weekStart,
      weekEnd
    });
  } catch (error) {
    console.error('Get weekly progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
