# Production Deployment Guide (Vercel + Render)

This guide covers deploying HustleMap with the frontend on Vercel and the backend on Render.

## Root Cause of Auth Failures (Fixed)

Authentication can fail in production due to:

1. **Wrong API base URL** – `VITE_API_URL` must include `/api` (e.g. `https://your-backend.onrender.com/api`)
2. **HTTP vs HTTPS** – Vercel uses HTTPS; if the API URL is `http://`, browsers block mixed content
3. **CORS** – Backend `CLIENT_URL` must match the Vercel frontend origin
4. **Missing env vars** – `JWT_SECRET` and `MONGO_URI` must be set on Render

---

## Backend (Render)

### Environment Variables

| Variable      | Required | Example                                                |
|---------------|----------|--------------------------------------------------------|
| `MONGO_URI`   | Yes      | `mongodb+srv://user:pass@cluster.mongodb.net/dbname`   |
| `JWT_SECRET`  | Yes      | `openssl rand -base64 32` (32+ characters)             |
| `CLIENT_URL`  | Yes*     | `https://your-app.vercel.app` (your Vercel URL)        |
| `PORT`        | No       | Render sets automatically                              |
| `NODE_ENV`    | No       | `production`                                           |
| `JWT_EXPIRES_IN` | No    | `7d`                                                   |

\* If `CLIENT_URL` is not set, CORS defaults to `http://localhost:5173`, and production requests will be blocked.

### Multiple Frontend Origins (e.g. Vercel previews)

Use comma-separated values:

```
CLIENT_URL=https://hustlemap.vercel.app,https://hustlemap-git-main-yourteam.vercel.app
```

### Start Command

```
npm start
```

---

## Frontend (Vercel)

### Environment Variables

| Variable       | Required | Example                                  |
|----------------|----------|------------------------------------------|
| `VITE_API_URL` | Yes      | `https://hustlemap-2.onrender.com/api`   |

Important:

- Must end with `/api` (or it will be appended automatically)
- Must use `https://` when the frontend is served over HTTPS

### Build Command

```
npm run build
```

### Output Directory

```
dist
```

---

## Quick Checklist

- [ ] `VITE_API_URL` on Vercel: `https://<your-render-service>.onrender.com/api`
- [ ] `CLIENT_URL` on Render: `https://<your-vercel-app>.vercel.app`
- [ ] `JWT_SECRET` on Render: strong random string (32+ chars)
- [ ] `MONGO_URI` on Render: MongoDB Atlas connection string
- [ ] Both URLs use `https://` in production
