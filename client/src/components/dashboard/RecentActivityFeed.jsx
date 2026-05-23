import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../../lib/api";
import { Activity, Clock } from "lucide-react";

// Lightweight timeAgo helper
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " secs ago";
};

const STATUS_COLORS = {
  applied: "bg-blue-100/80 text-blue-700 border-blue-200",
  online_test: "bg-purple-100/80 text-purple-700 border-purple-200",
  assessment: "bg-purple-100/80 text-purple-700 border-purple-200",
  oa: "bg-purple-100/80 text-purple-700 border-purple-200",
  interview: "bg-amber-100/80 text-amber-700 border-amber-200",
  offer: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100/80 text-rose-700 border-rose-200",
  withdrawn: "bg-slate-100 text-slate-700 border-slate-200",
  saved: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function RecentActivityFeed() {
  const { data: feed, isLoading } = useQuery({
    queryKey: ["dashboardFeed"],
    queryFn: () => jobsAPI.getDashboardFeed().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="bg-transparent border border-charcoal rounded-[32px] p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-charcoal/60 font-medium">Loading activity...</div>
      </div>
    );
  }

  const activities = feed?.recentActivity || [];

  return (
    <div className="bg-transparent border border-charcoal rounded-[32px] overflow-hidden">
      <div className="px-6 py-5 border-b border-charcoal/20 flex items-center gap-2">
        <Activity size={16} className="text-charcoal" />
        <span className="text-[15px] font-extrabold text-charcoal tracking-tight">Recent Activity</span>
      </div>

      <div className="p-5 sm:p-6">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-charcoal/60 text-[13.5px] font-medium">
            No recent activity found.
          </div>
        ) : (
          <div className="relative border-l border-slate-200/60 ml-3 space-y-7">
            {activities.map((job) => (
              <div key={job.id} className="relative pl-6 group">
                {/* Timeline dot */}
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-charcoal ring-4 ring-sage group-hover:scale-125 transition-transform" />
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[14.5px] font-bold text-charcoal leading-tight">
                        {job.company}
                      </h4>
                      <p className="text-[13px] text-charcoal/70 font-medium mt-0.5">
                        {job.position}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-extrabold px-3 py-1 rounded-full border border-charcoal bg-white text-charcoal uppercase tracking-wide`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal/50 font-semibold mt-1">
                    <Clock size={12} />
                    <span>Updated {timeAgo(job.updatedAt)}</span>
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
