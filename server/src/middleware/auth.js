import jwt from "jsonwebtoken";

// Simple JWT-based auth guard for protected routes
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    console.error("Auth middleware: JWT_SECRET is not configured");
    return res.status(503).json({ error: "Server configuration error" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Attach decoded user info so controllers can read req.user.id / req.user.email
    req.user = user;
    next();
  });
};
