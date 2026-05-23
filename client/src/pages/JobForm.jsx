import { useState, useEffect, useRef } from "react";
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

const labelClass = "block text-[12px] font-extrabold text-charcoal mb-1 tracking-tight";

const selectClass =
  "h-9 w-full rounded-full border border-charcoal bg-transparent px-4 text-[13px] text-charcoal font-semibold cursor-pointer outline-none transition-all shadow-none focus:border-charcoal focus:ring-2 focus:ring-charcoal/20 appearance-auto";

export default function JobForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const positionInputRef = useRef(null);

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
    if (!isEdit && location.state?.prefill) {
      setFormData((prev) => ({ ...prev, ...location.state.prefill }));
      
      // Auto-focus the "Job Title" input if coming from Quick Add
      setTimeout(() => {
        positionInputRef.current?.focus();
      }, 50);
    }
  }, [isEdit, location.state]);

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
      <div className="text-center py-16 text-[13.5px] text-slate-500">
        Loading job…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-[860px] mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-charcoal tracking-tight">
            {isEdit ? "Edit Job" : "Add New Job"}
          </h1>
          <p className="text-[12px] text-charcoal/50 font-semibold">Keep details clean and consistent.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 bg-transparent border border-charcoal rounded-full px-4 py-1.5 text-[12px] font-bold text-charcoal cursor-pointer hover:bg-charcoal/5 transition-colors shrink-0"
        >
          <ArrowLeft size={13} /> Back
        </button>
      </div>

      {/* ── Form card ── */}
      <div className="bg-sage-light border border-charcoal rounded-[24px] overflow-hidden">
        <div className="px-5 py-3 border-b border-charcoal/20">
          <p className="text-[11px] font-extrabold text-charcoal uppercase tracking-[0.6px] m-0">Job Details</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">

          {/* Row 1: Company & Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Company *</label>
              <Input
                type="text" required value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Google"
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <label className={labelClass}>Job Title *</label>
              <Input
                ref={positionInputRef}
                type="text" required value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Software Engineer"
                className="h-9 text-[13px]"
              />
            </div>
          </div>

          {/* Row 2: Location, Type, Status, Date Applied */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div>
              <label className={labelClass}>Location</label>
              <Input
                type="text" value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Remote"
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <label className={labelClass}>Type *</label>
              <select
                required value={formData.application_type}
                onChange={(e) => setFormData({ ...formData, application_type: e.target.value })}
                className={selectClass}
              >
                {APPLICATION_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select
                required value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={selectClass}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date Applied *</label>
              <Input
                type="date" required value={formData.date_applied}
                onChange={(e) => setFormData({ ...formData, date_applied: e.target.value })}
                className="h-9 text-[13px]"
              />
            </div>
          </div>

          {/* Row 3: Job URL & Interview Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Job URL <span className="font-normal text-charcoal/40">(optional)</span></label>
              <Input
                type="url" value={formData.job_url}
                onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                placeholder="https://company.com/careers/role"
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <label className={labelClass}>
                {formData.status === 'online_test' ? 'Online Test Date' : 'Interview Date'}{' '}
                <span className="font-normal text-charcoal/40">(optional)</span>
              </label>
              <Input
                type="date" value={formData.interview_date}
                onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                className="h-9 text-[13px]"
              />
            </div>
          </div>

          {/* Row 4: Resume & Portfolio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Resume Link <span className="font-normal text-charcoal/40">(optional)</span></label>
              <Input
                type="url" value={formData.resume_link}
                onChange={(e) => setFormData({ ...formData, resume_link: e.target.value })}
                placeholder="https://…"
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <label className={labelClass}>Portfolio Link <span className="font-normal text-charcoal/40">(optional)</span></label>
              <Input
                type="url" value={formData.portfolio_link}
                onChange={(e) => setFormData({ ...formData, portfolio_link: e.target.value })}
                placeholder="https://…"
                className="h-9 text-[13px]"
              />
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className={labelClass}>Notes <span className="font-normal text-charcoal/40">(optional)</span></label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full rounded-[16px] border border-charcoal bg-transparent px-4 py-2 text-[13px] text-charcoal resize-none outline-none shadow-none transition-all font-[inherit] box-border focus:border-charcoal focus:ring-2 focus:ring-charcoal/20"
              placeholder="Notes about this application, HR contact, salary range…"
            />
          </div>

          {/* Interview Rounds — shown for all statuses except applied */}
          {formData.status !== "applied" && (
            <div>
              <InterviewRounds
                rounds={formData.interview_rounds}
                onChange={(rounds) => setFormData({ ...formData, interview_rounds: rounds })}
              />
            </div>
          )}

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
          <div className="pt-1 flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className={`border border-charcoal rounded-full px-6 py-2 text-[13px] font-bold tracking-tight transition-all text-white ${
                isPending
                  ? 'bg-charcoal/50 cursor-not-allowed border-charcoal/50'
                  : 'bg-charcoal cursor-pointer hover:bg-charcoal/90'
              }`}
            >
              {isPending ? "Saving…" : isEdit ? "Update Job" : "Add Job"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="bg-transparent text-charcoal border border-charcoal rounded-full px-5 py-2 text-[13px] font-bold cursor-pointer transition-colors hover:bg-charcoal/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
