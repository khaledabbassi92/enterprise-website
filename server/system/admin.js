const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/* ============================================================
   ADMIN CONFIG
   Searches common locations for admin.json
============================================================ */

function getAdminConfig() {
  const candidatePaths = [
    path.join(process.cwd(), "admin.json"),
    path.join(__dirname, "admin.json"),
    path.join(__dirname, "..", "admin.json"),
    path.join(__dirname, "..", "..", "admin.json"),
  ];

  for (const candidate of candidatePaths) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    try {
      const raw = fs.readFileSync(candidate, "utf8");

      if (!raw.trim()) {
        console.error("❌ admin.json is empty:", candidate);
        return null;
      }

      const config = JSON.parse(raw);

      return config;
    } catch (error) {
      console.error("❌ Error reading admin.json:", error.message);
      return null;
    }
  }

  console.error("❌ admin.json not found.");
  return null;
}

/* ============================================================
   AUTH MIDDLEWARE
============================================================ */

function requireAdminAuth(req, res, next) {
  try {
    const authHeader =
      req.headers.authorization ||
      req.headers.Authorization ||
      "";

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentification administrateur requise.",
      });
    }

    let token = "";

    if (/^Bearer\s+/i.test(authHeader)) {
      token = authHeader.replace(/^Bearer\s+/i, "").trim();
    } else {
      token = authHeader.trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentification administrateur requise.",
      });
    }

    const config = getAdminConfig();

    if (!config) {
      return res.status(500).json({
        success: false,
        message: "Configuration administrateur introuvable.",
      });
    }

    if (!config.masterKey) {
      return res.status(500).json({
        success: false,
        message: "masterKey manquante dans admin.json.",
      });
    }

    if (token !== String(config.masterKey)) {
      console.warn("⚠️ Admin request rejected: invalid token.");

      return res.status(401).json({
        success: false,
        message: "Session administrateur invalide ou expirée.",
      });
    }

    req.admin = {
      name: config.name || "Admin",
    };

    return next();
  } catch (error) {
    console.error("❌ Authentication middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentification invalide.",
    });
  }
}

/* ============================================================
   LOGIN
============================================================ */

router.post("/login", (req, res) => {
  try {
    const { name, password } = req.body || {};

    const config = getAdminConfig();

    if (!config) {
      return res.status(500).json({
        success: false,
        message: "admin.json introuvable.",
      });
    }

    if (
      !config.name ||
      !config.password ||
      !config.masterKey
    ) {
      return res.status(500).json({
        success: false,
        message: "admin.json est incomplet.",
      });
    }

    const inputName = String(name || "")
      .trim()
      .toLowerCase();

    const configName = String(config.name)
      .trim()
      .toLowerCase();

    const inputPassword = String(password || "").trim();

    const configPassword = String(config.password).trim();

    if (
      inputName !== configName ||
      inputPassword !== configPassword
    ) {
      console.warn(
        `❌ Failed admin login attempt for user: "${name || ""}"`
      );

      return res.status(401).json({
        success: false,
        message: "Identifiant ou mot de passe incorrect.",
      });
    }

    console.log(`✅ Admin logged in successfully: ${config.name}`);

    return res.status(200).json({
      success: true,
      name: config.name,

      // ReviewsManager and the rest of the admin system
      // expect this exact property.
      token: String(config.masterKey),

      message: "Connexion réussie.",
    });
  } catch (error) {
    console.error("❌ Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion.",
    });
  }
});

/* ============================================================
   VERIFY CURRENT ADMIN SESSION
============================================================ */

router.get("/verify", requireAdminAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    name: req.admin.name,
  });
});

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;
module.exports.requireAdminAuth = requireAdminAuth;