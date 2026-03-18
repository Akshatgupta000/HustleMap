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
      <div className="bg-white border border-[#e8e6e1] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#f0ede8] flex items-center gap-2">
          <Inbox size={14} className="text-[#6b6b6b]" />
          <span className="text-sm font-bold text-[#37352f] tracking-tight">Captured Jobs</span>
        </div>
        <div className="py-8 text-center text-[13px] text-[#9b9b9b]">Loading…</div>
      </div>
    );
  }

  if (!capturedJobs.length) return null;

  return (
    <div className="bg-white border border-[#e8e6e1] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#f0ede8] flex items-center gap-2">
        <Inbox size={14} className="text-[#6b6b6b]" />
        <span className="text-sm font-bold text-[#37352f] tracking-tight">Captured Jobs</span>
        <span className="text-[11.5px] font-medium text-[#6b6b6b] bg-[#f7f6f3] border border-[#e8e6e1] px-2 py-0.5 rounded-full">
          {capturedJobs.length}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-[#f7f6f3]">
        {capturedJobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center gap-3 px-5 py-2.5 hover:bg-black/[0.02] transition-colors"
          >
            {/* Thumbnail */}
            {job.screenshot ? (
              <img
                src={job.screenshot}
                alt=""
                className="w-11 h-8 object-cover rounded-md border border-[#e8e6e1] shrink-0"
              />
            ) : (
              <div className="w-11 h-8 rounded-md bg-[#f7f6f3] border border-[#e8e6e1] shrink-0" />
            )}

            {/* Info */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              {job.company && job.company !== 'Unknown Company' && job.company !== 'Captured Job' && job.company !== 'Captured' && (
                <span className="text-[13.5px] font-semibold text-[#37352f] truncate">
                  {job.company}
                </span>
              )}
              {job.job_url ? (
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium text-indigo-500 hover:text-indigo-700 truncate transition-colors"
                  title={job.job_url}
                >
                  {stripProtocol(job.job_url)}
                </a>
              ) : (
                <span className="text-[13px] text-[#9b9b9b]">No URL</span>
              )}
              <span className="text-[11.5px] text-[#9b9b9b]">{formatDate(job.date_applied)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {job.job_url && (
                <button
                  onClick={() => window.open(job.job_url, "_blank", "noopener,noreferrer")}
                  title="Open job"
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-[#e8e6e1] bg-white text-[#6b6b6b] hover:bg-[#f7f6f3] hover:text-[#37352f] transition-colors cursor-pointer"
                >
                  <ExternalLink size={13} />
                </button>
              )}
              <button
                onClick={() => navigate(`/jobs/edit/${job.id}`, { state: { fromCaptured: true } })}
                className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Convert <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
