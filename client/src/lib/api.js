import axios from 'axios';

// VITE_API_URL must point to backend base (e.g. https://hustlemap-yntw.onrender.com/api)
const envUrl = import.meta.env.VITE_API_URL;
let rawUrl = envUrl;

// For local development, fall back to http://localhost:5001/api if VITE_API_URL is not set
if (!rawUrl && import.meta.env.DEV) {
  rawUrl = 'http://localhost:5001/api';
}

if (!rawUrl) {
  console.warn('[api] VITE_API_URL is not defined! Using defaults if local dev.');
}

const API_URL =
  typeof rawUrl === 'string'
    ? (() => {
        const base = rawUrl.replace(/\/+$/, '');
        return base.endsWith('/api') ? base : `${base}/api`;
      })()
    : rawUrl;

console.log(`[api] Final API Endpoint: ${API_URL}`);
console.log(`[api] withCredentials: true (CORS enabled)`);

// Warn if frontend is HTTPS but API is HTTP (mixed-content blocked by browsers)
if (
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  typeof API_URL === 'string' &&
  API_URL.startsWith('http://')
) {
  // eslint-disable-next-line no-console
  console.warn(
    `[api] Mixed-content: frontend is https but VITE_API_URL is http (${API_URL}). Use https in production.`,
  );
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests (used for JWT Authorization header)
api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
    const requestUrl = error.config?.url || '';

    // Do not force-redirect on authentication endpoints themselves
    const isAuthEndpoint = requestUrl.includes('/auth/');

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to landing/login page without causing loops on auth routes
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getExtensionId: () => api.get('/auth/extension-id'),
  getUserProfile: () => api.get('/auth/profile'),
  updateUserProfile: (data) => api.put('/auth/profile', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
};

export const jobsAPI = {
  getAll: () => api.get('/jobs'),
  getCaptured: () => api.get('/jobs/captured'),
  deleteAllCaptured: () => api.delete('/jobs/captured'),
  getDashboardFeed: () => api.get('/jobs/dashboard-feed'),
  getWeeklyProgress: () => api.get('/jobs/weekly-progress'),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  deleteAll: () => api.delete('/jobs'),
  getStats: () => api.get('/jobs/stats'),
};

export default api;
