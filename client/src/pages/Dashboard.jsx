import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../lib/api';
import { getUser } from '../lib/auth';
import AnalyticsWidgets from '../components/AnalyticsWidgets';
import DetailedAnalytics from '../components/DetailedAnalytics';
import CapturedJobs from '../components/CapturedJobs';
import { Calendar } from 'lucide-react';

export default function Dashboard() {
  const user = getUser();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['jobStats'],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
  });

  const upcomingInterviews = useMemo(() => {
    if (!jobs) return [];
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return jobs
      .filter((job) => {
        if (!job.interview_date) return false;
        const interviewDate = new Date(job.interview_date);
        return interviewDate >= now && interviewDate <= sevenDaysFromNow;
      })
      .sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date))
      .slice(0, 5);
  }, [jobs]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
      {/* ── Left Column ── */}
      <div className="flex-1 min-w-0 w-full flex flex-col gap-5">

      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 border border-slate-200 rounded-[24px] p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden mb-2 shadow-sm">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Hi, {user?.name ? user.name.split(' ')[0] : 'there'}
          </h1>
          <p className="text-[15px] text-slate-600 font-medium">
            Ready to track your job search and conquer your day?
          </p>
        </div>
        {/* Subtle decorative elements for modern SaaS feel */}
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-gradient-to-b from-white to-transparent opacity-60 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute right-40 bottom-0 w-[300px] h-[300px] bg-gradient-to-t from-slate-200/50 to-transparent opacity-40 rounded-full blur-3xl -mb-20"></div>
      </div>

      {/* ── Analytics ── */}
      <div>
        <AnalyticsWidgets />
      </div>


      {/* ── Captured Jobs ── */}
      <CapturedJobs />

      {/* ── Upcoming Interviews ── */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
            <Calendar size={15} className="text-slate-900" />
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Upcoming Interviews ({upcomingInterviews.length})
            </span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {upcomingInterviews.map((job) => {
              const interviewDate = new Date(job.interview_date);
              const daysUntil = Math.ceil((interviewDate - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-[10px] px-[14px] py-[10px] text-[13.5px]"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900">{job.company}</span>
                    <span className="text-slate-900 ml-1.5">— {job.position}</span>
                  </div>
                  <span className="shrink-0 font-extrabold text-white bg-slate-900 px-2.5 py-0.5 rounded-full text-[10.5px] uppercase tracking-wider">
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      </div>

      {/* ── Right Column ── */}
      <div className="w-full xl:w-[320px] 2xl:w-[360px] shrink-0 xl:sticky top-[88px]">
        <DetailedAnalytics />
      </div>
    </div>
  );
}
