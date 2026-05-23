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
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] mx-auto bg-sage p-6 rounded-[40px] h-[calc(100vh-150px)] overflow-hidden">
      
      {/* ── Left Content Area ── */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 h-full min-h-0">
        
        {/* ── Welcome Banner (Compact) ── */}
        <div className="bg-sage-light border border-charcoal rounded-[24px] py-4 px-6 sm:px-8 flex items-center justify-between relative shrink-0 shadow-sm">
          <div className="relative z-10 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight mb-1">
              Hi, {user?.name ? user.name.split(' ')[0] : 'there'}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-charcoal/80 font-medium leading-snug">
              Ready to track your job search and conquer your day?
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <img 
              src="/avatar.png" 
              alt="User Avatar" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm transition-transform hover:scale-105 mix-blend-multiply"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* ── 2-Column Internal Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
          
          {/* ── Column 1: Quick Add, Weekly Goal ── */}
          <div className="flex flex-col gap-6 h-full min-h-0 overflow-y-auto pr-2 pb-10 custom-scrollbar">
            <div className="shrink-0">
              <QuickAddBar />
            </div>
            <div className="shrink-0">
              <WeeklyGoalTracker />
            </div>
          </div>

          {/* ── Column 2: Action Items, Upcoming Interviews ── */}
          <div className="flex flex-col gap-6 h-full min-h-0 overflow-y-auto pr-2 pb-10 custom-scrollbar">
            <div className="shrink-0">
              <ActionItemsWidget />
            </div>
            
            {upcomingInterviews.length > 0 && (
              <div className="bg-transparent shrink-0">
                <div className="px-2 py-3 flex items-center gap-2.5">
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
            
            {/* ── Captured Jobs Alert ── */}
            <div className="shrink-0">
              <CapturedJobsAlert />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar: Recent Activity ── */}
      <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col gap-6 h-full min-h-0 pr-2 pb-6">
        <div className="flex-1 flex flex-col min-h-0">
          <RecentActivityFeed />
        </div>
      </div>

    </div>
  );
}
