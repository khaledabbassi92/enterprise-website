"use client";

import React, { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
} from "lucide-react";

const API_URL = "/api/text";

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
| ADMIN AUTH HELPERS
|--------------------------------------------------------------------------
|
| The masterKey returned by /api/admin/login
| is stored as admin_token.
|
| GET is public.
| PUT uses this Bearer token.
|--------------------------------------------------------------------------
*/

function getAdminHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token")
      : null;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function clearAdminSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function CompanyInfoEditor() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD COMPANY INFORMATION (PUBLIC REQUEST)
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        const result =
          await parseJsonResponse(response);

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Impossible de récupérer les informations."
          );
        }

        setPhone(
          result.data?.phone || ""
        );

        setEmail(
          result.data?.email || ""
        );

        setAddress(
          result.data?.address || ""
        );
      } catch (err) {
        console.error(
          "Company info load error:",
          err
        );

        setError(
          err.message ||
            "Impossible de charger les informations de l'entreprise."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCompanyInfo();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SAVE COMPANY INFORMATION (PROTECTED REQUEST)
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      setError("");
      setSaved(false);

      const token =
        localStorage.getItem("admin_token");

      if (!token) {
        setError(
          "Session administrateur introuvable. Veuillez vous reconnecter."
        );
        return;
      }

      setSaving(true);

      const response = await fetch(
        API_URL,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify({
            phone,
            email,
            address,
          }),
        }
      );

      const result =
        await parseJsonResponse(response);

      /*
      | Invalid master key / token
      */
      if (response.status === 401) {
        clearAdminSession();
        throw new Error(
          "Session administrateur invalide. Veuillez vous reconnecter."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Impossible de mettre à jour les informations."
        );
      }

      setPhone(
        result.data?.phone || ""
      );

      setEmail(
        result.data?.email || ""
      );

      setAddress(
        result.data?.address || ""
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error(
        "Company info save error:",
        err
      );

      setError(
        err.message ||
          "Impossible de mettre à jour les informations."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] px-6 py-8 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-sm text-[#888888]">
              Chargement des informations...
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#f6f6f6] px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600">
            <span className="h-px w-8 bg-red-600" />
            Contenu du site
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#171717] sm:text-4xl">
            Informations de l'entreprise
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#707070]">
            Modifiez les coordonnées qui apparaissent sur le site internet.
          </p>
        </div>

        {/* EDITOR */}
        <div className="overflow-hidden rounded-2xl border border-[#e2e2e2] bg-white shadow-sm">

          {/* SECTION HEADER */}
          <div className="border-b border-[#e8e8e8] px-6 py-5 sm:px-8">
            <h2 className="text-base font-semibold text-[#171717]">
              Coordonnées
            </h2>

            <p className="mt-1 text-xs text-[#888888]">
              Ces informations seront utilisées dans les différentes zones de contact du site.
            </p>
          </div>

          {/* FIELDS */}
          <div className="space-y-6 p-6 sm:p-8">

            {/* PHONE */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-[#252525]"
              >
                Téléphone
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  strokeWidth={1.7}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
                />

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="01 84 20 05 17"
                  className="h-13 w-full rounded-xl border border-[#dddddd] bg-white pl-11 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-[#aaaaaa] focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              <p className="mt-2 text-xs text-[#888888]">
                Numéro affiché sur le site et utilisé pour les liens d'appel.
              </p>
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#252525]"
              >
                Adresse e-mail
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  strokeWidth={1.7}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="contact@entreprise.fr"
                  className="h-13 w-full rounded-xl border border-[#dddddd] bg-white pl-11 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-[#aaaaaa] focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              <p className="mt-2 text-xs text-[#888888]">
                Adresse utilisée pour les demandes de contact.
              </p>
            </div>

            {/* ADDRESS */}
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-semibold text-[#252525]"
              >
                Adresse
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  strokeWidth={1.7}
                  className="pointer-events-none absolute left-4 top-4 text-[#999999]"
                />

                <textarea
                  id="address"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="12 rue Exemple, 75000 Paris"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#dddddd] bg-white py-3 pl-11 pr-4 text-sm leading-6 text-[#171717] outline-none transition placeholder:text-[#aaaaaa] focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              <p className="mt-2 text-xs text-[#888888]">
                Adresse physique affichée dans les informations de contact.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col gap-4 border-t border-[#e8e8e8] bg-[#fafafa] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <div className="min-h-5">
              {saved && (
                <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                  <CheckCircle2 size={16} />
                  Modifications enregistrées
                </div>
              )}

              {error && (
                <div className="text-xs font-medium text-red-600">
                  {error}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              <Save size={16} />
              {saving
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="mt-6 rounded-2xl border border-[#e2e2e2] bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
              Aperçu
            </div>

            <h2 className="mt-2 text-lg font-semibold text-[#171717]">
              Coordonnées affichées
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            {/* PHONE */}
            <div className="rounded-xl border border-[#eeeeee] bg-[#fafafa] p-4">
              <Phone
                size={18}
                className="text-red-600"
              />

              <div className="mt-3 text-xs text-[#888888]">
                Téléphone
              </div>

              <div className="mt-1 break-words text-sm font-semibold text-[#171717]">
                {phone || "—"}
              </div>
            </div>

            {/* EMAIL */}
            <div className="rounded-xl border border-[#eeeeee] bg-[#fafafa] p-4">
              <Mail
                size={18}
                className="text-red-600"
              />

              <div className="mt-3 text-xs text-[#888888]">
                E-mail
              </div>

              <div className="mt-1 break-words text-sm font-semibold text-[#171717]">
                {email || "—"}
              </div>
            </div>

            {/* ADDRESS */}
            <div className="rounded-xl border border-[#eeeeee] bg-[#fafafa] p-4">
              <MapPin
                size={18}
                className="text-red-600"
              />

              <div className="mt-3 text-xs text-[#888888]">
                Adresse
              </div>

              <div className="mt-1 break-words text-sm font-semibold text-[#171717]">
                {address || "—"}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}