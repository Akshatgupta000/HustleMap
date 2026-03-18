import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
    <Card className="mb-4">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="section-heading">Quick Add Job</CardTitle>
        <Link to="/jobs/new">
          <Button variant="outline" size="sm">
            Open Full Form
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">
                Company Name *
              </label>
              <Input
                type="text"
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="Google"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">
                Job Role *
              </label>
              <Input
                type="text"
                required
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="h-10 w-full rounded-xl border border-notion-border bg-white px-3 text-sm shadow-soft transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">
                Date
              </label>
              <Input
                type="date"
                required
                value={formData.date_applied}
                onChange={(e) =>
                  setFormData({ ...formData, date_applied: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              variant="default"
              className="sm:w-auto"
            >
              {createMutation.isPending ? "Adding..." : "Add Job"}
            </Button>
            <p className="text-sm text-notion-muted">
              Quick entry for urgent applications
            </p>
          </div>
          <p className="text-sm text-notion-muted">
            Use "Open Full Form" to add complete job details like interview
            notes, resume links, and preparation materials.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
