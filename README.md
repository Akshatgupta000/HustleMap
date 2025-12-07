# 🚀 Job Application Tracker

A modern, full-stack job application tracking system built with React, Express, Node.js, and SQL (SQLite/MySQL). Track your job applications, monitor your progress, and get insights into your job search performance.

## ✨ Features

### 🎯 **Core Functionality**
- **User Authentication**: Secure JWT-based login/register system
- **Job Management**: Full CRUD operations for job applications
- **Status Tracking**: Track applications through different stages
- **Data Isolation**: Per-user data security with protected routes

### 📊 **Smart Dashboard**
- **Application Health Score**: AI-powered score based on follow-up frequency and response rates
- **Weekly Analytics**: Track applications sent, interviews scheduled, and responses received
- **Interactive Charts**: Beautiful pie charts and trend analysis with Recharts
- **Real-time Statistics**: Live updates of your job search metrics

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Professional Icons**: Lucide React icon library for consistent design
- **Toast Notifications**: Real-time feedback for all user actions

### 🚀 **Interactive Features**
- **Floating Quick-Add**: Instant job entry without leaving the dashboard
- **Interactive Job Cards**: Hover effects, quick status updates, and copy buttons
- **Smart Reminders**: Auto-suggestions for follow-ups and stale applications
- **Quick Filters**: Preset filter chips for easy job browsing

### 📈 **Analytics & Insights**
- **Weekly Goal Tracking**: Set and monitor application targets
- **Response Time Analysis**: Average time from application to response
- **Source Performance**: Track which application channels work best
- **Conversion Rates**: Interview-to-offer conversion tracking

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18**: Modern React with hooks and functional components
- **JavaScript (JSX)**: Frontend programming language
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Framer Motion**: Production-ready motion library for animations
- **Recharts**: Composable charting library for data visualization
- **Lucide React**: Beautiful, customizable SVG icons
- **React Router**: Declarative routing for React applications
- **Axios**: Promise-based HTTP client for API requests
- **React Query**: Powerful data synchronization library for React
- **Date-fns**: Modern JavaScript date utility library

### **Backend**
- **Node.js**: JavaScript runtime for server-side development
- **JavaScript (ES6+)**: Backend programming language
- **Express.js**: Fast, unopinionated web framework for Node.js
- **SQLite**: Lightweight, file-based SQL database (primary)
- **MySQL**: Relational database management system (alternative option)
- **SQL**: Structured Query Language for database operations
- **JWT (jsonwebtoken)**: JSON Web Tokens for secure authentication
- **Bcrypt**: Password hashing library for security
- **CORS**: Cross-Origin Resource Sharing middleware
- **Morgan**: HTTP request logger middleware
- **dotenv**: Environment variable management

## 📁 **Project Structure**

```
job-tracker/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ModernDashboard.jsx  # Main dashboard with analytics
│   │   │   ├── AnalyticsWidgets.jsx # Analytics and metrics
│   │   │   ├── NotificationSystem.jsx # Smart reminders
│   │   │   ├── Toast.jsx           # Toast notifications
│   │   │   ├── Navbar.jsx          # Navigation component
│   │   │   └── DemoSection.jsx     # Landing page demo section
│   │   ├── pages/                  # Page components
│   │   │   ├── Landing.jsx         # Landing/home page
│   │   │   ├── Dashboard.jsx       # Dashboard page
│   │   │   ├── Jobs.jsx            # Jobs listing with interactive cards
│   │   │   ├── JobForm.jsx         # Add/Edit job form
│   │   │   ├── Login.jsx           # User login
│   │   │   └── Register.jsx        # User registration
│   │   ├── services/               # API services
│   │   │   ├── api.js              # Axios configuration
│   │   │   └── auth.js             # Authentication helpers
│   │   ├── App.jsx                 # Main app component with routing
│   │   ├── main.jsx                # App entry point
│   │   └── index.css               # Global styles
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── postcss.config.js           # PostCSS configuration
├── server/                         # Node.js backend
│   ├── src/
│   │   ├── config/                 # Database configuration
│   │   │   ├── database.js         # Main database config
│   │   │   ├── database-sqlite.js  # SQLite configuration (default)
│   │   │   └── database-mysql.js   # MySQL configuration (optional)
│   │   ├── models/                 # Database models
│   │   │   ├── index.js            # Model exports
│   │   │   ├── User.js             # User model (SQLite)
│   │   │   ├── UserSQLite.js       # SQLite user model
│   │   │   ├── UserMySQL.js        # MySQL user model
│   │   │   ├── UserSQL.js          # Generic SQL user model
│   │   │   ├── Job.js              # Job model (SQLite)
│   │   │   ├── JobSQLite.js        # SQLite job model
│   │   │   └── JobSQL.js           # Generic SQL job model
│   │   ├── routes/                 # API routes
│   │   │   ├── auth.js             # Authentication routes
│   │   │   └── jobs.js             # Job management routes
│   │   ├── middleware/             # Custom middleware
│   │   │   └── auth.js             # JWT authentication middleware
│   │   └── server.js               # Express server setup
│   ├── database/                   # Database schemas
│   │   ├── schema.sql              # PostgreSQL schema (reference)
│   │   ├── schema-sqlite.sql       # SQLite schema (default)
│   │   ├── schema-sqlite-simple.sql # Simplified SQLite schema
│   │   └── schema-mysql.sql        # MySQL schema (optional)
│   ├── scripts/                    # Database migration scripts
│   │   ├── migrate.js              # General migration
│   │   ├── migrate-sqlite.js       # SQLite migration (default)
│   │   └── migrate-mysql.js        # MySQL migration (optional)
│   ├── env.example                 # Environment variables template
│   ├── job_tracker.db              # SQLite database file (created after migration)
│   ├── package.json                # Backend dependencies
│   └── server.js                   # Server entry point
├── DATABASE_SETUP.md               # SQLite database setup guide
├── SQL_SETUP.md                    # PostgreSQL migration guide
└── README.md                       # Project documentation
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- npm or yarn package manager (comes with Node.js)
- SQLite (included with Node.js via sqlite3 package) - **No additional installation needed**
- MySQL (optional, only if you want to use MySQL instead of SQLite)

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd job-tracker
```

### **2. Backend Setup**
```bash
cd server
npm install

# Create environment file from example
cp env.example .env

# Edit .env file and set your JWT_SECRET
# (Other database config values are optional for SQLite)

# Run database migration to create SQLite database and tables
npm run migrate-sqlite

# Start the development server (with auto-reload)
npm run dev

# OR start production server
# npm start
```
**Backend runs on:** http://localhost:5000

**Health Check:** Visit http://localhost:5000/api/health to verify the server is running.

### **3. Frontend Setup**
```bash
cd ../client
npm install

# Start the development server (with hot module replacement)
npm run dev

# OR build for production
# npm run build
# npm run preview
```
**Frontend runs on:** http://localhost:5173

Open your browser and navigate to http://localhost:5173 to see the application.

### **4. Environment Configuration**
Create `server/.env` file by copying from the example:
```bash
cp env.example .env
```

Then edit `server/.env` file with your configuration:
```env
# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
# For SQLite (default): These variables are optional but can be left as-is
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here

# Note: SQLite uses a local file (job_tracker.db), so connection details
# are not strictly required. They are included for consistency and
# potential future database switching.
```

**Important Notes:**
- The project uses **SQLite by default** (no additional setup required)
- The database file (`job_tracker.db`) will be created automatically in the `server/` directory after running the migration
- For detailed SQLite setup instructions, see [`DATABASE_SETUP.md`](DATABASE_SETUP.md)
- For MySQL setup instructions, see [`DATABASE_SETUP.md`](DATABASE_SETUP.md)
- For PostgreSQL migration guide, see [`SQL_SETUP.md`](SQL_SETUP.md)

## 📊 **Dashboard Features**

### **Left Sidebar**
- **Health Score**: Visual indicator of application health
- **Quick Stats**: Color-coded status breakdown
- **This Week**: Weekly activity summary with progress indicators

### **Main Content**
- **Key Metrics**: Total applications, interview rate, offers received
- **Interactive Charts**: Pie chart for status distribution, area chart for trends
- **Real-time Updates**: Live data refresh on all actions

### **Right Sidebar**
- **Application Sources**: Track LinkedIn, company sites, referrals, etc.
- **Recent Activity**: Latest job applications with status indicators
- **Quick Actions**: Fast access to add jobs and view all applications

## 🎨 **UI/UX Highlights**

### **Modern Design**
- Clean, professional interface with consistent spacing
- Color-coded status indicators for easy recognition
- Smooth hover effects and micro-interactions
- Responsive grid layouts that adapt to all screen sizes

### **Interactive Elements**
- Floating quick-add button for instant job entry
- Hover-activated job cards with quick actions
- One-click status updates with visual feedback
- Copy-to-clipboard functionality for job details

### **Animations**
- Staggered entrance animations for dashboard elements
- Smooth transitions between states
- Loading states with professional spinners
- Toast notifications for user feedback

## 🔧 **API Endpoints**

### **Health Check**
- `GET /api/health` - Server health check (no auth required)

### **Authentication** (Public Routes)
- `POST /api/auth/register` - User registration
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- `POST /api/auth/login` - User login
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

### **Job Management** (Protected Routes)
- `GET /api/jobs` - Get all user jobs with statistics
- `POST /api/jobs` - Create new job application
  ```json
  {
    "company": "Tech Corp",
    "position": "Software Engineer",
    "status": "Applied",
    "date_applied": "2024-01-15",
    "application_source": "LinkedIn",
    "notes": "Great opportunity"
  }
  ```
- `PUT /api/jobs/:id` - Update job application
- `DELETE /api/jobs/:id` - Delete job application

### **Headers Required** (Protected Routes)
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: < 640px (Single column stack)
- **Tablet**: 640px - 1024px (Two column layout)
- **Desktop**: > 1024px (Full 3-column layout)

### **Layout Behavior**
- **Mobile**: All content stacks vertically for easy scrolling
- **Tablet**: Sidebars stack, main content gets full width
- **Desktop**: Optimal 3-column layout with sidebars

## 🎯 **Key Features Explained**

### **Application Health Score**
Calculates a score (0-100%) based on:
- **Follow-up Frequency** (40%): How often you follow up on applications
- **Response Rate** (30%): Percentage of applications that get responses
- **Recency** (30%): How recent your applications are

### **Smart Reminders**
- **Stale Applications**: Alerts for applications with no updates in 14+ days
- **Follow-up Suggestions**: Auto-suggests follow-up dates based on industry standards
- **Browser Notifications**: Optional desktop notifications for important reminders

### **Interactive Job Cards**
- **Hover Effects**: Cards reveal quick actions on hover
- **Status Updates**: One-click status changes with animations
- **Copy Buttons**: Quick copy for company names and positions
- **Progress Indicators**: Visual progress bars showing application stage

## 🚀 **Deployment**

### **Frontend Deployment** (Vercel/Netlify/Vite Preview)
```bash
cd client
npm run build
# The dist/ folder contains the production build
# Deploy dist/ folder to your hosting service
```

**Popular Hosting Options:**
- **Vercel**: Connect your GitHub repo and auto-deploy
- **Netlify**: Drag & drop the `dist/` folder or connect via Git
- **GitHub Pages**: Upload the `dist/` contents to gh-pages branch

**Note:** Make sure to configure the API endpoint URL in your frontend environment if it differs from `http://localhost:5000`.

### **Backend Deployment** (Railway/Heroku/Render/Fly.io)
```bash
cd server
# Set environment variables in your hosting platform:
# - JWT_SECRET (REQUIRED)
# - PORT (optional, defaults to 5000)
# - NODE_ENV=production
# - Database config (if using MySQL)
```

**Popular Hosting Options:**
- **Railway**: Easy Node.js deployment with PostgreSQL/MySQL support
- **Render**: Free tier available, supports SQLite and managed databases
- **Heroku**: Requires MySQL/PostgreSQL addon (SQLite not recommended for production)
- **Fly.io**: Supports persistent volumes for SQLite

### **Database Considerations**

**For SQLite (Development/Small Production):**
- ✅ No additional setup needed - database file is created automatically
- ✅ Perfect for single-instance deployments
- ⚠️ For production with SQLite, ensure the database file is persisted:
  - Use persistent volumes/disk storage
  - Regular backups are essential
  - Not suitable for multi-instance deployments

**For MySQL/PostgreSQL (Production Recommended):**
- ✅ Better for production environments
- ✅ Supports multiple server instances
- ✅ Better performance and scalability
- 📝 Set up a managed database service (e.g., Railway PostgreSQL, PlanetScale, Supabase)
- 📝 Update database configuration in environment variables
- 📝 Run migration script: `npm run migrate-mysql` or follow `SQL_SETUP.md` for PostgreSQL

**Important:** Never commit `.env` files or `job_tracker.db` to version control!

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

This project uses several amazing open-source libraries and frameworks:

- **React Team** - For the amazing React framework
- **Node.js** - For the powerful JavaScript runtime
- **Express.js** - For the flexible and minimal web framework
- **SQLite** - For the lightweight, file-based database solution
- **MySQL** - For the robust relational database option
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth, production-ready animations
- **Recharts** - For beautiful and composable data visualizations
- **Lucide React** - For the comprehensive and customizable icon library
- **Vite** - For the lightning-fast build tool and dev server
- **Axios** - For promise-based HTTP client
- **React Query** - For powerful data synchronization
- **React Router** - For declarative routing
- **Date-fns** - For modern date utilities
- **Bcrypt** - For secure password hashing
- **JWT** - For token-based authentication

## 📚 **Additional Documentation**

- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Comprehensive SQLite database setup guide
- **[SQL_SETUP.md](SQL_SETUP.md)** - PostgreSQL migration guide
- **[server/env.example](server/env.example)** - Environment variables template

## 🐛 **Troubleshooting**

### Common Issues

**1. Database Connection Error**
```bash
# Solution: Run the migration script again
cd server
npm run migrate-sqlite
```

**2. Port Already in Use**
```bash
# Solution: Change PORT in .env file or kill the process using the port
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -ti:5000 | xargs kill
```

**3. Module Not Found Errors**
```bash
# Solution: Reinstall dependencies
cd server (or client)
rm -rf node_modules package-lock.json
npm install
```

**4. JWT Authentication Errors**
- Ensure `JWT_SECRET` is set in `server/.env`
- Verify token is being sent in Authorization header
- Check token expiration

**5. CORS Errors**
- Verify backend server is running on correct port
- Check CORS configuration in `server/server.js`
- Ensure frontend is making requests to correct API URL

## 📞 **Support**

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review the documentation files (`DATABASE_SETUP.md`, `SQL_SETUP.md`)
3. Create a new issue with detailed information about your problem
4. Include error messages, logs, and steps to reproduce

---

**Built with ❤️ for job seekers everywhere**

*Track your applications, monitor your progress, and land your dream job!*