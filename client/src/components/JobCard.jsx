import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import toast from "react-hot-toast";

const STATUS_LABELS = {
  applied: "Applied",
  online_test: "Online Test",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const STATUS_COLORS = {
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
      className={`bg-white border border-black p-4 transition-all duration-200 hover:shadow-lg cursor-pointer hover:border-gray-600 flex flex-col h-full ${isUpcomingInterview() ? "ring-2 ring-yellow-400" : ""}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="subtitle text-black mb-0.5">{job.company}</h3>
          <p className="body-text text-black">{job.position}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tick Checkbox */}
          <button
            onClick={handleTickToggle}
            disabled={isAutomatic}
            className={`flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
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
          <span
            className={`px-2 py-0.5 badge-text border rounded ${
              STATUS_COLORS[job.status] ||
              "bg-gray-100 text-gray-800 border-gray-300"
            }`}
          >
            {STATUS_LABELS[job.status] || job.status}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="body-text text-black">
          <span className="font-medium">Applied:</span>{" "}
          {formatDate(job.date_applied)}
        </div>
        {job.location && (
          <div className="body-text text-black">
            <span className="font-medium">Location:</span> {job.location}
          </div>
        )}
        {job.application_type && (
          <div className="body-text text-black">
            <span className="font-medium">Type:</span>{" "}
            {APPLICATION_TYPE_LABELS[job.application_type] ||
              job.application_type}
          </div>
        )}
        {job.interview_date && (
          <div
            className={`body-text ${isUpcomingInterview() ? "text-yellow-700 font-medium" : "text-black"}`}
          >
            <span className="font-medium">Interview:</span>{" "}
            {formatDate(job.interview_date)}
            {isUpcomingInterview() && " ⏰"}
          </div>
        )}
        {job.interview_rounds && job.interview_rounds.length > 0 && (
          <div className="body-text text-black">
            <span className="font-medium">Rounds:</span>{" "}
            {job.interview_rounds.length}
          </div>
        )}
      </div>

      {job.notes && (
        <p className="body-text text-black mb-3 line-clamp-2">{job.notes}</p>
      )}

      {/* Interview Prep Indicator */}
      {job.interview_questions && job.interview_questions.length > 0 && (
        <div className="mb-3 p-1.5 bg-blue-50 border border-blue-200 rounded">
          <p className="helper-text text-blue-700 font-medium">
            📝 Interview Summary: {job.interview_questions.length} question
            {job.interview_questions.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Interview Difficulty Summary */}
      {job.interview_difficulty && (
        <div className="mb-3">
          <p className="helper-text text-gray-800 font-medium">
            Difficulty: {job.interview_difficulty}/5
          </p>
        </div>
      )}

      {/* Interview Status Recommendation */}
      {job.status === "interview" && (
        <div className="mb-3 p-1.5 bg-yellow-50 border border-yellow-200 rounded">
          <p className="helper-text text-yellow-800 font-medium">
            Interview scheduled — preparation recommended
          </p>
        </div>
      )}

      {(job.resume_link || job.portfolio_link) && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {job.resume_link && (
            <a
              href={job.resume_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="helper-text text-blue-600 hover:underline"
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
              className="helper-text text-blue-600 hover:underline"
            >
              🎨 Portfolio
            </a>
          )}
        </div>
      )}

      {/* Buttons container with mt-auto to push to bottom */}
      <div className="flex gap-2 mt-auto pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/jobs/edit/${job.id}`);
          }}
          className="flex-1 px-3 py-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors duration-200 hover:shadow-md form-label"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          className="flex-1 px-3 py-1.5 border border-black text-black hover:bg-black hover:text-white disabled:opacity-50 transition-colors duration-200 hover:shadow-md form-label"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
