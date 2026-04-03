import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../lib/api';
import { getUser } from '../lib/auth';
import QuickAddJob from '../components/QuickAddJob';
import AnalyticsWidgets from '../components/AnalyticsWidgets';
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

const SCROLL_POSITION_KEY = 'dashboard_scroll_position';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showAnalyticsDetails, setShowAnalyticsDetails] = useState(false);
  const [showApplications, setShowApplications] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const dashboardRef = useRef(null);

  const user = getUser();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['jobStats'],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
  });

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedScrollPosition && dashboardRef.current) {
      setTimeout(() => {
        dashboardRef.current?.parentElement?.scrollTo(0, parseInt(savedScrollPosition, 10));
      }, 0);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const scrollPosition = dashboardRef.current?.parentElement?.scrollY || window.scrollY || 0;
      sessionStorage.setItem(SCROLL_POSITION_KEY, scrollPosition.toString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
    'h-[38px] w-full sm:w-auto rounded-[10px] border border-[#e8e6e1] bg-white px-3 text-[13.5px] text-[#37352f] cursor-pointer outline-none transition-all shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

  return (
    <div ref={dashboardRef} className="flex flex-col gap-5">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#37352f] tracking-tight mb-1">
              Dashboard
            </h1>
            <p className="text-[13.5px] text-[#6b6b6b]">
              Track and manage your job applications
            </p>
          </div>
        </div>
      </div>

      {/* ── Analytics ── */}
      <div>
        <AnalyticsWidgets
          statusFilter={statusFilter}
          onFilterClick={handleFilterClick}
          showDetails={showAnalyticsDetails}
          onToggleDetails={() => setShowAnalyticsDetails(!showAnalyticsDetails)}
        />
      </div>

      {/* ── Quick Add ── */}
      <QuickAddJob />

      {/* ── Captured Jobs ── */}
      <CapturedJobs />

      {/* ── Upcoming Interviews ── */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-amber-200 flex items-center gap-2">
            <Calendar size={15} className="text-amber-800" />
            <span className="text-sm font-bold text-amber-900 tracking-tight">
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
                  className="flex items-center justify-between bg-white border border-amber-200 rounded-[10px] px-[14px] py-[10px] text-[13.5px]"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-amber-900">{job.company}</span>
                    <span className="text-amber-800 ml-1.5">— {job.position}</span>
                  </div>
                  <span className="shrink-0 font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full text-xs">
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Applications card ── */}
      <div className="bg-white border border-[#e8e6e1] rounded-2xl overflow-hidden shadow-sm">
        {/* Card header */}
        <div
          className={`flex items-center justify-between px-5 py-4 ${showApplications ? 'border-b border-[#f0ede8]' : ''}`}
        >
          <h2 className="text-[15px] font-bold text-[#37352f] tracking-tight">
            My Applications{' '}
            <span className="text-[12.5px] font-medium text-[#6b6b6b] bg-[#f7f6f3] px-2 py-0.5 rounded-full border border-[#e8e6e1] ml-1.5">
              {filteredAndSortedJobs.length}
            </span>
          </h2>
          <button
            onClick={() => setShowApplications(!showApplications)}
            className="flex items-center gap-1.5 bg-transparent border border-[#e8e6e1] rounded-lg px-[11px] py-[5px] text-[13px] font-medium text-[#6b6b6b] cursor-pointer transition-all hover:bg-[#f7f6f3] hover:text-[#37352f]"
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
                className="w-full"
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
              <div className="text-center py-10 text-[13.5px] text-[#6b6b6b]">
                Loading jobs…
              </div>
            ) : filteredAndSortedJobs.length === 0 ? (
              <div className="text-center py-10 px-5 bg-[#f7f6f3] rounded-xl border border-[#e8e6e1]">
                <h3 className="text-[15px] font-semibold text-[#37352f] mb-1.5">
                  No jobs found
                </h3>
                <p className="text-[13px] text-[#6b6b6b] mb-4">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start tracking your job applications'}
                </p>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                  <Link to="/jobs/new" className="no-underline">
                    <button className="bg-indigo-500 text-white border-none rounded-[9px] px-[18px] py-2 text-[13.5px] font-semibold cursor-pointer shadow-[0_2px_8px_rgba(99,102,241,0.25)] hover:bg-indigo-600 transition-colors">
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

      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
