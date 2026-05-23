import CapturedJobs from "../components/CapturedJobs";
import { Inbox } from "lucide-react";

export default function CapturedJobsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8 bg-sage p-6 rounded-[40px]">
      <div className="bg-sage-light border border-charcoal rounded-[32px] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between relative overflow-hidden mb-2 gap-6">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight mb-2 flex items-center gap-3">
            <Inbox className="h-8 w-8 text-charcoal" />
            Captured Inbox
          </h1>
          <p className="text-[15px] text-charcoal/80 font-medium">
            Review and process jobs captured from the browser extension.
          </p>
        </div>
      </div>

      <div className="mt-2">
        <CapturedJobs />
      </div>
    </div>
  );
}
