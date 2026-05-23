import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { 
  Inbox, 
  CalendarClock, 
  FileEdit, 
  MessageSquare, 
  FolderClock, 
  Target, 
  Activity,
  PartyPopper,
  ChevronRight,
  Clock
} from "lucide-react";
import { generateActionItems } from "../../lib/generateActionItems";

const ICON_MAP = {
  interview: CalendarClock,
  oa: FileEdit,
  followup: MessageSquare,
  captured: FolderClock,
  goal: Target,
  inactivity: Activity,
  schedule: Clock
};

export default function ActionItemsWidget() {
  const navigate = useNavigate();

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.getAll().then((res) => res.data),
  });

  const { data: weeklyProgress, isLoading: weeklyLoading } = useQuery({
    queryKey: ["weeklyProgress"],
    queryFn: () => jobsAPI.getWeeklyProgress().then((res) => res.data),
  });

  const { data: capturedJobs, isLoading: capturedLoading } = useQuery({
    queryKey: ["capturedJobs"],
    queryFn: () => jobsAPI.getCaptured().then((res) => res.data),
  });

  const isLoading = jobsLoading || weeklyLoading || capturedLoading;

  if (isLoading) {
    return (
      <div className="bg-sage-light border border-charcoal/15 rounded-[24px] p-5 min-h-[140px] flex items-center justify-center">
        <div className="text-[12.5px] text-charcoal/40 font-medium">Checking tasks...</div>
      </div>
    );
  }

  const capturedCount = Array.isArray(capturedJobs) ? capturedJobs.length : 0;
  const allActionItems = generateActionItems(Array.isArray(jobs) ? jobs : [], weeklyProgress, capturedCount);
  
  // Show all items and let the container scroll
  const displayItems = allActionItems;
  const hiddenCount = 0;

  return (
    <div className="bg-sage-light border border-charcoal/15 rounded-[24px] overflow-hidden flex flex-col h-full">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-charcoal/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox size={14} className="text-charcoal/60" />
          <span className="text-[13px] font-extrabold text-charcoal tracking-tight">Inbox</span>
        </div>
        {allActionItems.length > 0 && (
          <span className="text-[10px] font-bold text-charcoal/60 bg-charcoal/5 px-2 py-0.5 rounded-full">
            {allActionItems.length} task{allActionItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {displayItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-4">
            <PartyPopper size={20} className="text-charcoal/30 mb-2" strokeWidth={1.5} />
            <p className="text-[13.5px] font-bold text-charcoal">You're all caught up 🎉</p>
            <p className="text-[12px] text-charcoal/50 mt-0.5 font-medium">
              No urgent tasks right now.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {displayItems.map((item, index) => {
              const Icon = ICON_MAP[item.type] || Inbox;
              return (
                <div 
                  key={item.id}
                  className={`group flex items-start gap-3 p-3.5 hover:bg-white/60 transition-colors cursor-pointer ${
                    index !== displayItems.length - 1 || hiddenCount > 0 ? 'border-b border-charcoal/[0.06]' : ''
                  }`}
                  onClick={() => {
                    if (item.type === 'interview' && item.position) {
                      const query = encodeURIComponent(`gfg ${item.position}`);
                      window.open(`https://www.google.com/search?q=${query}`, '_blank');
                    } else {
                      navigate(item.link || `/jobs/edit/${item.jobId}`);
                    }
                  }}
                >
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    item.priority === 'high' ? 'bg-charcoal text-white' : 
                    item.priority === 'medium' ? 'bg-charcoal/10 text-charcoal' : 
                    'border border-charcoal/15 text-charcoal/60'
                  }`}>
                    <Icon size={12} strokeWidth={item.priority === 'high' ? 2.5 : 2} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[13px] font-bold text-charcoal leading-tight truncate mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-[11.5px] text-charcoal/50 font-medium truncate">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center self-center text-charcoal/40">
                    <ChevronRight size={14} />
                  </div>
                </div>
              );
            })}
            
            {hiddenCount > 0 && (
              <div 
                className="p-3 text-center hover:bg-white/60 transition-colors cursor-pointer"
                onClick={() => navigate('/jobs')}
              >
                <span className="text-[11.5px] font-bold text-charcoal/50">
                  +{hiddenCount} more task{hiddenCount !== 1 ? 's' : ''} →
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
