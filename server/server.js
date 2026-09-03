const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");
require("dotenv").config();

// Global crash handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
});

// Routers
const adminRouter = require("./system/admin");
const mediaRouter = require("./system/media");
const textMachineRouter = require("./system/textmachine");
const reviewsMachineRouter = require("./system/reviewsmachine");
const viewsRouter = require("./system/views");
const demandeAvisRouter = require("./system/demandeavis");

const app = express();

// Ensure system projects directory exists
const projectsDirectory = path.join(__dirname, "system", "projects");
if (!fs.existsSync(projectsDirectory)) {
  fs.mkdirSync(projectsDirectory, { recursive: true });
}

// Request logger to see every incoming request in Railway runtime logs
app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.url}`);
  next();
});

// CORS setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://enterprise-website-production.up.railway.app",
      "https://amira-renov.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API Health Check (instant 200 for Railway edge checks)
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/admin", adminRouter);
app.use("/api/media", mediaRouter);
app.use("/api/text", textMachineRouter);
app.use("/api/reviews", reviewsMachineRouter);
app.use("/api/views", viewsRouter);
app.use("/demandeavis", demandeAvisRouter);

// Serve Static Frontend Assets (Vite build output at repo root /dist)
const clientDistPath = path.join(__dirname, "..", "dist");
const indexPath = path.join(clientDistPath, "index.html");

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
} else {
  console.warn(`[WARNING] Dist directory not found at: ${clientDistPath}.`);
}

// React SPA fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "Endpoint not found" });
  }

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath, (err) => {
      if (err && !res.headersSent) {
        res.status(500).send("Error loading client.");
      }
    });
  }

  return res.status(200).send(
    "API is running! (Note: 'dist/index.html' not found yet. Run 'npm run build' to generate the frontend)."
  );
});

// Global Express error handler
app.use((err, req, res, next) => {
  console.error("Express Error:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Listen on ALL possible ports (process.env.PORT, 8080, 5000, 3000)
// Using default host binding allows dual-stack (IPv4 and IPv6) so Railway's proxy connects instantly.
const primaryPort = Number(process.env.PORT) || 8080;
const portsToListen = Array.from(new Set([primaryPort, 8080, 5000, 3000]));

portsToListen.forEach((port) => {
  const server = http.createServer(app);
  server.on("error", (err) => {
    if (err.code !== "EADDRINUSE") {
      console.warn(`Port ${port} error:`, err.message);
    }
  });
  server.listen(port, () => {
    console.log(`Server listening on port ${port} (IPv4/IPv6 dual-stack)`);
  });
});

module.exports = app;