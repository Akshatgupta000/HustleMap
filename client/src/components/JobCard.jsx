import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/cn";

const STATUS_LABELS = {
  saved: "Saved",
  applied: "Applied",
  online_test: "Online Test",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const STATUS_COLORS = {
  saved: "bg-slate-100 text-slate-800 border-slate-300",
  applied: "bg-blue-100 text-blue-800 border-blue-300",
  online_test: "bg-purple-100 text-purple-800 border-purple-300",
  interview: "bg-yellow-100 text-yellow-800 border-yellow-300",
  offer: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  withdrawn: "bg-gray-100 text-gray-800 border-gray-300",
};

const APPLICATION_TYPE_LABELS = {
  on_campus: "On-Campus",
  off_campus: "Off-Campus",
};

export default function JobCard({ job, onViewDetails }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isManuallyTicked, setIsManuallyTicked] = useState(false);
  const isCaptured =
    job?.is_captured === true || (job?.company || "").toLowerCase() === "captured";

  // Load manual tick from localStorage on mount and when job.id changes
  useEffect(() => {
    const saved = localStorage.getItem(`jobTick_${job.id}`);
    setIsManuallyTicked(saved === "true");
  }, [job.id]);

  const deleteMutation = useMutation({
    mutationFn: () => jobsAPI.delete(job.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobStats"] });
      toast.success("Job deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete job");
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isUpcomingInterview = () => {
    if (!job.interview_date) return false;
    const interviewDate = new Date(job.interview_date);
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return interviewDate >= now && interviewDate <= sevenDaysFromNow;
  };

  // Check if status is automatically tickable (Rejected or Offer)
  const isAutomatic = job.status === "rejected" || job.status === "offer";

  // Get tick color based on status
  const getTickColor = () => {
    if (job.status === "rejected")
      return { bg: "bg-red-500", border: "border-red-500" };
    if (job.status === "offer")
      return { bg: "bg-green-500", border: "border-green-500" };
    if (isManuallyTicked)
      return { bg: "bg-blue-500", border: "border-blue-500" };
    return { bg: "bg-white", border: "border-gray-300" };
  };

  const tickColor = getTickColor();

  // Determine if tick should be shown
  const isTicked = isAutomatic || isManuallyTicked;

  // Handle manual tick toggle
  const handleTickToggle = (e) => {
    e.stopPropagation();
    if (!isAutomatic) {
      const newState = !isManuallyTicked;
      setIsManuallyTicked(newState);
      localStorage.setItem(`jobTick_${job.id}`, newState.toString());
    }
  };

  return (
    <div
      onClick={() => onViewDetails(job)}
      className={cn(
        "rounded-xl border border-notion-border bg-notion-card p-4 shadow-soft transition-all duration-200 hover:bg-black/[0.02] hover:-translate-y-[1px] cursor-pointer flex flex-col h-full",
        isUpcomingInterview() && "ring-2 ring-amber-300",
      )}
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="subtitle mb-0.5 truncate">{job.company}</h3>
          <p className="text-sm text-notion-muted truncate">{job.position}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tick Checkbox */}
          <button
            onClick={handleTickToggle}
            disabled={isAutomatic}
            className={`flex-shrink-0 w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${
              isTicked
                ? `${tickColor.bg} ${tickColor.border}`
                : `${tickColor.border} hover:border-gray-400`
            } ${!isAutomatic && !isTicked ? "cursor-pointer" : ""} ${
              isAutomatic ? "cursor-not-allowed" : ""
            }`}
            title={
              isAutomatic
                ? job.status === "rejected"
                  ? "Automatically marked as rejected"
                  : "Automatically marked as offer received"
                : isManuallyTicked
                  ? "Click to mark as incomplete"
                  : "Click to mark as done"
            }
          >
            {isTicked && (
              <span className="text-white font-bold text-xs">✓</span>
            )}
          </button>
          {isCaptured && (
            <Badge className="border bg-indigo-50 text-indigo-800 border-indigo-200">
              📸 Captured
            </Badge>
          )}
          <Badge
            className={cn(
              "border",
              STATUS_COLORS[job.status] ||
                "bg-gray-100 text-gray-800 border-gray-300",
            )}
          >
            {STATUS_LABELS[job.status] || job.status}
          </Badge>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {job.screenshot && (
          <img
            src={job.screenshot}
            alt="Captured job"
            className="rounded-xl mb-2 max-h-40 object-cover border border-notion-border"
          />
        )}
        <div className="text-sm text-notion-text">
          <span className="font-medium">Applied:</span>{" "}
          {formatDate(job.date_applied)}
        </div>
        {job.location && (
          <div className="text-sm text-notion-text">
            <span className="font-medium">Location:</span> {job.location}
          </div>
        )}
        {job.application_type && (
          <div className="text-sm text-notion-text">
            <span className="font-medium">Type:</span>{" "}
            {APPLICATION_TYPE_LABELS[job.application_type] ||
              job.application_type}
          </div>
        )}
        {job.interview_date && (
          <div
            className={cn(
              "text-sm",
              isUpcomingInterview()
                ? "text-amber-900 font-medium"
                : "text-notion-text",
            )}
          >
            <span className="font-medium">Interview:</span>{" "}
            {formatDate(job.interview_date)}
            {isUpcomingInterview() && " ⏰"}
          </div>
        )}
        {job.interview_rounds && job.interview_rounds.length > 0 && (
          <div className="text-sm text-notion-text">
            <span className="font-medium">Rounds:</span>{" "}
            {job.interview_rounds.length}
          </div>
        )}
      </div>

      {job.notes && (
        <p className="text-sm text-notion-text mb-3 line-clamp-2">
          {job.notes}
        </p>
      )}

      {/* Interview Prep Indicator */}
      {job.interview_questions && job.interview_questions.length > 0 && (
        <div className="mb-3 p-2 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="text-xs text-indigo-800 font-medium">
            📝 Interview Summary: {job.interview_questions.length} question
            {job.interview_questions.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Interview Difficulty Summary */}
      {job.interview_difficulty && (
        <div className="mb-3">
          <p className="text-xs text-notion-muted font-medium">
            Difficulty: {job.interview_difficulty}/5
          </p>
        </div>
      )}

      {/* Interview Status Recommendation */}
      {job.status === "interview" && (
        <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-900 font-medium">
            Interview scheduled — preparation recommended
          </p>
        </div>
      )}

      {(job.job_url || job.resume_link || job.portfolio_link) && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {job.job_url && (
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-notion-accent hover:underline truncate inline-block max-w-[120px]"
            >
              🔗 Job Link
            </a>
          )}
          {job.resume_link && (
            <a
              href={job.resume_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-notion-accent hover:underline"
            >
              📄 Resume
            </a>
          )}
          {job.portfolio_link && (
            <a
              href={job.portfolio_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-notion-accent hover:underline"
            >
              🎨 Portfolio
            </a>
          )}
        </div>
      )}

      {/* Buttons container with mt-auto to push to bottom */}
      <div className="flex gap-2 mt-auto pt-3">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/jobs/edit/${job.id}`);
          }}
          variant="secondary"
          size="sm"
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
