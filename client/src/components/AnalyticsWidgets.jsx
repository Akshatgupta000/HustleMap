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
  showDetails = false,
  onToggleDetails,
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
        <CardContent className="py-10 text-center text-sm text-notion-muted">
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="section-heading">Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
                "rounded-xl border border-notion-border bg-white p-4 shadow-soft transition-all duration-200",
                (isClickable || widget.filterValue === null) &&
                  "cursor-pointer hover:bg-black/5 hover:-translate-y-[1px]",
                isActive && "border-notion-accent/30 bg-notion-accent/10",
                !isClickable && widget.filterValue !== null && "opacity-75",
              )}
            >
              <p
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-notion-accent" : "text-notion-muted",
                )}
              >
                {widget.label}
              </p>
              <p
                className="text-2xl sm:text-3xl font-semibold tracking-tight text-notion-text"
              >
                {widget.value}
              </p>
              {isClickable && (
                <p
                  className={cn(
                    "mt-1 text-xs",
                    isActive ? "text-notion-muted" : "text-notion-muted",
                  )}
                >
                  Click to filter
                </p>
              )}
            </div>
          );
        })}
        </div>
        </CardContent>
      </Card>

      {/* Expandable Detailed Analytics */}
      {onToggleDetails && (
        <Card className="p-0">
          <button
            onClick={onToggleDetails}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/5 transition-all duration-200 rounded-xl"
          >
            <h3 className="section-heading">Detailed Analytics & Insights</h3>
            <span className="text-notion-muted text-sm">
              {showDetails ? "Hide" : "Show"}
            </span>
          </button>
          {showDetails && (
            <div className="px-6 pb-6 pt-2 space-y-4 border-t border-notion-border">
              {/* Applications Per Week */}
              {safeStats.applicationsPerWeek &&
                safeStats.applicationsPerWeek.length > 0 && (
                  <div className="rounded-xl border border-notion-border bg-black/5 p-4">
                    <h4 className="subtitle mb-3">
                      Applications Per Week (Last 4 Weeks)
                    </h4>
                    <div className="space-y-2">
                      {safeStats.applicationsPerWeek.map((week, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl bg-white border border-notion-border px-3 py-2 shadow-soft"
                        >
                          <span className="text-sm text-notion-text">
                            Week {week.week}
                          </span>
                          <span className="text-sm font-medium text-notion-text">
                            {week.count} {week.count === 1 ? "application" : "applications"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Status Distribution */}
              {safeStats.byStatus && Object.keys(safeStats.byStatus).length > 0 && (
                <div className="rounded-xl border border-notion-border bg-black/5 p-4">
                  <h4 className="subtitle mb-3">Status Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(safeStats.byStatus)
                      .sort((a, b) => b[1] - a[1])
                      .map(([status, count]) => {
                        const isClickableStatus = onFilterClick;
                        const isActive = statusFilter === status;
                        return (
                          <div
                            key={status}
                            onClick={() => {
                              if (isClickableStatus) {
                                handleCardClick(status);
                              }
                            }}
                            className={cn(
                              "flex items-center justify-between rounded-xl px-3 py-2 border border-notion-border bg-white shadow-soft transition-all duration-200",
                              isClickableStatus && "cursor-pointer hover:bg-black/5",
                              isActive && "border-notion-accent/30 bg-notion-accent/10",
                            )}
                          >
                            <span
                              className="text-sm text-notion-text"
                            >
                              {STATUS_LABELS[status] || status}
                            </span>
                            <span
                              className="text-sm font-medium text-notion-text"
                            >
                              {count}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Additional Stats */}
              {(safeStats.interviewConversionRate !== undefined ||
                safeStats.offerRatio !== undefined) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {safeStats.interviewConversionRate !== undefined && (
                    <div className="rounded-xl border border-notion-border bg-black/5 p-4">
                      <h4 className="subtitle mb-2">
                        Interview Conversion Rate
                      </h4>
                      <p className="text-2xl font-semibold tracking-tight text-notion-text">
                        {safeStats.interviewConversionRate}%
                      </p>
                      <p className="text-sm text-notion-muted mt-1">
                        Applied → Interview
                      </p>
                    </div>
                  )}
                  {safeStats.offerRatio !== undefined && (
                    <div className="rounded-xl border border-notion-border bg-black/5 p-4">
                      <h4 className="subtitle mb-2">Offer Rate</h4>
                      <p className="text-2xl font-semibold tracking-tight text-notion-text">
                        {safeStats.offerRatio}%
                      </p>
                      <p className="text-sm text-notion-muted mt-1">
                        Total → Offer
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
