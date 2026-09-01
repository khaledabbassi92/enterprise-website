const express = require("express");
const fs = require("fs");
const path = require("path");

const { requireAdminAuth } = require("./admin");

const router = express.Router();

// ============================================================
// TEXT FILE
// ============================================================

const textFilePath = path.join(
  process.cwd(),
  "text.json"
);

// ============================================================
// DEFAULT DATA
// ============================================================

const DEFAULT_TEXT_DATA = {
  phone: "",
  email: "",
  address: "",
};

// ============================================================
// READ TEXT
// ============================================================

function readText() {
  try {
    if (!fs.existsSync(textFilePath)) {
      fs.writeFileSync(
        textFilePath,
        JSON.stringify(
          DEFAULT_TEXT_DATA,
          null,
          2
        ),
        "utf8"
      );

      return {
        ...DEFAULT_TEXT_DATA,
      };
    }

    const raw = fs.readFileSync(
      textFilePath,
      "utf8"
    );

    if (!raw.trim()) {
      return {
        ...DEFAULT_TEXT_DATA,
      };
    }

    const parsed = JSON.parse(raw);

    return {
      phone:
        typeof parsed.phone === "string"
          ? parsed.phone
          : "",

      email:
        typeof parsed.email === "string"
          ? parsed.email
          : "",

      address:
        typeof parsed.address === "string"
          ? parsed.address
          : "",
    };
  } catch (error) {
    console.error(
      "❌ Error reading text.json:",
      error
    );

    return {
      ...DEFAULT_TEXT_DATA,
    };
  }
}

// ============================================================
// WRITE TEXT
// ============================================================

function writeText(data) {
  try {
    fs.writeFileSync(
      textFilePath,
      JSON.stringify(
        data,
        null,
        2
      ),
      "utf8"
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Error writing text.json:",
      error
    );

    return false;
  }
}

// ============================================================
// GET COMPANY INFORMATION (PUBLIC)
// ============================================================

router.get("/", (req, res) => {
  try {
    const data = readText();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "❌ GET /api/text error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les informations.",
    });
  }
});

// ============================================================
// UPDATE COMPANY INFORMATION (PROTECTED)
// ============================================================

router.put(
  "/",
  requireAdminAuth,
  (req, res) => {
    try {
      const {
        phone,
        email,
        address,
      } = req.body || {};

      const updatedData = {
        phone:
          typeof phone === "string"
            ? phone.trim()
            : "",

        email:
          typeof email === "string"
            ? email.trim()
            : "",

        address:
          typeof address === "string"
            ? address.trim()
            : "",
      };

      const saved =
        writeText(updatedData);

      if (!saved) {
        return res.status(500).json({
          success: false,
          message:
            "Impossible d'enregistrer les informations.",
        });
      }

      console.log(
        "✅ text.json updated:",
        updatedData
      );

      return res.status(200).json({
        success: true,
        data: updatedData,
      });
    } catch (error) {
      console.error(
        "❌ PUT /api/text error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erreur serveur lors de la sauvegarde.",
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;