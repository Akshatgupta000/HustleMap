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
      <div className="bg-transparent border border-charcoal rounded-[32px] p-6 min-h-[120px] flex items-center justify-center">
        <div className="text-sm text-charcoal/60">Loading weekly progress...</div>
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
    <div className="bg-transparent border border-charcoal rounded-[32px] p-6 overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-[20px] shrink-0 transition-colors bg-charcoal text-white`}>
            {isComplete ? <Trophy className="h-7 w-7" /> : <Target className="h-7 w-7" />}
          </div>
          <div>
            <h2 className="text-[19px] font-extrabold text-charcoal tracking-tight mb-1">
              Hi {firstName}, you've applied to {applied} {applied === 1 ? 'job' : 'jobs'} this week
            </h2>
            <p className="text-[14.5px] text-charcoal/70 font-medium">
              {isComplete 
                ? "🎉 Amazing! You've reached your weekly goal." 
                : `You are ${remaining} away from your goal of ${target}!`}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2.5 w-full md:w-[35%] shrink-0">
          <div className="flex items-center justify-between text-[14px] font-bold text-charcoal">
            <span>Progress</span>
            <span className="text-charcoal">{percent}%</span>
          </div>
          <div className="h-3 w-full bg-charcoal/10 rounded-full overflow-hidden border border-charcoal/20">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out bg-charcoal`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      {isComplete && (
        <div className="absolute right-0 top-0 w-64 h-64 bg-charcoal/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      )}
    </div>
  );
}
