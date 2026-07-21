# API Documentation

The HustleMap backend exposes a REST API powered by Express and Node.js. It interfaces with MongoDB and manages authentication, job tracking, and Chrome Extension integration.

## Base URL
Local Development: `http://localhost:5000/api`

## Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Authenticate user and return JWT | Public |
| GET | `/me` | Get current authenticated user profile | JWT |

## Job Tracking (`/api/jobs`)

All standard job operations require a valid JWT passed in the `Authorization: Bearer <token>` header, unless otherwise noted.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all jobs for the authenticated user | JWT |
| POST | `/` | Create a new job entry | JWT |
| GET | `/:id` | Get a specific job by ID | JWT |
| PUT | `/:id` | Update an existing job by ID | JWT |
| DELETE | `/:id` | Delete a job by ID | JWT |
| DELETE | `/` | Clear all jobs for the user | JWT |
| DELETE | `/captured` | Clear all captured screenshot jobs for the user | JWT |

## Analytics & Dashboard Feeds (`/api/jobs`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/stats` | Returns high-level funnel metrics and counts by status | JWT |
| GET | `/weekly-progress` | Returns job activity trend over the last 7 days | JWT |
| GET | `/dashboard-feed` | Returns priority items (upcoming interviews, stale applications) | JWT |

## Chrome Extension Integration (`/api/jobs`)

These endpoints are specifically designed for the Chrome extension and bypass standard JWT authentication, utilizing a pre-generated Extension ID instead.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/save-from-extension` | Saves a job directly utilizing structured data (if parsing happens client-side) | Extension ID |
| POST | `/screenshot` | Accepts a multipart/form-data upload of a screenshot image. Uses `multer`, `tesseract.js` (OCR), and `@google/generative-ai` to extract structured details from the image. | Extension ID |
| POST | `/save` | A minimal save endpoint for simple integrations | Extension ID |
| GET | `/captured` | Retrieves a list of jobs specifically marked as "captured" (pending conversion to a full tracked job) | JWT |
