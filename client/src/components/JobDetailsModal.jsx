import { useNavigate } from "react-router-dom";

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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-4 border-b border-black sticky top-0 bg-white z-10">
          <div className="flex-1 pr-3">
            <h2 className="page-title text-black mb-1">{job.company}</h2>
            <p className="subtitle text-gray-700">{job.position}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-light text-black hover:text-gray-600 flex-shrink-0 w-7 h-7 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-2.5 py-0.5 badge-text border rounded ${
                STATUS_COLORS[job.status] ||
                "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              {STATUS_LABELS[job.status] || job.status}
            </span>
            {job.application_type && (
              <span className="px-2.5 py-0.5 badge-text border border-black text-black bg-gray-50">
                {APPLICATION_TYPE_LABELS[job.application_type] ||
                  job.application_type}
              </span>
            )}
          </div>

          {/* Interview Status Recommendation */}
          {job.status === "interview" && (
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-sm">
              <p className="body-text text-yellow-900 font-medium">
                ⏰ Interview scheduled — preparation recommended. Consider
                adding interview questions.
              </p>
            </div>
          )}

          {/* Job Details Section */}
          <div className="border-t border-b border-gray-300 py-4">
            <h3 className="section-heading text-black mb-3">Job Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <p className="form-label text-gray-600 mb-1">Company Name</p>
                <p className="body-text text-black">{job.company}</p>
              </div>

              {/* Job Role / Title */}
              <div>
                <p className="form-label text-gray-600 mb-1">
                  Job Role / Title
                </p>
                <p className="body-text text-black">{job.position}</p>
              </div>

              {/* Location */}
              <div>
                <p className="form-label text-gray-600 mb-1">Location</p>
                <p className="body-text text-black">
                  {job.location || "Not specified"}
                </p>
              </div>

              {/* Application Status */}
              <div>
                <p className="form-label text-gray-600 mb-1">
                  Application Status
                </p>
                <p className="body-text text-black">
                  {STATUS_LABELS[job.status] || job.status}
                </p>
              </div>

              {/* Application Date */}
              <div>
                <p className="form-label text-gray-600 mb-1">
                  Application Date
                </p>
                <p className="body-text text-black">
                  {formatDate(job.date_applied)}
                </p>
              </div>

              {/* Interview Date */}
              <div>
                <p className="form-label text-gray-600 mb-1">Interview Date</p>
                <p className="body-text text-black">
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
              <h3 className="text-lg font-medium text-black mb-3">
                Interview Rounds
              </h3>
              <div className="space-y-2">
                {job.interview_rounds.map((round, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border border-gray-300"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <p className="font-medium text-black">
                        {round.round || `Round ${index + 1}`}
                      </p>
                      {round.status && (
                        <span className="px-2 py-0.5 text-xs font-medium border border-gray-400 text-gray-700 bg-white">
                          {ROUND_STATUS_LABELS[round.status] || round.status}
                        </span>
                      )}
                    </div>
                    {round.date && (
                      <p className="text-sm text-gray-600 mb-1.5">
                        Date: {formatDate(round.date)}
                      </p>
                    )}
                    {round.feedback && (
                      <div className="mt-1.5">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          Feedback
                        </p>
                        <p className="text-sm text-black whitespace-pre-wrap">
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
              <h3 className="section-heading text-black mb-2">
                Notes / HR Details
              </h3>
              <div className="p-3 bg-gray-50 border border-gray-300">
                <p className="body-text text-black whitespace-pre-wrap">
                  {job.notes}
                </p>
              </div>
            </div>
          )}

          {/* Resume / Portfolio Links */}
          {(job.resume_link || job.portfolio_link) && (
            <div>
              <h3 className="section-heading text-black mb-2">
                Resume / Portfolio Links
              </h3>
              <div className="flex gap-2 flex-wrap">
                {job.resume_link && (
                  <a
                    href={job.resume_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 form-label flex items-center gap-2 transition-colors"
                  >
                    📄 Resume
                  </a>
                )}
                {job.portfolio_link && (
                  <a
                    href={job.portfolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 form-label flex items-center gap-2 transition-colors"
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
            <div className="border-t-2 border-black pt-4">
              <h3 className="page-title text-black mb-4">
                Interview Summary
              </h3>

              {/* Preparation Notes (pre-interview) */}
              {job.preparation_notes && (
                <div className="mb-4">
                  <h4 className="subtitle text-black mb-1.5">
                    Preparation Notes
                  </h4>
                  <div className="p-3 bg-gray-50 border border-gray-300">
                    <p className="body-text text-black whitespace-pre-wrap">
                      {job.preparation_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Interview Difficulty Rating */}
              {job.interview_difficulty && (
                <div className="mb-4">
                  <h4 className="subtitle text-black mb-2">
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
                    <span className="body-text font-medium text-black">
                      {job.interview_difficulty}/5
                    </span>
                    <span className="helper-text text-gray-600">
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
                    <h4 className="subtitle text-black mb-3">
                      Interview Questions ({job.interview_questions.length})
                    </h4>
                    <div className="space-y-3">
                      {job.interview_questions.map((qna, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-300 p-3 space-y-2"
                        >
                          {/* Round */}
                          {qna.round && (
                            <div className="pb-1.5 border-b border-gray-200">
                              <p className="helper-text font-semibold text-blue-600 uppercase tracking-wide">
                                {qna.round}
                              </p>
                            </div>
                          )}

                          {/* Question */}
                          <div>
                            <p className="form-label text-gray-600 mb-1">
                              Question Asked
                            </p>
                            <p className="body-text text-black font-medium">
                              {qna.question}
                            </p>
                          </div>

                          {/* Answer / Notes */}
                          {qna.notes_or_answer || qna.answer ? (
                            <div>
                              <p className="form-label text-gray-600 mb-1">
                                Your Notes / Answer
                              </p>
                              <div className="p-2 bg-gray-50 border border-gray-200">
                                <p className="body-text text-black whitespace-pre-wrap">
                                  {qna.notes_or_answer || qna.answer}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="helper-text text-gray-500 italic">
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
              <div className="border-t-2 border-gray-300 pt-4">
                <h3 className="page-title text-black mb-3">
                  Interview Summary
                </h3>
                <div className="p-3 bg-blue-50 border-l-4 border-blue-500">
                  <p className="helper-text text-blue-900">
                    No interview summary added yet. Add difficulty rating and
                    questions below.
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-black bg-gray-50 sticky bottom-0">
          <button
            onClick={handleEdit}
            className="flex-1 px-3 py-2 bg-black text-white hover:bg-gray-800 form-label transition-colors"
          >
            Edit Job
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 border border-black text-black hover:bg-black hover:text-white form-label transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
