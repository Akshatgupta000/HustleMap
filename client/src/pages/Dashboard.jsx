import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../lib/api';
import { getUser } from '../lib/auth';
import AnalyticsWidgets from '../components/AnalyticsWidgets';
import DetailedAnalytics from '../components/DetailedAnalytics';
import JobCard from '../components/JobCard';
import JobDetailsModal from '../components/JobDetailsModal';
import CapturedJobs from '../components/CapturedJobs';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { ChevronDown, ChevronUp, Calendar, Copy } from 'lucide-react';

const STATUS_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  online_test: 'Online Test',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showApplications, setShowApplications] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const user = getUser();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['jobStats'],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
  });

  const filteredAndSortedJobs = useMemo(() => {
    if (!jobs || !Array.isArray(jobs)) return [];
    let filtered = jobs.filter((job) => {
      if (job.is_captured) return false;
      const matchesSearch =
        searchQuery === '' ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesType = typeFilter === 'all' || job.application_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
    filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date_applied) - new Date(a.date_applied);
      if (sortBy === 'status') {
        const statusOrder = ['saved', 'applied', 'online_test', 'interview', 'offer', 'rejected', 'withdrawn'];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
      return 0;
    });
    return filtered;
  }, [jobs, searchQuery, statusFilter, typeFilter, sortBy]);

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

  const handleFilterClick = (filterValue) => {
    setStatusFilter(filterValue);
    setShowApplications(true);
  };

  const selectClass =
    'h-[40px] w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 text-[13.5px] font-medium text-slate-700 cursor-pointer outline-none transition-all shadow-sm hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10';

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
        <AnalyticsWidgets
          statusFilter={statusFilter}
          onFilterClick={handleFilterClick}
        />
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

      {/* ── Applications card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Card header */}
        <div
          className={`flex items-center justify-between px-5 py-4 ${showApplications ? 'border-b border-slate-200/50' : ''}`}
        >
          <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">
            My Applications{' '}
            <span className="text-[12.5px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 ml-1.5">
              {filteredAndSortedJobs.length}
            </span>
          </h2>
          <button
            onClick={() => setShowApplications(!showApplications)}
            className="flex items-center gap-1.5 bg-transparent border border-slate-200 rounded-lg px-[11px] py-[5px] text-[13px] font-medium text-slate-500 cursor-pointer transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            {showApplications ? (
              <><ChevronUp size={13} /> Hide</>
            ) : (
              <><ChevronDown size={13} /> Show</>
            )}
          </button>
        </div>

        {showApplications && (
          <div className="px-5 pt-4 pb-5">
            {/* Filters */}
            <div className="flex flex-col gap-2.5 mb-[18px]">
              <Input
                type="text"
                placeholder="Search by company or role…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[40px] rounded-xl border-slate-200 text-[13.5px] shadow-sm"
              />
              <div className="flex gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">All Status</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">All Types</option>
                  <option value="on_campus">On-Campus</option>
                  <option value="off_campus">Off-Campus</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={selectClass}
                >
                  <option value="date">Sort by Date</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
            </div>

            {/* Job list */}
            {isLoading ? (
              <div className="text-center py-10 text-[13.5px] text-slate-500">
                Loading jobs…
              </div>
            ) : filteredAndSortedJobs.length === 0 ? (
              <div className="text-center py-10 px-5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">
                  No jobs found
                </h3>
                <p className="text-[13px] text-slate-500 mb-4">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start tracking your job applications'}
                </p>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                  <Link to="/jobs/new" className="no-underline">
                    <button className="bg-slate-900 text-white border-none rounded-[9px] px-[18px] py-2 text-[13.5px] font-semibold cursor-pointer shadow-sm hover:brightness-110 transition-all">
                      Add Your First Job
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {filteredAndSortedJobs.map((job) => (
                  <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      </div>

      {/* ── Right Column ── */}
      <div className="w-full xl:w-[320px] 2xl:w-[360px] shrink-0 xl:sticky top-[88px]">
        <DetailedAnalytics />
      </div>

      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
