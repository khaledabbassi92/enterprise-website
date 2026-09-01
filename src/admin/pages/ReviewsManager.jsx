"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Plus,
  Trash2,
  Save,
  User,
} from "lucide-react";

const API_URL = "/api/reviews";

/*
|--------------------------------------------------------------------------
| JSON RESPONSE HELPER
|--------------------------------------------------------------------------
*/

async function parseJsonResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      success: response.ok,
      message:
        text || response.statusText,
    };
  }
}

/*
|--------------------------------------------------------------------------
| ADMIN AUTH
|--------------------------------------------------------------------------
|
| The masterKey returned by /api/admin/login
| is stored as admin_token.
|
| GET does NOT use this.
|
| POST / PUT / DELETE do use this.
|--------------------------------------------------------------------------
*/

function getAdminHeaders() {
  const token =
    localStorage.getItem("admin_token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

/*
|--------------------------------------------------------------------------
| CLEAR INVALID SESSION
|--------------------------------------------------------------------------
*/

function clearAdminSession() {
  localStorage.removeItem(
    "admin_token"
  );

  localStorage.removeItem(
    "admin_user"
  );
}

/*
|--------------------------------------------------------------------------
| REVIEWS MANAGER
|--------------------------------------------------------------------------
*/

export default function ReviewsManager() {
  const [reviews, setReviews] = useState([]);

  const [form, setForm] = useState({
    name: "",
    rating: "",
    description: "",
    order: "",
  });

  const [saving, setSaving] =
    useState(false);

  const [savingReview, setSavingReview] =
    useState({});

  const [deletingReview, setDeletingReview] =
    useState({});

  const [message, setMessage] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD REVIEWS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchReviews();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE FRONTEND DATA
  |--------------------------------------------------------------------------
  */

  const normalizeReviews = (
    reviewsList
  ) => {
    return [...reviewsList]
      .sort(
        (a, b) =>
          Number(a.order || 0) -
          Number(b.order || 0)
      )
      .map((review, index) => ({
        ...review,

        originalOrder:
          Number(review.order) ||
          index + 1,

        order:
          Number(review.order) ||
          index + 1,

        rating: Number.isFinite(
          Number(review.rating)
        )
          ? Math.min(
              5,
              Math.max(
                0,
                Number(review.rating)
              )
            )
          : 0,

        description:
          typeof review.description ===
          "string"
            ? review.description
            : "",
      }));
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH REVIEWS
  |--------------------------------------------------------------------------
  |
  | PUBLIC REQUEST.
  | No admin token.
  |--------------------------------------------------------------------------
  */

  const fetchReviews = async () => {
    try {
      const response =
        await fetch(API_URL);

      const data =
        await parseJsonResponse(
          response
        );

      if (
        response.ok &&
        data.success &&
        Array.isArray(data.reviews)
      ) {
        setReviews(
          normalizeReviews(
            data.reviews
          )
        );

        return;
      }

      if (!response.ok) {
        setMessage(
          data?.message ||
            "Impossible de charger les avis."
        );
      }
    } catch (error) {
      console.error(
        "Fetch reviews error:",
        error
      );

      setMessage(
        "Impossible de charger les avis."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (message) {
      setMessage("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | POSITION CHANGE
  |--------------------------------------------------------------------------
  */

  const handleOrderChange = (
    index,
    value
  ) => {
    setReviews((current) => {
      const updated = [...current];

      updated[index] = {
        ...updated[index],

        order:
          value === ""
            ? ""
            : Number(value),
      };

      return updated;
    });

    if (message) {
      setMessage("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ADD REVIEW
  |--------------------------------------------------------------------------
  */

  const handleAddReview = async (
    e
  ) => {
    e.preventDefault();

    setMessage("");

    const token =
      localStorage.getItem(
        "admin_token"
      );

    if (!token) {
      setMessage(
        "Session administrateur introuvable. Veuillez vous reconnecter."
      );
      return;
    }

    /*
    | Validate name
    */

    if (!form.name.trim()) {
      setMessage(
        "Veuillez entrer un nom."
      );
      return;
    }

    /*
    | Validate rating
    */

    let rating = Number(
      form.rating
    );

    if (!Number.isFinite(rating)) {
      setMessage(
        "Veuillez entrer une note."
      );
      return;
    }

    rating = Math.min(
      5,
      Math.max(0, rating)
    );

    /*
    | Validate position
    */

    let order;

    if (form.order !== "") {
      order = Number(
        form.order
      );

      if (
        !Number.isInteger(order) ||
        order < 1
      ) {
        setMessage(
          "La position doit être un nombre entier supérieur ou égal à 1."
        );
        return;
      }
    }

    /*
    | Build payload
    */

    const review = {
      name: form.name.trim(),

      rating: Number(
        rating.toFixed(2)
      ),

      description:
        typeof form.description ===
        "string"
          ? form.description.trim()
          : "",
    };

    if (order !== undefined) {
      review.order = order;
    }

    try {
      setSaving(true);

      const response =
        await fetch(API_URL, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...getAdminHeaders(),
          },

          body: JSON.stringify(
            review
          ),
        });

      const data =
        await parseJsonResponse(
          response
        );

      /*
      | Invalid master key
      */

      if (
        response.status === 401
      ) {
        clearAdminSession();

        throw new Error(
          "Session administrateur invalide. Veuillez vous reconnecter."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible d'enregistrer l'avis."
        );
      }

      /*
      | Reload server state
      */

      await fetchReviews();

      /*
      | Reset form
      */

      setForm({
        name: "",
        rating: "",
        description: "",
        order: "",
      });

      setMessage(
        "Avis ajouté avec succès."
      );
    } catch (error) {
      console.error(
        "Add review error:",
        error
      );

      setMessage(
        error.message ||
          "Impossible d'enregistrer l'avis."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | MOVE REVIEW
  |--------------------------------------------------------------------------
  |
  | Uses:
  |
  | PUT /api/reviews/:oldOrder
  |
  | Body:
  |
  | {
  |   "order": newOrder
  | }
  |
  | This is atomic from the frontend perspective.
  |--------------------------------------------------------------------------
  */

  const handleSaveReview = async (
    review,
    index
  ) => {
    setMessage("");

    const token =
      localStorage.getItem(
        "admin_token"
      );

    if (!token) {
      setMessage(
        "Session administrateur introuvable. Veuillez vous reconnecter."
      );
      return;
    }

    const oldOrder = Number(
      review.originalOrder
    );

    const newOrder = Number(
      review.order
    );

    /*
    | Validate old position
    */

    if (
      !Number.isInteger(oldOrder) ||
      oldOrder < 1
    ) {
      setMessage(
        "Position actuelle invalide."
      );
      return;
    }

    /*
    | Validate new position
    */

    if (
      !Number.isInteger(newOrder) ||
      newOrder < 1
    ) {
      setMessage(
        `La position de "${review.name}" doit être un nombre entier supérieur ou égal à 1.`
      );
      return;
    }

    /*
    | Nothing changed
    */

    if (
      oldOrder === newOrder
    ) {
      setMessage(
        `La position de "${review.name}" n'a pas changé.`
      );
      return;
    }

    try {
      setSavingReview(
        (current) => ({
          ...current,
          [index]: true,
        })
      );

      /*
      | PUT /api/reviews/:oldOrder
      */

      const response =
        await fetch(
          `${API_URL}/${oldOrder}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              ...getAdminHeaders(),
            },

            body: JSON.stringify({
              order: newOrder,
            }),
          }
        );

      const data =
        await parseJsonResponse(
          response
        );

      /*
      | Invalid master key
      */

      if (
        response.status === 401
      ) {
        clearAdminSession();

        throw new Error(
          "Session administrateur invalide. Veuillez vous reconnecter."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible de déplacer l'avis."
        );
      }

      /*
      | Server is authoritative.
      | Reload final state.
      */

      await fetchReviews();

      setMessage(
        `Position de "${review.name}" enregistrée avec succès.`
      );
    } catch (error) {
      console.error(
        "Move review error:",
        error
      );

      /*
      | Always reload after an error so
      | the UI cannot remain out of sync.
      */

      await fetchReviews();

      setMessage(
        error.message ||
          "Erreur lors du déplacement."
      );
    } finally {
      setSavingReview(
        (current) => ({
          ...current,
          [index]: false,
        })
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE REVIEW
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (
    review,
    index
  ) => {
    setMessage("");

    const token =
      localStorage.getItem(
        "admin_token"
      );

    if (!token) {
      setMessage(
        "Session administrateur introuvable. Veuillez vous reconnecter."
      );
      return;
    }

    const order = Number(
      review.originalOrder
    );

    if (
      !Number.isInteger(order) ||
      order < 1
    ) {
      setMessage(
        "Position invalide."
      );
      return;
    }

    try {
      setDeletingReview(
        (current) => ({
          ...current,
          [index]: true,
        })
      );

      const response =
        await fetch(
          `${API_URL}/${order}`,
          {
            method: "DELETE",

            headers: {
              ...getAdminHeaders(),
            },
          }
        );

      const data =
        await parseJsonResponse(
          response
        );

      /*
      | Invalid master key
      */

      if (
        response.status === 401
      ) {
        clearAdminSession();

        throw new Error(
          "Session administrateur invalide. Veuillez vous reconnecter."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible de supprimer l'avis."
        );
      }

      /*
      | Reload final server state.
      */

      await fetchReviews();

      setMessage(
        "Avis supprimé avec succès."
      );
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      setMessage(
        error.message ||
          "Erreur lors de la suppression."
      );
    } finally {
      setDeletingReview(
        (current) => ({
          ...current,
          [index]: false,
        })
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER STARS
  |--------------------------------------------------------------------------
  */

  const renderStars = (
    rating
  ) => {
    const safeRating =
      Math.min(
        5,
        Math.max(
          0,
          Number(rating) || 0
        )
      );

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <Star
              key={star}
              size={16}
              className={
                star <= safeRating
                  ? "fill-red-600 text-red-600"
                  : "text-black/20"
              }
            />
          )
        )}
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* HEADER */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">
          Avis clients
        </h1>

        <p className="text-sm text-black/50 mt-1">
          Ajoutez et gérez les avis
          affichés sur le site.
        </p>
      </div>

      {/* ADD REVIEW */}

      <form
        onSubmit={
          handleAddReview
        }
        className="bg-white border border-black/10 rounded-xl p-5 sm:p-6 mb-8"
      >

        <div className="flex items-center gap-2 mb-5">

          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
            <Plus
              size={18}
              className="text-red-600"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Ajouter un avis
            </h2>

            <p className="text-xs text-black/45">
              Les informations seront
              envoyées au serveur.
            </p>
          </div>

        </div>

        {/* NAME */}

        <div className="mb-4">

          <label className="block text-xs font-medium text-black/70 mb-1.5">
            Nom
          </label>

          <div className="relative">

            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
            />

            <input
              name="name"
              type="text"
              value={form.name}
              onChange={
                handleChange
              }
              placeholder="Nom du client"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-black/10 outline-none text-sm focus:border-red-600"
            />

          </div>

        </div>

        {/* RATING + POSITION */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

          <div>

            <label className="block text-xs font-medium text-black/70 mb-1.5">
              Note sur 5
            </label>

            <div className="relative">

              <Star
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600"
              />

              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={
                  form.rating
                }
                onChange={
                  handleChange
                }
                placeholder="5"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-black/10 outline-none text-sm focus:border-red-600"
              />

            </div>

            <p className="text-[10px] text-black/40 mt-1">
              Les valeurs supérieures
              à 5 sont limitées à 5.
            </p>

          </div>

          <div>

            <label className="block text-xs font-medium text-black/70 mb-1.5">
              Position
            </label>

            <input
              name="order"
              type="number"
              min="1"
              step="1"
              value={
                form.order
              }
              onChange={
                handleChange
              }
              placeholder="Laisser vide pour la fin"
              className="w-full h-10 px-3 rounded-lg border border-black/10 outline-none text-sm focus:border-red-600"
            />

          </div>

        </div>

        {/* DESCRIPTION */}

        <div className="mb-5">

          <label className="block text-xs font-medium text-black/70 mb-1.5">
            Avis
          </label>

          <textarea
            name="description"
            value={
              form.description
            }
            onChange={
              handleChange
            }
            rows={4}
            placeholder="Écrivez ici le commentaire du client... (facultatif)"
            className="w-full px-3 py-2.5 rounded-lg border border-black/10 outline-none text-sm resize-none focus:border-red-600"
          />

        </div>

        {/* MESSAGE */}

        {message && (
          <div
            className={`mb-4 px-3 py-2.5 rounded-lg text-xs ${
              message.includes(
                "succès"
              )
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* ADD BUTTON */}

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto h-10 px-5 rounded-lg bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
        >

          <Save size={16} />

          {saving
            ? "Enregistrement..."
            : "Ajouter l'avis"}

        </button>

      </form>

      {/* REVIEWS */}

      {reviews.length > 0 && (
        <div className="mt-6">

          <div className="flex items-center justify-between mb-3">

            <h2 className="text-sm font-semibold">
              Avis enregistrés
            </h2>

            <span className="text-xs text-black/40">
              {reviews.length} avis
            </span>

          </div>

          <div className="space-y-3">

            {reviews.map(
              (
                review,
                index
              ) => (
                <div
                  key={
                    review.id ||
                    `${review.name}-${review.originalOrder}-${index}`
                  }
                  className="border border-black/10 rounded-xl p-4 bg-white"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="font-semibold text-sm">
                          {review.name}
                        </span>

                        {renderStars(
                          review.rating
                        )}

                        <span className="text-xs text-black/40">
                          {Math.min(
                            5,
                            Math.max(
                              0,
                              Number(
                                review.rating
                              ) || 0
                            )
                          )}
                          /5
                        </span>

                      </div>

                      {review.description ? (
                        <p className="text-sm text-black/60 mt-2">
                          {
                            review.description
                          }
                        </p>
                      ) : (
                        <p className="text-sm text-black/30 italic mt-2">
                          Aucun commentaire
                        </p>
                      )}

                    </div>

                    <div className="flex items-end gap-2 shrink-0">

                      {/* POSITION */}

                      <div className="flex flex-col items-end">

                        <span className="text-[10px] text-black/40 mb-1">
                          Position
                        </span>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={
                            review.order
                          }
                          onChange={(e) =>
                            handleOrderChange(
                              index,
                              e.target.value
                            )
                          }
                          className="w-16 h-9 px-2 rounded-lg border border-black/10 outline-none text-xs text-center focus:border-red-600"
                        />

                      </div>

                      {/* SAVE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleSaveReview(
                            review,
                            index
                          )
                        }
                        disabled={
                          savingReview[
                            index
                          ]
                        }
                        className="h-9 px-3 rounded-lg bg-black text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-black/80 disabled:opacity-50 transition cursor-pointer"
                        title="Enregistrer cette position"
                      >

                        <Save
                          size={14}
                          className={
                            savingReview[
                              index
                            ]
                              ? "animate-pulse"
                              : ""
                          }
                        />

                        {savingReview[
                          index
                        ]
                          ? "..."
                          : "Enregistrer"}

                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            review,
                            index
                          )
                        }
                        disabled={
                          deletingReview[
                            index
                          ]
                        }
                        className="h-9 w-9 rounded-lg text-black/40 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition flex items-center justify-center cursor-pointer"
                        title="Supprimer"
                      >

                        <Trash2
                          size={16}
                          className={
                            deletingReview[
                              index
                            ]
                              ? "animate-pulse"
                              : ""
                          }
                        />

                      </button>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

      {/* NO REVIEWS */}

      {reviews.length === 0 &&
        !message && (
          <div className="border border-black/10 rounded-xl p-8 bg-white text-center">

            <p className="text-sm text-black/40">
              Aucun avis enregistré.
            </p>

          </div>
        )}

    </div>
  );
}