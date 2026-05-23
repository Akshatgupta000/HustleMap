import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../../lib/api";
import { Activity, Clock } from "lucide-react";

// Lightweight timeAgo helper
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

export default function RecentActivityFeed() {
  const { data: feed, isLoading } = useQuery({
    queryKey: ["dashboardFeed"],
    queryFn: () => jobsAPI.getDashboardFeed().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="bg-transparent border border-charcoal/20 rounded-[24px] p-5 flex items-center justify-center min-h-[180px]">
        <div className="text-[12.5px] text-charcoal/50 font-medium">Loading activity...</div>
      </div>
    );
  }

  const activities = feed?.recentActivity || [];

  return (
    <div className="bg-transparent border border-charcoal/20 rounded-[24px] overflow-hidden flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-charcoal/10 flex items-center gap-2 shrink-0">
        <Activity size={14} className="text-charcoal/70" />
        <span className="text-[13.5px] font-extrabold text-charcoal tracking-tight">Recent Activity</span>
      </div>

      <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-charcoal/45 text-[12.5px] font-medium">
            No recent activity found.
          </div>
        ) : (
          <div className="relative border-l border-charcoal/10 ml-2 space-y-5">
            {activities.map((job) => (
              <div key={job.id} className="relative pl-5 group">
                {/* Timeline dot */}
                <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-charcoal/60 ring-[3px] ring-sage group-hover:bg-charcoal group-hover:ring-charcoal/10 transition-all duration-200" />
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <h4 className="text-[13px] font-bold text-charcoal leading-tight">
                        {job.company}
                      </h4>
                      <p className="text-[11.5px] text-charcoal/60 font-medium mt-0.5 leading-snug">
                        {job.position}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-charcoal/8 text-charcoal/70 uppercase tracking-wide whitespace-nowrap">
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10.5px] text-charcoal/40 font-semibold">
                    <Clock size={10} />
                    <span>{timeAgo(job.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
