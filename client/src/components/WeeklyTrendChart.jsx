import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
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
        Week: {label}
      </p>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 700 }}>
        <span style={{ color: "#fff" }}>{payload[0].value}</span> applications
      </p>
    </div>
  );
};

export default function WeeklyTrendChart() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["jobStats"],
    queryFn: () => jobsAPI.getStats().then((res) => res.data),
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="bg-transparent border border-charcoal rounded-[28px] p-6 min-h-[300px] flex items-center justify-center">
        <span className="text-sm font-bold text-charcoal/50">Loading trend...</span>
      </div>
    );
  }

  const applicationsPerWeek = stats?.applicationsPerWeek || [];
  
  // The backend returns it sorted by descending week (newest first). We need chronological (oldest first).
  // Also, format the label. The backend week format is "YYYY-WXX"
  const chartData = [...applicationsPerWeek]
    .reverse()
    .map(item => {
      // Clean up the label for display (e.g. "2024-W20" -> "W20")
      const weekLabel = item.week.split('-')[1] || item.week;
      return {
        name: weekLabel,
        fullWeek: item.week,
        applications: item.count
      };
    });

  return (
    <div className="bg-transparent border border-charcoal rounded-[24px] p-5 flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-extrabold text-charcoal tracking-tight">
          Application Momentum
        </h2>
        <span className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wide">
          Last 4 Weeks
        </span>
      </div>

      <div className="relative h-[170px] w-full mt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#1c1c1c', fontSize: 11, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(28, 28, 28, 0.5)', fontSize: 11, fontWeight: 700 }}
                allowDecimals={false}
              />
              <Tooltip cursor={{ fill: 'rgba(28, 28, 28, 0.05)' }} content={<CustomTooltip />} />
              <Bar dataKey="applications" radius={[6, 6, 6, 6]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#1c1c1c' : '#a0a0a0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-charcoal/40 text-sm font-bold">
            No activity yet
          </div>
        )}
      </div>
    </div>
  );
}
