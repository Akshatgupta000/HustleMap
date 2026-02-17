# Quick Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Step 1: Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGO_URI=mongodb://localhost:27017/job_tracker
```

For MongoDB Atlas, use:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/job_tracker
```

**Important:** Make sure MongoDB is running before starting the server.

Start server:
```bash
npm run dev
```

## Step 2: Frontend Setup

```bash
cd client
npm install
```

(Optional) Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start dev server:
```bash
npm run dev
```

## Step 3: Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

Register a new account and start tracking your job applications!

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running locally, or
- Verify your MongoDB Atlas connection string is correct
- Check that the database name in MONGO_URI is correct

### Module Not Found Errors
- Run `npm install` in both `server/` and `client/` directories
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
