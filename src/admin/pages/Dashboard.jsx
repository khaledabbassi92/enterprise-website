import React, { useEffect, useState } from "react";
import { Eye, Clock, Calendar, Globe, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [views, setViews] = useState({
    today: 0,
    yesterday: 0,
    last30Days: 0,
    overall: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchViews = (isManual = false) => {
    if (isManual) setRefreshing(true);

    fetch("/api/views")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then((data) => {
        const v = data.views || data;
        setViews({
          today: Number(v.today || 0),
          yesterday: Number(v.yesterday || 0),
          last30Days: Number(v.last30Days || 0),
          overall: Number(v.overall || 0),
        });
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des vues :", err);
      })
      .finally(() => {
        setLoading(false);
        if (isManual) setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchViews();
  }, []);

  const stats = [
    {
      label: "Aujourd'hui",
      value: views.today,
      icon: Eye,
      iconBg: "bg-red-50 text-red-600",
      description: "Visites du jour en direct",
    },
    {
      label: "Hier",
      value: views.yesterday,
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
      description: "Total de la journée d'hier",
    },
    {
      label: "30 derniers jours",
      value: views.last30Days,
      icon: Calendar,
      iconBg: "bg-blue-50 text-blue-600",
      description: "Cumul du dernier mois glissant",
    },
    {
      label: "Total",
      value: views.overall,
      icon: Globe,
      iconBg: "bg-neutral-900 text-white",
      description: "Toutes les visites enregistrées",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-50 text-neutral-900 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">
              Administration
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1">
              Tableau de bord
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Vue d'ensemble des visites du site MIRAAA.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchViews(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-100 transition shadow-sm"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map(({ label, value, icon: Icon, iconBg, description }) => (
            <div
              key={label}
              className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-red-200 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className={`h-11 w-11 rounded-xl ${iconBg} flex items-center justify-center mb-5`}>
                  <Icon size={20} />
                </div>
                <p className="text-sm font-medium text-neutral-500">{label}</p>
                <p className="text-3xl font-extrabold text-neutral-900 mt-1 tracking-tight">
                  {loading ? "—" : value.toLocaleString("fr-FR")}
                </p>
              </div>
              <p className="text-xs text-neutral-400 mt-4 pt-3 border-t border-neutral-100">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}