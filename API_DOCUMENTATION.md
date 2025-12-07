# 📡 API Documentation

Complete API reference for the Job Application Tracker.

## 🌐 Base URL
```
Development: http://localhost:5000
Production: Your production URL
```

---

## 🔍 Health Check

### GET `/api/health`
Server health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "ok"
}
```

---

## 🔐 Authentication Endpoints (Public)

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Missing fields or email already registered
- `500` - Server error

**Used in:**
- `client/src/pages/Register.jsx` (line 26)

---

### POST `/api/auth/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Invalid credentials
- `500` - Server error

**Used in:**
- `client/src/pages/Login.jsx` (line 24)

---

## 💼 Job Management Endpoints (Protected)

**All job endpoints require JWT authentication:**

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

---

### GET `/api/jobs`
Get all jobs for the authenticated user with statistics.

**Response (200 OK):**
```json
{
  "jobs": [
    {
      "id": 1,
      "user_id": 1,
      "company": "Tech Corp",
      "position": "Software Engineer",
      "status": "Applied",
      "date_applied": "2024-01-15",
      "application_source": "LinkedIn",
      "notes": "Great opportunity",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "stats": {
    "total": 10,
    "by_status": {
      "Applied": 5,
      "Interview": 3,
      "Offer": 1,
      "Rejected": 1
    }
  }
}
```

**Error Responses:**
- `401` - Unauthorized (no/invalid token)
- `500` - Server error

**Used in:**
- `client/src/pages/Jobs.jsx` (lines 25, 43, 63)
- `client/src/pages/JobForm.jsx` (line 51)
- `client/src/components/ModernDashboard.jsx` (line 44)
- `client/src/components/NotificationSystem.jsx` (line 35)

---

### POST `/api/jobs`
Create a new job application.

**Request Body:**
```json
{
  "company": "Tech Corp",
  "position": "Software Engineer",
  "status": "Applied",
  "dateApplied": "2024-01-15",
  "applicationSource": "LinkedIn",
  "notes": "Great opportunity",
  "priority": "High",
  "salary": "$120,000",
  "location": "San Francisco, CA",
  "jobUrl": "https://company.com/jobs/123"
}
```

**Required Fields:**
- `company` (string)
- `position` (string)

**Optional Fields:**
- `status` (string) - Default: "Saved"
- `dateApplied` (string, ISO date)
- `applicationSource` (string)
- `notes` (string)
- `priority` (string)
- `salary` (string)
- `location` (string)
- `jobUrl` (string)
- `lastFollowUp` (string, ISO date)
- `nextFollowUp` (string, ISO date)
- `interviewDate` (string, ISO date)
- `responseReceived` (boolean)

**Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 1,
  "company": "Tech Corp",
  "position": "Software Engineer",
  "status": "Applied",
  "date_applied": "2024-01-15T00:00:00.000Z",
  "application_source": "LinkedIn",
  "notes": "Great opportunity",
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Unauthorized
- `500` - Server error

**Used in:**
- `client/src/pages/JobForm.jsx` (line 149)

---

### PUT `/api/jobs/:id`
Update an existing job application.

**URL Parameters:**
- `id` - Job ID

**Request Body (any combination of fields):**
```json
{
  "company": "Updated Corp",
  "position": "Senior Software Engineer",
  "status": "Interview",
  "dateApplied": "2024-01-20",
  "applicationSource": "Company Website",
  "notes": "Updated notes",
  "priority": "High"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "company": "Updated Corp",
  "position": "Senior Software Engineer",
  "status": "Interview",
  "date_applied": "2024-01-20T00:00:00.000Z",
  "application_source": "Company Website",
  "notes": "Updated notes",
  "priority": "High",
  "updated_at": "2024-01-20T10:00:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Job not found or not owned by user
- `500` - Server error

**Used in:**
- `client/src/pages/JobForm.jsx` (line 143)
- `client/src/pages/Jobs.jsx` (line 79)

---

### DELETE `/api/jobs/:id`
Delete a job application.

**URL Parameters:**
- `id` - Job ID

**Response (200 OK):**
```json
{
  "message": "Deleted"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Job not found or not owned by user
- `500` - Server error

**Used in:**
- `client/src/pages/Jobs.jsx` (line 43)

---

## 🔑 Authentication Flow

1. User registers/logs in → Receives JWT token
2. Token is stored in `localStorage` as `jt_token`
3. Token is automatically attached to all API requests via Axios interceptor
4. Token expires after 7 days (configured in `server/src/routes/auth.js`)

**Token Extraction:**
- Stored in: `localStorage.getItem('jt_token')`
- Attached to headers: `Authorization: Bearer <token>`

---

## 📝 Field Name Mapping

### Frontend → Backend
```
dateApplied → date_applied
applicationSource → application_source
jobUrl → job_url
lastFollowUp → last_follow_up
nextFollowUp → next_follow_up
interviewDate → interview_date
responseReceived → response_received
```

---

## 🛠️ Technology Used

**Backend:**
- Express.js - Web framework
- SQLite - Database (default)
- MySQL - Alternative database option
- JWT (jsonwebtoken) - Authentication tokens
- Bcrypt - Password hashing
- CORS - Cross-origin resource sharing
- Morgan - HTTP request logging

**Frontend:**
- Axios - HTTP client for API requests
- React Query - Data synchronization (configured but not heavily used)

---

## 📂 Implementation Files

### Server Routes
- `server/src/routes/auth.js` - Authentication endpoints
- `server/src/routes/jobs.js` - Job management endpoints
- `server/src/middleware/auth.js` - JWT authentication middleware
- `server/server.js` - Main server setup and routing

### Client Services
- `client/src/services/api.js` - Axios configuration with token interceptor
- `client/src/services/auth.js` - Token management helpers

### Client Pages Using APIs
- `client/src/pages/Login.jsx` - Login API
- `client/src/pages/Register.jsx` - Register API
- `client/src/pages/Jobs.jsx` - GET, PUT, DELETE jobs
- `client/src/pages/JobForm.jsx` - GET, POST, PUT jobs
- `client/src/components/ModernDashboard.jsx` - GET jobs
- `client/src/components/NotificationSystem.jsx` - GET jobs

---

## ⚠️ Error Handling

All endpoints follow consistent error responses:

**Success Codes:**
- `200` - OK (GET, PUT, DELETE)
- `201` - Created (POST)

**Client Error Codes:**
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found

**Server Error Codes:**
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "message": "Error description"
}
```

---

## 🔍 Testing Endpoints

### Using cURL

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Jobs (with token):**
```bash
curl http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 Status Options

Valid status values for job applications:
- `Saved`
- `Applied`
- `Interview`
- `Offer`
- `Rejected`

---

*Last updated: Based on current codebase structure*

