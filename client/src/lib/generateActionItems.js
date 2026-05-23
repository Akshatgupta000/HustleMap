/**
 * Pure function to generate prioritized action items based on client-side data
 * @param {Array} jobs - All jobs
 * @param {Object} weeklyProgress - { applied: number, target: number }
 * @param {number} capturedCount - Count of captured jobs waiting
 * @returns {Array} Array of action item objects
 */
export function generateActionItems(jobs = [], weeklyProgress = null, capturedCount = 0) {
  const items = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let mostRecentUpdate = null;

  jobs.forEach(job => {
    // Track most recent update
    const updated = new Date(job.updatedAt);
    if (!mostRecentUpdate || updated > mostRecentUpdate) {
      mostRecentUpdate = updated;
    }

    const appliedDate = new Date(job.dateApplied);
    const interviewDate = job.interviewDate || job.interview_date ? new Date(job.interviewDate || job.interview_date) : null;
    
    // Normalize interview date to start of day for accurate day-diffing
    const interviewDay = interviewDate ? new Date(interviewDate.getFullYear(), interviewDate.getMonth(), interviewDate.getDate()) : null;
    
    const daysSinceApplied = Math.floor((now - appliedDate) / (1000 * 60 * 60 * 24));
    const daysUntilInterview = interviewDay ? Math.ceil((interviewDay - today) / (1000 * 60 * 60 * 24)) : null;

    // 1. Interview within 72 hours (Highest Priority: 100+)
    if (job.status === 'interview' && daysUntilInterview !== null && daysUntilInterview >= 0 && daysUntilInterview <= 3) {
      items.push({
        id: `int_prep_${job.id || job._id}`,
        title: `Prepare for ${job.company} interview`,
        description: daysUntilInterview === 0 
          ? "Interview is today! Review your preparation notes."
          : `Interview in ${daysUntilInterview} day(s). Review the role and company.`,
        priority: 'high',
        score: 100 - daysUntilInterview, // 100 for today, 99 for tomorrow, etc.
        cta: 'View Prep',
        jobId: job.id || job._id,
        type: 'interview',
        position: job.position
      });
      return; // Skip other rules for this job if high priority triggered
    }

    // 2. Online Assessment due soon (Very High Priority: 90+)
    if (job.status === 'online_test' && daysUntilInterview !== null && daysUntilInterview >= 0 && daysUntilInterview <= 3) {
      items.push({
        id: `oa_due_${job.id || job._id}`,
        title: `Complete OA for ${job.company}`,
        description: daysUntilInterview === 0
          ? "Assessment due today."
          : `Assessment due in ${daysUntilInterview} day(s).`,
        priority: 'high',
        score: 90 - daysUntilInterview,
        cta: 'View Job',
        jobId: job.id || job._id,
        type: 'oa'
      });
      return;
    }

    // 3. Interview status but no date set (High Priority: 80)
    if (job.status === 'interview' && !interviewDate) {
      items.push({
        id: `int_sched_${job.id || job._id}`,
        title: `Schedule interview with ${job.company}`,
        description: "You're in the interview stage but haven't set a date.",
        priority: 'medium',
        score: 80,
        cta: 'Update Date',
        jobId: job.id || job._id,
        type: 'schedule',
        position: job.position
      });
      return;
    }

    // 4. OA status but no date set (High Priority: 75)
    if (job.status === 'online_test' && !interviewDate) {
      items.push({
        id: `oa_sched_${job.id || job._id}`,
        title: `Schedule OA for ${job.company}`,
        description: "You have an online test but haven't set a deadline.",
        priority: 'medium',
        score: 75,
        cta: 'Update Date',
        jobId: job.id || job._id,
        type: 'schedule',
        position: job.position
      });
      return;
    }

    // 5. Follow-up overdue (Medium Priority: 60)
    if (job.status === 'applied' && daysSinceApplied >= 7 && daysSinceApplied <= 30) {
      items.push({
        id: `followup_${job.id || job._id}`,
        title: `Follow up with ${job.company}`,
        description: `No update since you applied ${daysSinceApplied} days ago.`,
        priority: 'medium',
        score: 60 + Math.min(daysSinceApplied, 10), // slightly higher score if more overdue
        cta: 'View Job',
        jobId: job.id || job._id,
        type: 'followup'
      });
    }
  });

  // 6. Captured Jobs pending (Medium Priority: 50)
  if (capturedCount > 0) {
    items.push({
      id: 'captured_pending',
      title: `${capturedCount} captured job${capturedCount > 1 ? 's' : ''} waiting`,
      description: "You saved jobs but haven't formally applied yet.",
      priority: 'medium',
      score: 50,
      cta: 'Review',
      link: '/captured',
      type: 'captured'
    });
  }

  // 7. Weekly Goal behind (Low Priority: 40)
  if (weeklyProgress && weeklyProgress.target > 0) {
    const remaining = weeklyProgress.target - (weeklyProgress.applied || 0);
    if (remaining > 0) {
      items.push({
        id: 'weekly_goal',
        title: "Behind on weekly goal",
        description: `${remaining} more application${remaining > 1 ? 's' : ''} to hit your target.`,
        priority: 'low',
        score: 40,
        cta: 'Add Job',
        link: '/jobs/new',
        type: 'goal'
      });
    }
  }

  // 8. Inactivity reminder (Low Priority: 30)
  if (mostRecentUpdate) {
    const daysSinceLastUpdate = Math.floor((now - mostRecentUpdate) / (1000 * 60 * 60 * 24));
    if (daysSinceLastUpdate >= 3 && jobs.length > 0) {
      items.push({
        id: 'inactivity',
        title: "Stay consistent",
        description: `You haven't updated any applications in ${daysSinceLastUpdate} days.`,
        priority: 'low',
        score: 30,
        cta: 'View Jobs',
        link: '/jobs',
        type: 'inactivity'
      });
    }
  }

  // Sort strictly by the numerical score (highest first)
  items.sort((a, b) => b.score - a.score);

  return items;
}
