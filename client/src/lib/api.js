import axios from "axios";

// VITE_API_URL must point to backend base; ensure it ends with /api (server mounts at /api/auth, /api/jobs)
const rawUrl = import.meta.env.VITE_API_URL;
const API_URL =
  typeof rawUrl === "string"
    ? (() => {
        const base = rawUrl.replace(/\/+$/, "");
        return base.endsWith("/api") ? base : `${base}/api`;
      })()
    : rawUrl;

if (!API_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[api] VITE_API_URL is not defined. " +
      "Set VITE_API_URL in your environment (e.g. http://localhost:5000/api for dev, https://your-backend.onrender.com/api for prod)."
  );
}

// Warn if frontend is HTTPS but API is HTTP (mixed-content blocked by browsers)
if (
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  typeof API_URL === "string" &&
  API_URL.startsWith("http://")
) {
  console.warn(
    `[api] Mixed-content: frontend is https but VITE_API_URL is http (${API_URL}). Use https in production.`
  );
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests (used for JWT Authorization header)
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    // Ensure headers object exists before mutation
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Do not force-redirect on authentication endpoints themselves
    const isAuthEndpoint =
      requestUrl.endsWith("/auth/login") || requestUrl.endsWith("/auth/register");

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to landing/login page without causing loops on auth routes
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

export const jobsAPI = {
  getAll: () => api.get("/jobs"),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getStats: () => api.get("/jobs/stats"),
};

export default api;
