import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { Layers, CalendarCheck, Award, FileCheck } from "lucide-react";

const WIDGET_ICONS = [Layers, CalendarCheck, Award, FileCheck];

export default function AnalyticsWidgets() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="bg-transparent border border-charcoal rounded-[28px] py-10 flex items-center justify-center">
        <span className="text-sm font-bold text-charcoal/50">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    console.error("AnalyticsWidgets: Error loading stats", error);
    return (
      <div className="bg-transparent border border-charcoal rounded-[28px] py-6 px-6 text-center">
        <p className="text-sm font-bold text-charcoal mb-1">Failed to load analytics</p>
        <p className="text-sm text-charcoal/60">
          {error.response?.data?.error || error.message || "Please refresh the page"}
        </p>
      </div>
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
      label: "Online Tests",
      value:
        (safeStats.byStatus?.online_test || 0) +
        (safeStats.byStatus?.assessment || 0) +
        (safeStats.byStatus?.oa || 0),
      description: "Assessments & OAs",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-extrabold text-charcoal tracking-tight px-1">Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {widgets.map((widget, index) => {
          const Icon = WIDGET_ICONS[index];
          return (
            <div
              key={index}
              className="rounded-[24px] border border-charcoal bg-transparent p-5 flex flex-col justify-between min-h-[110px] hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-extrabold text-charcoal/50 uppercase tracking-wide">
                  {widget.label}
                </p>
                <div className="p-1.5 rounded-[10px] bg-charcoal/8 text-charcoal/60">
                  <Icon size={13} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-charcoal">
                {widget.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
