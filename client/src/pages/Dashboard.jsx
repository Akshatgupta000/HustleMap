import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../lib/api';
import { getUser } from '../lib/auth';
import QuickAddBar from '../components/dashboard/QuickAddBar';
import WeeklyGoalTracker from '../components/dashboard/WeeklyGoalTracker';
import ActionItemsWidget from '../components/dashboard/ActionItemsWidget';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import CapturedJobsAlert from '../components/dashboard/CapturedJobsAlert';
import DashboardEmptyState from '../components/dashboard/DashboardEmptyState';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import { Calendar, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const user = getUser();

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  const { data: feedData, isLoading: feedLoading } = useQuery({
    queryKey: ["dashboardFeed"],
    queryFn: () => jobsAPI.getDashboardFeed().then((res) => res.data),
  });

  const streak = feedData?.streak || 0;

  // ── Data readiness gates ──────────────────────────────────────
  const isDataLoaded   = !jobsLoading && !feedLoading;
  const hasJobs        = isDataLoaded && Array.isArray(jobs) && jobs.length > 0;

  const upcomingInterviews = Array.isArray(jobs) ? jobs
    .filter((job) => {
      if (!job.interview_date) return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const interviewDate = new Date(job.interview_date);
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return interviewDate >= now && interviewDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date)) : [];

  const hasInterviews = upcomingInterviews.length > 0;

  // ── Shared: Welcome banner ────────────────────────────────────
  const WelcomeBanner = () => (
    <div className="bg-sage-light border border-charcoal/30 rounded-[20px] py-3 px-5 sm:px-6 flex items-center justify-between relative shrink-0">
      <div className="relative z-10 flex-1">
        <div className="flex items-center gap-2.5 mb-0.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal tracking-tight leading-none">
            Hi, {user?.name ? user.name.split(' ')[0] : 'there'}
          </h1>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full">
              <Flame size={11} className="fill-[#FF9500]/30" />
              {streak}d
            </span>
          )}
        </div>
        <p className="text-[12.5px] sm:text-[13px] text-charcoal/50 font-medium leading-snug">
          {hasJobs
            ? 'Ready to track your job search and conquer your day?'
            : 'Welcome to HustleMap — let\'s get your search started.'}
        </p>
      </div>
      <div className="relative z-10 shrink-0">
        <img
          src="/avatar.png"
          alt="User Avatar"
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-sm transition-transform hover:scale-105 mix-blend-multiply"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    </div>
  );

  // ── STATE 1: Loading ──────────────────────────────────────────
  if (!isDataLoaded) {
    return (
      <div className="w-full max-w-[1400px] mx-auto bg-sage px-5 pb-5 pt-0 rounded-[32px] flex-1 h-full min-h-0 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        <WelcomeBanner />
        <DashboardSkeleton />
      </div>
    );
  }

  // ── STATE 2: First-time user (no jobs yet) ────────────────────
  if (!hasJobs) {
    return (
      <div className="w-full max-w-[1400px] mx-auto bg-sage px-5 pb-5 pt-0 rounded-[32px] flex-1 h-full min-h-0 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        <WelcomeBanner />
        <div className="fade-slide-in w-full max-w-xl mx-auto flex flex-col gap-4 pt-2">
          <QuickAddBar />
          <DashboardEmptyState />
        </div>
      </div>
    );
  }

  // ── STATE 3: Returning user — full progressive dashboard ──────
  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full max-w-[1400px] mx-auto bg-sage px-5 pb-5 pt-0 rounded-[32px] flex-1 h-full min-h-0 overflow-hidden">

      {/* ── Left Content Area ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full min-h-0">

        {/* Welcome Banner */}
        <div className="fade-slide-in shrink-0">
          <WelcomeBanner />
        </div>

        {/* ── 2-Column Internal Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">

          {/* ── Column 1: Quick Add, Weekly Goal, Captured Jobs, Upcoming Interviews ── */}
          <div className="flex flex-col gap-4 h-full min-h-0 overflow-y-auto pb-0 custom-scrollbar">
            <div className="shrink-0 fade-slide-in-delay-1">
              <QuickAddBar />
            </div>
            <div className="shrink-0 fade-slide-in-delay-2">
              <WeeklyGoalTracker />
            </div>
            <div className="shrink-0 fade-slide-in-delay-3">
              <CapturedJobsAlert />
            </div>

            {hasInterviews && (
              <div className="bg-sage-light border border-charcoal/20 rounded-[24px] overflow-hidden shrink-0 fade-slide-in-delay-3">
                {/* Section header */}
                <div className="px-4 py-3 border-b border-charcoal/10 flex items-center gap-2">
                  <Calendar size={14} className="text-charcoal/70" />
                  <span className="text-[13.5px] font-extrabold text-charcoal tracking-tight">
                    Upcoming Interviews
                  </span>
                  <span className="ml-auto text-[10px] font-extrabold text-white bg-charcoal px-2 py-0.5 rounded-full">
                    {upcomingInterviews.length}
                  </span>
                </div>
                {/* Items */}
                <div className="p-3 flex flex-col gap-2 max-h-[216px] overflow-y-auto custom-scrollbar">
                  {upcomingInterviews.map((job) => {
                    const interviewDate = new Date(job.interview_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const daysUntil = Math.ceil((interviewDate - today) / (1000 * 60 * 60 * 24));
                    return (
                      <Link
                        key={job.id}
                        to={`/jobs/edit/${job.id}`}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between bg-charcoal rounded-[18px] px-4 py-3 hover:bg-charcoal/90 transition-all duration-200 cursor-pointer"
                      >
                        <div className="min-w-0 flex flex-col">
                          <span className="text-[13.5px] font-bold text-white leading-tight">
                            {job.company}
                          </span>
                          <span className="text-[12px] text-white/60 font-medium mt-0.5">
                            {job.position}
                          </span>
                        </div>
                        <span className="mt-2.5 sm:mt-0 shrink-0 self-start sm:self-center font-extrabold px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wide bg-white text-charcoal">
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil}d`}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Column 2: Recent Activity ── */}
          <div className="flex flex-col gap-4 h-full min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 fade-slide-in-delay-2">
              <RecentActivityFeed />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar: Action Items ── */}
      <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col gap-4 h-full min-h-0 pb-0 overflow-hidden fade-slide-in-delay-4">
        <div className="flex-1 flex flex-col min-h-0 fade-slide-in-delay-4">
          <ActionItemsWidget />
        </div>
      </div>

    </div>
  );
}
