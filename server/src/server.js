import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import jobRoutes from "./routes/jobs.js";
import { healthCheck } from "./utils/healthCheck.js";
import mongoose from "mongoose";
import http from "http";

dotenv.config();

// Allow common alternate env var names for Mongo connection strings
const mongoCandidates = [
  "MONGO_URI",
  "MONGODB_URI",
  "DATABASE_URL",
  "MONGO_URL",
  "ATLAS_URI",
  "RENDER_DATABASE_URL",
  "MONGO_CONNECTION_STRING",
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
  // Fail fast in production if URI points to localhost (common mistake when deploying)
  const uri = process.env.MONGO_URI || "";
  if (
    process.env.NODE_ENV === "production" &&
    (uri.includes("localhost") || uri.includes("127.0.0.1"))
  ) {
    console.error(
      "[FATAL] MONGO_URI points to localhost. On Render, use your MongoDB Atlas connection string (mongodb+srv://...)."
    );
    process.exit(1);
  }
}

// Prevent unhandled rejections from crashing the process (log instead)
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Validate required env vars before starting (fail fast in production)
const requiredEnv = ["JWT_SECRET", "MONGO_URI"];
const missing = requiredEnv.filter((key) => !(process.env[key] || "").trim());
if (missing.length > 0) {
  console.error(`[FATAL] Missing required env vars: ${missing.join(", ")}`);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: CLIENT_URL = frontend origin(s), comma-separated for multiple (e.g. Vercel + preview deploys)
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
      .map((u) => u.trim())
      .filter(Boolean)
  : ["http://localhost:5173"];

console.log(`[CORS] Allowed origins: ${clientOrigins.join(", ")}`);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server, curl, Postman
      if (clientOrigins.includes(origin)) return cb(null, true);

      // Log CORS rejections in production for debugging
      if (process.env.NODE_ENV === "production") {
        console.warn(`[CORS] Rejected request from origin: ${origin}`);
      }

      cb(null, false); // reject unsupported origins
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Log all requests in production for debugging
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.get("origin") || "unknown"}`,
    );
    next();
  });
}
// Health check
app.get("/api/health", healthCheck);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

// Error handling middleware (must have 4 args for Express to recognize)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server only after DB is connected (prevents 500s from early requests)
let server;
// Attempt to listen on PORT or next available ports (fallback)
const attemptListen = (startPort, maxAttempts = 10) =>
  new Promise((resolve, reject) => {
    let attempts = 0;

    const tryPort = (port) => {
      server = http.createServer(app);

      server.once("error", (err) => {
        if (err && err.code === "EADDRINUSE") {
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
        server.removeAllListeners("error");
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
    console.error("Failed to start server:", err.message || err);
    process.exit(1);
  }
};
startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      console.log("HTTP server closed");
    }

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error closing server or MongoDB connection:", error);
    process.exit(1);
  }
});
