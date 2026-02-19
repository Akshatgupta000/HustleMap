# 🔴 Production Registration Failure - Diagnosis Report

## Executive Summary

**Registration fails in production because: The `CLIENT_URL` environment variable is not set on Render.**

When omitted, the backend defaults to accepting requests only from `http://localhost:5173`, causing it to reject all requests from your Vercel frontend with a CORS error.

---

## The Flow: What Happens When You Register

### Locally (Works ✅)

```
User fills form on http://localhost:5173
    ↓
Frontend POST to http://localhost:5000/api/auth/register
(withCredentials: true)
    ↓
Backend receives origin: http://localhost:5173
    ↓
CORS check: Is http://localhost:5173 in allowed origins?
    ↓
✅ Default allows http://localhost:5173
    ↓
MongoDB: Create user
    ↓
JWT issued: { token, user }
    ↓
Frontend receives token, navigates to /dashboard
```

### In Production (Fails ❌)

```
User fills form on https://hustlemap.vercel.app
    ↓
Frontend POST to https://hustlemap-2.onrender.com/api/auth/register
(withCredentials: true)
    ↓
Backend receives origin: https://hustlemap.vercel.app
    ↓
CORS check: Is https://hustlemap.vercel.app in allowed origins?
    ↓
❌ DEFAULT is ['http://localhost:5173'] only!
process.env.CLIENT_URL is not set
    ↓
CORS middleware rejects the request
Browser console: "Access to XMLHttpRequest has been blocked by CORS policy"
    ↓
❌ Registration never reaches the database
```

---

## Code Location: The Problem

**File:** [server/src/server.js](server/src/server.js#L31-L48)

```javascript
// Line 32-35: CORS Configuration
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
      .map((u) => u.trim())
      .filter(Boolean)
  : ["http://localhost:5173"]; // ← Default when CLIENT_URL is missing!

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (clientOrigins.includes(origin)) return cb(null, true); // ← Origin check
      cb(null, false); // ← Reject non-matching origins
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
```

**What's happening:**

- `process.env.CLIENT_URL` reads the environment variable from Render
- If it's not set (undefined), `clientOrigins` defaults to `['http://localhost:5173']`
- Your Vercel frontend origin `https://hustlemap.vercel.app` is NOT in this list
- CORS rejects the request before it even reaches the auth controller

---

## Why Frontend Code Is Correct

**File:** [client/src/lib/api.js](client/src/lib/api.js#L1-L45)

The frontend code is **correctly configured**:

```javascript
// Line 4: Reads from environment variable
const rawUrl = import.meta.env.VITE_API_URL;

// Vite automatically loads from .env.production during build
// .env.production contains: VITE_API_URL=https://hustlemap-2.onrender.com/api
```

**File:** [client/.env.production](client/.env.production)

```dotenv
# This is correct ✅
VITE_API_URL=https://hustlemap-2.onrender.com/api
```

When Vercel builds the frontend, it correctly sets `VITE_API_URL` to the Render backend URL. The frontend is making the request to the right place. The problem is the **backend is not accepting requests from that origin**.

---

## Why It Works Locally

In development:

- Both frontend and backend run on `localhost`
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Default CORS allows `http://localhost:5173`
- ✅ Everything works without needing `CLIENT_URL` env var

In production:

- Frontend runs on: `https://hustlemap.vercel.app` (Vercel)
- Backend runs on: `https://hustlemap-2.onrender.com` (Render)
- Backend needs `CLIENT_URL` env var to know which frontend to accept requests from
- ❌ Without it, defaults to `localhost` only

---

## The Fix (Required)

### 1. Generate a Secure JWT_SECRET

Run this locally and copy the output:

```bash
openssl rand -base64 32
```

Example output: `xB9kL2mP3qR+vW8yZ1cD4eF5gH6jK7nL8oP9qR0sT1uV2wX3yZ4aBc5dE=`

### 2. Set Environment Variables on Render

Go to **Render Dashboard** → Your Service → **Environment**

Add these variables:

```
CLIENT_URL=https://hustlemap.vercel.app
JWT_SECRET=<paste-the-generated-secret-here>
MONGO_URI=<your-existing-mongodb-uri>
NODE_ENV=production
JWT_EXPIRES_IN=7d
```

**Critical:** The `CLIENT_URL` value MUST exactly match your Vercel app URL (protocol, domain, no path suffix)

### 3. Redeploy Backend

Click **Manual Deploy** → **Deploy Latest Commit** on Render

### 4. Verify Logs

In Render Logs, you should now see:

```
[CORS] Allowed origins: https://hustlemap.vercel.app
```

### 5. Test Registration

Go to your Vercel app and try registering again. It should work!

---

## How to Verify the Fix Is Working

### In Browser DevTools (Network Tab):

**Before fix:**

```
Method: OPTIONS
Status: 403 Forbidden
Response headers include:
  Access-Control-Allow-Origin: (not set)
```

**After fix:**

```
Method: OPTIONS
Status: 200 OK
Response headers include:
  Access-Control-Allow-Origin: https://hustlemap.vercel.app
  Access-Control-Allow-Credentials: true
```

### In Render Logs:

**Before fix:**

```
[CORS] Allowed origins: http://localhost:5173
[CORS] Rejected request from origin: https://hustlemap.vercel.app
```

**After fix:**

```
[CORS] Allowed origins: https://hustlemap.vercel.app
[POST /api/auth/register from https://hustlemap.vercel.app]
```

---

## Additional Configurations

### For Vercel Preview Deployments

If you deploy preview URLs (like GitHub PR previews), add all of them:

```
CLIENT_URL=https://hustlemap.vercel.app,https://hustlemap-*.vercel.app
```

### For Multiple Environments

```
CLIENT_URL=https://app.hustlemap.com,https://staging.hustlemap.com,https://hustlemap.vercel.app
```

---

## Files Modified for Production Readiness

1. **[server/src/server.js](server/src/server.js)**
   - Added logging for CORS rejections
   - Added logging for allowed origins
   - Helps debug production issues

2. **[server/src/controllers/authController.js](server/src/controllers/authController.js)**
   - Better error logging for duplicate email
   - Helps diagnose registration failures

3. **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** (Created)
   - Complete deployment checklist
   - Common issues and fixes
   - Debug guide

4. **[PRODUCTION_DIAGNOSIS.md](PRODUCTION_DIAGNOSIS.md)** (This file)
   - Full explanation of the problem
   - Why it works locally but fails in production
   - Exact error flow

---

## Summary

| Aspect                    | Status        | Details                                                      |
| ------------------------- | ------------- | ------------------------------------------------------------ |
| Frontend Code             | ✅ Correct    | `VITE_API_URL` properly set in env                           |
| Backend Code              | ✅ Correct    | CORS properly configured, just needs env var                 |
| CORS Configuration        | ⚠️ Incomplete | Defaults to `localhost` when `CLIENT_URL` not set            |
| MongoDB Connection        | ✅ Works      | Should already be set on Render                              |
| JWT Configuration         | ✅ Correct    | Just needs `JWT_SECRET` env var                              |
| **Environment Variables** | ❌ Missing    | **`CLIENT_URL` is KEY - without it, CORS blocks everything** |

---

## Next Steps

1. ✅ **Add `CLIENT_URL` to Render environment** (highest priority)
2. ✅ **Redeploy backend on Render**
3. ✅ **Test registration on Vercel**
4. ✅ Check logs if still failing

That's it! Registration should now work in production.
