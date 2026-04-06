import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import JobCard from "../components/JobCard";
import JobDetailsModal from "../components/JobDetailsModal";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Plus } from "lucide-react";
import { cn } from "../lib/cn";

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
  all:         { base: "bg-white/5 text-notion-muted",               active: "bg-white text-notion-bg" },
  applied:     { base: "bg-accent-purple/10 text-accent-purple",      active: "bg-accent-purple text-notion-bg" },
  online_test: { base: "bg-accent-purple/10 text-accent-purple",      active: "bg-accent-purple text-notion-bg" },
  interview:   { base: "bg-accent-purple/10 text-accent-purple",      active: "bg-accent-purple text-notion-bg" },
  offer:       { base: "bg-accent-green/10 text-accent-green",        active: "bg-accent-green text-notion-bg" },
  rejected:    { base: "bg-red-500/10 text-red-400",                  active: "bg-red-500 text-notion-bg" },
  withdrawn:   { base: "bg-notion-sidebar text-notion-muted",         active: "bg-notion-muted text-notion-bg" },
};

const selectClass =
  "h-9 rounded-[9px] border border-notion-border bg-notion-card px-3 text-[13px] text-notion-text cursor-pointer outline-none shadow-soft appearance-auto focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20";

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
          <h1 className="text-2xl font-extrabold text-notion-text tracking-tight mb-1">
            My Applications
          </h1>
          <p className="text-[13.5px] text-notion-muted">
            Search, filter, and manage your applications.
          </p>
        </div>
        <Link to="/jobs/new" className="no-underline">
          <button className="flex items-center justify-center gap-1.5 bg-accent-purple text-notion-bg border-none rounded-[10px] px-4 py-[9px] text-[14.5px] font-bold cursor-pointer shadow-soft transition-all hover:brightness-110 hover:scale-[1.03] w-full sm:w-auto">
            <Plus size={15} /> Add Job
          </button>
        </Link>
      </div>

      {/* ── Filters card ── */}
      <div className="bg-notion-card border border-notion-border rounded-2xl px-4 sm:px-5 py-4 shadow-soft flex flex-col gap-3">
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
        <div className="text-center py-16 text-[13.5px] text-notion-muted">
          Loading jobs…
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        <div className="bg-notion-card border border-notion-border rounded-2xl py-16 px-5 text-center shadow-soft">
          <h3 className="text-base font-bold text-notion-text mb-2">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "No jobs match your filters"
              : "No jobs yet"}
          </h3>
          <p className="text-[13.5px] text-notion-muted mb-5">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Start tracking your job applications"}
          </p>
          {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
            <Link to="/jobs/new" className="no-underline">
              <button className="bg-accent-purple text-notion-bg border-none rounded-[10px] px-5 py-[9px] text-[14.5px] font-bold cursor-pointer shadow-soft hover:brightness-110 transition-all">
                Add Your First Job
              </button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-[13px] text-notion-muted">
            Showing{" "}
            <strong className="text-notion-text">{filteredAndSortedJobs.length}</strong> of{" "}
            <strong className="text-notion-text">{jobs?.length || 0}</strong> applications
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
