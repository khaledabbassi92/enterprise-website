import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLogin({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !password.trim()) {
      setErrorMessage("Veuillez renseigner votre identifiant et votre mot de passe.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        // Store the master key returned by the backend
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", data.name || name.trim());

        if (onLoginSuccess) {
          onLoginSuccess(data.token, data.name);
        }

        // Redirect to admin dashboard
        navigate("/admin/dashboard", { replace: true });
      } else {
        setErrorMessage(data.message || "Identifiants administrateur incorrects.");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorMessage("Impossible de contacter le serveur Express API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
            <Lock size={26} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-1.5 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Espace Administrateur
          </h1>
          <p className="text-sm text-neutral-400">
            Identifiez-vous pour gérer les avis et les contenus.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Identifiant
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-3.5 text-neutral-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="ex: admin"
                disabled={isLoading}
                autoFocus
                className="w-full pl-11 pr-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-neutral-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition text-sm"
              />
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !name.trim() || !password.trim()}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/20 text-sm cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <span>Connexion</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Authentification sécurisée par masterKey</span>
        </div>
      </div>
    </div>
  );
}