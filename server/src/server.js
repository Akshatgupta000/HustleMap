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
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
  console.error('[FATAL ERROR] ----------------------------------------');
  console.error(`[FATAL ERROR] Missing required env vars: ${missing.join(', ')}`);
  console.error('[FATAL ERROR] Check your .env file or hosting dashboard.');
  console.error('[FATAL ERROR] ----------------------------------------');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Handle proxy headers from Render/Vercel
app.set("trust proxy", 1);

// CORS: CLIENT_URL = frontend origin(s), comma-separated for multiple (e.g. Vercel + preview deploys)
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
      .map((u) => u.trim())
      .filter(Boolean)
      .map((u) => u.replace(/\/+$/, '')) // Remove trailing slashes
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

console.log(`[CORS] Allowed origins: ${clientOrigins.join(', ')}`);

const corsOptions = {
  origin: (origin, cb) => {
    // 1. Allow server-to-server, curl, Postman, or same-origin requests
    if (!origin) {
      return cb(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');

    // 2. Allow any localhost for easier development/testing
    if (normalizedOrigin.startsWith('http://localhost:')) {
      return cb(null, true);
    }

    // 3. Allow Chrome extensions
    if (normalizedOrigin.startsWith('chrome-extension://')) {
      return cb(null, true);
    }

    // 4. Check explicit whitelist from CLIENT_URL or known deployments
    if (
      clientOrigins.includes(normalizedOrigin) ||
      normalizedOrigin === 'https://hustle-map-khaki.vercel.app' ||
      normalizedOrigin.endsWith('.vercel.app') ||
      normalizedOrigin.endsWith('.onrender.com')
    ) {
      return cb(null, true);
    }

    // 5. Fail closed but log details for debugging production mismatches
    console.error(`[CORS REJECTED] Origin: "${origin}"`);
    console.error(`[CORS REJECTED] Whitelist: [${clientOrigins.join(', ')}]`);

    // Instead of throwing an error that might break the app, we just fail the CORS check
    cb(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS globally
app.use(cors(corsOptions));

// Explicitly handle preflight for all routes
app.options('*', cors(corsOptions));
app.use(morgan('dev'));
// Chrome extension screenshots can be large base64 payloads; raise limits safely.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Uptime Monitor & Root Health Check
app.get('/', (req, res) => {
  res.send('HustleMap API running');
});

// Service Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HustleMap API',
    timestamp: new Date().toISOString()
  });
});

// Health check (existing API version)
app.get('/api/health', healthCheck);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
    console.log('[STARTUP] Connecting to MongoDB...');
    await connectDB();

    console.log(`[STARTUP] Attempting to listen on port ${PORT}...`);
    const usedPort = await attemptListen(Number(PORT), 10);
    process.env.PORT = String(usedPort);
  } catch (err) {
    console.error('[CRITICAL FAILURE] -----------------------------------');
    console.error('[CRITICAL FAILURE] Failed to start server:');
    console.error(err.message || err);
    if (err.stack) console.error(err.stack);
    console.error('[CRITICAL FAILURE] -----------------------------------');
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
