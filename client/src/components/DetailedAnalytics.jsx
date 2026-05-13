import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
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

const COLORS = ['#0f172a', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const popOutRadius = outerRadius + 4;
  const tipX = cx + (popOutRadius + 2) * cos;
  const tipY = cy + (popOutRadius + 2) * sin;

  const bx = cx + (popOutRadius + 30) * cos;
  const by = cy + (popOutRadius + 30) * sin;

  const perpX = -sin;
  const perpY = cos;
  const baseWidth = 6;
  const baseX1 = bx + perpX * baseWidth;
  const baseY1 = by + perpY * baseWidth;
  const baseX2 = bx - perpX * baseWidth;
  const baseY2 = by - perpY * baseWidth;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={popOutRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <polygon 
        points={`${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`} 
        fill="#0f172a" 
      />
      <rect 
        x={bx - 25} 
        y={by - 12} 
        width={50} 
        height={24} 
        rx={12} 
        fill="#0f172a" 
      />
      <text 
        x={bx} 
        y={by + 4} 
        textAnchor="middle" 
        fill="#ffffff" 
        fontSize={11} 
        fontWeight="bold"
      >
        {value}
      </text>
    </g>
  );
};

export default function DetailedAnalytics() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[500px] flex items-center justify-center text-slate-500 text-sm">
        Loading statistics...
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

  // Prepare chart data from byStatus
  const chartData = Object.entries(safeStats.byStatus || {})
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      key: status
    }));

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">Statistic</h2>
        <select className="text-[12px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 font-medium outline-none">
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
                onClick={(_, index) => setActiveIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-slate-400 text-sm">No data available</div>
        )}
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] text-slate-500 font-medium">Total Apps</span>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{safeStats.total}</span>
        </div>
      </div>

      {/* Conversion Stats */}
      <div className="flex gap-3 justify-center mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-slate-900"></div>
          <span className="text-[11px] text-slate-500 font-medium">Applied → Int: {safeStats.interviewConversionRate || 0}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-slate-300"></div>
          <span className="text-[11px] text-slate-500 font-medium">Total → Offer: {safeStats.offerRatio || 0}%</span>
        </div>
      </div>

      {/* Detailed List */}
      <div className="flex flex-col gap-3 mt-2">
        {chartData.map((item, index) => (
          <div 
            key={index} 
            onClick={() => setActiveIndex(index)}
            className={cn(
              "flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border",
              activeIndex === index 
                ? "bg-white border-slate-300 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)]" 
                : "bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-slate-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              >
                {item.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-slate-900">{item.name}</span>
                <span className="text-[11px] text-slate-500 font-medium">{item.value} applications</span>
              </div>
            </div>
            <div className="text-[14px] font-bold text-slate-900">
              {Math.round((item.value / safeStats.total) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
