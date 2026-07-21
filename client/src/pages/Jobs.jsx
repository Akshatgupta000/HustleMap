import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import JobCard from "../components/JobCard";
import KanbanBoard from "../components/KanbanBoard";
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
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("jobsViewMode") || "list");

  useEffect(() => {
    localStorage.setItem("jobsViewMode", viewMode);
  }, [viewMode]);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  const kanbanFilteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((job) => {
      const company = (job?.company ?? "").toString();
      const position = (job?.position ?? "").toString();
      const matchesSearch =
        searchQuery === "" ||
        company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || job.application_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [jobs, searchQuery, typeFilter]);

  const clearAllMutation = useMutation({
    mutationFn: () => jobsAPI.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardFeed"] });
      import("react-hot-toast").then((toast) => {
        toast.default.success("All jobs cleared successfully");
      });
    },
    onError: () => {
      import("react-hot-toast").then((toast) => {
        toast.default.error("Failed to clear jobs");
      });
    },
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
    <div className="flex flex-col gap-4 lg:gap-6 h-full min-h-0 overflow-hidden pb-2">

      {/* ── Page header: Title, Search, Add Job on same level ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0 pb-2 border-b-2 border-charcoal/10">
        <h2 className="text-[22px] font-black text-charcoal tracking-tight flex items-center gap-3">
          Jobs List
          {!isLoading && (
            <span className="bg-white border-2 border-charcoal text-charcoal text-[13px] font-black px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_0px_#1c1c1c]">
              {filteredAndSortedJobs.length}
            </span>
          )}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Search & Mobile Filter Toggle row */}
          <div className="flex items-center gap-3 w-full sm:w-[320px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/50" />
              <Input
                type="text"
                placeholder="Search company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white border-2 border-charcoal rounded-[12px] font-bold text-[13px] text-charcoal placeholder:text-charcoal/40 focus:ring-0 focus:border-charcoal shadow-[2px_2px_0px_0px_#1c1c1c] w-full"
              />
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={cn(
                "lg:hidden flex items-center justify-center h-10 px-4 rounded-[12px] border-2 border-charcoal font-black text-[12px] uppercase tracking-wide cursor-pointer transition-all shadow-[2px_2px_0px_0px_#1c1c1c] shrink-0",
                showMobileFilters ? "bg-charcoal text-white shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white text-charcoal"
              )}
            >
              {showMobileFilters ? "Hide Filters" : "Filters"}
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border-2 border-charcoal rounded-[12px] bg-white p-0.5 shadow-[2px_2px_0px_0px_#1c1c1c] overflow-hidden shrink-0 w-full sm:w-auto justify-center">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5 text-[11px] font-black uppercase rounded-[8px] transition-all cursor-pointer flex-1 sm:flex-initial text-center",
                viewMode === "list" ? "bg-charcoal text-white" : "bg-transparent text-charcoal"
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-3 py-1.5 text-[11px] font-black uppercase rounded-[8px] transition-all cursor-pointer flex-1 sm:flex-initial text-center",
                viewMode === "kanban" ? "bg-charcoal text-white" : "bg-transparent text-charcoal"
              )}
            >
              Kanban
            </button>
          </div>

          <Link to="/jobs/new" className="no-underline w-full sm:w-auto shrink-0">
            <button className="flex items-center justify-center gap-1.5 bg-charcoal text-white border-2 border-charcoal rounded-[12px] px-5 h-10 text-[13px] font-black tracking-wide cursor-pointer shadow-[3px_3px_0px_0px_#1c1c1c] hover:shadow-[1px_1px_0px_0px_#1c1c1c] hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-full uppercase">
              <Plus size={16} strokeWidth={3} /> Add Job
            </button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 pt-2">
        {/* ── Left Sidebar Filters ── */}
        <aside className={cn(
          "w-full lg:w-[180px] shrink-0 flex-col gap-4 lg:flex overflow-y-auto custom-scrollbar lg:overflow-visible transition-all duration-300 bg-sage-light/50 lg:bg-transparent p-4 lg:p-0 rounded-[20px] lg:rounded-none border border-charcoal/15 lg:border-none",
          showMobileFilters ? "flex animate-in slide-in-from-top duration-200" : "hidden"
        )}>
          
          {/* Status Filter */}
          {viewMode === "list" ? (
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
          ) : (
            <div className="flex flex-col gap-1">
              <h3 className="text-[11px] font-black text-charcoal tracking-widest uppercase mb-1">Status</h3>
              <span className="text-[11px] font-bold text-charcoal/40 italic">
                All columns shown
              </span>
            </div>
          )}

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

          <div className="mt-auto pt-4 border-t border-charcoal/10 flex justify-center">
            {isConfirmingClear ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="text-[10px] font-black text-red-500 uppercase text-center leading-tight">
                  Are you sure?<br/>This cannot be undone.
                </span>
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={() => setIsConfirmingClear(false)}
                    className="flex-1 bg-white border border-charcoal/20 text-charcoal text-[10px] font-black uppercase py-1.5 rounded-lg hover:bg-charcoal/5"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      clearAllMutation.mutate();
                      setIsConfirmingClear(false);
                    }}
                    className="flex-1 bg-red-500 text-white text-[10px] font-black uppercase py-1.5 rounded-lg hover:bg-red-600 shadow-[1px_1px_0px_0px_#1c1c1c]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (jobs?.length > 0) setIsConfirmingClear(true);
                }}
                className={cn(
                  "text-red-500 font-bold text-[11px] uppercase tracking-widest hover:underline cursor-pointer opacity-80 hover:opacity-100",
                  (!jobs || jobs.length === 0) && "opacity-30 cursor-not-allowed hover:underline-none hover:opacity-30"
                )}
                disabled={!jobs || jobs.length === 0}
              >
                Clear All Jobs
              </button>
            )}
          </div>

        </aside>

        {/* ── Main Content / Results ── */}
        <div className="flex-1 w-full flex flex-col gap-4 min-w-0 h-full min-h-0">
          {viewMode === "list" ? (
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-6 pr-1">
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
          ) : (
            <div className="flex-1 min-h-0 h-full">
              {isLoading ? (
                <div className="bg-white border-2 border-charcoal rounded-[24px] py-20 text-center text-[15px] font-bold text-charcoal/60 shadow-[4px_4px_0px_0px_#1c1c1c]">
                  Loading your jobs…
                </div>
              ) : (
                <KanbanBoard jobs={kanbanFilteredJobs} onViewDetails={setSelectedJob} />
              )}
            </div>
          )}
        </div>
      </div>

      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
