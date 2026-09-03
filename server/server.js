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
const demandeAvisRouter = require("./system/demandeavis");

const app = express();
const PORT = process.env.PORT || 5000;

const projectsDirectory = path.join(__dirname, "system", "projects");
if (!fs.existsSync(projectsDirectory)) {
  fs.mkdirSync(projectsDirectory, { recursive: true });
}

// 1. Updated CORS to include your live Railway and custom domains
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://enterprise-website-production.up.railway.app",
      "https://amira-renov.com", // Add your custom domain here once bought
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API Routes
app.use("/api/admin", adminRouter);
app.use("/api/media", mediaRouter);
app.use("/api/text", textMachineRouter);
app.use("/api/reviews", reviewsMachineRouter);
app.use("/api/views", viewsRouter);
app.use("/demandeavis", demandeAvisRouter);

app.get("/api/health", (req, res) => {
  return res.json({ success: true, message: "API is running." });
});

// 2. Serve React Frontend Static Files (adjust "client/build" to your actual react build folder name)
app.use(express.static(path.join(__dirname, "client", "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Projects directory: ${projectsDirectory}`);
});

module.exports = app;