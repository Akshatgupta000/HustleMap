import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { ExternalLink, ArrowRight, FolderClock } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const stripProtocol = (url) => url?.replace(/^https?:\/\//, "") ?? "";

export default function CapturedJobs() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["capturedJobs"],
    queryFn: () => jobsAPI.getCaptured().then((res) => res.data),
  });

  const capturedJobs = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-sage-light border border-charcoal/15 rounded-[24px] overflow-hidden flex flex-col h-full shadow-sm">
        <div className="px-5 py-4 border-b border-charcoal/10 flex items-center gap-2">
          <FolderClock size={16} className="text-charcoal/60" />
          <span className="text-[14px] font-extrabold text-charcoal tracking-tight">Captured Jobs</span>
        </div>
        <div className="py-12 text-center text-[13px] font-medium text-charcoal/40">Loading…</div>
      </div>
    );
  }

  if (!capturedJobs.length) return null;

  return (
    <div className="bg-sage-light border border-charcoal/15 rounded-[24px] overflow-hidden flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-charcoal/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FolderClock size={16} className="text-charcoal/60" />
          <span className="text-[14px] font-extrabold text-charcoal tracking-tight">Captured Jobs</span>
        </div>
        <span className="text-[11px] font-bold text-charcoal/60 bg-charcoal/5 px-2.5 py-0.5 rounded-full">
          {capturedJobs.length} captured
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
        {capturedJobs.map((job) => (
          <div
            key={job.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[18px] border border-charcoal/15 bg-white hover:bg-charcoal/[0.03] hover:border-charcoal/25 transition-all duration-200"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Thumbnail */}
              {job.screenshot ? (
                <img
                  src={job.screenshot}
                  alt=""
                  className="w-14 h-14 object-cover rounded-[12px] border border-charcoal/10 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-[12px] bg-charcoal/5 border border-charcoal/10 shrink-0 flex items-center justify-center">
                  <FolderClock size={20} className="text-charcoal/20" />
                </div>
              )}

              {/* Info */}
              <div className="flex flex-col gap-0.5 min-w-0">
                {job.company && job.company !== 'Unknown Company' && job.company !== 'Captured Job' && job.company !== 'Captured' && (
                  <span className="text-[14px] font-bold text-charcoal truncate tracking-tight">
                    {job.company}
                  </span>
                )}
                {job.job_url ? (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-medium text-charcoal/60 hover:text-charcoal hover:underline truncate transition-colors"
                    title={job.job_url}
                  >
                    {stripProtocol(job.job_url)}
                  </a>
                ) : (
                  <span className="text-[12px] font-medium text-charcoal/40">No URL</span>
                )}
                <span className="text-[10px] font-bold tracking-wider uppercase text-charcoal/40 mt-1">
                  Captured • {formatDate(job.date_applied)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 mt-3 sm:mt-0">
              {job.job_url && (
                <button
                  onClick={() => window.open(job.job_url, "_blank", "noopener,noreferrer")}
                  title="Open job"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-charcoal/15 bg-white text-charcoal hover:bg-charcoal/5 transition-all cursor-pointer"
                >
                  <ExternalLink size={14} />
                </button>
              )}
              <button
                onClick={() => navigate(`/jobs/edit/${job.id}`, { state: { fromCaptured: true } })}
                className="flex items-center gap-1.5 h-8 px-4 rounded-full bg-charcoal hover:bg-charcoal/90 text-white text-[11px] font-bold tracking-wide transition-all cursor-pointer"
              >
                Review <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
