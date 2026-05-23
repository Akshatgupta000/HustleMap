import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import JobCard from "../components/JobCard";
import JobDetailsModal from "../components/JobDetailsModal";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Plus, Search, CheckCircle2, Circle } from "lucide-react";
import { cn } from "../lib/cn";

const STATUS_FILTERS = ["all", "applied", "online_test", "interview", "offer", "rejected", "withdrawn"];
const STATUS_LABELS = {
  all: "All Statuses",
  applied: "Applied",
  online_test: "Online Test",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const TYPE_FILTERS = ["all", "on_campus", "off_campus"];
const TYPE_LABELS = {
  all: "All Types",
  on_campus: "On-Campus",
  off_campus: "Off-Campus"
};

const SORT_OPTIONS = ["date", "status"];
const SORT_LABELS = {
  date: "Date Applied",
  status: "Status"
};

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

  const FilterItem = ({ label, isActive, onClick }) => (
    <div 
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer group py-0.5"
    >
      {isActive ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-charcoal transition-transform group-active:scale-90 shrink-0" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-charcoal/30 group-hover:text-charcoal/60 transition-all group-active:scale-90 shrink-0" />
      )}
      <span className={cn(
        "text-[12px] transition-colors",
        isActive ? "font-black text-charcoal" : "font-bold text-charcoal/50 group-hover:text-charcoal"
      )}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-10">

      {/* ── Page header ── */}
      <div className="flex justify-end mb-2">
        <Link to="/jobs/new" className="no-underline shrink-0">
          <button className="flex items-center justify-center gap-1.5 bg-charcoal text-white border-2 border-charcoal rounded-[12px] px-4 py-2 text-[12px] font-black tracking-wide cursor-pointer shadow-[3px_3px_0px_0px_#1c1c1c] hover:shadow-[1px_1px_0px_0px_#1c1c1c] hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-full sm:w-auto uppercase">
            <Plus size={14} strokeWidth={3} /> Add Job
          </button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Left Sidebar Filters ── */}
        <aside className="w-full lg:w-[180px] shrink-0 flex flex-col gap-4">
          
          {/* Search */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[11px] font-black text-charcoal tracking-widest uppercase">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal/50" />
              <Input
                type="text"
                placeholder="Company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 bg-white border border-charcoal rounded-[12px] font-bold text-[12px] text-charcoal placeholder:text-charcoal/40 focus:ring-0 focus:border-charcoal"
              />
            </div>
          </div>

          <div className="h-[1px] w-full bg-charcoal/10 rounded-full"></div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <h3 className="text-[11px] font-black text-charcoal tracking-widest uppercase mb-1">Status</h3>
            <div className="flex flex-col gap-0">
              {STATUS_FILTERS.map((status) => (
                <FilterItem
                  key={status}
                  label={STATUS_LABELS[status]}
                  isActive={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                />
              ))}
            </div>
          </div>

          <div className="h-[1px] w-full bg-charcoal/10 rounded-full"></div>

          {/* Type Filter */}
          <div className="flex flex-col gap-1">
            <h3 className="text-[11px] font-black text-charcoal tracking-widest uppercase mb-1">Type</h3>
            <div className="flex flex-col gap-0">
              {TYPE_FILTERS.map((type) => (
                <FilterItem
                  key={type}
                  label={TYPE_LABELS[type]}
                  isActive={typeFilter === type}
                  onClick={() => setTypeFilter(type)}
                />
              ))}
            </div>
          </div>

          <div className="h-[1px] w-full bg-charcoal/10 rounded-full"></div>

          {/* Sort Order */}
          <div className="flex flex-col gap-1">
            <h3 className="text-[11px] font-black text-charcoal tracking-widest uppercase mb-1">Sort By</h3>
            <div className="flex flex-col gap-0">
              {SORT_OPTIONS.map((sort) => (
                <FilterItem
                  key={sort}
                  label={SORT_LABELS[sort]}
                  isActive={sortBy === sort}
                  onClick={() => setSortBy(sort)}
                />
              ))}
            </div>
          </div>

        </aside>

        {/* ── Main Content / Results ── */}
        <div className="flex-1 w-full flex flex-col gap-4 min-w-0">
          {/* Header row for results */}
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-[20px] font-black text-charcoal tracking-tight flex items-center gap-3">
              Jobs List
              {!isLoading && (
                <span className="bg-white border-2 border-charcoal text-charcoal text-[13px] font-black px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_0px_#1c1c1c]">
                  {filteredAndSortedJobs.length}
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="bg-white border-2 border-charcoal rounded-[24px] py-20 text-center text-[15px] font-bold text-charcoal/60 shadow-[4px_4px_0px_0px_#1c1c1c]">
              Loading your jobs…
            </div>
          ) : filteredAndSortedJobs.length === 0 ? (
            <div className="bg-white border-2 border-charcoal rounded-[32px] py-20 px-6 text-center shadow-[6px_6px_0px_0px_#1c1c1c] flex flex-col items-center">
              <h3 className="text-[20px] font-black text-charcoal mb-3">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "No jobs match your filters"
                  : "No jobs yet"}
              </h3>
              <p className="text-[15px] font-bold text-charcoal/60 mb-8 max-w-sm">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search or unchecking some filters."
                  : "Start tracking your job applications and stay organized."}
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="bg-sage-light text-charcoal border-2 border-charcoal rounded-full px-6 py-3 text-[14px] font-black cursor-pointer shadow-[3px_3px_0px_0px_#1c1c1c] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#1c1c1c] transition-all uppercase tracking-wide"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
            >
              {filteredAndSortedJobs.map((job) => (
                <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
              ))}
            </div>
          )}
        </div>
      </div>

      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
