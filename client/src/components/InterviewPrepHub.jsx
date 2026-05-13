import { useState, useEffect } from "react";

export default function InterviewHub({ job, onUpdate }) {
  const [interviewDifficulty, setInterviewDifficulty] = useState(
    job.interview_difficulty || null,
  );
  const [interviewQuestions, setInterviewQuestions] = useState(
    job.interview_questions && job.interview_questions.length > 0
      ? job.interview_questions.map((q) => ({
          round: q.round || "",
          question: q.question || "",
          // Support legacy `answer` while preferring `notes_or_answer`
          notes_or_answer: q.notes_or_answer ?? q.answer ?? "",
        }))
      : [],
  );
  const [expandedQuestions, setExpandedQuestions] = useState(
    interviewQuestions.reduce((acc, _, i) => ({ ...acc, [i]: true }), {}),
  );

  // Sync state when job prop changes
  useEffect(() => {
    setInterviewDifficulty(job.interview_difficulty || null);
    if (job.interview_questions && job.interview_questions.length > 0) {
      setInterviewQuestions(
        job.interview_questions.map((q) => ({
          round: q.round || "",
          question: q.question || "",
          notes_or_answer: q.notes_or_answer ?? q.answer ?? "",
        })),
      );
      setExpandedQuestions(
        job.interview_questions.reduce((acc, _, i) => ({ ...acc, [i]: true }), {}),
      );
    } else {
      setInterviewQuestions([]);
      setExpandedQuestions({});
    }
  }, [job]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...interviewQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setInterviewQuestions(updated);
    saveData({
      questions: updated,
      difficulty: interviewDifficulty,
    });
  };

  const toggleQuestionExpand = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const addQuestion = () => {
    const newQuestion = { question: "", notes_or_answer: "", round: "" };
    const updated = [...interviewQuestions, newQuestion];
    const newIndex = updated.length - 1;
    setInterviewQuestions(updated);
    setExpandedQuestions((prev) => ({ ...prev, [newIndex]: true }));
    // Don't save empty questions - only save when user adds text
  };

  const removeQuestion = (index) => {
    if (interviewQuestions.length > 1) {
      const updated = interviewQuestions.filter((_, i) => i !== index);
      setInterviewQuestions(updated);
      const newExpanded = { ...expandedQuestions };
      delete newExpanded[index];
      setExpandedQuestions(newExpanded);
      saveData({
        questions: updated,
        difficulty: interviewDifficulty,
      });
    }
  };

  const saveData = (data) => {
    if (onUpdate) {
      onUpdate({
        interview_questions: data.questions || interviewQuestions,
        interview_difficulty:
          data.difficulty !== undefined ? data.difficulty : interviewDifficulty,
      });
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return "text-slate-900";
    return "text-slate-900";
  };

  const getDifficultyLabel = (difficulty) => {
    if (!difficulty) return "";
    if (difficulty <= 2) return "(Easy)";
    if (difficulty <= 3) return "(Moderate)";
    if (difficulty <= 4) return "(Hard)";
    return "(Very Hard)";
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Main Container */}
      <div className="space-y-6 bg-white border-2 border-slate-200 p-4 sm:p-6">
        {/* Header */}
        <div className="border-b-2 border-slate-200 pb-3">
          <h2 className="page-title text-slate-900 font-bold mb-1.5">
            Interview Summary
          </h2>
          <p className="helper-text text-slate-500">
            Difficulty rating and questions asked, with notes or answers.
          </p>

          {/* Interview Summary */}
          {(interviewDifficulty ||
            (interviewQuestions &&
              interviewQuestions.some((q) => q.question))) && (
            <div className="mt-3 p-2.5 bg-slate-100 border border-slate-200 rounded">
              <p className="helper-text text-slate-900 font-medium">
                Interview Summary:
                {interviewDifficulty &&
                  ` • Overall Difficulty: ${interviewDifficulty}/5 ${getDifficultyLabel(interviewDifficulty)}`}
                {interviewQuestions &&
                  interviewQuestions.some((q) => q.question) &&
                  ` • ${interviewQuestions.filter((q) => q.question).length} question(s) logged`}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!interviewDifficulty &&
            (!interviewQuestions ||
              !interviewQuestions.some((q) => q.question)) && (
              <div className="mt-3 p-3 bg-slate-50/50 border border-slate-200 rounded">
                <p className="helper-text text-slate-500">
                  No interview summary added yet. Add difficulty rating and
                  questions below.
                </p>
              </div>
            )}
        </div>

        {/* Interview Difficulty Rating Section */}
        <div className="space-y-3 bg-slate-50/30 border-2 border-slate-200 p-3">
          <label className="block section-heading text-slate-900 font-bold">
            ⭐ Overall Difficulty
          </label>
          <p className="helper-text text-slate-500 mb-2">
            How difficult was this interview? (1 = Easy, 5 = Very Hard)
          </p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => {
                  const newDifficulty =
                    interviewDifficulty === rating ? null : rating;
                  setInterviewDifficulty(newDifficulty);
                  saveData({
                    difficulty: newDifficulty,
                    questions: interviewQuestions,
                  });
                }}
                className={`w-10 h-10 sm:w-12 sm:h-12 border-2 font-bold text-center flex items-center justify-center transition-all ${
                  interviewDifficulty === rating
                    ? "bg-slate-900 text-white border-slate-900 scale-110"
                    : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                }`}
                title={`Rate as ${rating} star${rating !== 1 ? "s" : ""}`}
              >
                <span className="body-text">{rating}</span>
              </button>
            ))}
          </div>
          {interviewDifficulty && (
            <div
              className={`form-label font-semibold mt-3 ${getDifficultyColor(interviewDifficulty)}`}
            >
              ✓ Difficulty: {interviewDifficulty}/5{" "}
              {getDifficultyLabel(interviewDifficulty)}
            </div>
          )}
        </div>

        {/* Interview Questions Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b-2 border-slate-200 pb-3">
            <label className="block section-heading text-slate-900 font-bold">
              Questions Asked (
              {interviewQuestions.filter((q) => q.question).length})
            </label>
            <button
              type="button"
              onClick={addQuestion}
              className="w-full sm:w-auto form-label px-3 py-1.5 bg-slate-900 text-white border-2 border-slate-900 hover:brightness-110 transition-all font-bold"
            >
              + Add Question
            </button>
          </div>

          {/* Questions List - Scrollable Container */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {interviewQuestions.length === 0 ? (
              <div className="text-center py-6">
                <p className="helper-text text-slate-500">
                  No questions logged yet. Click "+ Add Question" to record
                  interview questions.
                </p>
              </div>
            ) : (
              interviewQuestions.map((q, index) => (
                <div
                  key={index}
                  className="border-2 border-slate-200 bg-white hover:shadow-md transition-shadow"
                >
                  {/* Question Header - Collapsible */}
                  <button
                    type="button"
                    onClick={() => toggleQuestionExpand(index)}
                    className="w-full px-3 py-2 bg-slate-50/50 border-b-2 border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-left flex-1">
                      <span className="form-label text-slate-900 font-bold min-w-fit">
                        Q {index + 1}
                      </span>
                      {q.round && (
                        <span className="badge-text bg-notion-text text-white px-1.5 py-0.5 rounded">
                          {q.round}
                        </span>
                      )}
                      <span className="body-text text-slate-900/80 line-clamp-1">
                        {q.question}
                      </span>
                    </div>
                    <span
                      className={`text-lg transition-transform ${expandedQuestions[index] ? "rotate-180" : ""}`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Question Content - Collapsible */}
                  {expandedQuestions[index] && (
                    <div className="p-3 space-y-3 bg-white">
                      {/* Round */}
                      <div>
                        <label className="block form-label text-slate-900 mb-1.5 font-semibold">
                          Interview Round
                        </label>
                        <input
                          type="text"
                          value={q.round}
                          onChange={(e) =>
                            handleQuestionChange(index, "round", e.target.value)
                          }
                          className="w-full px-3 py-1.5 body-text border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                          placeholder="e.g., Technical Round, HR Round, etc."
                        />
                      </div>

                      {/* Question */}
                      <div>
                        <label className="block form-label text-slate-900 mb-1.5 font-semibold">
                          Question Asked
                        </label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "question",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-1.5 body-text border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                          placeholder="What was the question?"
                        />
                      </div>

                      {/* Notes / Answer */}
                      <div>
                        <label className="block form-label text-slate-900 mb-1.5 font-semibold">
                          Notes / Answer
                        </label>
                        <textarea
                          value={q.notes_or_answer}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "notes_or_answer",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full px-3 py-1.5 body-text border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-none"
                          placeholder="Your answer, approach, or notes about this question"
                        />
                      </div>

                      {/* Remove Button */}
                      {interviewQuestions.length > 1 && (
                        <button
                           type="button"
                           onClick={() => removeQuestion(index)}
                           className="w-full px-3 py-1.5 form-label border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold transition-colors"
                        >
                          🗑️ Remove Question
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {(interviewDifficulty ||
          interviewQuestions.filter((q) => q.question).length > 0) && (
          <div className="bg-slate-100 border-2 border-slate-200 p-3 rounded-md">
            <p className="helper-text text-slate-900 font-medium">
              Interview logged:
              {interviewDifficulty && ` Difficulty ${interviewDifficulty}/5`}
              {interviewQuestions.filter((q) => q.question).length > 0 &&
                ` • ${interviewQuestions.filter((q) => q.question).length} question(s) recorded`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
