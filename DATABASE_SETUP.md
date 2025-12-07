# 🗄️ Database Setup Guide - Job Tracker

This guide will help you set up the SQL database for your job tracker application. We'll use SQLite for easy setup and development.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git (for version control)

## 🚀 Quick Start (SQLite)

### Step 1: Navigate to Server Directory

```bash
cd job-tracker/server
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `sqlite3` - SQLite database driver
- `bcrypt` - Password hashing
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-origin resource sharing
- `morgan` - HTTP request logger

### Step 3: Create Environment File

Create a `.env` file in the `server` directory with the following content:

```env
# Database Configuration (SQLite)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Note**: For SQLite, the database connection details are not critical as SQLite uses a local file, but the environment variables are still required for the application to run.

### Step 4: Run Database Migration

```bash
npm run migrate-sqlite
```

This command will:
- Create the SQLite database file (`job_tracker.db`)
- Create all necessary tables (users, jobs)
- Add indexes for better performance
- Set up foreign key relationships

### Step 5: Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Step 6: Verify Setup

Test the server by visiting:
```
http://localhost:5000/api/health
```

You should see:
```json
{"status":"ok"}
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Saved',
    date_applied DATE,
    notes TEXT,
    application_source TEXT DEFAULT 'Other',
    last_follow_up DATE,
    next_follow_up DATE,
    interview_date DATE,
    response_received BOOLEAN DEFAULT 0,
    priority TEXT DEFAULT 'Medium',
    salary TEXT,
    location TEXT,
    job_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes
- `idx_jobs_user_id` - For user-specific queries
- `idx_jobs_status` - For status filtering
- `idx_jobs_date_applied` - For date-based queries
- `idx_jobs_company` - For company searches
- `idx_users_email` - For email lookups

## 🔧 Available Scripts

```bash
# Development server with auto-reload
npm run dev

# Production server
npm start

# Run database migration
npm run migrate-sqlite

# View all available scripts
npm run
```

## 🗂️ Database File Location

The SQLite database file is created at:
```
job-tracker/server/job_tracker.db
```

## 🛠️ Database Management

### View Database Content

**Option 1: DB Browser for SQLite (Recommended)**
1. Download from: https://sqlitebrowser.org/
2. Open `job_tracker.db` file
3. Browse tables, run queries, view data

**Option 2: Command Line**
```bash
# Install SQLite command line tool
# Then navigate to server directory and run:
sqlite3 job_tracker.db

# Inside SQLite shell:
.tables                    # List all tables
.schema users             # View users table structure
.schema jobs              # View jobs table structure
SELECT * FROM users;      # View all users
SELECT * FROM jobs;       # View all jobs
.quit                     # Exit SQLite shell
```

**Option 3: VS Code Extensions**
- Install "SQLite Viewer" extension
- Open `job_tracker.db` file in VS Code

## 🔄 Migration from MongoDB

If you're migrating from MongoDB:

1. **Backup your MongoDB data** (if needed)
2. **Follow the SQLite setup steps above**
3. **Re-register users** (passwords are hashed, so you can't migrate them)
4. **Re-add job applications** through the frontend

## 🚨 Troubleshooting

### Common Issues

**1. "Cannot find module" errors**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**2. "Database connection error"**
```bash
# Solution: Run migration again
npm run migrate-sqlite
```

**3. "Port already in use"**
```bash
# Solution: Change port in .env file
PORT=5001
```

**4. "Permission denied" errors**
```bash
# Solution: Run as administrator (Windows) or use sudo (Mac/Linux)
```

### Reset Database

To completely reset the database:

```bash
# Delete database file
rm job_tracker.db

# Run migration again
npm run migrate-sqlite
```

### Check Database Status

```bash
# Check if database file exists
ls -la job_tracker.db

# Check database size
du -h job_tracker.db

# Test database connection
sqlite3 job_tracker.db "SELECT COUNT(*) FROM users;"
```

## 🔒 Security Notes

1. **Environment Variables**: Never commit `.env` files to version control
2. **JWT Secret**: Use a strong, random secret in production
3. **Password Hashing**: Passwords are automatically hashed with bcrypt
4. **SQL Injection**: All queries use parameterized statements
5. **Database File**: Keep `job_tracker.db` secure and backed up

## 📈 Performance Tips

1. **Indexes**: Already created for common queries
2. **Connection Pooling**: Configured for optimal performance
3. **Query Optimization**: Use EXPLAIN QUERY PLAN for slow queries
4. **Regular Backups**: Backup `job_tracker.db` regularly

## 🔄 Production Deployment

For production, consider:

1. **PostgreSQL**: More robust for production
2. **Database Hosting**: Use managed database services
3. **Backup Strategy**: Automated backups
4. **Monitoring**: Database performance monitoring
5. **Security**: Enhanced security measures

## 📞 Support

If you encounter issues:

1. **Check the logs**: Server logs will show detailed error messages
2. **Verify setup**: Ensure all steps were completed correctly
3. **Database file**: Check if `job_tracker.db` exists and is accessible
4. **Dependencies**: Ensure all npm packages are installed
5. **Environment**: Verify `.env` file is properly configured

## 🎯 Next Steps

After successful database setup:

1. **Start the frontend**: `cd client && npm run dev`
2. **Test registration**: Create a new user account
3. **Add jobs**: Test job application functionality
4. **View dashboard**: Check analytics and data visualization
5. **Explore features**: Test all application features

---

**🎉 Congratulations!** Your job tracker now has a fully functional SQL database backend. You can start tracking your job applications with proper data persistence and relationships.
