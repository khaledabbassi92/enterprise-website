const express = require("express");
const fs = require("fs");
const path = require("path");

const { requireAdminAuth } = require("./admin");

const router = express.Router();

/* ============================================================
   FILE
============================================================ */

const reviewsFilePath = path.join(
  __dirname,
  "..",
  "reviews.json"
);

/* ============================================================
   ENSURE FILE EXISTS
============================================================ */

function ensureReviewsFile() {
  try {
    if (!fs.existsSync(reviewsFilePath)) {
      fs.writeFileSync(
        reviewsFilePath,
        JSON.stringify(
          {
            reviews: [],
          },
          null,
          2
        ),
        "utf8"
      );
    }

    return true;
  } catch (error) {
    console.error(
      "❌ Error creating reviews.json:",
      error
    );

    return false;
  }
}

/* ============================================================
   READ REVIEWS
============================================================ */

function readReviews() {
  try {
    if (!ensureReviewsFile()) {
      return [];
    }

    const raw = fs.readFileSync(
      reviewsFilePath,
      "utf8"
    );

    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (
      parsed &&
      Array.isArray(parsed.reviews)
    ) {
      return parsed.reviews;
    }

    return [];
  } catch (error) {
    console.error(
      "❌ Error reading reviews.json:",
      error
    );

    return [];
  }
}

/* ============================================================
   REINDEX
============================================================ */

function reindexReviews(reviews) {
  return reviews.map((review, index) => ({
    ...review,
    order: index + 1,
  }));
}

/* ============================================================
   SORT EXISTING REVIEWS
============================================================ */

function getOrderedReviews() {
  const reviews = readReviews();

  return [...reviews]
    .map((review, index) => ({
      ...review,

      /*
       * Keep original array position as a fallback
       * when order is missing/invalid.
       */
      __position: index,

      order:
        Number.isInteger(Number(review.order)) &&
        Number(review.order) >= 1
          ? Number(review.order)
          : null,
    }))
    .sort((a, b) => {
      if (a.order === null && b.order === null) {
        return a.__position - b.__position;
      }

      if (a.order === null) {
        return 1;
      }

      if (b.order === null) {
        return -1;
      }

      if (a.order !== b.order) {
        return a.order - b.order;
      }

      return a.__position - b.__position;
    })
    .map((review) => {
      const copy = {
        ...review,
      };

      delete copy.__position;

      return copy;
    });
}

/* ============================================================
   WRITE
============================================================ */

function writeReviews(reviews) {
  try {
    const normalized = reindexReviews(
      reviews
    );

    fs.writeFileSync(
      reviewsFilePath,
      JSON.stringify(
        {
          reviews: normalized,
        },
        null,
        2
      ),
      "utf8"
    );

    return normalized;
  } catch (error) {
    console.error(
      "❌ Error writing reviews.json:",
      error
    );

    return null;
  }
}

/* ============================================================
   RATING
============================================================ */

function normalizeRating(rating) {
  let value = Number(rating);

  if (!Number.isFinite(value)) {
    value = 5;
  }

  value = Math.max(
    0,
    Math.min(5, value)
  );

  return Number(
    value.toFixed(2)
  );
}

/* ============================================================
   GET — PUBLIC
============================================================ */

router.get("/", (req, res) => {
  try {
    const reviews =
      getOrderedReviews();

    /*
     * Always repair the indexes returned to
     * the frontend.
     */
    const normalized =
      reindexReviews(reviews);

    return res.status(200).json({
      success: true,
      reviews: normalized,
    });
  } catch (error) {
    console.error(
      "❌ GET reviews error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de charger les avis.",
    });
  }
});

/* ============================================================
   POST — ADD
   PROTECTED
============================================================ */

router.post(
  "/",
  requireAdminAuth,
  (req, res) => {
    try {
      const {
        name,
        rating,
        description,
        order,
      } = req.body || {};

      /* --------------------------------------------------------
         VALIDATE NAME
      -------------------------------------------------------- */

      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Nom requis.",
        });
      }

      /* --------------------------------------------------------
         CURRENT REVIEWS
      -------------------------------------------------------- */

      const reviews =
        getOrderedReviews();

      /* --------------------------------------------------------
         REQUESTED POSITION
      -------------------------------------------------------- */

      let requestedOrder =
        Number(order);

      if (
        !Number.isInteger(
          requestedOrder
        ) ||
        requestedOrder < 1
      ) {
        requestedOrder =
          reviews.length + 1;
      }

      requestedOrder = Math.max(
        1,
        Math.min(
          requestedOrder,
          reviews.length + 1
        )
      );

      /* --------------------------------------------------------
         NEW REVIEW
      -------------------------------------------------------- */

      const newReview = {
        name: name.trim(),

        rating:
          normalizeRating(rating),

        description:
          typeof description === "string"
            ? description.trim()
            : "",
      };

      /* --------------------------------------------------------
         INSERT
      -------------------------------------------------------- */

      const updatedReviews = [
        ...reviews,
      ];

      updatedReviews.splice(
        requestedOrder - 1,
        0,
        newReview
      );

      /* --------------------------------------------------------
         SAVE + REINDEX
      -------------------------------------------------------- */

      const savedReviews =
        writeReviews(
          updatedReviews
        );

      if (!savedReviews) {
        return res.status(500).json({
          success: false,
          message:
            "Impossible d'enregistrer l'avis.",
        });
      }

      return res.status(201).json({
        success: true,

        review:
          savedReviews[
            requestedOrder - 1
          ],

        reviews: savedReviews,
      });
    } catch (error) {
      console.error(
        "❌ POST reviews error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Erreur serveur.",
      });
    }
  }
);

/* ============================================================
   PUT — MOVE / REINDEX
   PROTECTED

   PUT /api/reviews/:order

   Body:
   {
     "order": 2
   }

   Example:

   Before:
   1 A
   2 B
   3 C
   4 D

   PUT /api/reviews/4
   { "order": 2 }

   After:
   1 A
   2 D
   3 B
   4 C
============================================================ */

router.put(
  "/:order",
  requireAdminAuth,
  (req, res) => {
    try {
      /* --------------------------------------------------------
         CURRENT POSITION
      -------------------------------------------------------- */

      const currentOrder =
        Number(req.params.order);

      /* --------------------------------------------------------
         NEW POSITION
      -------------------------------------------------------- */

      const requestedOrder =
        Number(req.body?.order);

      /* --------------------------------------------------------
         VALIDATE CURRENT POSITION
      -------------------------------------------------------- */

      if (
        !Number.isInteger(
          currentOrder
        ) ||
        currentOrder < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Position actuelle invalide.",
        });
      }

      /* --------------------------------------------------------
         READ + NORMALIZE CURRENT DATA
      -------------------------------------------------------- */

      const reviews =
        getOrderedReviews();

      /*
       * If the file contained bad indexes,
       * repair them before moving anything.
       */
      const normalized =
        reindexReviews(reviews);

      /* --------------------------------------------------------
         CHECK EXISTING REVIEW
      -------------------------------------------------------- */

      if (
        currentOrder >
        normalized.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Avis introuvable.",
        });
      }

      /* --------------------------------------------------------
         VALIDATE NEW POSITION
      -------------------------------------------------------- */

      if (
        !Number.isInteger(
          requestedOrder
        ) ||
        requestedOrder < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Nouvelle position invalide.",
        });
      }

      /* --------------------------------------------------------
         LIMIT NEW POSITION
      -------------------------------------------------------- */

      const newOrder =
        Math.min(
          requestedOrder,
          normalized.length
        );

      /* --------------------------------------------------------
         MOVE
      -------------------------------------------------------- */

      const updatedReviews = [
        ...normalized,
      ];

      const movingReview =
        updatedReviews.splice(
          currentOrder - 1,
          1
        )[0];

      /*
       * Insert at requested position.
       */
      updatedReviews.splice(
        newOrder - 1,
        0,
        movingReview
      );

      /* --------------------------------------------------------
         REINDEX FROM 1
      -------------------------------------------------------- */

      const savedReviews =
        writeReviews(
          updatedReviews
        );

      if (!savedReviews) {
        return res.status(500).json({
          success: false,
          message:
            "Impossible d'enregistrer la nouvelle position.",
        });
      }

      /* --------------------------------------------------------
         RETURN EXACT RESULT
      -------------------------------------------------------- */

      return res.status(200).json({
        success: true,

        review:
          savedReviews[
            newOrder - 1
          ],

        reviews: savedReviews,
      });
    } catch (error) {
      console.error(
        "❌ PUT reviews error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Erreur serveur.",
      });
    }
  }
);

/* ============================================================
   DELETE — REMOVE
   PROTECTED
============================================================ */

router.delete(
  "/:order",
  requireAdminAuth,
  (req, res) => {
    try {
      const targetOrder =
        Number(req.params.order);

      /* --------------------------------------------------------
         VALIDATE
      -------------------------------------------------------- */

      if (
        !Number.isInteger(
          targetOrder
        ) ||
        targetOrder < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Position invalide.",
        });
      }

      /* --------------------------------------------------------
         READ + NORMALIZE
      -------------------------------------------------------- */

      const reviews =
        reindexReviews(
          getOrderedReviews()
        );

      /* --------------------------------------------------------
         CHECK
      -------------------------------------------------------- */

      if (
        targetOrder >
        reviews.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Avis introuvable.",
        });
      }

      /* --------------------------------------------------------
         REMOVE
      -------------------------------------------------------- */

      reviews.splice(
        targetOrder - 1,
        1
      );

      /* --------------------------------------------------------
         SAVE + REINDEX
      -------------------------------------------------------- */

      const savedReviews =
        writeReviews(
          reviews
        );

      if (!savedReviews) {
        return res.status(500).json({
          success: false,
          message:
            "Impossible de supprimer l'avis.",
        });
      }

      return res.status(200).json({
        success: true,
        reviews: savedReviews,
      });
    } catch (error) {
      console.error(
        "❌ DELETE reviews error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Erreur serveur.",
      });
    }
  }
);

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;