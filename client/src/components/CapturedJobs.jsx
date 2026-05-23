import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { ExternalLink, ArrowRight, Inbox } from "lucide-react";

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
      <div className="bg-white border-2 border-charcoal rounded-[24px] overflow-hidden shadow-[4px_4px_0px_0px_#1c1c1c]">
        <div className="px-5 py-4 border-b-2 border-charcoal bg-sage-light flex items-center gap-2">
          <Inbox size={18} className="text-charcoal" />
          <span className="text-[16px] font-extrabold text-charcoal tracking-tight">Captured Jobs</span>
        </div>
        <div className="py-12 text-center text-[14px] font-bold text-charcoal/60">Loading…</div>
      </div>
    );
  }

  if (!capturedJobs.length) return null;

  return (
    <div className="bg-white border-2 border-charcoal rounded-[24px] overflow-hidden shadow-[4px_4px_0px_0px_#1c1c1c]">
      {/* Header */}
      <div className="px-5 py-4 border-b-2 border-charcoal bg-sage-light flex items-center gap-2">
        <Inbox size={18} className="text-charcoal" />
        <span className="text-[16px] font-extrabold text-charcoal tracking-tight">Captured Jobs</span>
        <span className="text-[12px] font-extrabold text-white bg-charcoal px-2.5 py-0.5 rounded-full">
          {capturedJobs.length}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y-2 divide-charcoal/10">
        {capturedJobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-sage/20 transition-colors"
          >
            {/* Thumbnail */}
            {job.screenshot ? (
              <img
                src={job.screenshot}
                alt=""
                className="w-16 h-12 object-cover rounded-[12px] border-2 border-charcoal shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-16 h-12 rounded-[12px] bg-sage-light border-2 border-charcoal shrink-0" />
            )}

            {/* Info */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              {job.company && job.company !== 'Unknown Company' && job.company !== 'Captured Job' && job.company !== 'Captured' && (
                <span className="text-[16px] font-black text-charcoal truncate tracking-tight">
                  {job.company}
                </span>
              )}
              {job.job_url ? (
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] font-bold text-charcoal hover:underline truncate transition-colors"
                  title={job.job_url}
                >
                  {stripProtocol(job.job_url)}
                </a>
              ) : (
                <span className="text-[14px] font-bold text-charcoal/40">No URL</span>
              )}
              <span className="text-[12px] font-extrabold tracking-wider uppercase text-charcoal/60">{formatDate(job.date_applied)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center mt-2 sm:mt-0">
              {job.job_url && (
                <button
                  onClick={() => window.open(job.job_url, "_blank", "noopener,noreferrer")}
                  title="Open job"
                  className="flex items-center justify-center w-10 h-10 rounded-[12px] border-2 border-charcoal bg-white text-charcoal hover:bg-sage-light hover:-translate-y-0.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1c1c1c]"
                >
                  <ExternalLink size={16} strokeWidth={2.5} />
                </button>
              )}
              <button
                onClick={() => navigate(`/jobs/edit/${job.id}`, { state: { fromCaptured: true } })}
                className="flex items-center gap-1.5 h-10 px-4 rounded-[12px] bg-charcoal hover:bg-charcoal/90 text-white text-[13px] font-extrabold uppercase tracking-wide transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1c1c1c] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                Convert <ArrowRight size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
