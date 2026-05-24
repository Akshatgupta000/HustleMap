import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { Target, Trophy } from "lucide-react";

export default function WeeklyGoalTracker() {
  const user = getUser();
  
  const { data: progress, isLoading } = useQuery({
    queryKey: ["weeklyProgress"],
    queryFn: () => jobsAPI.getWeeklyProgress().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="bg-transparent border border-charcoal/20 rounded-[24px] p-5 min-h-[100px] flex items-center justify-center">
        <div className="text-[12.5px] text-charcoal/50">Loading weekly progress...</div>
      </div>
    );
  }

  const applied = progress?.applied || 0;
  const target = progress?.target || 10;
  const percent = Math.min(Math.round((applied / target) * 100), 100);
  const remaining = Math.max(target - applied, 0);
  const isComplete = applied >= target;
  
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="bg-transparent border border-charcoal/20 rounded-[24px] p-5 overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-[14px] shrink-0 transition-colors bg-[#FF9500] text-white`}>
            {isComplete ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-[16px] font-extrabold text-charcoal tracking-tight mb-0.5 leading-snug">
              {applied} {applied === 1 ? 'job' : 'jobs'} applied this week
            </h2>
            <p className="text-[12.5px] text-charcoal/55 font-medium">
              {isComplete 
                ? "🎉 You've reached your weekly goal!" 
                : `${remaining} more to reach your goal of ${target}`}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-[38%] shrink-0">
          <div className="flex items-center justify-between text-[12.5px] font-bold text-charcoal">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="h-3 w-full bg-white border border-charcoal/20 rounded-full p-[2px]">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out bg-[#FF9500]`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      {isComplete && (
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#FF9500]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      )}
    </div>
  );
}
