const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Global crash handlers to catch silent errors in Railway logs
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
const PORT = process.env.PORT || 5000;

// Ensure system projects directory exists
const projectsDirectory = path.join(__dirname, "system", "projects");
if (!fs.existsSync(projectsDirectory)) {
  fs.mkdirSync(projectsDirectory, { recursive: true });
}

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

// API Health Check (instant response for Railway probes)
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
  console.warn(`[WARNING] Dist directory not found at: ${clientDistPath}. Run 'npm run build' if frontend is needed.`);
}

// React SPA fallback (Safely handles missing index.html)
app.get("*", (req, res, next) => {
  // If requesting an API route that didn't match, return 404 JSON instead of index.html
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "Endpoint not found" });
  }

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Failed to send index.html:", err);
        if (!res.headersSent) {
          res.status(500).send("Error serving application.");
        }
      }
    });
  }

  // Fallback message so Railway health checks don't hang if frontend is not built
  return res.status(200).send(
    "API server is running. (Note: Frontend 'dist/index.html' was not found. Please verify your build command)."
  );
});

// Global Express error handler
app.use((err, req, res, next) => {
  console.error("Express Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

// Start Server listening on 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server successfully started and listening on 0.0.0.0:${PORT}`);
  console.log(`Projects directory: ${projectsDirectory}`);
});

module.exports = app;