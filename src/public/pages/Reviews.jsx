import { useEffect, useMemo, useState } from "react";
import { Quote, Star, X, MessageSquarePlus } from "lucide-react";

// Point to your backend port:
const API_URL = "";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [rating, setRating] = useState("5.0");
  const [description, setDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      description: description.trim(),
      rating: parseFloat(rating) || 5,
      timeSent: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_URL}/demandeavis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      console.log("Réponse du serveur:", resData);

      setStatusMessage("Votre avis a bien été envoyé !");

      setTimeout(() => {
        setIsOpen(false);
        setName("");
        setContact("");
        setRating("5.0");
        setDescription("");
        setStatusMessage(null);
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de l'envoi de la demande d'avis:", err);
      setStatusMessage("Erreur lors de l'envoi de l'avis.");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/reviews`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Reviews API returned ${response.status}`);
        }

        const result = await response.json();

        if (cancelled) return;

        const data = Array.isArray(result)
          ? result
          : Array.isArray(result?.reviews)
          ? result.reviews
          : [];

        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);

        if (!cancelled) {
          setReviews([]);
          setError("Les avis ne sont pas disponibles pour le moment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  const overallRating = useMemo(() => {
    const ratings = reviews
      .map((review) => Number(review.rating))
      .filter((rating) => Number.isFinite(rating))
      .map((rating) => Math.min(5, Math.max(0, rating)));

    if (ratings.length === 0) return 0;
    const total = ratings.reduce((sum, r) => sum + r, 0);
    return total / ratings.length;
  }, [reviews]);

  const renderStars = (starRating, size = 13) => {
    const safeRating = Math.min(5, Math.max(0, Number(starRating) || 0));

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercentage = Math.min(
            100,
            Math.max(0, (safeRating - (star - 1)) * 100)
          );

          return (
            <div
              key={star}
              className="relative shrink-0"
              style={{ width: `${size}px`, height: `${size}px` }}
            >
              <Star
                size={size}
                strokeWidth={2}
                className="absolute inset-0 text-black/15"
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  size={size}
                  strokeWidth={2}
                  className="fill-red-600 text-red-600"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="bg-[#f5f5f5] px-4 py-12 sm:px-10 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
              <span className="h-px w-6 sm:w-7 bg-red-600" />
              Avis clients
            </span>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-5xl leading-tight">
              Ce que nos clients pensent de notre travail.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#707070] sm:text-base">
              Des retours simples et authentiques de personnes qui nous ont fait
              confiance pour leurs travaux.
            </p>

            {!loading && !error && reviews.length > 0 && (
              <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[#e3e3e3] bg-white px-3.5 py-2 shadow-sm sm:px-4 sm:py-2.5">
                {renderStars(overallRating, 14)}
                <span className="text-xs sm:text-sm font-bold text-[#171717]">
                  {overallRating.toFixed(1)} / 5
                </span>
              </div>
            )}
          </div>

          <div className="w-full shrink-0 sm:w-auto">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 cursor-pointer active:scale-95 sm:w-auto min-h-[44px]"
            >
              <MessageSquarePlus size={18} />
              <span>Laisser un avis</span>
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-56 sm:h-64 animate-pulse rounded-2xl border border-[#e4e4e4] bg-white"
              />
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-8 text-center">
            <div className="text-sm font-semibold text-[#333333]">
              Impossible de charger les avis.
            </div>
            <div className="mt-2 text-xs text-[#888888]">{error}</div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && reviews.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-[#dddddd] bg-white p-8 sm:p-10 text-center">
            <div className="text-sm font-semibold text-[#333333]">
              Aucun avis disponible.
            </div>
            <div className="mt-2 text-xs text-[#888888]">
              Les avis clients apparaîtront ici lorsqu'ils seront disponibles.
            </div>
          </div>
        )}

        {/* REVIEWS LIST */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => {
              const safeRating = Math.min(
                5,
                Math.max(0, Number(review.rating) || 0)
              );

              return (
                <article
                  key={review.id || `${review.name}-${review.order ?? index}-${index}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e3e3e3] bg-white p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#d5d5d5] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                >
                  <Quote
                    size={48}
                    strokeWidth={1}
                    className="absolute right-2.5 top-2.5 rotate-180 text-red-600/[0.04] transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-bold text-white">
                      {review.name ? review.name.charAt(0).toUpperCase() : "C"}
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 sm:px-3 sm:py-1.5">
                      {renderStars(safeRating, 12)}
                      <span className="text-[11px] font-bold text-[#707070]">
                        {safeRating.toFixed(1)}/5
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 my-3 sm:my-4 flex-1">
                    <p className="text-sm font-medium leading-relaxed text-[#333333] break-words">
                      {review.description || ""}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between border-t border-[#eeeeee] pt-3">
                    <div>
                      <div className="text-xs font-bold text-[#171717] truncate max-w-[200px]">
                        {review.name || "Client"}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#999999]">
                        Client vérifié
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative my-auto w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg sm:text-xl font-bold text-[#171717] mb-4 pr-8">
              Laisser un avis
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email ou numéro de téléphone
                </label>
                <input
                  type="text"
                  required
                  placeholder="Votre email ou numéro"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre d'étoiles (ex: 4.5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  required
                  placeholder="5.0"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Votre avis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm outline-none focus:border-red-600 resize-none"
                />
              </div>

              {statusMessage && (
                <div className="rounded-lg p-2.5 text-center text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {statusMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 cursor-pointer min-h-[44px] active:scale-[0.99]"
              >
                Ajouter
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}