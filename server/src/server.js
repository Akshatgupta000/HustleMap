import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import { healthCheck } from './utils/healthCheck.js';
import mongoose from 'mongoose';
import http from 'http';

// Load environment variables. Prefer root `.env`, but also support `src/.env`
// so local dev works even if the file was placed there.
dotenv.config();
dotenv.config({ path: './src/.env', override: false });

// Allow common alternate env var names for Mongo connection strings
const mongoCandidates = [
  'MONGO_URI',
  'MONGODB_URI',
  'DATABASE_URL',
  'MONGO_URL',
  'ATLAS_URI',
  'RENDER_DATABASE_URL',
  'MONGO_CONNECTION_STRING',
];
let _mongoUriName = null;
for (const name of mongoCandidates) {
  if (process.env[name] && process.env[name].trim()) {
    _mongoUriName = name;
    process.env.MONGO_URI = process.env[name].trim();
    break;
  }
}
if (_mongoUriName) {
  console.log(`[ENV] Using Mongo connection from env var: ${_mongoUriName}`);
}

// Prevent unhandled rejections from crashing the process (log instead)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Validate required env vars before starting (fail fast with clear error)
const requiredEnv = ['JWT_SECRET', 'MONGO_URI'];
const missing = requiredEnv.filter((key) => !(process.env[key] || '').trim());
if (missing.length > 0) {
  console.error(
    `[FATAL] Missing required env vars: ${missing.join(
      ', ',
    )}. Check your .env file – these are required for MongoDB and JWT auth.`,
  );
  // Always exit so we fail fast instead of serving 500s with a misconfigured server
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: CLIENT_URL = frontend origin(s), comma-separated for multiple (e.g. Vercel + preview deploys)
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
      .map((u) => u.trim())
      .filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

console.log(`[CORS] Allowed origins: ${clientOrigins.join(', ')}`);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server, curl, Postman
      if (origin.startsWith('http://localhost:')) return cb(null, true);
      if (origin.startsWith('chrome-extension://')) return cb(null, true);
      if (clientOrigins.includes(origin)) return cb(null, true);

      // Log CORS rejections in production for debugging
      if (process.env.NODE_ENV === 'production') {
        console.warn(`[CORS] Rejected request from origin: ${origin}`);
      }

      cb(null, false); // reject unsupported origins
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(morgan('dev'));
// Chrome extension screenshots can be large base64 payloads; raise limits safely.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Log all requests in production for debugging
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.get('origin') || 'unknown'}`,
    );
    next();
  });
}
// Health check
app.get('/api/health', healthCheck);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Error handling middleware (must have 4 args for Express to recognize)
app.use((err, req, res, next) => {
  console.error(`[Unhandled Error] ${err.name || 'Error'}:`, err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server only after DB is connected (prevents 500s from early requests)
let server;
// Attempt to listen on PORT or next available ports (fallback)
const attemptListen = (startPort, maxAttempts = 10) =>
  new Promise((resolve, reject) => {
    let attempts = 0;

    const tryPort = (port) => {
      server = http.createServer(app);

      server.once('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
          attempts += 1;
          if (attempts >= maxAttempts) {
            return reject(
              new Error(
                `Port ${startPort} to ${startPort + maxAttempts - 1} all in use`,
              ),
            );
          }
          console.warn(`Port ${port} in use, trying port ${port + 1}...`);
          // cleanup listener and try next port
          server.close(() => tryPort(port + 1));
          return;
        }
        return reject(err);
      });

      server.listen(port, () => {
        // remove the temporary error listener
        server.removeAllListeners('error');
        console.log(`Server running on http://localhost:${port}`);
        resolve(port);
      });
    };

    tryPort(startPort);
  });

const startServer = async () => {
  try {
    await connectDB();
    const usedPort = await attemptListen(Number(PORT), 10);
    // update process.env.PORT to reflect the actual port if needed elsewhere
    process.env.PORT = String(usedPort);
  } catch (err) {
    console.error('Failed to start server:', err.message || err);
    process.exit(1);
  }
};
startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      console.log('HTTP server closed');
    }

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing server or MongoDB connection:', error);
    process.exit(1);
  }
});
