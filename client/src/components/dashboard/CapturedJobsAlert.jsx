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
      className="bg-charcoal rounded-[20px] p-3 sm:p-3.5 text-white cursor-pointer hover:bg-charcoal/90 transition-all duration-300 group relative overflow-hidden shrink-0"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 blur-xl pointer-events-none group-hover:opacity-10 transition-opacity"></div>
      
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-[10px] flex items-center justify-center shrink-0 backdrop-blur-sm shadow-sm">
            <Inbox size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-[14px] font-extrabold tracking-tight leading-tight">Captured Jobs</h3>
            <p className="text-[12px] text-white/80 font-medium leading-none mt-0.5">
              <span className="font-extrabold text-white">{capturedJobs.length}</span> waiting
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white text-charcoal flex items-center justify-center shrink-0 group-hover:bg-sage-light transition-colors shadow-sm">
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
}
