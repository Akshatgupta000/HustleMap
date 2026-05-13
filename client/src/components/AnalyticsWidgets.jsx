import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/cn";

export default function AnalyticsWidgets() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
    retry: 2,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-slate-500">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

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

  const safeStats = stats || {
    total: 0,
    byStatus: {},
    interviewsScheduled: 0,
    interviewConversionRate: 0,
    offerRatio: 0,
    applicationsPerWeek: [],
  };

  const widgets = [
    {
      label: "Total Applications",
      value: safeStats.total || 0,
      description: "All job applications",
    },
    {
      label: "Interviews Scheduled",
      value: safeStats.interviewsScheduled || 0,
      description: "Upcoming interviews",
    },
    {
      label: "Offers Received",
      value: safeStats.byStatus?.offer || 0,
      description: "Job offers",
    },
    {
      label: "Online Test",
      value:
        (safeStats.byStatus?.online_test || 0) +
        (safeStats.byStatus?.assessment || 0) +
        (safeStats.byStatus?.oa || 0),
      description: "Online test and assessment applications",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[16px] font-bold text-slate-900 mb-4 tracking-tight px-1">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {widgets.map((widget, index) => (
            <div
              key={index}
              className={cn(
                "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col justify-between min-h-[100px]",
                "hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-300"
              )}
            >
              <div>
                <p className="text-[13px] font-semibold mb-2 text-slate-500">
                  {widget.label}
                </p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {widget.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
