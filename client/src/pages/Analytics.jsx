import DetailedAnalytics from "../components/DetailedAnalytics";
import AnalyticsWidgets from "../components/AnalyticsWidgets";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-500" />
            Analytics & Insights
          </h1>
          <p className="text-[13.5px] text-slate-500 font-medium">
            Track your job search progress, conversion rates, and metrics.
          </p>
        </div>
      </div>

      <div className="mt-2">
        <AnalyticsWidgets />
      </div>
      
      <div className="mt-2">
        <DetailedAnalytics />
      </div>
    </div>
  );
}
