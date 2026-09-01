const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const adminRouter = require("./system/admin");
const mediaRouter = require("./system/media");
const textMachineRouter = require("./system/textmachine");
const reviewsMachineRouter = require("./system/reviewsmachine");
const viewsRouter = require("./system/views");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// PROJECTS DIRECTORY
// ============================================================

// Correct location:
// <project-root>/system/projects

const projectsDirectory = path.join(__dirname, "system", "projects");

if (!fs.existsSync(projectsDirectory)) {
  fs.mkdirSync(projectsDirectory, { recursive: true });
}

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],
  })
);

// ============================================================
// BODY PARSING
// ============================================================

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// ============================================================
// API ROUTES
// ============================================================

app.use("/api/admin", adminRouter);

app.use("/api/media", mediaRouter);

app.use("/api/text", textMachineRouter);

app.use("/api/reviews", reviewsMachineRouter);

app.use("/api/views", viewsRouter);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  return res.json({
    success: true,
    message: "API is running.",
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Projects directory: ${projectsDirectory}`);
});

// ============================================================
// EXPORT
// ============================================================

module.exports = app;