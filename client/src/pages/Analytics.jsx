import AnalyticsWidgets from "../components/AnalyticsWidgets";
import WeeklyTrendChart from "../components/WeeklyTrendChart";
import ConversionFunnel from "../components/ConversionFunnel";

export default function Analytics() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto pb-4">
      <div>
        <AnalyticsWidgets />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[250px]">
        <WeeklyTrendChart />
        <ConversionFunnel />
      </div>
    </div>
  );
}
