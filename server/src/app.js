import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import morgan from "morgan";

import { globalLimiter } from "./middlewares/rateLimiters.js";

// Routes
import publicRoutes from "./routes/publicRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// ── Resolve client/dist path ──────────────────────────────────────────────────
const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = path.dirname(__filename2);
const distPath = path.join(__dirname2, "..", "..", "client", "dist");

console.log("[Static] distPath resolved to:", distPath, "| exists:", fs.existsSync(distPath));

// ── Serve static frontend assets FIRST (before CORS/helmet) ───────────────────
// Explicit setHeaders ensures correct Content-Type headers for .js and .css files,
// which browsers require to execute/apply them (especially for type="module" scripts).
// etag and lastModified are disabled to prevent 304 responses which bypass setHeaders.
if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      etag: false,
      lastModified: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css; charset=utf-8");
        }
      },
    })
  );
} else {
  console.warn("[Static] Warning: client/dist not found! Frontend will not be served.");
}

// ── Trust proxy ───────────────────────────────────────────────────────────────
const trustProxy = String(process.env.TRUST_PROXY || (isProduction ? "true" : "false"))
  .trim()
  .toLowerCase();
if (trustProxy === "true" || trustProxy === "1") {
  app.set("trust proxy", 1);
}

// ── Allowed CORS origins ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

// ── Security & CORS middleware ─────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Disabled — lets self-hosted React JS/CSS load without CSP blocks
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(globalLimiter);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);

// ── SPA Catch-all: serve index.html for all non-API, non-asset routes ────────
if (fs.existsSync(distPath)) {
  app.get(/.*/, (req, res, next) => {
    // Skip API routes - handled by their own routers
    if (req.path.startsWith("/api/")) return next();
    // Skip /assets/ - these are static files already handled by express.static above
    // Without this, express would serve index.html instead of the JS/CSS bundles!
    if (req.path.startsWith("/assets/")) return next();
    const indexFile = path.join(distPath, "index.html");
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      next();
    }
  });
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  console.error("[Error Handler]", err.message, err.stack);
  const message = status >= 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
});

export default app;
