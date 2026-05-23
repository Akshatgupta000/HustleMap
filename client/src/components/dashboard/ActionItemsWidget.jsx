import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, ListTodo, PartyPopper } from "lucide-react";

export default function ActionItemsWidget() {
  const navigate = useNavigate();

  const { data: feed, isLoading } = useQuery({
    queryKey: ["dashboardFeed"],
    queryFn: () => jobsAPI.getDashboardFeed().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="bg-sage-light border border-charcoal rounded-[32px] p-6 min-h-[200px] flex items-center justify-center">
        <div className="text-sm text-charcoal/60 font-medium">Loading action items...</div>
      </div>
    );
  }

  const actionItems = feed?.actionItems || [];

  return (
    <div className="bg-sage-light border border-charcoal rounded-[32px] overflow-hidden flex flex-col h-full">
      <div className="px-6 py-5 border-b border-charcoal/20 flex items-center gap-2.5">
        <ListTodo size={18} className="text-charcoal" />
        <span className="text-[16px] font-extrabold text-charcoal tracking-tight">Action Items</span>
        {actionItems.length > 0 && (
          <span className="ml-1.5 text-[11px] font-extrabold text-white bg-charcoal px-2 py-0.5 rounded-full">
            {actionItems.length}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {actionItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 bg-charcoal/10 text-charcoal rounded-[20px] flex items-center justify-center mb-4">
              <PartyPopper size={28} strokeWidth={2.5} />
            </div>
            <p className="text-[16px] font-extrabold text-charcoal">You're all caught up!</p>
            <p className="text-[14px] text-charcoal/70 mt-1 font-medium">No pending action items right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {actionItems.map((item) => (
              <div 
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-[24px] border border-charcoal bg-white hover:bg-charcoal/[0.02] transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/jobs/edit/${item.jobId}`)}
              >
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="h-5 w-5 text-charcoal/30 group-hover:text-charcoal shrink-0 mt-0.5 transition-colors duration-200" />
                  <div className="flex flex-col">
                    <span className="text-[14.5px] font-bold text-charcoal leading-tight transition-colors">{item.description}</span>
                    <span className="text-[13px] text-charcoal/70 font-medium mt-1 transition-colors">{item.position} at {item.company}</span>
                  </div>
                </div>
                <button className="mt-4 sm:mt-0 self-start sm:self-center shrink-0 flex items-center gap-1.5 text-[12.5px] font-bold text-white bg-charcoal group-hover:bg-charcoal/80 px-4 py-2 rounded-full transition-all duration-200">
                  View <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
