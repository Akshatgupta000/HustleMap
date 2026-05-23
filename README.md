# HustleMap

**Track smarter. Prep better. Get hired.**
A full‑stack job application tracker with analytics, interview prep, and a Chrome extension for screenshot-based job capture.

---

## 📌 Project Title & Tagline

**HustleMap** is your personal command center for job hunting—track applications end‑to‑end, stay on top of interviews, and save postings straight from LinkedIn/Indeed/Glassdoor in seconds.

---

## 🚀 Features (UPDATED)

- **Job tracking system**: Create, edit, and manage job applications with rich details (company, role, links, notes, dates, contacts).
- **Status tracking**: Move jobs through the pipeline (e.g. **Applied**, **Online Test**, **Interview**, **Offer**, **Rejected**, **Withdrawn**, plus **Saved** from captures).
- **Fast “Quick Add”**: Add a job in seconds with sensible defaults; use the full form when you want deeper details.
- **Search, filter, sort**: Find jobs quickly by company/role; filter by status & type; sort by date and status.
- **Interview preparation hub**: Log interview questions, track rounds, rate difficulty, and store preparation notes per job.
- **Upcoming interviews visibility**: Upcoming interview items and “days until interview” style countdowns for planning.
- **Analytics dashboard**: High-signal metrics (totals, pipeline counts) plus trend visuals (charts/graphs via Recharts).
- **Prioritized Action Items Widget**: Dynamic, client-side task generator that prioritizes actions (upcoming interviews within 72 hours, pending Online Assessments, follow-up alerts, inactivity reminders, weekly goals).
- **Browser Extension Setup Guide**: A step-by-step interactive setup instructions page (available at `/extension`) where users can generate and copy their unique **Extension ID** to link their extension to their account.
- **Redesigned Chrome Extension Popup**: Aesthetic styling matching the web app (Sage Green / Charcoal) with simplified configuration (no manual API URL storage required).
- **Enhanced Data Management**: Clear and safe data cleaning options like **Delete All Jobs** and **Clear All Captured Jobs** with confirmation prompts.
- **OCR fallback (backend)**: The backend includes an OCR fallback using `tesseract.js` for screenshot capture flows when structured data isn’t available.
- **Authentication & Landing Page**: JWT-based sign up, login, session preservation, and a sleek modern landing page.
- **Dark mode**: **Not currently implemented** in the frontend codebase (planned / optional enhancement).

---

## 🧩 Chrome Extension (NEW SECTION)

The `hustlemap-extension/` Chrome extension lets you save job posts to HustleMap without copy/pasting details.

### What the extension does

- Lets you **draw a rectangle** around a job posting on supported sites
- Captures and **crops a screenshot**
- Shows a **preview** inside the extension popup
- Saves the screenshot into HustleMap as a **Captured / Saved** job (with URL + timestamp)

### How it works (draw → capture → preview → save)

1. **Draw**: Click “Save Job to HustleMap” and drag to select the job content.
2. **Capture**: The extension captures the visible tab and crops it to your selection.
3. **Preview**: Reopen the popup to see the screenshot + the job URL.
4. **Save**: Confirm to send it to the HustleMap API and create a captured job in your account.

### Supported platforms

- **LinkedIn**
- **Indeed**
- **Glassdoor**

### How it connects to the main app

- The extension calls the backend endpoint `POST /api/jobs/save-from-extension` (**no JWT required**).
- The request includes your **HustleMap Extension ID** (generated on the `/extension` page and stored in the extension settings).
- In the web app, captured jobs can be viewed and then **converted** by editing them into a normal tracked job.

For full extension details, see `hustlemap-extension/README.md`.

---

## 🛠 Tech Stack

### Frontend (`client/`)

- **React + Vite**
- **Tailwind CSS**
- **React Router**
- **TanStack Query** (server state) + **Axios**
- **Recharts** (analytics charts/graphs)
- **Radix UI** (primitives) + **Lucide** (icons) + **React Hot Toast** (toasts)

### Backend (`server/`)

- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT** auth + **bcrypt** password hashing
- **CORS** + **Morgan** logging
- **tesseract.js** (OCR support for screenshot capture flows)

### State management / APIs

- **TanStack Query** handles caching, refetching, and mutations on the frontend.
- REST API under `/api`:
  - Auth: `/api/auth/*`
  - Jobs: `/api/jobs/*` (CRUD, stats, captured jobs, extension endpoints)
    - `DELETE /api/jobs` – Clear all job applications for the user.
    - `DELETE /api/jobs/captured` – Clear all captured/saved screenshot jobs for the user.

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js **18+**
- MongoDB (local) or MongoDB Atlas
- npm

### 1) Clone repo

```bash
git clone <your-repo-url>
cd HustleMap
```

### 2) Install dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd ../client
npm install
```

### 3) Setup environment variables

Backend (`server/.env`) is **required**:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-strong-secret
MONGO_URI=mongodb://localhost:27017/job_tracker

# Optional (recommended in production; can be comma-separated for multiple origins)
CLIENT_URL=http://localhost:5173
```

Frontend (`client/.env`) is recommended (example exists at `client/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 4) Run frontend and backend

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### More guides

- Local setup walkthrough: `SETUP.md`
- Production deployment (Vercel + Render): `DEPLOYMENT.md`

---

## 🧪 How to Use

### Using the main web app

1. **Register / Login**
2. **Add jobs**
   - Use **Quick Add** for fast entry
   - Use the **full job form** for complete details
3. **Track status** as you progress (Applied → Interview → Offer, etc.)
4. **Prep interviews** by logging questions, rounds, and difficulty ratings
5. **Review analytics** to understand your funnel and weekly activity

### Using the Chrome extension (step-by-step)

1. Open `chrome://extensions` and enable **Developer mode**
2. Click **Load unpacked** and select the `hustlemap-extension/` folder
3. Open the extension popup → **Settings** → enter your **HustleMap Extension ID** (generated/copied from your web app's `/extension` setup page) → Save
4. Open a supported job posting (LinkedIn/Indeed/Glassdoor)
5. Click the extension → **Save Job to HustleMap** → **draw** a rectangle on the page
6. Reopen the popup → review the **Preview** → click **Save to HustleMap**
7. In the web app, view captured jobs and **Convert** them by editing into a normal tracked job

---

## 📊 Screenshots / UI Preview

No screenshots are committed in the repo right now. If you add images, a good convention is:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/job-details.png`
- `docs/screenshots/analytics.png`
- `docs/screenshots/extension-preview.png`

---

## 📁 Project Structure

```
HustleMap/
├── client/                 # React frontend (Vite)
├── server/                 # Express API + MongoDB (Mongoose)
├── hustlemap-extension/    # Chrome extension (MV3) for screenshot capture
├── README.md               # Project overview (this file)
├── SETUP.md                # Local setup notes
└── DEPLOYMENT.md           # Production deployment guide
```

---

## 🔮 Future Improvements (optional)

- **Dark mode** toggle + persisted theme
- **Structured job extraction** from job boards (auto-fill company/title/location instead of screenshot-first)
- **Notifications/reminders** for follow-ups and interview prep
- **Richer analytics** (conversion funnel, time-to-decision, source performance)
- **CSV import/export**

---

## 🤝 Contributing

- Fork the repo and create a branch: `git checkout -b feature/my-change`
- Keep PRs focused (one feature/fix per PR when possible)
- Verify core flows locally (auth, create/edit job, stats, captured jobs)
- Open a PR with:
  - What changed
  - Why it changed
  - How to test

Documentation improvements are welcome.

---

## 📄 License

No license file is currently present in the repository. If you want this project to be open-source, add a `LICENSE` file (e.g. MIT) and update this section.

