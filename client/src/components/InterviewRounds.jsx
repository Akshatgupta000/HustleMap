import { useState } from 'react';

export default function InterviewRounds({ rounds = [], onChange }) {
  const [localRounds, setLocalRounds] = useState(
    rounds.length > 0
      ? rounds
      : [
          {
            round: '',
            date: '',
            feedback: '',
            status: 'scheduled',
          },
        ]
  );

  const handleRoundChange = (index, field, value) => {
    const updated = [...localRounds];
    updated[index] = { ...updated[index], [field]: value };
    setLocalRounds(updated);
    onChange(updated);
  };

  const addRound = () => {
    const newRound = {
      round: '',
      date: '',
      feedback: '',
      status: 'scheduled',
    };
    const updated = [...localRounds, newRound];
    setLocalRounds(updated);
    onChange(updated);
  };

  const removeRound = (index) => {
    if (localRounds.length > 1) {
      const updated = localRounds.filter((_, i) => i !== index);
      setLocalRounds(updated);
      onChange(updated);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-notion-text">Interview Rounds</label>
        <button
          type="button"
          onClick={addRound}
          className="text-xs font-semibold text-notion-text border border-notion-border px-2.5 py-1 rounded-lg hover:bg-white/5 transition-all"
        >
          + Add Round
        </button>
      </div>

      {localRounds.map((round, index) => (
        <div key={index} className="bg-notion-bg border border-notion-border p-3 space-y-2 rounded-xl shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-notion-muted mb-1">Round Name</label>
              <input
                type="text"
                value={round.round}
                onChange={(e) => handleRoundChange(index, 'round', e.target.value)}
                className="w-full px-3 py-1.5 text-sm text-notion-text bg-notion-card border border-notion-border rounded-lg focus:border-accent-purple/50 focus:outline-none transition-all"
                placeholder="e.g., Technical Round 1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-notion-muted mb-1">Date</label>
              <input
                type="date"
                value={round.date}
                onChange={(e) => handleRoundChange(index, 'date', e.target.value)}
                className="w-full px-3 py-1.5 text-sm text-notion-text bg-notion-card border border-notion-border rounded-lg focus:border-accent-purple/50 focus:outline-none transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-notion-muted mb-1">Status</label>
              <select
                value={round.status}
                onChange={(e) => handleRoundChange(index, 'status', e.target.value)}
                className="w-full px-3 py-1.5 text-sm text-notion-text bg-notion-card border border-notion-border rounded-lg focus:border-accent-purple/50 focus:outline-none transition-all"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-end">
              {localRounds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRound(index)}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-muted mb-1">Feedback</label>
            <textarea
              value={round.feedback}
              onChange={(e) => handleRoundChange(index, 'feedback', e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 text-sm text-notion-text bg-notion-card border border-notion-border rounded-lg focus:border-accent-purple/50 focus:outline-none transition-all resize-none"
              placeholder="Add feedback about this round..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}
