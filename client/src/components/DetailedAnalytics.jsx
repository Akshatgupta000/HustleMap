import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from "recharts";

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

// Charcoal-family palette to match the app's design language
const COLORS = ['#1c1c1c', '#3d3d3d', '#6b6b6b', '#9a9a9a', '#c4c4c4', '#e0e0e0'];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
  return (
    <div
      style={{
        background: "#1c1c1c",
        borderRadius: "14px",
        padding: "8px 14px",
        pointerEvents: "none",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      <p style={{ color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", marginBottom: 2 }}>
        {item.name}
      </p>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 700 }}>
        {item.value} apps · <span style={{ color: "#fff" }}>{pct}%</span>
      </p>
    </div>
  );
};

export default function DetailedAnalytics() {
  const [activeIndex, setActiveIndex] = useState(null);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="bg-transparent border border-charcoal rounded-[28px] p-6 min-h-[500px] flex items-center justify-center">
        <span className="text-sm font-bold text-charcoal/50">Loading statistics...</span>
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

  const chartData = Object.entries(safeStats.byStatus || {})
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      key: status,
    }));

  return (
    <div className="bg-transparent border border-charcoal rounded-[28px] p-6 sm:p-7 flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-extrabold text-charcoal tracking-tight">
          Status Breakdown
        </h2>
        <select className="text-[11px] bg-transparent border border-charcoal rounded-full px-3 py-1.5 text-charcoal font-bold outline-none cursor-pointer hover:bg-charcoal hover:text-white transition-colors">
          <option>All Time</option>
          <option>This Week</option>
        </select>
      </div>

      {/* Donut Chart */}
      <div className="relative h-[220px] w-full flex items-center justify-center">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{ cursor: "pointer" }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip total={safeStats.total} />}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-charcoal/40 text-sm font-bold">No data available</div>
        )}

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] text-charcoal/50 font-extrabold uppercase tracking-wide">
            Total
          </span>
          <span className="text-2xl font-extrabold text-charcoal tracking-tight">
            {safeStats.total}
          </span>
        </div>
      </div>

      {/* Conversion Stats */}
      <div className="flex gap-3 justify-center flex-wrap">
        <div className="flex items-center gap-2 border border-charcoal rounded-full px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-charcoal shrink-0" />
          <span className="text-[11px] font-extrabold text-charcoal/70 tracking-wide">
            Applied → Interview: {safeStats.interviewConversionRate || 0}%
          </span>
        </div>
        <div className="flex items-center gap-2 border border-charcoal rounded-full px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-charcoal/40 shrink-0" />
          <span className="text-[11px] font-extrabold text-charcoal/70 tracking-wide">
            Total → Offer: {safeStats.offerRatio || 0}%
          </span>
        </div>
      </div>

    </div>
  );
}
