import { STATUS_ORDER } from "./constants.js";

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function filterAndSortJobs(jobs, { searchQuery, statusFilter, typeFilter, sortBy }) {
  if (!jobs || !Array.isArray(jobs)) return [];

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesType = typeFilter === "all" || job.application_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  filtered.sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date_applied) - new Date(a.date_applied);
    }
    if (sortBy === "status") {
      return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    }
    return 0;
  });

  return filtered;
}
