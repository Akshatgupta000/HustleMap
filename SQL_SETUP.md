# SQL Database Migration Guide

This guide will help you migrate your job tracker application from MongoDB to PostgreSQL.

## Prerequisites

1. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Install Node.js dependencies**
   ```bash
   cd server
   npm install
   ```

## Setup Steps

### 1. Create Database
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE job_tracker;

-- Create user (optional, you can use postgres user)
CREATE USER jobtracker WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE job_tracker TO jobtracker;
```

### 2. Configure Environment Variables
Create a `.env` file in the server directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Run Database Migration
```bash
cd server
npm run migrate
```

This will create all the necessary tables and indexes.

### 4. Start the Server
```bash
npm run dev
```

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password` (VARCHAR)
- `name` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Jobs Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id))
- `company` (VARCHAR)
- `position` (VARCHAR)
- `status` (VARCHAR with CHECK constraint)
- `date_applied` (DATE)
- `notes` (TEXT)
- `application_source` (VARCHAR)
- `priority` (VARCHAR)
- `salary` (VARCHAR)
- `location` (VARCHAR)
- `job_url` (TEXT)
- `last_follow_up` (DATE)
- `next_follow_up` (DATE)
- `interview_date` (DATE)
- `response_received` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Key Changes from MongoDB

1. **Field Naming**: Changed from camelCase to snake_case
   - `dateApplied` → `date_applied`
   - `applicationSource` → `application_source`
   - `jobUrl` → `job_url`

2. **Data Types**: 
   - MongoDB ObjectId → PostgreSQL SERIAL
   - MongoDB Date → PostgreSQL DATE/TIMESTAMP

3. **Relationships**: 
   - Foreign key constraints between users and jobs
   - Cascade delete when user is deleted

## Testing the Migration

1. **Start the server**: `npm run dev`
2. **Test registration**: Create a new user account
3. **Test job creation**: Add a job application
4. **Test job updates**: Modify job status
5. **Test job deletion**: Remove a job

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### Migration Issues
- Check PostgreSQL logs
- Ensure user has proper permissions
- Verify schema file syntax

### Application Issues
- Check server logs for SQL errors
- Verify all environment variables are set
- Test database connection manually

## Alternative SQL Databases

If you prefer MySQL or SQLite, you can adapt the schema:

### MySQL
- Change `SERIAL` to `AUTO_INCREMENT`
- Change `TEXT` to `LONGTEXT` if needed
- Update connection string in database.js

### SQLite
- Use `sqlite3` package instead of `pg`
- Remove SERIAL, use INTEGER PRIMARY KEY
- Update connection configuration

## Performance Considerations

1. **Indexes**: Already created for common queries
2. **Connection Pooling**: Configured in database.js
3. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries

## Security Notes

1. **Password Hashing**: Still using bcrypt
2. **SQL Injection**: Using parameterized queries
3. **Environment Variables**: Never commit .env files
4. **Database Permissions**: Use least privilege principle
