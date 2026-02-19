import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import QuickAddJob from "../components/QuickAddJob";
import AnalyticsWidgets from "../components/AnalyticsWidgets";
import JobCard from "../components/JobCard";
import JobDetailsModal from "../components/JobDetailsModal";
import { Link } from "react-router-dom";

const STATUS_LABELS = {
  applied: "Applied",
  online_test: "Online Test",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const SCROLL_POSITION_KEY = "dashboard_scroll_position";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showAnalyticsDetails, setShowAnalyticsDetails] = useState(false);
  const [showApplications, setShowApplications] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const dashboardRef = useRef(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
  });

  // Restore scroll position when component mounts
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedScrollPosition && dashboardRef.current) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        dashboardRef.current?.parentElement?.scrollTo(
          0,
          parseInt(savedScrollPosition, 10),
        );
      }, 0);
    }
  }, []);

  // Save scroll position before navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      const scrollPosition =
        dashboardRef.current?.parentElement?.scrollY || window.scrollY || 0;
      sessionStorage.setItem(SCROLL_POSITION_KEY, scrollPosition.toString());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    if (!jobs || !Array.isArray(jobs)) return [];

    let filtered = jobs.filter((job) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.position.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      // Type filter
      const matchesType =
        typeFilter === "all" || job.application_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date_applied) - new Date(a.date_applied);
      } else if (sortBy === "status") {
        const statusOrder = [
          "applied",
          "online_test",
          "interview",
          "offer",
          "rejected",
          "withdrawn",
        ];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
      return 0;
    });

    return filtered;
  }, [jobs, searchQuery, statusFilter, typeFilter, sortBy]);

  // Get upcoming interviews (next 7 days)
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

  // Handle filter click from analytics cards
  const handleFilterClick = (filterValue) => {
    setStatusFilter(filterValue);
    // Expand applications section when filtering so users can see results
    setShowApplications(true);
  };

  return (
    <div className="min-h-screen bg-white" ref={dashboardRef}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="page-title text-black mb-1">Dashboard</h1>
          <p className="helper-text text-gray-600">
            Track and manage your job applications
          </p>
        </div>

        {/* Analytics Section - Top Priority */}
        <div className="mb-4 sm:mb-6">
          <AnalyticsWidgets
            statusFilter={statusFilter}
            onFilterClick={handleFilterClick}
            showDetails={showAnalyticsDetails}
            onToggleDetails={() =>
              setShowAnalyticsDetails(!showAnalyticsDetails)
            }
          />
        </div>

        {/* Quick Add Job Section */}
        <QuickAddJob />

        {/* Main Dashboard Section - Applied Jobs */}
        <div className="bg-white border border-black mb-4">
          <button
            onClick={() => setShowApplications(!showApplications)}
            className="w-full px-4 sm:px-6 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <h2 className="section-heading text-black">
              My Applications ({filteredAndSortedJobs.length})
            </h2>
            <span className="text-black text-lg">
              {showApplications ? "−" : "+"}
            </span>
          </button>

          {showApplications && (
            <div className="px-4 sm:px-6 pb-3 sm:pb-4 border-t border-black">
              {/* Search and Filters */}
              <div className="mb-4 space-y-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by company or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-black focus:border-gray-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 border border-black focus:border-gray-500 focus:outline-none form-label"
                  >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-1.5 border border-black focus:border-gray-500 focus:outline-none form-label"
                  >
                    <option value="all">All Types</option>
                    <option value="on_campus">On-Campus</option>
                    <option value="off_campus">Off-Campus</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-black focus:border-gray-500 focus:outline-none form-label"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="status">Sort by Status</option>
                  </select>
                </div>
              </div>

              {/* Job List */}
              {isLoading ? (
                <div className="text-center py-8 body-text text-black">
                  Loading jobs...
                </div>
              ) : filteredAndSortedJobs.length === 0 ? (
                <div className="border border-gray-300 p-8 text-center">
                  <h3 className="subtitle text-black mb-2">No jobs found</h3>
                  <p className="helper-text text-gray-600 mb-4">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Start tracking your job applications"}
                  </p>
                  {!searchQuery &&
                    statusFilter === "all" &&
                    typeFilter === "all" && (
                      <Link
                        to="/jobs/new"
                        className="inline-block px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-colors"
                      >
                        Add Your First Job
                      </Link>
                    )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
                  {filteredAndSortedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewDetails={setSelectedJob}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Interviews Section */}
        {upcomingInterviews.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 p-3 sm:p-4 mb-4">
            <h3 className="subtitle text-yellow-900 mb-3">
              ⏰ Upcoming Interviews ({upcomingInterviews.length})
            </h3>
            <div className="space-y-1.5">
              {upcomingInterviews.map((job) => {
                const interviewDate = new Date(job.interview_date);
                const daysUntil = Math.ceil(
                  (interviewDate - new Date()) / (1000 * 60 * 60 * 24),
                );
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between body-text text-yellow-800 bg-white p-2 border border-yellow-200"
                  >
                    <div>
                      <strong className="font-medium">{job.company}</strong> -{" "}
                      {job.position}
                    </div>
                    <div className="text-yellow-700 font-medium">
                      {daysUntil === 0
                        ? "Today"
                        : daysUntil === 1
                          ? "Tomorrow"
                          : `${daysUntil} days`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
