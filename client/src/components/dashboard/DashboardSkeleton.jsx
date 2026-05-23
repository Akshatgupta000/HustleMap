// Skeleton block primitive — a shimmer bar of any shape
function Sk({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

// Skeleton card wrapper
function SkCard({ className = '', children }) {
  return (
    <div className={`bg-sage-light border border-charcoal/10 rounded-[24px] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full max-w-[1400px] mx-auto">

      {/* ── Left Content Area ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Welcome banner skeleton */}
        <div className="bg-sage-light border border-charcoal/10 rounded-[20px] py-3 px-5 sm:px-6 flex items-center justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <Sk className="h-6 w-32 rounded-full" />
            <Sk className="h-3.5 w-52 rounded-full" />
          </div>
          <Sk className="w-12 h-12 rounded-full shrink-0" />
        </div>

        {/* 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            {/* QuickAdd skeleton */}
            <Sk className="h-12 sm:h-13 w-full rounded-full" />

            {/* WeeklyGoal skeleton */}
            <SkCard className="p-5">
              <div className="flex items-center gap-3.5 mb-5">
                <Sk className="w-10 h-10 rounded-[14px] shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Sk className="h-4 w-48 rounded-full" />
                  <Sk className="h-3 w-36 rounded-full" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Sk className="h-3 w-14 rounded-full" />
                  <Sk className="h-3 w-8 rounded-full" />
                </div>
                {/* Progress bar track */}
                <div className="h-2 w-full bg-charcoal/8 rounded-full overflow-hidden">
                  <div className="skeleton h-full w-2/3 rounded-full" />
                </div>
              </div>
            </SkCard>

            {/* CapturedJobs skeleton */}
            <SkCard className="p-4">
              <div className="flex items-center gap-3">
                <Sk className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Sk className="h-3.5 w-28 rounded-full" />
                  <Sk className="h-3 w-40 rounded-full" />
                </div>
                <Sk className="w-9 h-9 rounded-full shrink-0" />
              </div>
            </SkCard>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            {/* ActionItems skeleton */}
            <SkCard>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-charcoal/8 flex items-center gap-2">
                <Sk className="w-3.5 h-3.5 rounded" />
                <Sk className="h-3.5 w-24 rounded-full" />
              </div>
              {/* Items */}
              <div className="p-3 flex flex-col gap-2">
                {[72, 56, 64].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-[18px] border border-charcoal/8">
                    <Sk className="w-4 h-4 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Sk className={`h-3.5 w-${w} rounded-full`} style={{ width: `${w}%` }} />
                      <Sk className="h-3 rounded-full" style={{ width: '50%' }} />
                    </div>
                    <Sk className="h-6 w-14 rounded-full shrink-0" />
                  </div>
                ))}
              </div>
            </SkCard>

            {/* Upcoming interviews skeleton */}
            <SkCard>
              <div className="px-4 py-3 border-b border-charcoal/8 flex items-center gap-2">
                <Sk className="w-3.5 h-3.5 rounded" />
                <Sk className="h-3.5 w-36 rounded-full" />
              </div>
              <div className="p-3 flex flex-col gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between bg-charcoal/8 rounded-[18px] px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <Sk className="h-3.5 w-28 rounded-full bg-charcoal/15" />
                      <Sk className="h-3 w-20 rounded-full bg-charcoal/10" />
                    </div>
                    <Sk className="h-6 w-16 rounded-full bg-charcoal/15" />
                  </div>
                ))}
              </div>
            </SkCard>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar skeleton ── */}
      <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0">
        <SkCard className="h-full">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-charcoal/8 flex items-center gap-2">
            <Sk className="w-3.5 h-3.5 rounded" />
            <Sk className="h-3.5 w-28 rounded-full" />
          </div>
          {/* Timeline items */}
          <div className="p-4 flex flex-col">
            <div className="relative border-l border-charcoal/8 ml-2 space-y-5">
              {[70, 55, 80, 62, 48].map((w, i) => (
                <div key={i} className="relative pl-5">
                  <div className="absolute -left-[4px] top-1.5 w-2 h-2 rounded-full bg-charcoal/15" />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Sk className="h-3.5 rounded-full" style={{ width: `${w}%` }} />
                      <Sk className="h-5 w-14 rounded-full shrink-0" />
                    </div>
                    <Sk className="h-3 rounded-full" style={{ width: '55%' }} />
                    <Sk className="h-2.5 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SkCard>
      </div>

    </div>
  );
}
