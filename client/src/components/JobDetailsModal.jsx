import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "../lib/cn";

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

const ROUND_STATUS_LABELS = {
  scheduled: "Scheduled",
  completed: "Completed",
  passed: "Passed",
  failed: "Failed",
};

export default function JobDetailsModal({ job, onClose }) {
  const navigate = useNavigate();

  if (!job) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEdit = () => {
    onClose();
    navigate(`/jobs/edit/${job.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-notion-card border border-notion-border shadow-soft rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-notion-border sticky top-0 bg-notion-card z-10">
          <div className="flex-1 pr-3">
            <h2 className="page-title mb-1">{job.company}</h2>
            <p className="subtitle text-notion-muted">{job.position}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-light text-notion-muted hover:text-notion-text flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 transition-all duration-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              className={cn(
                "border",
                STATUS_COLORS[job.status] ||
                  "bg-gray-100 text-gray-800 border-gray-300",
              )}
            >
              {STATUS_LABELS[job.status] || job.status}
            </Badge>
            {job.application_type && (
              <Badge variant="muted">
                {APPLICATION_TYPE_LABELS[job.application_type] ||
                  job.application_type}
              </Badge>
            )}
          </div>

          {/* Interview Status Recommendation */}
          {job.status === "interview" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-950 font-medium">
                ⏰ Interview scheduled — preparation recommended. Consider
                adding interview questions.
              </p>
            </div>
          )}

          {/* Job Details Section */}
          <div className="border-y border-notion-border py-4">
            <h3 className="section-heading mb-3">Job Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <p className="text-xs font-medium text-notion-muted mb-1">
                  Company Name
                </p>
                <p className="text-sm text-notion-text">{job.company}</p>
              </div>

              {/* Job Role / Title */}
              <div>
                <p className="text-xs font-medium text-notion-muted mb-1">
                  Job Role / Title
                </p>
                <p className="text-sm text-notion-text">{job.position}</p>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-medium text-notion-muted mb-1">
                  Location
                </p>
                <p className="text-sm text-notion-text">
                  {job.location || "Not specified"}
                </p>
              </div>

              {/* Application Status */}
              <div>
                <p className="text-xs font-medium text-notion-muted mb-1">
                  Application Status
                </p>
                <p className="text-sm text-notion-text">
                  {STATUS_LABELS[job.status] || job.status}
                </p>
              </div>

              {/* Application Date */}
              <div>
                <p className="text-xs font-medium text-notion-muted mb-1">
                  Application Date
                </p>
                <p className="text-sm text-notion-text">
                  {formatDate(job.date_applied)}
                </p>
              </div>

              {/* Interview Date */}
              <div>
                <p className="text-xs font-medium text-notion-muted mb-1">
                  Interview Date
                </p>
                <p className="text-sm text-notion-text">
                  {job.interview_date
                    ? formatDate(job.interview_date)
                    : "Not scheduled"}
                </p>
              </div>

            </div>
          </div>

          {/* Interview Rounds */}
          {job.interview_rounds && job.interview_rounds.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-notion-text mb-3">
                Interview Rounds
              </h3>
              <div className="space-y-2">
                {job.interview_rounds.map((round, index) => (
                  <div
                    key={index}
                    className="p-3 bg-black/5 border border-notion-border rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <p className="font-medium text-notion-text">
                        {round.round || `Round ${index + 1}`}
                      </p>
                      {round.status && (
                        <Badge variant="muted">
                          {ROUND_STATUS_LABELS[round.status] || round.status}
                        </Badge>
                      )}
                    </div>
                    {round.date && (
                      <p className="text-sm text-notion-muted mb-1.5">
                        Date: {formatDate(round.date)}
                      </p>
                    )}
                    {round.feedback && (
                      <div className="mt-1.5">
                        <p className="text-xs font-medium text-notion-muted mb-1">
                          Feedback
                        </p>
                        <p className="text-sm text-notion-text whitespace-pre-wrap">
                          {round.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes / HR Details */}
          {job.notes && (
            <div>
              <h3 className="section-heading mb-2">
                Notes / HR Details
              </h3>
              <div className="p-3 bg-black/5 border border-notion-border rounded-xl">
                <p className="text-sm text-notion-text whitespace-pre-wrap">
                  {job.notes}
                </p>
              </div>
            </div>
          )}

          {/* Resume / Portfolio / Job Links */}
          {(job.job_url || job.resume_link || job.portfolio_link) && (
            <div>
              <h3 className="section-heading mb-2">
                Links
              </h3>
              <div className="flex gap-2 flex-wrap">
                {job.job_url && (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-notion-border bg-white shadow-soft text-sm text-notion-accent hover:bg-black/5 transition-all duration-200"
                  >
                    🔗 Job Posting
                  </a>
                )}
                {job.resume_link && (
                  <a
                    href={job.resume_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-notion-border bg-white shadow-soft text-sm text-notion-accent hover:bg-black/5 transition-all duration-200"
                  >
                    📄 Resume
                  </a>
                )}
                {job.portfolio_link && (
                  <a
                    href={job.portfolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-notion-border bg-white shadow-soft text-sm text-notion-accent hover:bg-black/5 transition-all duration-200"
                  >
                    🎨 Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Interview Summary Section */}
          {(job.preparation_notes ||
            job.interview_difficulty ||
            (job.interview_questions &&
              job.interview_questions.length > 0)) && (
            <div className="border-t border-notion-border pt-4">
              <h3 className="page-title mb-4">
                Interview Summary
              </h3>

              {/* Preparation Notes (pre-interview) */}
              {job.preparation_notes && (
                <div className="mb-4">
                  <h4 className="subtitle mb-1.5">
                    Preparation Notes
                  </h4>
                  <div className="p-3 bg-black/5 border border-notion-border rounded-xl">
                    <p className="text-sm text-notion-text whitespace-pre-wrap">
                      {job.preparation_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Interview Difficulty Rating */}
              {job.interview_difficulty && (
                <div className="mb-4">
                  <h4 className="subtitle mb-2">
                    Interview Difficulty Rating
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <span
                          key={rating}
                          className={`text-xl ${
                            rating <= job.interview_difficulty
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-notion-text">
                      {job.interview_difficulty}/5
                    </span>
                    <span className="text-sm text-notion-muted">
                      {job.interview_difficulty <= 2
                        ? "(Easy)"
                        : job.interview_difficulty <= 3
                          ? "(Moderate)"
                          : job.interview_difficulty <= 4
                            ? "(Hard)"
                            : "(Very Hard)"}
                    </span>
                  </div>
                </div>
              )}

              {/* Interview Questions */}
              {job.interview_questions &&
                job.interview_questions.length > 0 && (
                  <div>
                    <h4 className="subtitle mb-3">
                      Interview Questions ({job.interview_questions.length})
                    </h4>
                    <div className="space-y-3">
                      {job.interview_questions.map((qna, index) => (
                        <div
                          key={index}
                          className="bg-white border border-notion-border p-3 space-y-2 rounded-xl shadow-soft"
                        >
                          {/* Round */}
                          {qna.round && (
                            <div className="pb-1.5 border-b border-notion-border">
                              <p className="text-xs font-semibold text-notion-accent uppercase tracking-wide">
                                {qna.round}
                              </p>
                            </div>
                          )}

                          {/* Question */}
                          <div>
                            <p className="text-xs font-medium text-notion-muted mb-1">
                              Question Asked
                            </p>
                            <p className="text-sm text-notion-text font-medium">
                              {qna.question}
                            </p>
                          </div>

                          {/* Answer / Notes */}
                          {qna.notes_or_answer || qna.answer ? (
                            <div>
                              <p className="text-xs font-medium text-notion-muted mb-1">
                                Your Notes / Answer
                              </p>
                              <div className="p-2 bg-black/5 border border-notion-border rounded-xl">
                                <p className="text-sm text-notion-text whitespace-pre-wrap">
                                  {qna.notes_or_answer || qna.answer}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-notion-muted italic">
                              No answer recorded yet
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Empty State for Interview Summary */}
          {!job.preparation_notes &&
            !job.interview_difficulty &&
            (!job.interview_questions ||
              job.interview_questions.length === 0) && (
              <div className="border-t border-notion-border pt-4">
                <h3 className="page-title mb-3">
                  Interview Summary
                </h3>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <p className="text-sm text-indigo-900">
                    No interview summary added yet. Add difficulty rating and
                    questions below.
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-5 border-t border-notion-border bg-notion-bg/50 sticky bottom-0">
          <Button
            onClick={handleEdit}
            variant="default"
            className="flex-1"
          >
            Edit Job
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
