const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Emplacements d'origine conservés:
const demandsFilePath = path.resolve(__dirname, "../demandesavis.json");
const reviewsFilePath = path.resolve(__dirname, "../reviews.json");

// Helper to safely read a JSON file
const readJsonFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.reviews)) return parsed.reviews;
      }
    } catch (err) {
      console.error(`Erreur de parsing ${filePath}:`, err);
    }
  }
  return [];
};

// ============================================================
// 1. GET /demandeavis - Returns pending requests
// ============================================================
router.get("/", (req, res) => {
  try {
    const data = readJsonFile(demandsFilePath);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Erreur lecture demandesavis.json:", err);
    return res.status(500).json({ error: "Erreur lecture des demandes" });
  }
});

// ============================================================
// 2. POST /demandeavis - Saves strictly: name, contact, description, rating, timeSent
// ============================================================
router.post("/", (req, res) => {
  const { name, contact, description, rating, timeSent } = req.body || {};

  try {
    const demands = readJsonFile(demandsFilePath);

    const numRating = typeof rating === "number" ? rating : parseFloat(rating) || 5;
    const safeRating = Math.max(0, Math.min(5, numRating));

    // STRICTEMENT les 5 champs voulus (aucun "id", aucun "nom")
    const newDemand = {
      name: (name || "Client").trim(),
      contact: typeof contact === "string" ? contact.trim() : "",
      description: typeof description === "string" ? description.trim() : "",
      rating: Number(safeRating.toFixed(1)),
      timeSent: timeSent || new Date().toISOString(),
    };

    demands.push(newDemand);

    fs.writeFileSync(demandsFilePath, JSON.stringify(demands, null, 2), "utf-8");

    console.log("Demande d'avis enregistrée dans demandesavis.json:", newDemand);

    return res.status(201).json({
      success: true,
      message: "Votre avis a été envoyé !",
      demand: newDemand,
    });
  } catch (err) {
    console.error("Erreur enregistrement demande avis:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement dans le JSON",
    });
  }
});

// ============================================================
// 3. POST /demandeavis/accept - Adds to reviews.json & deletes from demandesavis.json
// ============================================================
router.post("/accept", (req, res) => {
  const { name, rating, description, timeSent, creationDate, date, contact, order } = req.body || {};

  try {
    const existingReviews = readJsonFile(reviewsFilePath);

    const numRating = typeof rating === "number" ? rating : parseFloat(rating) || 5;
    const safeRating = Math.max(0, Math.min(5, numRating));

    const newReview = {
      name: (name || "Client").trim(),
      rating: Number(safeRating.toFixed(2)),
      description: typeof description === "string" ? description.trim() : "",
    };

    let requestedOrder = Number(order);
    if (!Number.isInteger(requestedOrder) || requestedOrder < 1) {
      requestedOrder = existingReviews.length + 1;
    }
    requestedOrder = Math.max(1, Math.min(requestedOrder, existingReviews.length + 1));

    const updatedReviews = [...existingReviews];
    updatedReviews.splice(requestedOrder - 1, 0, newReview);

    const normalizedReviews = updatedReviews.map((rev, index) => ({
      ...rev,
      order: index + 1,
    }));

    fs.writeFileSync(
      reviewsFilePath,
      JSON.stringify({ reviews: normalizedReviews }, null, 2),
      "utf-8"
    );

    // Supprime de demandesavis.json via timeSent / name / description
    const demands = readJsonFile(demandsFilePath);
    const updatedDemands = demands.filter((d) => {
      const dName = (d.name || "").trim().toLowerCase();
      const targetName = (name || "").trim().toLowerCase();
      const nameMatches = dName && targetName && dName === targetName;

      const effectiveDate = timeSent || creationDate || date;
      const dateMatches =
        effectiveDate && (d.timeSent === effectiveDate || d.creationDate === effectiveDate || d.date === effectiveDate);

      const descMatches =
        description && d.description && d.description.trim() === description.trim();

      return !(nameMatches && (dateMatches || descMatches || !effectiveDate));
    });

    fs.writeFileSync(demandsFilePath, JSON.stringify(updatedDemands, null, 2), "utf-8");

    return res.status(200).json({
      success: true,
      message: "Avis ajouté avec succès !",
      review: normalizedReviews[requestedOrder - 1],
      reviews: normalizedReviews,
    });
  } catch (err) {
    console.error("Erreur acceptation demande:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout à reviews.json",
    });
  }
});

// ============================================================
// 4. POST /demandeavis/delete - Deletes from demandesavis.json
// ============================================================
router.post("/delete", (req, res) => {
  const { name, timeSent, creationDate, date, contact, description } = req.body || {};

  try {
    const demands = readJsonFile(demandsFilePath);

    const updatedDemands = demands.filter((d) => {
      const dName = (d.name || "").trim().toLowerCase();
      const targetName = (name || "").trim().toLowerCase();
      const nameMatches = dName && targetName && dName === targetName;

      const effectiveDate = timeSent || creationDate || date;
      const dateMatches =
        effectiveDate && (d.timeSent === effectiveDate || d.creationDate === effectiveDate || d.date === effectiveDate);

      const descMatches =
        description && d.description && d.description.trim() === description.trim();

      const contactMatches =
        contact && d.contact && d.contact.trim() === contact.trim();

      if (nameMatches && (dateMatches || descMatches || contactMatches)) return false;
      if (nameMatches && !effectiveDate && !description) return false;

      return true;
    });

    fs.writeFileSync(demandsFilePath, JSON.stringify(updatedDemands, null, 2), "utf-8");

    return res.status(200).json({
      success: true,
      message: "Demande d'avis supprimée.",
      remainingCount: updatedDemands.length,
    });
  } catch (err) {
    console.error("Erreur suppression demande:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la demande",
    });
  }
});

module.exports = router;