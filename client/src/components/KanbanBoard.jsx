import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { toast } from "react-hot-toast";
import { GripVertical, Calendar, MapPin, AlertCircle, Award } from "lucide-react";
import { cn } from "../lib/cn";
import { Badge } from "./ui/badge";

const COLUMNS = [
  { id: "saved", label: "Saved", color: "border-charcoal shadow-[#1c1c1c]", bg: "bg-white" },
  { id: "applied", label: "Applied", color: "border-charcoal bg-charcoal text-white shadow-charcoal", bg: "bg-charcoal/5" },
  { id: "online_test", label: "Online Test", color: "border-orange-400 shadow-orange-400", bg: "bg-orange-50" },
  { id: "interview", label: "Interview", color: "border-blue-900 shadow-blue-900", bg: "bg-blue-50" },
  { id: "offer", label: "Offer", color: "border-green-500 shadow-green-500", bg: "bg-green-50" },
  { id: "rejected", label: "Rejected", color: "border-red-500 shadow-red-500", bg: "bg-red-50" },
  { id: "withdrawn", label: "Withdrawn", color: "border-gray-400 shadow-gray-400", bg: "bg-gray-50" },
];

export default function KanbanBoard({ jobs, onViewDetails }) {
  const queryClient = useQueryClient();
  const [draggedJobId, setDraggedJobId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Mutation to update job status when dropped
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }) => jobsAPI.update(id, payload),
    onMutate: async ({ id, payload }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["jobs"] });
      const previousJobs = queryClient.getQueryData(["jobs"]);

      queryClient.setQueryData(["jobs"], (old) => {
        if (!old) return [];
        return old.map((job) =>
          job.id === id ? { ...job, status: payload.status } : job
        );
      });

      return { previousJobs };
    },
    onError: (err, variables, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(["jobs"], context.previousJobs);
      }
      toast.error("Failed to update job status");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardFeed"] });
      toast.success("Status updated!");
    },
  });

  const handleDragStart = (e, id) => {
    setDraggedJobId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedJobId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedJobId;
    setDragOverColumn(null);

    if (!id) return;

    // Find current job status to avoid redundancy
    const job = jobs.find((j) => j.id === id);
    if (job && job.status !== targetStatus) {
      const payload = {
        ...job,
        status: targetStatus,
      };
      updateStatusMutation.mutate({ id, payload });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 h-full min-h-[60vh] custom-scrollbar items-start select-none">
      {COLUMNS.map((col) => {
        const columnJobs = jobs.filter((job) => job.status === col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={cn(
              "flex flex-col w-[290px] shrink-0 rounded-[24px] border-2 border-charcoal bg-white p-4 transition-all duration-200 min-h-[500px]",
              col.id === "offer" && "border-green-500 shadow-[3px_3px_0px_0px_#22c55e]",
              col.id === "rejected" && "border-red-500 shadow-[3px_3px_0px_0px_#ef4444]",
              col.id === "interview" && "border-blue-900 shadow-[3px_3px_0px_0px_#1e3a8a]",
              col.id !== "offer" && col.id !== "rejected" && col.id !== "interview" && "shadow-[4px_4px_0px_0px_#1c1c1c]",
              isOver && "scale-[1.02] bg-charcoal/5 border-dashed border-charcoal/60"
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-charcoal/10">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-3 h-3 rounded-full border border-charcoal",
                  col.id === "saved" && "bg-white",
                  col.id === "applied" && "bg-charcoal",
                  col.id === "online_test" && "bg-orange-400",
                  col.id === "interview" && "bg-blue-900",
                  col.id === "offer" && "bg-green-500",
                  col.id === "rejected" && "bg-red-500",
                  col.id === "withdrawn" && "bg-gray-400"
                )} />
                <h3 className="font-black text-[14px] text-charcoal tracking-tight uppercase">
                  {col.label}
                </h3>
              </div>
              <span className="bg-white border-2 border-charcoal text-charcoal text-[11px] font-black px-2 py-0.5 rounded-full shadow-[1px_1px_0px_0px_#1c1c1c]">
                {columnJobs.length}
              </span>
            </div>

            {/* Column Body / Drop area */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[650px] pr-1 scrollbar-thin">
              {columnJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-charcoal/20 rounded-[16px] bg-charcoal/[0.01]">
                  <p className="text-[11px] font-bold text-charcoal/30 uppercase tracking-wider">
                    Drag jobs here
                  </p>
                </div>
              ) : (
                columnJobs.map((job) => {
                  const isJobDragged = draggedJobId === job.id;
                  return (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onViewDetails(job)}
                      className={cn(
                        "group bg-white border-2 border-charcoal rounded-[16px] p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-[2px] shadow-[2px_2px_0px_0px_#1c1c1c] hover:shadow-[3px_3px_0px_0px_#1c1c1c] relative overflow-hidden flex flex-col gap-2",
                        isJobDragged && "opacity-45 scale-95 border-dashed",
                        job.status === "offer" && "border-green-500 shadow-[2px_2px_0px_0px_#22c55e]",
                        job.status === "rejected" && "border-red-500 shadow-[2px_2px_0px_0px_#ef4444]",
                        job.status === "interview" && "border-blue-900 shadow-[2px_2px_0px_0px_#1e3a8a]",
                        job.status === "online_test" && "border-orange-400 shadow-[2px_2px_0px_0px_#fb923c]"
                      )}
                    >
                      {/* Drag Handle & Company Info */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-[13px] text-charcoal leading-tight truncate group-hover:text-charcoal/80">
                            {job.company}
                          </h4>
                          <p className="text-[11px] text-charcoal/70 font-semibold truncate leading-normal">
                            {job.position}
                          </p>
                        </div>
                        <GripVertical className="h-3.5 w-3.5 text-charcoal/30 group-hover:text-charcoal/70 transition-colors cursor-grab shrink-0 mt-0.5" />
                      </div>

                      {/* Details Meta */}
                      <div className="flex flex-col gap-1 text-[11px] text-charcoal/70 font-medium">
                        {job.location && (
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin size={11} className="shrink-0 text-charcoal/40" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Calendar size={11} className="shrink-0 text-charcoal/40" />
                          <span>Applied: {formatDate(job.date_applied)}</span>
                        </div>
                      </div>

                      {/* Lower badges and indicator icons */}
                      <div className="flex items-center justify-between gap-2 mt-1 pt-1.5 border-t border-charcoal/10 shrink-0">
                        <Badge variant="muted" className="text-[9px] px-1.5 py-0">
                          {job.application_type === "on_campus" ? "On-Campus" : "Off-Campus"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {job.interview_questions && job.interview_questions.length > 0 && (
                            <div title={`${job.interview_questions.length} interview questions`} className="p-0.5 bg-sage border border-charcoal rounded-md text-[9px] font-bold text-charcoal">
                              QA
                            </div>
                          )}
                          {job.status === "interview" && (
                            <AlertCircle size={13} className="text-blue-900" title="Interview Scheduled" />
                          )}
                          {job.status === "offer" && (
                            <Award size={13} className="text-green-500" title="Offer Received!" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
