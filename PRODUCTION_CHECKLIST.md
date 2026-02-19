# 🚀 Production Deployment Checklist

## Before Deploying

### Backend (Render)

- [ ] Repository connected to Render
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`

### Environment Variables on Render

**CRITICAL - Must be set or registration WILL FAIL:**

```
CLIENT_URL=https://YOURVERCELAPP.vercel.app
JWT_SECRET=<run: openssl rand -base64 32>
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
NODE_ENV=production
```

**Optional but recommended:**

```
JWT_EXPIRES_IN=7d
```

### Frontend (Vercel)

- [ ] Repository connected to Vercel
- [ ] Framework: Other (Vite)
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Root directory: `client` (if monorepo)

### Environment Variables on Vercel

**CRITICAL - Must be set or API calls WILL FAIL:**

```
VITE_API_URL=https://your-render-service.onrender.com/api
```

---

## Why Registration Fails (Common Issues)

| Issue                  | Symptom                           | Fix                                                       |
| ---------------------- | --------------------------------- | --------------------------------------------------------- |
| Missing `CLIENT_URL`   | 403 CORS error in browser console | Set `CLIENT_URL` on Render to your Vercel URL             |
| Wrong Render URL       | 404 or connection refused         | Verify Render service URL in `VITE_API_URL`               |
| Missing `JWT_SECRET`   | 503 Server error                  | Generate with `openssl rand -base64 32` and set on Render |
| Missing `MONGO_URI`    | Database connection fails         | Whitelist your Render IP in MongoDB Atlas                 |
| `VITE_API_URL` is HTTP | Mixed content blocked (browser)   | Change to `https://` URL                                  |

---

## Debug Your Deployment

### Step 1: Check Render Logs

1. Go to Render dashboard
2. Select your service
3. Click "Logs"
4. Look for:
   - ✅ `[CORS] Allowed origins: ...`
   - ❌ `[CORS] Rejected request from origin: ...`
   - ❌ `MongoDB connection error` → Need to whitelist IP

### Step 2: Check Vercel Build Logs

1. Go to Vercel dashboard
2. Select your project
3. Click recent deployment
4. Check build logs for errors

### Step 3: Browser DevTools

1. Open your Vercel app
2. Press F12 → Network tab
3. Try to register
4. Look for the POST request to `/api/auth/register`
5. Check the response:
   - **403**: CORS issue → Fix `CLIENT_URL`
   - **500**: Server error → Check Render logs
   - **Network error**: Wrong URL → Fix `VITE_API_URL`

### Step 4: Test Backend Directly

```bash
curl -X POST https://your-render-service.onrender.com/api/health
```

Should return: `{"ok":true}`

---

## Quick Redeploy After Fixing Env Vars

### On Render:

1. After adding env vars, click "Manual Deploy" → "Deploy Latest Commit"
2. Wait for deployment to complete
3. Check logs

### On Vercel:

1. Env vars are applied automatically
2. Trigger redeploy: Go to Deployments → Redeploy

---

## Common Vercel + Render URL Examples

**If your services are:**

- Vercel project: `hustlemap`
- Render service: `hustlemap-backend`

**Then set:**

On Render `CLIENT_URL`:

```
https://hustlemap.vercel.app
```

On Vercel `VITE_API_URL`:

```
https://hustlemap-backend.onrender.com/api
```

---

## Zero-Downtime Testing

**Test registration before full deployment:**

1. Deploy backend to Render (private)
2. Set Vercel `VITE_API_URL` to new backend
3. Test registration on Vercel preview deployment
4. If successful, deploy to production

This way, if there's an issue, you can revert quickly.

---

## Getting Help

If registration still fails after setting env vars:

1. **Check Render logs** for CORS rejection message
2. **Check Vercel build logs** for env var issues
3. **Check browser DevTools** Network tab for actual error response
4. **Verify:** `CLIENT_URL` on Render = your Vercel frontend URL (exactly)

The error logs will tell you exactly what's wrong!
