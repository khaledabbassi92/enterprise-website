import { useEffect, useMemo, useState } from "react";
import { Quote, Star } from "lucide-react";

const API_URL = "";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  /*
   * OVERALL AVERAGE RATING
   */
  const overallRating = useMemo(() => {
    const ratings = reviews
      .map((review) => Number(review.rating))
      .filter((rating) => Number.isFinite(rating))
      .map((rating) => Math.min(5, Math.max(0, rating)));

    if (ratings.length === 0) {
      return 0;
    }

    const total = ratings.reduce(
      (sum, rating) => sum + rating,
      0
    );

    return total / ratings.length;
  }, [reviews]);

  /*
   * FRACTIONAL STAR DISPLAY
   */
  const renderStars = (rating) => {
    const safeRating = Math.min(
      5,
      Math.max(0, Number(rating) || 0)
    );

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
              className="relative h-[13px] w-[13px]"
            >
              <Star
                size={13}
                strokeWidth={2}
                className="absolute inset-0 text-black/15"
              />

              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: `${fillPercentage}%`,
                }}
              >
                <Star
                  size={13}
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
    <section className="bg-[#f5f5f5] px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-[1280px]">

        {/* HEADER */}
        <div className="mb-12 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            <span className="h-px w-7 bg-red-600" />
            Avis clients
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-5xl">
            Ce que nos clients pensent de notre travail.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[#707070] sm:text-base">
            Des retours simples et authentiques de personnes qui nous ont fait
            confiance pour leurs travaux.
          </p>

          {/* OVERALL RATING */}
          {!loading && !error && reviews.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#e3e3e3] bg-white px-4 py-2.5 shadow-sm">
              {renderStars(overallRating)}

              <span className="text-sm font-bold text-[#171717]">
                {overallRating.toFixed(1)} / 5
              </span>
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-[#e4e4e4] bg-white"
              />
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center">
            <div className="text-sm font-semibold text-[#333333]">
              Impossible de charger les avis.
            </div>

            <div className="mt-2 text-xs text-[#888888]">
              {error}
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && reviews.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-[#dddddd] bg-white p-10 text-center">
            <div className="text-sm font-semibold text-[#333333]">
              Aucun avis disponible.
            </div>

            <div className="mt-2 text-xs text-[#888888]">
              Les avis clients apparaîtront ici lorsqu'ils seront disponibles.
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => {
              const safeRating = Math.min(
                5,
                Math.max(0, Number(review.rating) || 0)
              );

              return (
                <article
                  key={
                    review.id ||
                    `${review.name}-${review.order ?? index}-${index}`
                  }
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#e3e3e3] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#d5d5d5] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                >

                  {/* DECORATIVE QUOTE */}
                  <Quote
                    size={60}
                    strokeWidth={1}
                    className="absolute right-3 top-3 rotate-180 text-red-600/[0.05] transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* TOP */}
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-bold text-white">
                      {review.name
                        ? review.name.charAt(0).toUpperCase()
                        : "C"}
                    </div>

                    <div className="flex flex-col items-end gap-1 rounded-full bg-red-50 px-3 py-1.5">
                      {renderStars(safeRating)}

                      <span className="text-[11px] font-bold text-[#707070]">
                        {safeRating.toFixed(1)} / 5
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="relative z-10 my-4 flex-1">
                    <p className="text-sm font-medium leading-relaxed text-[#333333]">
                      {review.description || ""}
                    </p>
                  </div>

                  {/* BOTTOM */}
                  <div className="relative z-10 flex items-center justify-between border-t border-[#eeeeee] pt-3">
                    <div>
                      <div className="text-xs font-bold text-[#171717]">
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
    </section>
  );
}