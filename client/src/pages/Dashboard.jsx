import { useState, useMemo, useEffect } from 'react';
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

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showAnalyticsDetails, setShowAnalyticsDetails] = useState(false);
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
    'h-[38px] w-full sm:w-auto rounded-[10px] border border-notion-border bg-notion-card px-3 text-[13.5px] text-notion-text cursor-pointer outline-none transition-all shadow-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/10';

  return (
    <div className="flex flex-col gap-5">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-notion-text tracking-tight mb-1">
              Dashboard
            </h1>
            <p className="text-[13.5px] text-notion-muted">
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
        <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-2xl overflow-hidden shadow-soft">
          <div className="px-5 py-4 border-b border-accent-purple/20 flex items-center gap-2">
            <Calendar size={15} className="text-accent-purple" />
            <span className="text-sm font-bold text-accent-purple tracking-tight">
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
                  className="flex items-center justify-between bg-notion-card border border-accent-purple/20 rounded-[10px] px-[14px] py-[10px] text-[13.5px]"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-accent-purple">{job.company}</span>
                    <span className="text-notion-text ml-1.5">— {job.position}</span>
                  </div>
                  <span className="shrink-0 font-extrabold text-notion-bg bg-accent-purple px-2.5 py-0.5 rounded-full text-[10.5px] uppercase tracking-wider">
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Applications card ── */}
      <div className="bg-notion-card border border-notion-border rounded-2xl overflow-hidden shadow-sm">
        {/* Card header */}
        <div
          className={`flex items-center justify-between px-5 py-4 ${showApplications ? 'border-b border-notion-border/50' : ''}`}
        >
          <h2 className="text-[15px] font-bold text-notion-text tracking-tight">
            My Applications{' '}
            <span className="text-[12.5px] font-medium text-notion-muted bg-notion-bg px-2 py-0.5 rounded-full border border-notion-border ml-1.5">
              {filteredAndSortedJobs.length}
            </span>
          </h2>
          <button
            onClick={() => setShowApplications(!showApplications)}
            className="flex items-center gap-1.5 bg-transparent border border-notion-border rounded-lg px-[11px] py-[5px] text-[13px] font-medium text-notion-muted cursor-pointer transition-all hover:bg-notion-bg hover:text-notion-text"
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
              <div className="text-center py-10 text-[13.5px] text-notion-muted">
                Loading jobs…
              </div>
            ) : filteredAndSortedJobs.length === 0 ? (
              <div className="text-center py-10 px-5 bg-notion-bg rounded-xl border border-notion-border">
                <h3 className="text-[15px] font-semibold text-notion-text mb-1.5">
                  No jobs found
                </h3>
                <p className="text-[13px] text-notion-muted mb-4">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start tracking your job applications'}
                </p>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                  <Link to="/jobs/new" className="no-underline">
                    <button className="bg-accent-purple text-notion-bg border-none rounded-[9px] px-[18px] py-2 text-[13.5px] font-semibold cursor-pointer shadow-soft hover:brightness-110 transition-all">
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
