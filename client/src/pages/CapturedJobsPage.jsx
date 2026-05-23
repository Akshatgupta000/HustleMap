import CapturedJobs from "../components/CapturedJobs";
import { Inbox } from "lucide-react";

export default function CapturedJobsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2">
            <Inbox className="h-6 w-6 text-indigo-500" />
            Captured Jobs Inbox
          </h1>
          <p className="text-[13.5px] text-slate-500 font-medium">
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
