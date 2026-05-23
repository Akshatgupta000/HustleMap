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
      className="bg-charcoal rounded-[32px] p-5 sm:p-6 text-white cursor-pointer hover:bg-charcoal/90 transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none group-hover:opacity-10 transition-opacity"></div>
      
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm shadow-sm">
            <Inbox size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-extrabold tracking-tight">Captured Jobs</h3>
            <p className="text-[13px] text-indigo-50 font-medium leading-tight mt-0.5">
              <span className="font-extrabold text-white">{capturedJobs.length}</span> waiting to be processed
            </p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white text-charcoal flex items-center justify-center shrink-0 group-hover:bg-sage-light transition-colors shadow-sm">
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}
