import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";

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
      <div className="border border-black bg-white p-4">
        <div className="text-center py-8 body-text text-black">
          Loading analytics...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error("AnalyticsWidgets: Error loading stats", error);
    return (
      <div className="border border-red-500 bg-red-50 p-4">
        <div className="text-center py-4">
          <p className="body-text text-red-800 mb-2">
            Failed to load analytics
          </p>
          <p className="helper-text text-red-600">
            {error.response?.data?.error || error.message || "Please refresh the page"}
          </p>
        </div>
      </div>
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
      <div className="bg-white border border-black p-3 sm:p-4">
        <h2 className="section-heading text-black mb-3 sm:mb-4">
          Analytics Overview
        </h2>
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
              className={`
                border-2 border-black p-4 sm:p-5 rounded-sm
                transition-all duration-200
                ${isClickable || widget.filterValue === null ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : ""}
                ${isActive ? "bg-black text-white shadow-lg" : "bg-white text-black hover:bg-gray-50"}
                ${!isClickable && widget.filterValue !== null ? "opacity-75" : ""}
              `}
              style={{
                boxShadow: isActive
                  ? "4px 4px 0px 0px rgba(0,0,0,0.2)"
                  : "2px 2px 0px 0px rgba(0,0,0,0.1)",
              }}
            >
              <p
                className={`form-label mb-2 ${
                  isActive ? "text-white opacity-90" : "text-gray-600"
                }`}
                style={{ fontSize: "0.875rem" }}
              >
                {widget.label}
              </p>
              <p
                className={`font-bold ${
                  isActive ? "text-white" : "text-black"
                }`}
                style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
              >
                {widget.value}
              </p>
              {isClickable && (
                <p
                  className={`helper-text mt-1.5 ${
                    isActive ? "text-white opacity-75" : "text-gray-500"
                  }`}
                >
                  Click to filter
                </p>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Expandable Detailed Analytics */}
      {onToggleDetails && (
        <div className="border border-black bg-white">
          <button
            onClick={onToggleDetails}
            className="w-full px-4 sm:px-6 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="section-heading text-black">
              Detailed Analytics & Insights
            </h3>
            <span className="text-black text-lg">
              {showDetails ? "−" : "+"}
            </span>
          </button>
          {showDetails && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-black pt-4 space-y-4">
              {/* Applications Per Week */}
              {safeStats.applicationsPerWeek &&
                safeStats.applicationsPerWeek.length > 0 && (
                  <div className="border border-gray-300 p-4 bg-gray-50">
                    <h4 className="subtitle mb-3 text-black">
                      Applications Per Week (Last 4 Weeks)
                    </h4>
                    <div className="space-y-2">
                      {safeStats.applicationsPerWeek.map((week, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 bg-white border border-gray-200"
                        >
                          <span className="body-text text-black">
                            Week {week.week}
                          </span>
                          <span className="body-text font-semibold text-black">
                            {week.count} {week.count === 1 ? "application" : "applications"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Status Distribution */}
              {safeStats.byStatus && Object.keys(safeStats.byStatus).length > 0 && (
                <div className="border border-gray-300 p-4 bg-gray-50">
                  <h4 className="subtitle mb-3 text-black">
                    Status Distribution
                  </h4>
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
                            className={`
                              flex items-center justify-between py-2 px-3
                              border-2 transition-all duration-200
                              ${
                                isClickableStatus
                                  ? "cursor-pointer hover:shadow-md"
                                  : ""
                              }
                              ${
                                isActive
                                  ? "bg-black text-white border-black"
                                  : "bg-white border-gray-200 hover:border-gray-400"
                              }
                            `}
                          >
                            <span
                              className={`body-text ${
                                isActive ? "text-white" : "text-black"
                              }`}
                            >
                              {STATUS_LABELS[status] || status}
                            </span>
                            <span
                              className={`body-text font-semibold ${
                                isActive ? "text-white" : "text-black"
                              }`}
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
                    <div className="border border-gray-300 p-4 bg-gray-50">
                      <h4 className="subtitle mb-2 text-black">
                        Interview Conversion Rate
                      </h4>
                      <p className="text-2xl font-bold text-black">
                        {safeStats.interviewConversionRate}%
                      </p>
                      <p className="helper-text text-gray-600 mt-1">
                        Applied → Interview
                      </p>
                    </div>
                  )}
                  {safeStats.offerRatio !== undefined && (
                    <div className="border border-gray-300 p-4 bg-gray-50">
                      <h4 className="subtitle mb-2 text-black">Offer Rate</h4>
                      <p className="text-2xl font-bold text-black">
                        {safeStats.offerRatio}%
                      </p>
                      <p className="helper-text text-gray-600 mt-1">
                        Total → Offer
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
