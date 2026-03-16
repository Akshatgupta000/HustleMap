/**
 * Safe date formatter - prevents 500 from invalid/null dates
 */
export const formatDate = (date) => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
};

/**
 * Format a single job document for API response
 */
export const formatJobForResponse = (job) => ({
  id: job._id.toString(),
  user_id: job.user?.toString?.() ?? job.user,
  company: job.company,
  position: job.position,
  location: job.location || null,
  status: job.status,
  application_type: job.applicationType || "off_campus",
  date_applied: formatDate(job.dateApplied),
  interview_date: formatDate(job.interviewDate),
  application_source: job.applicationSource || null,
  screenshot: job.screenshot || null,
  is_captured: job.isCaptured === true,
  job_url: job.jobUrl || null,
  notes: job.notes || null,
  resume_link: job.resumeLink || null,
  portfolio_link: job.portfolioLink || null,
  interview_rounds: job.interviewRounds || [],
  interview_questions: job.interviewQuestions || [],
  preparation_notes: job.preparationNotes || null,
  interview_difficulty: job.interviewDifficulty ?? null,
  interview_status: job.interviewStatus || "pending",
  created_at: job.createdAt,
  updated_at: job.updatedAt,
});
