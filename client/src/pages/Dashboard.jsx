import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../lib/api';
import { getUser } from '../lib/auth';
import QuickAddBar from '../components/dashboard/QuickAddBar';
import WeeklyGoalTracker from '../components/dashboard/WeeklyGoalTracker';
import ActionItemsWidget from '../components/dashboard/ActionItemsWidget';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import CapturedJobsAlert from '../components/dashboard/CapturedJobsAlert';
import { Calendar, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const user = getUser();

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  const { data: feedData } = useQuery({
    queryKey: ["dashboardFeed"],
    queryFn: () => jobsAPI.getDashboardFeed().then((res) => res.data),
  });

  const streak = feedData?.streak || 0;

  const upcomingInterviews = Array.isArray(jobs) ? jobs
    .filter((job) => {
      if (!job.interview_date) return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const interviewDate = new Date(job.interview_date);
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return interviewDate >= now && interviewDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date))
    .slice(0, 5) : [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8 bg-sage p-6 rounded-[40px]">
      {/* ── Welcome Banner ── */}
      <div className="bg-sage-light border border-charcoal rounded-[32px] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between relative overflow-hidden mb-2 gap-6">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight mb-2">
            Hi, {user?.name ? user.name.split(' ')[0] : 'there'}
          </h1>
          <p className="text-[15px] text-charcoal/80 font-medium">
            Ready to track your job search and conquer your day?
          </p>
        </div>

        {/* ── Gamified Streak Badge ── */}
        <div className="relative z-10 shrink-0 self-start sm:self-center">
          <div className="flex items-center gap-4 bg-white border-2 border-charcoal rounded-full py-3 px-6 shadow-[4px_4px_0px_0px_#1c1c1c] transition-transform hover:-translate-y-[2px] cursor-default">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 border-charcoal ${streak > 0 ? 'bg-[#FF9500] text-white' : 'bg-sage-dark text-charcoal/50'}`}>
              <Flame size={24} strokeWidth={2.5} className={streak > 0 ? "fill-white/20" : ""} />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[22px] font-black text-charcoal leading-none tracking-tight">
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </span>
              <span className="text-[11px] font-extrabold text-charcoal/60 tracking-wider uppercase mt-1">
                Activity Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Row: Quick Add ── */}
      <QuickAddBar />

      {/* ── Second Row: Weekly Goal ── */}
      <WeeklyGoalTracker />

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ── Left Column (Main content, ~65%) ── */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <ActionItemsWidget />
          
          {upcomingInterviews.length > 0 && (
            <div className="bg-transparent">
              <div className="px-2 py-4 flex items-center gap-2.5">
                <Calendar size={18} className="text-charcoal" />
                <span className="text-[16px] font-extrabold text-charcoal tracking-tight">
                  Upcoming Interviews
                </span>
                <span className="ml-1.5 text-[11px] font-extrabold text-sage-light bg-charcoal px-2 py-0.5 rounded-full">
                  {upcomingInterviews.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {upcomingInterviews.map((job) => {
                  const interviewDate = new Date(job.interview_date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const daysUntil = Math.ceil((interviewDate - today) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Link
                      key={job.id}
                      to={`/jobs/edit/${job.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between bg-charcoal rounded-[24px] p-5 hover:bg-charcoal/90 transition-all duration-200 cursor-pointer text-decoration-none"
                    >
                      <div className="min-w-0 flex flex-col">
                        <span className="text-[15px] font-bold text-white transition-colors">
                          {job.company}
                        </span>
                        <span className="text-[13px] text-white/70 font-medium mt-0.5 transition-colors">
                          {job.position}
                        </span>
                      </div>
                      <span className={`mt-3 sm:mt-0 shrink-0 self-start sm:self-center font-extrabold px-4 py-2 rounded-full text-[11px] uppercase tracking-wide bg-white text-charcoal`}>
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column (Sidebar, ~35%) ── */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <CapturedJobsAlert />
          <RecentActivityFeed />
        </div>

      </div>
    </div>
  );
}
