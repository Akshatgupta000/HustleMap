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
  all:         { base: "bg-transparent text-charcoal border border-charcoal hover:bg-charcoal/5", active: "bg-charcoal text-white border border-charcoal" },
  applied:     { base: "bg-transparent text-charcoal border border-charcoal hover:bg-charcoal/5", active: "bg-charcoal text-white border border-charcoal" },
  online_test: { base: "bg-transparent text-charcoal border border-charcoal hover:bg-charcoal/5", active: "bg-charcoal text-white border border-charcoal" },
  interview:   { base: "bg-transparent text-charcoal border border-charcoal hover:bg-charcoal/5", active: "bg-charcoal text-white border border-charcoal" },
  offer:       { base: "bg-transparent text-accent-green border border-accent-green hover:bg-accent-green/5", active: "bg-accent-green text-white border border-accent-green" },
  rejected:    { base: "bg-transparent text-red-500 border border-red-500 hover:bg-red-500/5", active: "bg-red-500 text-white border border-red-500" },
  withdrawn:   { base: "bg-transparent text-charcoal/50 border border-charcoal/50 hover:bg-charcoal/5", active: "bg-charcoal/50 text-white border border-charcoal/50" },
};

const selectClass =
  "h-10 rounded-full border border-charcoal bg-transparent px-4 text-[13px] font-semibold text-charcoal cursor-pointer outline-none shadow-none appearance-auto focus:border-charcoal focus:ring-2 focus:ring-charcoal/20";

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
          <h1 className="text-[28px] font-extrabold text-charcoal tracking-tight mb-1">
            My Applications
          </h1>
          <p className="text-[14px] text-charcoal/60 font-semibold">
            Search, filter, and manage your applications.
          </p>
        </div>
        <Link to="/jobs/new" className="no-underline">
          <button className="flex items-center justify-center gap-1.5 bg-charcoal text-white border-none rounded-full px-5 py-[11px] text-[14.5px] font-bold cursor-pointer transition-all hover:brightness-110 hover:scale-[1.03] w-full sm:w-auto">
            <Plus size={15} /> Add Job
          </button>
        </Link>
      </div>

      {/* ── Filters card ── */}
      <div className="bg-transparent border border-charcoal rounded-[32px] px-4 sm:px-6 py-5 flex flex-col gap-4">
        {/* Search */}
        <Input
          type="text"
          placeholder="Search by company or role…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-full border-charcoal bg-white/50 focus:ring-charcoal/20"
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
                className={`rounded-full px-[13px] py-[5px] text-[12.5px] cursor-pointer transition-all tracking-tight ${
                  isActive ? colors.active + ' font-bold' : colors.base + ' font-bold hover:scale-[1.04]'
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
        <div className="text-center py-16 text-[13.5px] text-charcoal/60">
          Loading jobs…
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        <div className="bg-transparent border border-charcoal rounded-[32px] py-16 px-5 text-center shadow-sm">
          <h3 className="text-base font-extrabold text-charcoal mb-2">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "No jobs match your filters"
              : "No jobs yet"}
          </h3>
          <p className="text-[13.5px] text-charcoal/60 mb-5">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Start tracking your job applications"}
          </p>
          {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
            <Link to="/jobs/new" className="no-underline">
              <button className="bg-charcoal text-white border-none rounded-full px-5 py-[9px] text-[14.5px] font-bold cursor-pointer shadow-sm hover:brightness-110 transition-all">
                Add Your First Job
              </button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-[13px] text-charcoal/60">
            Showing{" "}
            <strong className="text-charcoal">{filteredAndSortedJobs.length}</strong> of{" "}
            <strong className="text-charcoal">{jobs?.length || 0}</strong> applications
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
