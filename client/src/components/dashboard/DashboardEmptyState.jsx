import { BarChart2, Bell, Briefcase } from 'lucide-react';

const FEATURES = [
  { icon: Briefcase, label: 'Track Applications' },
  { icon: BarChart2, label: 'Monitor Progress' },
  { icon: Bell,      label: 'Follow-up Reminders' },
];

export default function DashboardEmptyState() {
  return (
    <div className="fade-slide-in flex flex-col items-center justify-center text-center py-14 px-6 select-none">

      {/* Primary heading */}
      <h2 className="text-[20px] sm:text-[22px] font-extrabold text-charcoal/60 tracking-tight mb-3 leading-snug">
        Your job search starts here.
      </h2>

      {/* Secondary text */}
      <p className="text-[14.5px] sm:text-[15px] text-charcoal/38 font-medium leading-relaxed max-w-sm mb-8">
        Add your first application above to unlock analytics,
        activity tracking, and weekly progress insights.
      </p>

      {/* Feature hint pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {FEATURES.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-charcoal/35 bg-charcoal/5 border border-charcoal/8 px-3 py-1.5 rounded-full"
          >
            <Icon size={11} strokeWidth={2} className="text-charcoal/30" />
            {label}
          </span>
        ))}
      </div>

      {/* Subtle bottom divider hint */}
      <div className="mt-10 flex items-center gap-2 text-charcoal/20">
        <div className="h-px w-10 bg-charcoal/10" />
        <span className="text-[10.5px] font-semibold tracking-wide uppercase">Start by typing above</span>
        <div className="h-px w-10 bg-charcoal/10" />
      </div>
    </div>
  );
}
