import DetailedAnalytics from "../components/DetailedAnalytics";
import AnalyticsWidgets from "../components/AnalyticsWidgets";

export default function Analytics() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-8">
      <div>
        <AnalyticsWidgets />
      </div>

      <div>
        <DetailedAnalytics />
      </div>
    </div>
  );
}
