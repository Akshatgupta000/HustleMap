import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import toast from "react-hot-toast";

import InterviewRounds from "../components/InterviewRounds";
import InterviewPrepHub from "../components/InterviewPrepHub";

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "online_test", label: "Online Test" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

const APPLICATION_TYPE_OPTIONS = [
  { value: "on_campus", label: "On-Campus" },
  { value: "off_campus", label: "Off-Campus" },
];

export default function JobForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    application_type: "off_campus",
    status: "applied",
    date_applied: new Date().toISOString().split("T")[0],
    interview_date: "",
    notes: "",
    job_url: "",
    resume_link: "",
    portfolio_link: "",
    interview_rounds: [],
    interview_questions: [],
    preparation_notes: "",
    interview_difficulty: null,
    interview_status: "pending",
  });

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsAPI.getById(id).then((res) => res.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (job) {
      const fromCaptured = location.state?.fromCaptured && job.is_captured;
      setFormData({
        company: fromCaptured ? "" : job.company || "",
        position: fromCaptured ? "" : job.position || "",
        location: job.location || "",
        application_type: job.application_type || "off_campus",
        status: job.status || "applied",
        date_applied:
          job.date_applied || new Date().toISOString().split("T")[0],
        interview_date: job.interview_date || "",
        notes: fromCaptured ? "Imported from screenshot" : job.notes || "",
        resume_link: job.resume_link || "",
        portfolio_link: job.portfolio_link || "",
        interview_rounds: job.interview_rounds || [],
        interview_questions: job.interview_questions || [],
        preparation_notes: job.preparation_notes || "",
        interview_difficulty: job.interview_difficulty || null,
        interview_status: job.interview_status || "pending",
        job_url: job.job_url || "",
      });
    }
  }, [job, location.state]);

  const createMutation = useMutation({
    mutationFn: (data) => jobsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobStats"] });
      toast.success("Job added successfully!");
      // Reset form
      setFormData({
        company: "",
        position: "",
        location: "",
        application_type: "off_campus",
        status: "applied",
        date_applied: new Date().toISOString().split("T")[0],
        interview_date: "",
        notes: "",
        resume_link: "",
        portfolio_link: "",
        interview_rounds: [],
        interview_questions: [],
        preparation_notes: "",
        interview_difficulty: null,
        job_url: "",
      });
      // Redirect to Dashboard
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to create job");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => jobsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["jobStats"] });
      toast.success("Job updated successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to update job");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.company.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!formData.position.trim()) {
      toast.error("Job title is required");
      return;
    }
    if (!formData.date_applied) {
      toast.error("Application date is required");
      return;
    }

    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isEdit && isLoadingJob) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-black">Loading job...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-black px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="page-title text-black">
            {isEdit ? "Edit Job" : "Add New Job"}
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="helper-text text-black hover:underline"
          >
            Close
          </button>
        </div>
      </div>

      {/* Form Container - Takes remaining space, scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Row 1: Company & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block form-label text-black mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
                  placeholder="Google"
                />
              </div>

              <div>
                <label className="block form-label text-black mb-1">
                  Job Role / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            {/* Row 2: Location & Application Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block form-label text-black mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
                  placeholder="San Francisco, CA or Remote"
                />
              </div>

              <div>
                <label className="block form-label text-black mb-1">
                  Application Type *
                </label>
                <select
                  required
                  value={formData.application_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      application_type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
                >
                  {APPLICATION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Status & Application Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block form-label text-black mb-1">
                  Application Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block form-label text-black mb-1">
                  Application Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_applied}
                  onChange={(e) =>
                    setFormData({ ...formData, date_applied: e.target.value })
                  }
                  className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3.5: Job URL */}
            <div>
              <label className="block form-label text-black mb-1">
                Job URL (optional)
              </label>
              <input
                type="url"
                value={formData.job_url}
                onChange={(e) =>
                  setFormData({ ...formData, job_url: e.target.value })
                }
                className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
                placeholder="https://company.com/careers/role"
              />
            </div>

            {/* Row 4: Interview Date */}
            <div>
              <label className="block form-label text-black mb-1">
                Interview Date (optional)
              </label>
              <input
                type="date"
                value={formData.interview_date}
                onChange={(e) =>
                  setFormData({ ...formData, interview_date: e.target.value })
                }
                className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
              />
            </div>

            {/* Interview Rounds */}
            <div>
              <InterviewRounds
                rounds={formData.interview_rounds}
                onChange={(rounds) =>
                  setFormData({ ...formData, interview_rounds: rounds })
                }
              />
            </div>

            {/* Row 5: Resume & Portfolio Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block form-label text-black mb-1">
                  Resume Link (optional)
                </label>
                <input
                  type="url"
                  value={formData.resume_link}
                  onChange={(e) =>
                    setFormData({ ...formData, resume_link: e.target.value })
                  }
                  className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block form-label text-black mb-1">
                  Portfolio Link (optional)
                </label>
                <input
                  type="url"
                  value={formData.portfolio_link}
                  onChange={(e) =>
                    setFormData({ ...formData, portfolio_link: e.target.value })
                  }
                  className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Row 6: Notes */}
            <div>
              <label className="block form-label text-black mb-1">
                Notes / HR Details (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none resize-none"
                placeholder="Add any notes about this application, HR contact details, etc."
              />
            </div>

            {/* Interview Preparation Hub - Only show when editing */}
            {isEdit && (
              <div>
                <InterviewPrepHub
                  job={formData}
                  onUpdate={(data) => {
                    setFormData({ ...formData, ...data });
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full sm:w-auto sm:min-w-[180px] bg-black text-white py-2 px-4 form-label hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : isEdit
                    ? "Update Job"
                    : "Add Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
