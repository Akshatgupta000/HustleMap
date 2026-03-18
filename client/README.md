# HustleMap Frontend (React + Vite)

This folder contains the **React frontend** for **HustleMap**, the job application tracking dashboard described in the root `README.md`.

For full product overview, API docs, and setup details, see the root [`README.md`](../README.md) and [`SETUP.md`](../SETUP.md). This file focuses on the frontend-only workflow.

---

## 🧩 Tech Overview

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Data fetching**: TanStack Query + Axios
- **Auth**: JWT-based, talking to the Express backend at `VITE_API_URL`

Key entry points:

- `src/App.jsx` – top-level routes and layout
- `src/pages/Dashboard.jsx` – main dashboard (Quick Add + job cards + analytics)
- `src/components/` – reusable UI (QuickAddJob, JobCard, AnalyticsWidgets, Navbar, etc.)
- `src/lib/api.js` – configured Axios instance pointing at the backend API

---

## 🚀 Running the Frontend

From the repo root:

```bash
cd client
npm install
npm run dev
```

The app will start on `http://localhost:5173` by default (see Vite logs).

Make sure the backend in `server/` is also running (see the root `README.md` / `SETUP.md` for backend instructions).

---

## 🔧 Environment Variables

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

In production, point `VITE_API_URL` to your deployed backend (must end with `/api` and match the backend CORS config).

---

## 🧪 Development Notes

- This app uses **TanStack Query** heavily; prefer hooks like `useQuery` / `useMutation` over manual `useEffect` + `axios`.
- All API calls should go through `src/lib/api.js` so headers and base URL stay centralized.
- UI is built with Tailwind utility classes; keep components small and composable.

For a complete feature walkthrough (Quick Add, analytics, interview logging, etc.), see the **How to Use** section in the root `README.md`.
