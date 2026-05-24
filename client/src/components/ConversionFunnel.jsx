import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { ChevronRight } from "lucide-react";

export default function ConversionFunnel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="bg-transparent border border-charcoal rounded-[28px] p-6 min-h-[300px] flex items-center justify-center">
        <span className="text-sm font-bold text-charcoal/50">Loading funnel...</span>
      </div>
    );
  }

  const safeStats = stats || { total: 0, byStatus: {} };
  const { byStatus, total } = safeStats;

  // Calculate funnel numbers (cumulative or current)
  // To make it an actual funnel, we'll show "Total" -> "Reached Interview Stage" -> "Offers"
  // Reached Interview = interview + offer
  const reachedInterview = (byStatus.interview || 0) + (byStatus.offer || 0);
  const offers = byStatus.offer || 0;
  
  // Ghosting / No response metric: total - (interview + offer + rejected + withdrawn + online_test/assessment)
  const responded = 
    (byStatus.interview || 0) + 
    (byStatus.offer || 0) + 
    (byStatus.rejected || 0) + 
    (byStatus.online_test || 0) + 
    (byStatus.assessment || 0) + 
    (byStatus.oa || 0);

  const ghosted = total - responded - (byStatus.withdrawn || 0);

  const funnelSteps = [
    { label: "Applications", value: total, color: "bg-charcoal" },
    { label: "Responses", value: responded, color: "bg-orange-400" },
    { label: "Interviews", value: reachedInterview, color: "bg-blue-900" },
    { label: "Offers", value: offers, color: "bg-green-500" }
  ];

  const maxVal = Math.max(total, 1);

  return (
    <div className="bg-transparent border border-charcoal rounded-[24px] p-5 flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[17px] font-extrabold text-charcoal tracking-tight">
          Conversion Funnel
        </h2>
        <span className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wide">
          All Time
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-3">
        {funnelSteps.map((step, idx) => {
          const widthPct = Math.max((step.value / maxVal) * 100, 5); // min 5% width for visibility
          const conversionRate = idx > 0 && funnelSteps[idx - 1].value > 0 
            ? Math.round((step.value / funnelSteps[idx - 1].value) * 100)
            : null;

          return (
            <div key={idx} className="flex flex-col gap-1 w-full">
              {/* Conversion rate indicator between steps */}
              {idx > 0 && (
                <div className="flex items-center gap-2 ml-4 mb-1">
                  <div className="w-[2px] h-3 bg-charcoal/20"></div>
                  <span className="text-[10px] font-bold text-charcoal/40 tracking-wider">
                    {conversionRate}% CONVERSION
                  </span>
                </div>
              )}
              
              {/* Funnel Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-8 bg-charcoal/5 rounded-r-full relative flex items-center">
                  <div 
                    className={`h-full ${step.color} rounded-r-full transition-all duration-700 ease-out flex items-center px-4`}
                    style={{ width: `${widthPct}%` }}
                  >
                  </div>
                  {/* Values floating over/next to the bar */}
                  <div className="absolute left-4 font-extrabold text-white">
                    {step.value}
                  </div>
                </div>
                <div className="w-24 shrink-0 text-right">
                  <span className="text-[13px] font-bold text-charcoal tracking-tight">
                    {step.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ghosting Stats */}
      <div className="mt-auto pt-4 border-t border-charcoal/10 flex items-center justify-between">
        <span className="text-[12px] font-extrabold text-charcoal/60">Ghosting Rate</span>
        <span className="text-[12px] font-extrabold text-charcoal px-3 py-1 bg-charcoal/5 rounded-full">
          {total > 0 ? Math.round((ghosted / total) * 100) : 0}%
        </span>
      </div>
    </div>
  );
}
