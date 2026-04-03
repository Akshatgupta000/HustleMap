import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import JobCard from "../components/JobCard";
import JobDetailsModal from "../components/JobDetailsModal";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Plus } from "lucide-react";

const STATUS_FILTERS = ["all", "applied", "online_test", "interview", "offer", "rejected", "withdrawn"];
const STATUS_LABELS = {
  all: "All",
  applied: "Applied",
  online_test: "Online Test",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const STATUS_COLORS = {
  all:         { base: "bg-[#f7f6f3] text-[#6b6b6b]",         active: "bg-[#37352f] text-white" },
  applied:     { base: "bg-blue-50 text-blue-700",             active: "bg-blue-500 text-white" },
  online_test: { base: "bg-amber-50 text-amber-800",           active: "bg-amber-400 text-white" },
  interview:   { base: "bg-violet-50 text-violet-700",         active: "bg-indigo-500 text-white" },
  offer:       { base: "bg-emerald-50 text-emerald-800",       active: "bg-emerald-500 text-white" },
  rejected:    { base: "bg-red-50 text-red-800",               active: "bg-red-500 text-white" },
  withdrawn:   { base: "bg-gray-100 text-gray-700",            active: "bg-gray-500 text-white" },
};

const selectClass =
  "h-9 rounded-[9px] border border-[#e8e6e1] bg-white px-3 text-[13px] text-[#37352f] cursor-pointer outline-none shadow-sm appearance-auto focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export default function Jobs() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedJob, setSelectedJob] = useState(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("[Jobs] jobs:", jobs);
    }
  }, [jobs]);

  const filteredAndSortedJobs = useMemo(() => {
    if (!jobs) return [];
    let filtered = jobs.filter((job) => {
      const company = (job?.company ?? "").toString();
      const position = (job?.position ?? "").toString();
      const matchesSearch =
        searchQuery === "" ||
        company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      const matchesType = typeFilter === "all" || job.application_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
    filtered.sort((a, b) => {
      if (sortBy === "date") return new Date(b.date_applied) - new Date(a.date_applied);
      if (sortBy === "status") {
        const statusOrder = ["applied", "online_test", "interview", "offer", "rejected", "withdrawn"];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
      return 0;
    });
    return filtered;
  }, [jobs, searchQuery, statusFilter, typeFilter, sortBy]);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#37352f] tracking-tight mb-1">
            My Applications
          </h1>
          <p className="text-[13.5px] text-[#6b6b6b]">
            Search, filter, and manage your applications.
          </p>
        </div>
        <Link to="/jobs/new" className="no-underline">
          <button className="flex items-center justify-center gap-1.5 bg-indigo-500 text-white border-none rounded-[10px] px-4 py-[9px] text-[13.5px] font-semibold cursor-pointer shadow-[0_2px_10px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-600 hover:scale-[1.03] w-full sm:w-auto">
            <Plus size={15} /> Add Job
          </button>
        </Link>
      </div>

      {/* ── Filters card ── */}
      <div className="bg-white border border-[#e8e6e1] rounded-2xl px-4 sm:px-5 py-4 shadow-sm flex flex-col gap-3">
        {/* Search */}
        <Input
          type="text"
          placeholder="Search by company or role…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Status pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((status) => {
            const isActive = statusFilter === status;
            const colors = STATUS_COLORS[status];
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`border-none rounded-full px-[13px] py-[5px] text-[12.5px] cursor-pointer transition-all tracking-tight ${
                  isActive ? colors.active + ' font-semibold' : colors.base + ' font-medium hover:scale-[1.04]'
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>

        {/* Type & Sort selects */}
        <div className="flex gap-2 flex-wrap">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={cn(selectClass, "w-full sm:w-auto")}>
            <option value="all">All Types</option>
            <option value="on_campus">On-Campus</option>
            <option value="off_campus">Off-Campus</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={cn(selectClass, "w-full sm:w-auto")}>
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* ── Results ── */}
      {isLoading ? (
        <div className="text-center py-16 text-[13.5px] text-[#6b6b6b]">
          Loading jobs…
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        <div className="bg-white border border-[#e8e6e1] rounded-2xl py-16 px-5 text-center shadow-sm">
          <h3 className="text-base font-bold text-[#37352f] mb-2">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "No jobs match your filters"
              : "No jobs yet"}
          </h3>
          <p className="text-[13.5px] text-[#6b6b6b] mb-5">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Start tracking your job applications"}
          </p>
          {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
            <Link to="/jobs/new" className="no-underline">
              <button className="bg-indigo-500 text-white border-none rounded-[10px] px-5 py-[9px] text-[13.5px] font-semibold cursor-pointer shadow-[0_2px_8px_rgba(99,102,241,0.25)] hover:bg-indigo-600 transition-colors">
                Add Your First Job
              </button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-[13px] text-[#9b9994]">
            Showing{" "}
            <strong className="text-[#6b6b6b]">{filteredAndSortedJobs.length}</strong> of{" "}
            <strong className="text-[#6b6b6b]">{jobs?.length || 0}</strong> applications
          </p>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {filteredAndSortedJobs.map((job) => (
              <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
            ))}
          </div>
        </>
      )}

      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
