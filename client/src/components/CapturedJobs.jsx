import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jobsAPI } from "../lib/api";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function CapturedJobs() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["capturedJobs"],
    queryFn: () => jobsAPI.getCaptured().then((res) => res.data),
  });

  const capturedJobs = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white border border-black mb-4">
        <div className="px-4 sm:px-6 py-3 border-b border-black">
          <h2 className="section-heading text-black">📸 Captured Jobs</h2>
        </div>
        <div className="px-4 sm:px-6 py-4 body-text text-black">
          Loading captured jobs...
        </div>
      </div>
    );
  }

  if (!capturedJobs.length) {
    // Do not render the section at all when there are no captured jobs
    return null;
  }

  return (
    <div className="bg-white border border-black mb-4">
      <div className="px-4 sm:px-6 py-3 border-b border-black flex items-center justify-between">
        <h2 className="section-heading text-black">📸 Captured Jobs</h2>
        <span className="body-text text-gray-700">
          {capturedJobs.length} captured
        </span>
      </div>
      <div className="px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
          {capturedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-black p-3 flex flex-col h-full hover:shadow-lg transition-shadow"
            >
              <div className="mb-2">
                {job.screenshot && (
                  <img
                    src={job.screenshot}
                    alt="Captured job"
                    className="w-full max-h-40 object-cover border border-gray-200"
                  />
                )}
              </div>

              <div className="space-y-1 mb-3">
                {job.job_url && (
                  <p className="body-text text-black break-all">
                    <span className="font-medium">Link:</span>{" "}
                    <span className="text-blue-700">
                      {job.job_url.replace(/^https?:\/\//, "")}
                    </span>
                  </p>
                )}
                <p className="body-text text-gray-800">
                  <span className="font-medium">Captured on:</span>{" "}
                  {formatDate(job.date_applied)}
                </p>
                {job.application_source && (
                  <p className="helper-text text-gray-600">
                    Source: {job.application_source}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-2">
                {job.job_url && (
                  <button
                    onClick={() => {
                      window.open(job.job_url, "_blank", "noopener,noreferrer");
                    }}
                    className="flex-1 px-3 py-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors duration-200 form-label"
                  >
                    Open Job
                  </button>
                )}
                <button
                  onClick={() =>
                    navigate(`/jobs/edit/${job.id}`, {
                      state: { fromCaptured: true },
                    })
                  }
                  className="flex-1 px-3 py-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors duration-200 form-label"
                >
                  Convert to Job
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

