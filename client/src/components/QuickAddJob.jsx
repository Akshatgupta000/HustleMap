import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "online_test", label: "Online Test" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default function QuickAddJob() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "applied",
    date_applied: new Date().toISOString().split("T")[0],
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      // Log the payload for debugging
      console.log("QuickAdd: Sending job data:", data);
      return jobsAPI.create(data);
    },
    onSuccess: (response) => {
      console.log("QuickAdd: Job created successfully", response.data);
      // Invalidate both queries to ensure dashboard updates
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobStats"] });
      toast.success("Job added successfully!");
      // Reset form
      setFormData({
        company: "",
        position: "",
        status: "applied",
        date_applied: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error) => {
      // Enhanced error logging for debugging
      console.error("QuickAdd: Failed to create job", {
        error,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to add job. Please try again.";
      toast.error(errorMessage);
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
      toast.error("Job role is required");
      return;
    }
    if (!formData.date_applied) {
      toast.error("Date is required");
      return;
    }

    // Validate status is one of the allowed values
    const validStatuses = STATUS_OPTIONS.map((opt) => opt.value);
    if (!validStatuses.includes(formData.status)) {
      console.error("QuickAdd: Invalid status value:", formData.status);
      toast.error("Invalid status selected");
      return;
    }

    // Prepare payload with exact field names expected by backend
    const payload = {
      company: formData.company.trim(),
      position: formData.position.trim(),
      status: formData.status, // Must match backend enum: applied, online_test, interview, offer, rejected, withdrawn
      date_applied: formData.date_applied,
      application_type: "off_campus", // Default value
    };

    console.log("QuickAdd: Submitting job with payload:", payload);
    createMutation.mutate(payload);
  };

  return (
    <div className="bg-white border border-black p-3 sm:p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-heading text-black">Quick Add Job</h2>
        <Link
          to="/jobs/new"
          className="px-2.5 py-1 border border-black text-black form-label hover:bg-gray-50 transition-colors"
        >
          Open Full Form
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
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
              Job Role *
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

          <div>
            <label className="block form-label text-black mb-1">Status</label>
            <select
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
            <label className="block form-label text-black mb-1">Date</label>
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

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-3 py-1.5 bg-black text-white form-label font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createMutation.isPending ? "Adding..." : "Add Job"}
          </button>
          <p className="helper-text text-gray-600">
            Quick entry for urgent applications
          </p>
        </div>
        <p className="helper-text text-gray-500 text-sm mt-2">
          Use "Open Full Form" above to add complete job details like interview
          notes, resume links, and preparation materials.
        </p>
      </form>
    </div>
  );
}
