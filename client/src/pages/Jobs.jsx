import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import JobCard from "../components/JobCard";
import JobDetailsModal from "../components/JobDetailsModal";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";

const STATUS_FILTERS = [
  "all",
  "applied",
  "online_test",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];
const STATUS_LABELS = {
  all: "All",
  applied: "Applied",
  online_test: "Online Test",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export default function Jobs() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'status'
  const [selectedJob, setSelectedJob] = useState(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    if (!jobs) return [];

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <h1 className="page-title text-black">My Applications</h1>
            <Link
              to="/jobs/new"
              className="px-3 py-1.5 border border-black text-black hover:bg-black hover:text-white whitespace-nowrap form-label"
            >
              Add Job
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search by company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 border border-black focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 form-label whitespace-nowrap border ${
                    statusFilter === status
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black hover:bg-black hover:text-white"
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-black focus:border-gray-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="on_campus">On-Campus</option>
              <option value="off_campus">Off-Campus</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-black focus:border-gray-500 focus:outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 body-text text-black">
            Loading jobs...
          </div>
        ) : filteredAndSortedJobs.length === 0 ? (
          <div className="border border-black p-8 text-center">
            <h3 className="subtitle text-black mb-2">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "No jobs match your filters"
                : "No jobs yet"}
            </h3>
            <p className="helper-text text-black mb-4">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start tracking your job applications"}
            </p>
            {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
              <Link
                to="/jobs/new"
                className="inline-block px-4 py-2 border border-black text-black hover:bg-black hover:text-white"
              >
                Add Your First Job
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-3 helper-text text-black">
              Showing {filteredAndSortedJobs.length} of {jobs?.length || 0}{" "}
              applications
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {filteredAndSortedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={setSelectedJob}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
