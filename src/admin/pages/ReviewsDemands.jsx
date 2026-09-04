"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Check,
  Inbox,
  AlertCircle,
} from "lucide-react";

const API_URL = "";

export default function AdminDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingKey, setProcessingKey] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filtres & Recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper functions for date formatting
  const formatDate = (isoString) => {
    if (!isoString) return "—";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Get admin token from localStorage
  const getAdminToken = () => {
    return localStorage.getItem("admin_token");
  };

  // ============================================================
  // 1. CHARGEMENT DES DEMANDES D'AVIS (SECURED)
  // ============================================================
  const fetchDemandes = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAdminToken();
      if (!token) {
        setError("Authentification requise. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/demandeavis`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Erreur réseau (${res.status})`);
      }

      const data = await res.json();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération des demandes d'avis:", err);
      setError("Impossible de contacter le serveur pour charger les demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  // ============================================================
  // 2. ACCEPTER - Add to reviews.json THEN delete from demands
  // ============================================================
  const handleAccept = async (item) => {
    const actionKey = `${item.name}-${item.timeSent || item.description}`;
    try {
      setProcessingKey(actionKey);

      const token = getAdminToken();
      if (!token) {
        showNotification("error", "Authentification requise.");
        return;
      }

      // Payload pour /api/reviews
      const reviewPayload = {
        name: (item.name || "Client").trim(),
        rating:
          typeof item.rating === "number"
            ? item.rating
            : parseFloat(String(item.rating)) || 5,
        description: (item.description || "").trim(),
      };

      // Step 1: Add to reviews.json via reviewsmachine secured route
      const resReviews = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(reviewPayload),
      });

      if (!resReviews.ok) {
        throw new Error(
          `Impossible d'ajouter l'avis à reviews.json (${resReviews.status})`
        );
      }

      // Step 2: Delete from demandesavis.json
      const resDelete = await fetch(`${API_URL}/demandeavis/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: item.name,
          timeSent: item.timeSent,
        }),
      });

      if (!resDelete.ok) {
        throw new Error(
          `Impossible de supprimer de demandesavis.json (${resDelete.status})`
        );
      }

      // Remove from UI only after BOTH operations succeed
      setDemandes((prev) =>
        prev.filter((d) => !(d.name === item.name && d.timeSent === item.timeSent))
      );

      showNotification(
        "success",
        `L'avis de ${item.name || "ce client"} a été approuvé et ajouté aux avis.`
      );
    } catch (err) {
      console.error("Erreur lors de l'approbation:", err);
      showNotification("error", `Erreur: ${err.message}`);
    } finally {
      setProcessingKey(null);
    }
  };

  // ============================================================
  // 3. SUPPRIMER - Delete from demandesavis.json (SECURED)
  // ============================================================
  const handleDelete = async (item) => {
    const actionKey = `${item.name}-${item.timeSent || item.description}`;
    try {
      setProcessingKey(actionKey);

      const token = getAdminToken();
      if (!token) {
        showNotification("error", "Authentification requise.");
        return;
      }

      const res = await fetch(`${API_URL}/demandeavis/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: item.name,
          timeSent: item.timeSent,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }

      // Remove from UI only after successful deletion
      setDemandes((prev) =>
        prev.filter((d) => !(d.name === item.name && d.timeSent === item.timeSent))
      );

      showNotification(
        "success",
        `La demande de ${item.name || "ce client"} a été supprimée.`
      );
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      showNotification("error", "Erreur lors de la suppression de la demande.");
    } finally {
      setProcessingKey(null);
    }
  };

  const renderStars = (rating, size = 14) => {
    const safeRating = Math.min(5, Math.max(0, Number(rating) || 0));

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillPercentage = Math.max(
            0,
            Math.min(100, (safeRating - (starIndex - 1)) * 100)
          );

          return (
            <div key={starIndex} className="relative" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="absolute text-black/20"
                fill="currentColor"
              />
              <div
                style={{
                  width: `${fillPercentage}%`,
                  overflow: "hidden",
                  height: "100%",
                }}
              >
                <Star
                  size={size}
                  className="text-amber-500"
                  fill="currentColor"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Filtrage et tri
  const filteredDemandes = demandes
    .filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.contact?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating =
        ratingFilter === "all" ||
        Number(d.rating) === Number(ratingFilter);

      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.timeSent || 0) - new Date(a.timeSent || 0);
      } else if (sortBy === "oldest") {
        return new Date(a.timeSent || 0) - new Date(b.timeSent || 0);
      } else if (sortBy === "rating-high") {
        return Number(b.rating) - Number(a.rating);
      } else if (sortBy === "rating-low") {
        return Number(a.rating) - Number(b.rating);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-black">Demandes d'avis</h1>
        <p className="text-sm text-black/60">
          Gérez les demandes d'avis en attente. Approuvez pour ajouter aux avis
          publiés ou supprimez pour rejeter.
        </p>
      </div>

      {/* NOTIFICATION */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{notification.text}</span>
        </div>
      )}

      {/* CONTROLS */}
      <div className="space-y-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
          />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone ou message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-black/10 bg-black/[0.02] focus:bg-white focus:border-red-500 focus:outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-black/10 bg-black/[0.02] text-black/80 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes les notes</option>
            <option value="5">5 étoiles</option>
            <option value="4">4 étoiles</option>
            <option value="3">3 étoiles</option>
            <option value="2">2 étoiles</option>
            <option value="1">1 étoile</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-black/10 bg-black/[0.02] text-black/80 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="recent">Plus récentes d'abord</option>
            <option value="oldest">Plus anciennes d'abord</option>
            <option value="rating-high">Meilleures notes</option>
            <option value="rating-low">Moins bonnes notes</option>
          </select>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-64 rounded-2xl border border-black/10 bg-white p-6 shadow-sm animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 bg-black/10 rounded w-1/3" />
                <div className="h-3 bg-black/10 rounded w-1/4" />
                <div className="h-16 bg-black/5 rounded w-full mt-4" />
              </div>
              <div className="h-10 bg-black/10 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-red-600" />
          <div className="text-sm font-bold text-red-900">{error}</div>
          <p className="text-xs text-red-700/80 max-w-md mx-auto">
            Vérifiez votre authentification et que le fichier{" "}
            <code>demandesavis.json</code> existe.
          </p>
          <button
            onClick={fetchDemandes}
            className="mt-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredDemandes.length === 0 && (
        <div className="bg-white rounded-2xl border border-black/10 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] text-black/40 flex items-center justify-center mx-auto mb-3">
            <Inbox size={24} />
          </div>
          <h3 className="text-base font-bold text-black">
            Aucune demande d'avis trouvée
          </h3>
          <p className="text-xs text-black/50 mt-1 max-w-sm mx-auto">
            {searchQuery || ratingFilter !== "all"
              ? "Aucun résultat ne correspond à vos filtres actuels. Essayez de réinitialiser la recherche."
              : "Toutes les demandes ont été modérées."}
          </p>
        </div>
      )}

      {/* CARDS GRID */}
      {!loading && !error && filteredDemandes.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredDemandes.map((item, index) => {
            const numRating = Number(item.rating) || 5;
            const dateFormatted = formatDate(item.timeSent);
            const timeFormatted = formatTime(item.timeSent);
            const isProcessing =
              processingKey === `${item.name}-${item.timeSent || item.description}`;

            return (
              <div
                key={`${item.name}-${item.timeSent || index}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-black/20"
              >
                <div>
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 font-bold text-white text-sm">
                        {(item.name || "C").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-black">
                          {item.name || "Client anonyme"}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-black/50">
                          <Calendar size={12} />
                          <span>{dateFormatted}</span>
                          {timeFormatted && (
                            <>
                              <span>•</span>
                              <Clock size={11} />
                              <span>{timeFormatted}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 border border-amber-200 shrink-0">
                      <Star
                        size={13}
                        className="fill-amber-500 text-amber-500"
                      />
                      <span>{numRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* STARS */}
                  <div className="mt-3 flex items-center gap-2">
                    {renderStars(numRating, 14)}
                    <span className="text-[11px] text-black/40 font-medium">
                      ({numRating}/5)
                    </span>
                  </div>

                  {/* CONTACT INFO */}
                  {item.contact && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-black/[0.02] border border-black/5 px-2.5 py-1.5 text-xs text-black/70">
                      {item.contact.includes("@") ? (
                        <Mail size={13} className="shrink-0 text-black/40" />
                      ) : (
                        <Phone size={13} className="shrink-0 text-black/40" />
                      )}
                      <span className="truncate">{item.contact}</span>
                    </div>
                  )}

                  {/* DESCRIPTION */}
                  <div className="mt-4 rounded-xl bg-black/[0.015] border border-black/5 p-3.5">
                    <p className="text-xs leading-relaxed text-black/80 whitespace-pre-line italic">
                      "{item.description || "Aucun message rédigé."}"
                    </p>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="mt-5 flex items-center gap-2 border-t border-black/10 pt-4">
                  {/* APPROUVER */}
                  <button
                    type="button"
                    onClick={() => handleAccept(item)}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Approuver: ajouter aux avis et supprimer de la file d'attente"
                  >
                    {isProcessing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    <span>Approuver</span>
                  </button>

                  {/* SUPPRIMER */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-semibold text-black/70 shadow-sm transition hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Supprimer la demande d'avis"
                  >
                    <Trash2 size={14} />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
