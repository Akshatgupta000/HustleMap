# 🎯 HustleMap

> A full-stack web application designed to help job seekers efficiently track, manage, and analyze their job applications with smart filtering, interview prep tools, and actionable analytics.

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)

## 📋 Table of Contents

- [Problem & Solution](#problem--solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Why Use HustleMap](#why-use-hustlemap)
- [Future Roadmap](#future-roadmap)

## 🎯 Problem & Solution

### The Problem

Job seekers often lose track of applications across multiple companies and platforms. Critical information—like interview dates, company details, and preparation notes—gets scattered across emails, spreadsheets, and notes apps. Without a centralized system, it's easy to miss follow-ups, repeat questions in interviews, or lose sight of your overall application strategy.

### Our Solution

**HustleMap** provides a single, intuitive dashboard where you can:

- Quickly add new job applications
- Track status at every stage (Applied → Interview → Offer)
- Prepare for interviews with dedicated notes and practice questions
- Visualize your progress with analytics
- Stay organized with smart filters and search

## ✨ Key Features

### 🔐 Secure Authentication

- User registration and login with JWT tokens
- Secure password hashing with bcrypt
- Protected routes with automatic redirects
- Session persistence across browser sessions

### ⚡ Quick Add Job (Top Priority)

- Add jobs in **seconds** with the essentials: Company, Position, Status, and Date
- Default values pre-filled (Status: "Applied", Date: Today)
- Auto-form reset after submission for rapid entry
- Link to the full form for detailed information

### 📝 Comprehensive Job Form

- Full job details: company name, position, location, job link
- Application status tracking (Applied, Online Test, Interview, Offer, Rejected, Withdrawn)
- Application type classification (On-Campus/Off-Campus)
- Application and interview dates
- HR contact information
- Notes and portfolio links
- Interview rounds tracking

### 📊 Smart Dashboard

- **My Applications Section**: View all jobs in a responsive card grid
  - Search by company name or position
  - Filter by status and application type
  - Sort by date applied or status
  - Interview Prep indicator showing question count (e.g., "📝 Interview Prep: 3 questions")
  - Interview status highlight with recommendation when status is "Interview"
  - Real-time count of applications
  - Responsive design (1-3 columns based on screen size)

### 🔍 Job Details Modal

- Complete job information at a glance
- Click any job card to view full details
- Interview status recommendation when interview is scheduled
- Easy access to interview prep tools
- "Prepare Interview" button when prep data exists, "Edit Job" otherwise

### 🎯 Interview Summary & History Log

- **Visibility Features**:
  - Clear display of interview difficulty rating and logged questions
  - Empty state guidance: "No interview data recorded yet. Add questions asked and difficulty rating below."
  - Question count displayed clearly at top
  - Visual summary showing interview logging status

- **Difficulty Rating**: Rate each interview (1-5 stars) to track patterns and reflect on interview experiences
- **Interview History Tracker**:
  - Log actual questions asked during each interview round
  - Write notes about your answers and approach
  - Organize by round (e.g., "Technical Round 1", "HR Round")
  - Review your responses for continuous improvement
  - Optional: questions can be left empty if not needed

### 📈 Analytics Dashboard

- **Key Metrics**: Total applications, interviews, offers, and in-progress count displayed as simple counters
- **Applications Per Week**: Text-based breakdown showing application activity by week
- **Status Distribution**: List showing count of applications in each status (Applied, Interview, Offer, etc.)
- **Collapsible Section**: Minimize analytics to focus on your job list

### 🔔 Upcoming Interviews Alert

- View interviews scheduled for the next 7 days at a glance
- "Days until interview" countdown on job cards
- Easy reference for preparation planning

### Additional Features

- 📎 **Resume & Portfolio Links**: Quick access to submitted documents
- 🏷️ **Status Management**: Easy status updates with visual indicators
- 📅 **Date Tracking**: Track application and interview dates
- 💬 **Notes & HR Details**: Store important contact information and notes
- 🔄 **Interview Rounds**: Track multiple interview stages with feedback
- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS
- ⚡ **Fast Performance**: Optimized with React Query for efficient data fetching
- 🔒 **Data Security**: User-specific data isolation and secure authentication

## �️ Tech Stack

### Frontend

- **React 19.2.0** - Modern UI library with hooks
- **Vite 7.2.4** - Fast build tool and dev server with HMR
- **React Router 6.22.0** - Client-side routing and navigation
- **TanStack Query 5.20.0** - Powerful server state management
- **Axios 1.6.5** - HTTP client for API communication
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **React Hot Toast 2.4.1** - Toast notifications for user feedback
- **Framer Motion 11.0.5** - Smooth animations and transitions
- **Lucide React 0.344.0** - Beautiful icon library

### Backend

- **Node.js 18+** - JavaScript runtime environment
- **Express 4.18.2** - Lightweight web framework
- **MongoDB** - NoSQL database for flexible schema
- **Mongoose 8.0.3** - MongoDB ODM with schema validation
- **JWT (jsonwebtoken 9.0.2)** - Secure token-based authentication
- **bcrypt 5.1.1** - Password hashing with salt
- **CORS 2.8.5** - Cross-origin resource sharing
- **Morgan 1.10.0** - HTTP request logging

### Why This Stack?

- **Performance**: Vite's instant HMR and React Query's caching make the app feel snappy
- **Scalability**: MongoDB's schema flexibility allows easy feature additions
- **Security**: JWT + bcrypt provide secure authentication
- **Developer Experience**: Modern tooling with fast feedback loops
- **Maintainability**: Clean separation of concerns with Express controllers

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud database)

### Quick Setup (5 minutes)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd job-tracker
   ```

2. **Backend Setup**

   ```bash
   cd server
   npm install
   ```

   Create `.env` file in `server/`:

   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   MONGO_URI=mongodb://localhost:27017/job_tracker
   ```

   Start the backend:

   ```bash
   npm run dev
   ```

   ✅ Server runs on `http://localhost:5000`

3. **Frontend Setup**

   ```bash
   cd ../client
   npm install
   ```

   (Optional) Create `.env` file in `client/`:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   Start the frontend:

   ```bash
   npm run dev
   ```

   ✅ App runs on `http://localhost:5173`

4. **Start Using**
   - Open `http://localhost:5173` in your browser
   - Register a new account
   - Begin tracking your job applications!

> 📖 See [SETUP.md](SETUP.md) for detailed setup instructions including MongoDB Atlas configuration.

## 📁 Project Structure

```
job-tracker/
├── client/                           # React frontend application
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── QuickAddJob.jsx       # Fast job entry form
│   │   │   ├── JobCard.jsx           # Job display card
│   │   │   ├── JobDetailsModal.jsx   # Full job details view
│   │   │   ├── InterviewPrepHub.jsx  # Interview prep section
│   │   │   ├── InterviewRounds.jsx   # Interview rounds tracker
│   │   │   ├── AnalyticsWidgets.jsx  # Statistics dashboard
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   └── ProtectedRoute.jsx    # Auth-protected routes
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Landing.jsx           # Landing/home page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Register.jsx          # Registration page
│   │   │   ├── Dashboard.jsx         # Main dashboard (Quick Add + Jobs)
│   │   │   ├── JobForm.jsx           # Add/Edit job form
│   │   │   └── Jobs.jsx              # All jobs list view
│   │   │
│   │   ├── lib/                      # Utilities & helpers
│   │   │   ├── api.js                # API client configuration
│   │   │   └── auth.js               # Auth helper functions
│   │   │
│   │   ├── App.jsx                   # Main app with routing
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                           # Express backend application
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection setup
│   │   │
│   │   ├── controllers/              # Business logic
│   │   │   ├── authController.js     # Auth: register, login
│   │   │   └── jobController.js      # Job CRUD & stats
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification middleware
│   │   │
│   │   ├── models/                   # Database schemas
│   │   │   ├── User.js               # User schema
│   │   │   └── Job.js                # Job schema with all fields
│   │   │
│   │   ├── routes/                   # API endpoints
│   │   │   ├── auth.js               # /api/auth routes
│   │   │   └── jobs.js               # /api/jobs routes
│   │   │
│   │   ├── utils/
│   │   │   └── healthCheck.js        # Health check utility
│   │   │
│   │   └── server.js                 # Express server initialization
│   │
│   ├── package.json
│   └── .env                          # Environment variables
│
├── README.md                         # This file
├── SETUP.md                          # Detailed setup guide
└── .gitignore
```

## 📖 How to Use

### 1. **Authentication Workflow**

#### Register (First Time)

- Click "Register" on the landing page
- Enter name, email, and password
- You'll be automatically logged in and taken to the dashboard

#### Login

- Click "Login" on the landing page
- Enter your email and password
- Dashboard loads immediately upon success

#### Logout

- Click "Logout" in the navbar (top right)
- You'll be redirected to the landing page

### 2. **Adding Job Applications**

#### ⚡ Quick Add (Recommended - Top Form)

This is the **primary entry point** for adding jobs:

1. On the **Dashboard**, find the **Quick Add Job** section at the very top
2. Fill in only 4 fields:
   - **Company Name** (required)
   - **Job Role** (required)
   - **Status** (defaults to "Applied")
   - **Date Applied** (defaults to today)
3. Click **"Add Job"**
4. Form instantly resets for the next entry
5. Job appears immediately in your applications list below

#### 📝 Full Form (Detailed Entry)

For comprehensive job information:

1. Click **"Open Full Form"** button in Quick Add, or navigate to `/jobs/new`
2. Fill in complete details:
   - Basic info: company, position, location, job URL
   - Application: status, type (on-campus/off-campus), dates
   - Interview: date, rounds tracking
   - Notes: HR contact, resume link, portfolio link
   - Interview prep notes
3. Click **"Add Job"** to save

### 3. **Viewing & Managing Jobs**

#### Dashboard View

- **My Applications**: All your jobs in a responsive grid
- **Search**: Type to find jobs by company or role (real-time)
- **Filters**:
  - Filter by status (Applied, Interview, Offer, etc.)
  - Filter by type (On-Campus or Off-Campus)
  - Combine filters for precise views
- **Sort**: By date applied or by status

#### Job Card Actions

Click any job card to open the **Details Modal** showing:

- Full job information
- Interview status recommendation (when interview is scheduled)
- Interview rounds (if tracked)
- Notes and links
- Interview summary data (if available)
- **Edit** button to modify job details
- **Delete** button with confirmation

### 4. **Interview Summary & History**

Access from any job's details modal by clicking "Edit" when interview data exists:

**Getting Started**

- When opening the interview section, you'll see a clean form to log your interview experience
- Start by rating the difficulty (1-5 stars) then add questions that were asked

**Difficulty Rating**

- Rate the interview difficulty 1-5 stars
- Track patterns across companies
- Useful for reflecting on interview difficulty trends

**Interview History Logger**

- Log actual questions asked in each round
- Write notes about your answers and approach
- Organize by round (e.g., "Technical Round 1", "HR Round")
- Questions are optional - you can save difficulty and notes without adding questions
- Review your logged responses before similar interviews

### 5. **Analytics & Insights**

- **Key Metrics**: Summary counters for total applications, interviews, offers, and in-progress jobs
- **Applications Per Week**: Text-based list showing how many jobs you applied to each week
- **Status Distribution**: Breakdown of application counts by status (Applied, Interview, Offer, Rejected, etc.)
- Click the Analytics heading to collapse/expand this section

### 6. **Upcoming Interviews**

- Automatically shows interviews scheduled in the next 7 days
- Displays "days until interview" countdown on job cards
- Quick reference for upcoming preparation

### 7. **Responsive Design**

- **Desktop**: Full 3-column grid layout
- **Tablet**: 2-column grid with optimized spacing
- **Mobile**: Single column, touch-friendly
- Works seamlessly across all screen sizes

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register` | Register new user | No            |
| POST   | `/api/auth/login`    | Login user        | No            |

### Job Endpoints (Protected)

| Method | Endpoint          | Description           | Auth Required |
| ------ | ----------------- | --------------------- | ------------- |
| GET    | `/api/jobs`       | Get all jobs for user | Yes           |
| GET    | `/api/jobs/stats` | Get job statistics    | Yes           |
| GET    | `/api/jobs/:id`   | Get single job        | Yes           |
| POST   | `/api/jobs`       | Create new job        | Yes           |
| PUT    | `/api/jobs/:id`   | Update job            | Yes           |
| DELETE | `/api/jobs/:id`   | Delete job            | Yes           |

### Health Check

| Method | Endpoint      | Description         |
| ------ | ------------- | ------------------- |
| GET    | `/api/health` | Server health check |

### Request/Response Examples

**Register User**

```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Create Job**

```json
POST /api/jobs
Authorization: Bearer <token>
{
  "company": "Google",
  "position": "Software Engineer",
  "location": "Mountain View, CA",
  "status": "applied",
  "application_type": "off_campus",
  "date_applied": "2024-01-15",
  "interview_date": "2024-01-20",
  "notes": "Applied through company website",
  "resume_link": "https://...",
  "interview_difficulty": 4,
  "interview_questions": [
    {
      "round": "Technical Round 1",
      "question": "Explain binary search",
      "answer": "Binary search divides the array in half..."
    }
  ]
}
```

## 💡 Why Use HustleMap?

### For Job Seekers

- **Stay Organized**: Centralized hub for all your applications instead of scattered emails and spreadsheets
- **Save Time**: Quick Add form lets you log jobs in seconds, not minutes
- **Track Progress**: See your journey from "Applied" to "Offer" with visual progress
- **Log Interview Experiences**: Track interview questions, difficulty ratings, and your responses for each round
- **Data Safety**: Your personal data is secure with JWT authentication
- **No Distractions**: Clean interface focused on what matters—finding your next job

### For Resume Review

- **Demonstrates Real Skills**: Built with modern tech stack (React, Express, MongoDB)
- **Shows Problem-Solving**: Identifies and solves actual pain points in the job search process
- **Production-Ready Code**: Proper authentication, validation, error handling
- **Full-Stack Capability**: Frontend + Backend + Database design and implementation
- **Attention to UX**: Clean design focused on usability and user experience

### For Teams

- **Easy to Deploy**: Clear setup instructions and Docker-ready structure
- **Maintainable Code**: Well-organized components, controllers, and routes
- **Extensible Architecture**: Easy to add new features (notifications, resume storage, etc.)
- **Good Documentation**: Comprehensive README and setup guides

## 🚀 Why Use HustleMap?

### Problems It Solves

| Problem                           | Solution                                                            |
| --------------------------------- | ------------------------------------------------------------------- |
| **Scattered Applications**        | Centralized dashboard for all jobs                                  |
| **Lost Interview Dates**          | Calendar view with upcoming interview alerts                        |
| **Forgotten Interview Questions** | Interview history logger to document questions asked and responses  |
| **No Progress Visibility**        | Simple text-based analytics showing weekly trends and status counts |
| **Repetitive Data Entry**         | Quick Add form for fast entry, full form for details                |
| **Interview Experience Tracking** | Interview summary with difficulty ratings and question logging      |
| **Mobile Inaccessibility**        | Fully responsive design (desktop, tablet, mobile)                   |

### Real-World Use Cases

1. **Campus Placements**: Track on-campus and off-campus applications side-by-side
2. **Internship Hunt**: Quick log multiple applications daily, prep for rounds
3. **Career Change**: Comprehensive tracking across multiple industries
4. **Freelance Work**: Monitor job applications while freelancing
5. **Visa Sponsorship**: Document companies offering visa sponsorship in notes

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with token refresh
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Protected Routes**: Client and server-side route protection
- **Data Isolation**: Each user can only access their own data (MongoDB queries filtered by user ID)
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Server-side validation for all inputs prevents injection attacks

## 🛠️ Development & Deployment

### Local Development

**Backend:**

```bash
cd server
npm install
npm run dev  # Auto-reload with --watch flag
```

**Frontend:**

```bash
cd client
npm install
npm run dev  # Vite dev server with HMR on localhost:5173
```

### Production Build

**Frontend:**

```bash
cd client
npm run build  # Creates optimized dist/ folder
```

**Backend:**

```bash
cd server
npm start  # Node production server
```

### Environment Setup

- Frontend: `.env.local` for `VITE_API_URL`
- Backend: `.env` for `PORT`, `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`

## 🗺️ Future Roadmap

### Phase 1: Enhanced Tracking

- [ ] **Interview Rounds Timeline**: Visual timeline showing progress through each round
- [ ] **Salary Tracking**: Log offered and expected salary ranges
- [ ] **Interview Notes by Round**: Detailed notes for each interview round (Technical, HR, etc.)
- [ ] **Company Research Links**: Store and organize links to company research materials

### Phase 2: Notifications & Reminders

- [ ] **Email Notifications**: Alerts for upcoming interviews and follow-up reminders
- [ ] **Interview Day Reminders**: Push notifications on interview day
- [ ] **Follow-up Scheduler**: Automatic reminders to follow up on applications
- [ ] **Application Deadline Alerts**: Know when application windows are closing

### Phase 3: Advanced Analytics

- [ ] **Offer Comparison Tool**: Side-by-side comparison of job offers
- [ ] **Success Rate Analytics**: Track conversion rate by company, role, or industry
- [ ] **Interview Difficulty Analysis**: Patterns in companies' interview difficulty
- [ ] **Application Funnel**: Visualization of applications through each status stage
- [ ] **Time to Decision**: Average days from application to offer/rejection

### Phase 4: Collaboration & Sharing

- [ ] **Interview Prep Sharing**: Share interview questions with friends
- [ ] **Company Reviews**: Community reviews of interview experience
- [ ] **Study Groups**: Connect with other job seekers preparing together
- [ ] **Mentor Connection**: Link with senior professionals for advice

### Phase 5: AI-Powered Features

- [ ] **Resume Suggestions**: AI recommendations for resume tailoring
- [ ] **Interview Question Predictions**: AI suggests likely questions based on role/company
- [ ] **Preparation Score**: Smart recommendations for interview prep
- [ ] **Job Matching**: Suggest jobs based on your application history

### Phase 6: Mobile & Integrations

- [ ] **Mobile App**: Native iOS/Android app with offline sync
- [ ] **Calendar Integration**: Sync interview dates with Google Calendar/Outlook
- [ ] **LinkedIn Integration**: Import job postings directly from LinkedIn
- [ ] **Gmail Integration**: Extract interview dates and recruiter info from emails

### Phase 7: Enterprise Features

- [ ] **Team Analytics**: For career coaches and university placement offices
- [ ] **Batch Import**: Upload jobs from CSV or Excel
- [ ] **Custom Reports**: Generate PDF reports of your job search journey
- [ ] **API Access**: Let other tools integrate with HustleMap

### Nice-to-Have Features

- Interview video recording and playback
- AI-powered resume optimization
- Salary negotiation guides
- Application letter templates
- Interview mock tests with scoring

## 🤝 Contributing

Contributions are welcome! We'd love your help in improving HustleMap.

**How to Contribute:**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Make your changes with clear commit messages
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a Pull Request with a detailed description

**Areas We Need Help With:**

- Bug fixes and performance improvements
- UI/UX enhancements
- Backend optimizations
- Documentation improvements
- New features from the roadmap

## 📝 License

MIT License - See [LICENSE](LICENSE) for full details

## 🙏 Acknowledgments

- Built for job seekers navigating the modern application process
- Inspired by real pain points in job search management
- Thanks to the amazing open-source JavaScript community
- Special thanks to all contributors and testers

---

## 📬 Support & Questions

- **Report Bugs**: Open a GitHub issue with details and reproduction steps
- **Feature Requests**: Create a discussion or issue describing your idea
- **Questions**: Check existing discussions or open a new one
- **Documentation**: See [SETUP.md](SETUP.md) for detailed setup help

---

**Track smarter. Prep better. Get hired. 🎯**

_Your job search companion, built by developers, for everyone._
