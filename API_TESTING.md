# 🧪 Production API Testing Guide

Use these commands to test your production API directly without the frontend.

## Prerequisites

Replace these values:

- `BACKEND_URL`: Your Render backend URL (e.g., `https://hustlemap-2.onrender.com`)
- `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://hustlemap.vercel.app`)

## Test 1: Health Check

```bash
curl -X GET https://BACKEND_URL/api/health
```

**Expected Response:**

```json
{ "ok": true }
```

**If this fails:** Backend is not running or MongoDB is not connected.

---

## Test 2: CORS Preflight (OPTIONS Request)

This is what the browser sends BEFORE the actual POST request.

```bash
curl -X OPTIONS https://BACKEND_URL/api/auth/register \
  -H "Origin: https://FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Look for in response:**

```
< Access-Control-Allow-Origin: https://FRONTEND_URL
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

**If you see:**

- ❌ `Access-Control-Allow-Origin: (missing)`
- ❌ `Access-Control-Allow-Credentials: (missing)`

**→ Then `CLIENT_URL` is not set correctly on Render**

---

## Test 3: Registration Request

```bash
curl -X POST https://BACKEND_URL/api/auth/register \
  -H "Origin: https://FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }' \
  -v
```

**Expected Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Possible Failures:**

| Response                                     | Cause                 | Fix                          |
| -------------------------------------------- | --------------------- | ---------------------------- |
| 403 Forbidden (no body)                      | CORS blocked          | Check `CLIENT_URL` on Render |
| 400 "Email already has account"              | User exists           | Use different email          |
| 400 "Email, password, and name are required" | Missing fields        | Include all fields           |
| 500 "Internal server error"                  | Database or JWT issue | Check Render logs            |
| 503 "Server configuration error"             | JWT_SECRET missing    | Set `JWT_SECRET` on Render   |

---

## Test 4: Login Request

After registration succeeds, test login:

```bash
curl -X POST https://BACKEND_URL/api/auth/login \
  -H "Origin: https://FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -v
```

**Expected Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

---

## Test 5: Get Jobs (Protected Route)

First, get a token from login. Then:

```bash
curl -X GET https://BACKEND_URL/api/jobs \
  -H "Origin: https://FRONTEND_URL" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -v
```

**Expected Response (200 OK):**

```json
[
  {
    "id": "507f...",
    "company": "Google",
    "position": "Engineer",
    "status": "applied",
    ...
  }
]
```

**Common Issues:**

| Response                      | Cause                    | Fix                                     |
| ----------------------------- | ------------------------ | --------------------------------------- |
| 401 Unauthorized              | Token expired or invalid | Get new token via login                 |
| 401 Unauthorized (empty body) | No Authorization header  | Include `Authorization: Bearer {token}` |
| 403 Forbidden                 | CORS rejection           | Check `CLIENT_URL`                      |

---

## PowerShell Alternative (Windows)

If curl doesn't work as expected:

```powershell
$headers = @{
    "Origin" = "https://FRONTEND_URL"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest `
  -Uri "https://BACKEND_URL/api/auth/register" `
  -Method POST `
  -Headers $headers `
  -Body $body `
  -verbose
```

---

## Debugging Response Headers

Add `-v` flag to see all response headers:

```bash
curl -X POST https://BACKEND_URL/api/auth/register \
  -H "Origin: https://FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}' \
  -v
```

This shows:

- ✅ CORS headers (if set correctly)
- ✅ HTTP status code
- ✅ Response body
- ✅ Request path (useful to verify it's going to the right endpoint)

---

## Common Errors & Fixes

### Error: "Failed to connect"

- Backend is down
- Render service is not running
- URL is wrong (typo in BACKEND_URL)

**Fix:**

1. Check Render dashboard - is the service running?
2. Check Render logs for startup errors
3. Verify the URL format (must be `https://`, no trailing `/`)

### Error: 403 Forbidden (CORS)

- `CLIENT_URL` not set on Render
- `CLIENT_URL` value doesn't match your frontend origin exactly

**Fix:**

1. Go to Render dashboard → Environment
2. Verify `CLIENT_URL=https://FRONTEND_URL` (ensure the URL matches exactly)
3. Click "Manual Deploy" to restart the service

### Error: 500 Internal Server Error

- JWT_SECRET not set
- MONGO_URI connection issue
- Validation error

**Fix:**

1. Check Render logs for the exact error
2. Set missing env vars on Render
3. Verify MongoDB Atlas connection and IP whitelist

---

## Quick Verification Checklist

Run these in order to verify everything is set up correctly:

```bash
# 1. Backend is running
curl https://BACKEND_URL/api/health

# 2. CORS is configured
curl -X OPTIONS https://BACKEND_URL/api/auth/register \
  -H "Origin: https://FRONTEND_URL" -v

# 3. Registration works
curl -X POST https://BACKEND_URL/api/auth/register \
  -H "Origin: https://FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# 4. Login works
curl -X POST https://BACKEND_URL/api/auth/login \
  -H "Origin: https://FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

If all four pass, your production deployment is correctly configured! ✅

---

## When to Use This Guide

- ✅ Before telling users about downtime
- ✅ When troubleshooting production issues
- ✅ To verify deployment before announcement
- ✅ To isolate whether issue is frontend or backend
- ✅ To test API changes without touching frontend

This isolates the backend from frontend issues!
