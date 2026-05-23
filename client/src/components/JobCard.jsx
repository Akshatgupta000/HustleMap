import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/cn";
import { Camera, Clock } from "lucide-react";

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
  saved: "bg-transparent text-charcoal/60 border-charcoal/40",
  applied: "bg-charcoal text-white border-charcoal",
  online_test: "bg-charcoal/5 text-charcoal border-charcoal",
  interview: "bg-sage text-charcoal border-charcoal",
  offer: "bg-accent-green text-white border-accent-green",
  rejected: "bg-red-500 text-white border-red-500",
  withdrawn: "bg-transparent text-charcoal/60 border-charcoal/40",
};

const APPLICATION_TYPE_LABELS = {
  on_campus: "On-Campus",
  off_campus: "Off-Campus",
};

export default function JobCard({ job, onViewDetails }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isManuallyTicked, setIsManuallyTicked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      return { bg: "bg-accent-green", border: "border-accent-green" };
    if (isManuallyTicked)
      return { bg: "bg-charcoal", border: "border-charcoal" };
    return { bg: "bg-white", border: "border-charcoal/40" };
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

  const getCardBorderClass = (status) => {
    switch (status) {
      case "online_test":
        return "border-2 border-orange-400 shadow-[3px_3px_0px_0px_#fb923c]";
      case "interview":
        return "border-2 border-blue-900 shadow-[3px_3px_0px_0px_#1e3a8a]";
      case "offer":
        return "border-2 border-green-500 shadow-[3px_3px_0px_0px_#22c55e]";
      case "rejected":
        return "border-2 border-red-500 shadow-[3px_3px_0px_0px_#ef4444]";
      case "withdrawn":
        return "border-2 border-gray-400 shadow-[3px_3px_0px_0px_#9ca3af]";
      case "saved":
      case "applied":
      default:
        return "border border-charcoal";
    }
  };

  return (
    <div
      onClick={() => onViewDetails(job)}
      className={cn(
        "rounded-[20px] bg-white p-4 transition-all duration-200 hover:-translate-y-[2px] cursor-pointer flex flex-col h-full relative overflow-hidden",
        getCardBorderClass(job.status),
        isUpcomingInterview() && "ring-2 ring-accent-yellow",
      )}
    >
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-extrabold text-charcoal leading-tight mb-0.5 truncate">{job.company}</h3>
          <p className="text-[12px] text-charcoal/70 font-semibold truncate">{job.position}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tick Checkbox */}
          <button
            onClick={handleTickToggle}
            disabled={isAutomatic}
            className={`flex-shrink-0 w-5 h-5 border-[1.5px] rounded-md flex items-center justify-center transition-colors ${
              isTicked
                ? `${tickColor.bg} ${tickColor.border}`
                : `${tickColor.border} hover:border-charcoal`
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
            <span title="Captured job" className="flex items-center justify-center text-charcoal/50 hover:text-charcoal transition-colors">
              <Camera size={14} strokeWidth={2} />
            </span>
          )}
          <Badge
            className={cn(
              "border",
              STATUS_COLORS[job.status] ||
                "bg-white text-charcoal border-charcoal",
            )}
          >
            {STATUS_LABELS[job.status] || job.status}
          </Badge>
        </div>
      </div>

      <div className="space-y-1 mb-2">
        {job.screenshot && (
          <img
            src={job.screenshot}
            alt="Captured job"
            className="rounded-[16px] mb-2 max-h-40 object-cover border border-charcoal"
          />
        )}
        <div className="text-sm text-charcoal">
          <span className="font-bold">Applied:</span>{" "}
          {formatDate(job.date_applied)}
        </div>
        {job.location && (
          <div className="text-sm text-charcoal">
            <span className="font-bold">Location:</span> {job.location}
          </div>
        )}
        {job.application_type && (
          <div className="text-sm text-charcoal">
            <span className="font-bold">Type:</span>{" "}
            {APPLICATION_TYPE_LABELS[job.application_type] ||
              job.application_type}
          </div>
        )}
        {job.interview_date && (
          <div
            className={cn(
              "text-sm",
              isUpcomingInterview()
                ? "text-accent-yellow font-bold"
                : "text-charcoal",
            )}
          >
            <span className="font-bold">
              {job.status === 'online_test' ? 'Online Test:' : 'Interview:'}
            </span>{" "}
            {formatDate(job.interview_date)}
            {isUpcomingInterview() && (
              <Clock size={13} className="inline ml-1 text-accent-yellow" strokeWidth={2.5} />
            )}
          </div>
        )}
        {job.interview_rounds && job.interview_rounds.length > 0 && (
          <div className="text-sm text-charcoal">
            <span className="font-bold">Rounds:</span>{" "}
            {job.interview_rounds.length}
          </div>
        )}
      </div>

      {job.notes && (
        <p className="text-sm text-charcoal mb-3 line-clamp-2">
          {job.notes}
        </p>
      )}

      {/* Interview Prep Indicator */}
      {job.interview_questions && job.interview_questions.length > 0 && (
        <div className="mb-3 p-2 bg-sage border border-charcoal rounded-xl">
          <p className="text-xs text-charcoal font-bold">
            📝 Interview Summary: {job.interview_questions.length} question
            {job.interview_questions.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Interview Difficulty Summary */}
      {job.interview_difficulty && (
        <div className="mb-3">
          <p className="text-xs text-charcoal/60 font-bold">
            Difficulty: {job.interview_difficulty}/5
          </p>
        </div>
      )}

      {/* Interview Status Recommendation */}
      {job.status === "interview" && (
        <div className="mb-3 p-2 bg-sage border border-charcoal rounded-xl">
          <p className="text-xs text-charcoal font-bold">
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
              className="text-xs text-notion-accent font-bold hover:underline truncate inline-block max-w-[120px]"
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
              className="text-xs text-charcoal font-bold hover:underline"
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
              className="text-xs text-charcoal font-bold hover:underline"
            >
              🎨 Portfolio
            </a>
          )}
        </div>
      )}

      {/* Buttons container with mt-auto to push to bottom */}
      <div className="flex gap-2 mt-auto pt-3">
        {showDeleteConfirm ? (
          <div className="flex flex-col w-full gap-2 p-2 bg-red-50 border border-red-100 rounded-[12px]">
            <p className="text-[12px] font-bold text-center text-red-600 m-0">Delete this job?</p>
            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-[11px] border-red-200 text-red-700 hover:bg-red-100"
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate();
                }}
                disabled={deleteMutation.isPending}
                size="sm"
                className="flex-1 h-8 text-[11px] bg-red-500 hover:bg-red-600 text-white border-transparent"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm"}
              </Button>
            </div>
          </div>
        ) : (
          <>
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
                setShowDeleteConfirm(true);
              }}
              disabled={deleteMutation.isPending}
              variant="outline"
              size="sm"
              className="flex-1 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
