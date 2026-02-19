# 📊 Visual Debugging Guide

## What Happens Without CLIENT_URL Set

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  User on https://hustlemap.vercel.app clicks Register  │
│  ↓                                                      │
│  Browser sends:                                         │
│  POST /api/auth/register HTTP/1.1                       │
│  Origin: https://hustlemap.vercel.app                   │
│                                                         │
│  ↓                                                      │
│  Render Backend receives request                        │
│  ↓                                                      │
│  Check: Is Origin in CORS whitelist?                    │
│  ├─ CLIENT_URL is not set                               │
│  ├─ So defaults to ['http://localhost:5173']            │
│  └─ https://hustlemap.vercel.app ≠ http://localhost:5173 │
│  ↓                                                      │
│  ❌ CORS REJECTED                                        │
│  ↓                                                      │
│  Browser console error:                                 │
│  "Access to XMLHttpRequest at                           │
│   'https://hustlemap-2.onrender.com/api/auth/register'  │
│   from origin 'https://hustlemap.vercel.app'            │
│   has been blocked by CORS policy"                      │
│  ↓                                                      │
│  Registration FAILS                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## What Happens WITH CLIENT_URL Set Correctly

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  User on https://hustlemap.vercel.app clicks Register  │
│  ↓                                                      │
│  Browser sends:                                         │
│  POST /api/auth/register HTTP/1.1                       │
│  Origin: https://hustlemap.vercel.app                   │
│                                                         │
│  ↓                                                      │
│  Render Backend receives request                        │
│  ↓                                                      │
│  Check: Is Origin in CORS whitelist?                    │
│  ├─ CLIENT_URL = https://hustlemap.vercel.app           │
│  ├─ clientOrigins = ['https://hustlemap.vercel.app']    │
│  └─ https://hustlemap.vercel.app ✅ MATCHES!            │
│  ↓                                                      │
│  ✅ CORS ACCEPTED                                       │
│  ↓                                                      │
│  Process registration:                                  │
│  ├─ Validate inputs (name, email, password)             │
│  ├─ Hash password with bcrypt                           │
│  ├─ Create user in MongoDB                              │
│  ├─ Generate JWT token                                  │
│  └─ Return { token, user }                              │
│  ↓                                                      │
│  ✅ Registration SUCCEEDS                               │
│  ↓                                                      │
│  Frontend receives token and navigates to /dashboard    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## How CORS Works (Simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  PREFLIGHT REQUEST (Browser automatically sends OPTIONS)        │
│  ├─ Method: OPTIONS                                              │
│  ├─ Origin: https://hustlemap.vercel.app                        │
│  ├─ Access-Control-Request-Method: POST                         │
│  └─ Access-Control-Request-Headers: Content-Type                │
│                                                                 │
│  Server checks: "Is this origin allowed?"                        │
│  ├─ If YES → Send back approval headers                         │
│  │   ├─ Access-Control-Allow-Origin: https://hustlemap.vercel.app │
│  │   ├─ Access-Control-Allow-Credentials: true                  │
│  │   └─ Access-Control-Allow-Methods: GET, POST, PUT, DELETE    │
│  │   ↓                                                           │
│  │   ✅ Browser allows the actual POST request                   │
│  │                                                             │
│  └─ If NO → Send no approval headers                            │
│      └─ Access-Control-Allow-Origin: (missing)                 │
│          ↓                                                      │
│          ❌ Browser blocks the request                          │
│                                                                │
│  ACTUAL REQUEST (Only happens if preflight passed)              │
│  └─ Method: POST                                                │
│      └─ Reaches backend auth controller                         │
│          └─ Creates user, returns JWT                           │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Environment Variable Mapping

```
YOUR DEPLOYED APPS
├─ Vercel Frontend
│  └─ https://hustlemap.vercel.app
│     └─ Points to backend via VITE_API_URL
│        └─ https://hustlemap-2.onrender.com/api ✅
│
└─ Render Backend
   └─ https://hustlemap-2.onrender.com
      └─ Accepts requests from CLIENT_URL
         └─ https://hustlemap.vercel.app ✅

ENVIRONMENT VARIABLES
├─ On Vercel:
│  └─ VITE_API_URL=https://hustlemap-2.onrender.com/api
│     (Frontend knows where to send API requests)
│
└─ On Render:
   └─ CLIENT_URL=https://hustlemap.vercel.app
      (Backend knows which frontend to accept requests from)
```

---

## Request Flow Diagram

```
                    User Registration
                           |
                           v
                    ┌──────────────┐
                    │   Vercel     │
                    │              │
                    │  Browser on  │
                    │ hustlemap    │
                    │ .vercel.app  │
                    └──────┬───────┘
                           |
                      POST request
                      /api/auth/register
                      + Origin header
                           |
                           v
        ┌──────────────────────────────────┐
        │                                  │
        │  CORS Preflight Check (OPTIONS)  │
        │                                  │
        │ "Is Vercel URL allowed?"         │
        │                                  │
        └────────────┬─────────────────────┘
                     |
        ┌────────────v──────────────────────────┐
        │                                       │
        │  Check CLIENT_URL on Render           │
        │                                       │
        │  WITHOUT CLIENT_URL set:              │
        │  └─ Default = ['localhost:5173']      │
        │  └─ ❌ Does NOT match Vercel URL      │
        │  └─ ❌ CORS REJECTED                  │
        │                                       │
        │  WITH CLIENT_URL set:                 │
        │  └─ = ['hustlemap.vercel.app']        │
        │  └─ ✅ MATCHES Vercel URL             │
        │  └─ ✅ CORS ACCEPTED                  │
        │                                       │
        └────────────┬──────────────────────────┘
                     |
              ✅ or ❌
                     |
        ┌────────────v──────────────────────────┐
        │                                       │
        │       If APPROVED (✅):               │
        │       Send actual POST request        │
        │       Register user in MongoDB        │
        │       Generate JWT                    │
        │       Return token to frontend        │
        │                                       │
        │       If REJECTED (❌):               │
        │       Block request at browser        │
        │       Show CORS error                 │
        │       Registration fails              │
        │                                       │
        └────────────┬──────────────────────────┘
                     |
                     v
                  Result
```

---

## Why Local Works But Production Doesn't

```
LOCAL DEVELOPMENT
├─ Frontend: http://localhost:5173 (Vite dev server)
│
├─ Backend: http://localhost:5000 (Node.js server)
│  └─ CLIENT_URL not set
│  └─ Defaults to ['http://localhost:5173']
│  └─ ✅ Matches frontend origin
│  └─ ✅ CORS passes
│
└─ Result: ✅ Registration works


PRODUCTION (Without CLIENT_URL set)
├─ Frontend: https://hustlemap.vercel.app (Vercel)
│
├─ Backend: https://hustlemap-2.onrender.com (Render)
│  └─ CLIENT_URL not set
│  └─ Defaults to ['http://localhost:5173']  ← Still using LOCAL default!
│  └─ ❌ Does NOT match Vercel origin
│  └─ ❌ CORS rejects
│
└─ Result: ❌ Registration fails


PRODUCTION (With CLIENT_URL set correctly)
├─ Frontend: https://hustlemap.vercel.app (Vercel)
│
├─ Backend: https://hustlemap-2.onrender.com (Render)
│  └─ CLIENT_URL = https://hustlemap.vercel.app
│  └─ ✅ Matches frontend origin
│  └─ ✅ CORS passes
│
└─ Result: ✅ Registration works
```

---

## Code Path During Registration

```
Frontend (api.js)
├─ authAPI.register(data)
├─ axios.post('/auth/register', data)
├─ baseURL = https://hustlemap-2.onrender.com/api
└─ Full URL: https://hustlemap-2.onrender.com/api/auth/register
             + Origin: https://hustlemap.vercel.app
             + withCredentials: true

                    |
                    v (over HTTP)

Backend (server.js)
├─ CORS middleware
├─ Check if Origin is in CLIENT_URL
├─ ❌ If not set: Default to localhost only → CORS rejected
├─ ✅ If set correctly: Allow request → Continue
│
└──── v (if CORS passed)

Backend (routes/auth.js)
├─ router.post('/register', register)
│
└──── v

Backend (authController.js)
├─ Validate inputs
├─ Check if email exists
├─ Hash password
├─ Create user in MongoDB
├─ Generate JWT
└─ Return { token, user }

                    |
                    v (response)

Frontend
├─ Receive token
├─ Save to localStorage
├─ Navigate to /dashboard
└─ ✅ Success!
```

---

## Checklist: Is Your Production Ready?

```
FRONTEND (Vercel)
├─ ✅ Code: api.js uses import.meta.env.VITE_API_URL
├─ ✅ Code: axios.create({ withCredentials: true })
├─ ✅ .env.production: VITE_API_URL=https://...onrender.com/api
├─ ✅ Vercel env vars: VITE_API_URL set
└─ ✅ Build: "npm run build" creates dist/

BACKEND (Render)
├─ ✅ Code: CORS checks CLIENT_URL env var
├─ ✅ Code: app.use(cors({ credentials: true }))
├─ ✅ Render env vars:
│  ├─ CLIENT_URL=https://...vercel.app
│  ├─ JWT_SECRET=(generated)
│  ├─ MONGO_URI=(atlas connection)
│  └─ NODE_ENV=production
├─ ✅ Start: npm start runs node src/server.js
└─ ✅ Redeploy: Manual Deploy after env var changes

DATABASE (MongoDB Atlas)
├─ ✅ Cluster exists
├─ ✅ User has read/write permission
├─ ✅ Render IP is whitelisted
└─ ✅ Connection string is correct

VERIFICATION
├─ ✅ curl /api/health returns {"ok":true}
├─ ✅ CORS OPTIONS preflight approved
├─ ✅ POST /api/auth/register creates user
────────────────────────────────────────┘
      Your app is ready! 🚀
```

---

## Summary

The issue is **simple**: Your backend doesn't know which frontend URL to accept requests from.

**The fix is simple too**: Tell it! Set `CLIENT_URL=https://yourapp.vercel.app` on Render.

That's literally it. Everything else is already correct in your code.
