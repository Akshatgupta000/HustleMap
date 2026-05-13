import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "../lib/cn";

const STATUS_LABELS = {
  applied: "Applied",
  online_test: "Online Test",
  assessment: "Assessment",
  oa: "Online Assessment",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export default function AnalyticsWidgets({
  statusFilter,
  onFilterClick,
}) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
    retry: 2, // Retry failed requests
  });

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-slate-500">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    console.error("AnalyticsWidgets: Error loading stats", error);
    return (
      <Card className="border-red-200 bg-red-50/60">
        <CardContent className="py-6 text-center">
          <p className="text-sm font-medium text-red-900 mb-1">
            Failed to load analytics
          </p>
          <p className="text-sm text-red-800/80">
            {error.response?.data?.error ||
              error.message ||
              "Please refresh the page"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Default to empty stats object if stats is null/undefined
  // This ensures the component always renders
  const safeStats = stats || {
    total: 0,
    byStatus: {},
    interviewsScheduled: 0,
    interviewConversionRate: 0,
    offerRatio: 0,
    applicationsPerWeek: [],
  };

  const handleCardClick = (filterValue) => {
    if (onFilterClick) {
      onFilterClick(filterValue);
    }
  };

  const widgets = [
    {
      label: "Total Applications",
      value: safeStats.total || 0,
      filterValue: "all",
      description: "All job applications",
    },
    {
      label: "Interviews Scheduled",
      value: safeStats.interviewsScheduled || 0,
      filterValue: "interview",
      description: "Upcoming interviews",
    },
    {
      label: "Offers Received",
      value: safeStats.byStatus?.offer || 0,
      filterValue: "offer",
      description: "Job offers",
    },
    {
      label: "Online Test",
      value:
        (safeStats.byStatus?.online_test || 0) +
        (safeStats.byStatus?.assessment || 0) +
        (safeStats.byStatus?.oa || 0),
      filterValue: "online_test", // Filter to show online test applications
      description: "Online test and assessment applications",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Key Metrics - Enhanced Styling */}
      <div>
        <h2 className="text-[16px] font-bold text-slate-900 mb-4 tracking-tight px-1">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {widgets.map((widget, index) => {
          const isActive =
            widget.filterValue === statusFilter ||
            (widget.filterValue === null && statusFilter === "all");
          const isClickable = onFilterClick && widget.filterValue !== null;

          return (
            <div
              key={index}
              onClick={() => {
                if (isClickable) {
                  handleCardClick(widget.filterValue);
                } else if (widget.filterValue === null) {
                  handleCardClick("all");
                }
              }}
              className={cn(
                "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col justify-between min-h-[100px]",
                (isClickable || widget.filterValue === null) &&
                  "cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-300",
                isActive && "border-slate-500 bg-slate-50/50 ring-1 ring-slate-500",
                !isClickable && widget.filterValue !== null && "opacity-75",
              )}
            >
              <div>
                <p
                  className={cn(
                    "text-[13px] font-semibold mb-2",
                    isActive ? "text-slate-900" : "text-slate-500",
                  )}
                >
                  {widget.label}
                </p>
                <p
                  className="text-3xl font-extrabold tracking-tight text-slate-900"
                >
                  {widget.value}
                </p>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
