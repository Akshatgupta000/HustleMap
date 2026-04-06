import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import toast from "react-hot-toast";

import InterviewRounds from "../components/InterviewRounds";
import InterviewPrepHub from "../components/InterviewPrepHub";
import { Input } from "../components/ui/input";
import { ArrowLeft } from "lucide-react";

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

const labelClass = "block text-[13px] font-semibold text-notion-text mb-[7px] tracking-tight";

const selectClass =
  "h-10 w-full rounded-[10px] border border-notion-border bg-notion-card px-3 text-[13.5px] text-notion-text cursor-pointer outline-none transition-all shadow-soft focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 appearance-auto";

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
      
      const isPlaceholderCompany = job.company === "Captured" || job.company === "Unknown Company";
      const isPlaceholderPosition = job.position === "Job Capture" || job.position === "Captured Job";

      setFormData({
        company: fromCaptured && isPlaceholderCompany ? "" : job.company || "",
        position: fromCaptured && isPlaceholderPosition ? "" : job.position || "",
        location: job.location || "",
        application_type: job.application_type || "off_campus",
        status: job.status || "applied",
        date_applied: job.date_applied || new Date().toISOString().split("T")[0],
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
      setFormData({
        company: "", position: "", location: "", application_type: "off_campus",
        status: "applied", date_applied: new Date().toISOString().split("T")[0],
        interview_date: "", notes: "", resume_link: "", portfolio_link: "",
        interview_rounds: [], interview_questions: [], preparation_notes: "",
        interview_difficulty: null, job_url: "",
      });
      navigate("/dashboard");
    },
    onError: (error) => toast.error(error.response?.data?.error || "Failed to create job"),
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
    onError: (error) => toast.error(error.response?.data?.error || "Failed to update job"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company.trim()) { toast.error("Company name is required"); return; }
    if (!formData.position.trim()) { toast.error("Job title is required"); return; }
    if (!formData.date_applied) { toast.error("Application date is required"); return; }
    isEdit ? updateMutation.mutate(formData) : createMutation.mutate(formData);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingJob) {
    return (
      <div className="text-center py-16 text-[13.5px] text-notion-muted">
        Loading job…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-notion-text tracking-tight mb-1">
            {isEdit ? "Edit Job" : "Add New Job"}
          </h1>
          <p className="text-[13.5px] text-notion-muted">
            Keep details clean and consistent so you can spot patterns later.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center justify-center gap-1.5 bg-notion-card border border-notion-border rounded-[10px] px-[14px] py-2 text-[13.5px] font-medium text-notion-text cursor-pointer shadow-soft transition-colors hover:bg-notion-sidebar w-full sm:w-auto"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      {/* ── Form card ── */}
      <div className="bg-notion-card border border-notion-border rounded-2xl overflow-hidden shadow-soft">
        <div className="px-5 py-[14px] border-b border-notion-border/50 flex items-center justify-between">
          <p className="text-[11px] font-bold text-notion-muted uppercase tracking-[0.6px] m-0">
            Job Details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-[18px]">

          {/* Company & Position */}
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label className={labelClass}>Company Name *</label>
              <Input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Google"
              />
            </div>
            <div>
              <label className={labelClass}>Job Role / Title *</label>
              <Input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          {/* Location & Type */}
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label className={labelClass}>Location</label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA or Remote"
              />
            </div>
            <div>
              <label className={labelClass}>Application Type *</label>
              <select
                required
                value={formData.application_type}
                onChange={(e) => setFormData({ ...formData, application_type: e.target.value })}
                className={selectClass}
              >
                {APPLICATION_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Date */}
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label className={labelClass}>Application Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={selectClass}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Application Date *</label>
              <Input
                type="date"
                required
                value={formData.date_applied}
                onChange={(e) => setFormData({ ...formData, date_applied: e.target.value })}
              />
            </div>
          </div>

          {/* Job URL */}
          <div>
            <label className={labelClass}>
              Job URL{' '}
              <span className="font-normal text-notion-muted">(optional)</span>
            </label>
            <Input
              type="url"
              value={formData.job_url}
              onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
              placeholder="https://company.com/careers/role"
            />
          </div>

          {/* Interview Date */}
          <div>
            <label className={labelClass}>
              Interview Date{' '}
              <span className="font-normal text-notion-muted">(optional)</span>
            </label>
            <Input
              type="date"
              value={formData.interview_date}
              onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
            />
          </div>

          {/* Interview Rounds */}
          <div>
            <InterviewRounds
              rounds={formData.interview_rounds}
              onChange={(rounds) => setFormData({ ...formData, interview_rounds: rounds })}
            />
          </div>

          {/* Resume & Portfolio */}
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label className={labelClass}>
                Resume Link{' '}
                <span className="font-normal text-notion-muted">(optional)</span>
              </label>
              <Input
                type="url"
                value={formData.resume_link}
                onChange={(e) => setFormData({ ...formData, resume_link: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <label className={labelClass}>
                Portfolio Link{' '}
                <span className="font-normal text-notion-muted">(optional)</span>
              </label>
              <Input
                type="url"
                value={formData.portfolio_link}
                onChange={(e) => setFormData({ ...formData, portfolio_link: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>
              Notes / HR Details{' '}
              <span className="font-normal text-notion-muted">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full rounded-[10px] border border-notion-border bg-notion-bg px-3 py-[9px] text-[13.5px] text-notion-text resize-none outline-none shadow-soft transition-all font-[inherit] box-border focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20"
              placeholder="Notes about this application, HR contact, salary range…"
            />
          </div>

          {/* Interview Prep Hub (edit only) */}
          {isEdit && (
            <div>
              <InterviewPrepHub
                job={formData}
                onUpdate={(data) => setFormData({ ...formData, ...data })}
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-1 flex gap-2.5 flex-wrap">
            <button
              type="submit"
              disabled={isPending}
              className={`border-none rounded-[11px] px-7 py-[10px] text-[14.5px] font-bold tracking-tight transition-all flex-1 sm:flex-none sm:min-w-[160px] text-notion-bg ${
                isPending
                  ? 'bg-notion-muted cursor-not-allowed'
                  : 'bg-accent-purple cursor-pointer shadow-soft hover:brightness-110 hover:scale-[1.03]'
              }`}
            >
              {isPending ? "Saving…" : isEdit ? "Update Job" : "Add Job"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="bg-notion-card text-notion-text border border-notion-border rounded-[11px] px-5 py-[10px] text-[14.5px] font-medium cursor-pointer transition-colors hover:bg-notion-sidebar flex-1 sm:flex-none shadow-soft"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
