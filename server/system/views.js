const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const viewsFilePath = path.join(__dirname, "..", "views.json");
const TIMEZONE = "Europe/Paris";

const DEFAULT_VIEWS_CONFIG = {
  today: 42,
  yesterday: 38,
  last30Days: 980,
  overall: 3410,
  history: {},
  lastProcessedDate: null,
};

// Paris Date ("YYYY-MM-DD")
function getFrenchDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getDateDaysAgo(dateString, offset) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

// File Read/Write Helpers
function readViews() {
  try {
    if (!fs.existsSync(viewsFilePath)) {
      fs.writeFileSync(viewsFilePath, JSON.stringify(DEFAULT_VIEWS_CONFIG, null, 2), "utf8");
      return { ...DEFAULT_VIEWS_CONFIG };
    }
    const content = fs.readFileSync(viewsFilePath, "utf8");
    if (!content.trim()) return { ...DEFAULT_VIEWS_CONFIG };
    const data = JSON.parse(content);
    return {
      today: Number(data.today ?? 0),
      yesterday: Number(data.yesterday ?? 0),
      last30Days: Number(data.last30Days ?? 0),
      overall: Number(data.overall ?? 0),
      history: typeof data.history === "object" && data.history ? data.history : {},
      lastProcessedDate: data.lastProcessedDate ?? null,
    };
  } catch (error) {
    console.error("Erreur lecture views.json :", error);
    return { ...DEFAULT_VIEWS_CONFIG };
  }
}

function writeViews(data) {
  try {
    fs.writeFileSync(viewsFilePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Erreur écriture views.json :", error);
    return false;
  }
}

// Rolls date at midnight: shifts today -> yesterday & recalculates last30Days
function syncToCurrentDay(data, currentDate) {
  if (data.lastProcessedDate === currentDate) {
    return { data, changed: false };
  }

  if (!data.lastProcessedDate) {
    data.lastProcessedDate = currentDate;
    data.history[currentDate] = data.today || 0;
    return { data, changed: true };
  }

  const yesterdayDate = getDateDaysAgo(currentDate, 1);
  data.yesterday = Number(data.history[yesterdayDate] ?? data.today ?? 0);
  data.today = Number(data.history[currentDate] ?? 0);
  data.lastProcessedDate = currentDate;

  // Recalculate 30-day sum from history
  let sum30 = 0;
  for (let i = 0; i < 30; i++) {
    const d = getDateDaysAgo(currentDate, i);
    sum30 += Number(data.history[d] ?? 0);
  }
  data.last30Days = sum30;

  // Prune history older than 35 days
  const cutoff = getDateDaysAgo(currentDate, 35);
  for (const dateKey in data.history) {
    if (dateKey < cutoff) delete data.history[dateKey];
  }

  return { data, changed: true };
}

// ==========================================
// GET /api/views -> Fetch Stats
// ==========================================
router.get("/", (req, res) => {
  try {
    const data = readViews();
    const currentDate = getFrenchDate();
    const { changed } = syncToCurrentDay(data, currentDate);

    if (changed) {
      writeViews(data);
    }

    return res.json({
      success: true,
      currentDate,
      views: {
        today: data.today,
        yesterday: data.yesterday,
        last30Days: data.last30Days,
        overall: data.overall,
      },
    });
  } catch (error) {
    console.error("Erreur GET /api/views :", error);
    return res.status(500).json({ success: false, message: "Erreur lecture des vues" });
  }
});

// ==========================================
// POST /api/views -> Record a View
// ==========================================
router.post("/", (req, res) => {
  try {
    const data = readViews();
    const currentDate = getFrenchDate();

    syncToCurrentDay(data, currentDate);

    data.history[currentDate] = (data.history[currentDate] ?? 0) + 1;
    data.today += 1;
    data.last30Days += 1;
    data.overall += 1;

    const saved = writeViews(data);
    if (!saved) {
      return res.status(500).json({ success: false, message: "Erreur écriture des vues" });
    }

    return res.status(201).json({
      success: true,
      currentDate,
      views: {
        today: data.today,
        yesterday: data.yesterday,
        last30Days: data.last30Days,
        overall: data.overall,
      },
    });
  } catch (error) {
    console.error("Erreur POST /api/views :", error);
    return res.status(500).json({ success: false, message: "Erreur enregistrement vue" });
  }
});

module.exports = router;