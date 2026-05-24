import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { Inbox, ArrowRight } from "lucide-react";

export default function CapturedJobsAlert() {
  const navigate = useNavigate();

  const { data: capturedJobs, isLoading } = useQuery({
    queryKey: ["capturedJobs"],
    queryFn: () => jobsAPI.getCaptured().then((res) => res.data),
  });

  if (isLoading || !capturedJobs || capturedJobs.length === 0) {
    return null;
  }

  return (
    <div 
      onClick={() => navigate('/captured')}
      className="bg-charcoal rounded-[16px] pr-3 pl-3 py-2 text-white cursor-pointer hover:bg-charcoal/90 transition-all duration-300 group relative overflow-hidden shrink-0 w-fit self-start inline-flex items-center gap-3 shadow-sm"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 blur-xl pointer-events-none group-hover:opacity-10 transition-opacity"></div>
      
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-7 h-7 bg-white/20 rounded-[8px] flex items-center justify-center shrink-0 backdrop-blur-sm">
          <Inbox size={14} className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-[13.5px] font-extrabold tracking-tight">Captured Jobs</h3>
          <span className="text-[11px] text-white/90 font-medium bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="font-extrabold text-white">{capturedJobs.length}</span> waiting
          </span>
        </div>
        <div className="w-6 h-6 rounded-full bg-white text-charcoal flex items-center justify-center shrink-0 group-hover:bg-sage-light transition-colors shadow-sm ml-1">
          <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}
