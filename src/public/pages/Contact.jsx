"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, Building2, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function ContactPage() {
  const [textData, setTextData] = useState({
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    const fetchTextData = async () => {
      try {
        const response = await fetch("/api/text");

        if (!response.ok) {
          throw new Error("Failed to fetch text data");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setTextData({
            phone: result.data.phone || "",
            email: result.data.email || "",
            address: result.data.address || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch company information:", error);
      }
    };

    fetchTextData();
  }, []);

  const phoneHref = textData.phone ? `tel:${textData.phone.replace(/[^\d+]/g, "")}` : null;
  const mailtoHref = textData.email ? `mailto:${textData.email.trim()}` : null;

  return (
    <main className="overflow-x-hidden bg-white text-[#171717]">

      {/* ======================================================
          HERO SECTION
      ====================================================== */}

      <section className="border-b border-[#e8e8e8] bg-white px-5 pb-14 pt-16 sm:px-10 sm:pb-20 sm:pt-24 lg:px-16 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-[1200px]">

          <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-red-600">
            <span className="h-px w-6 sm:w-8 bg-red-600" />
            Service Client &amp; Siège
          </div>

          <h1 className="mt-4 sm:mt-6 max-w-4xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#171717] sm:text-5xl sm:leading-[1] lg:text-[76px]">
            Échangons ensemble sur
            <span className="block text-[#bdbdbd]">
              vos projets de rénovation.
            </span>
          </h1>

          <p className="mt-5 sm:mt-8 max-w-2xl text-sm sm:text-lg leading-6 sm:leading-7 text-[#6f6f6f]">
            Une question technique, un besoin d'intervention rapide ou envie d'en savoir plus sur nos prestations ? 
            Nos équipes basées au siège vous répondent avec écoute et transparence.
          </p>

        </div>
      </section>

      {/* ======================================================
          CARDS SECTION
      ====================================================== */}

      <section className="px-5 py-14 sm:px-10 sm:py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1200px]">

          <div className="grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-3">

            {/* Phone Card */}
            <div className="group flex flex-col justify-between border border-[#e2e2e2] bg-[#f8f8f8] p-6 transition-all duration-300 hover:border-red-600 sm:p-10">
              <div>
                <div className="mb-6 sm:mb-8 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white">
                  <Phone size={20} strokeWidth={1.5} className="sm:h-[22px] sm:w-[22px]" />
                </div>

                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-red-600">
                  Ligne directe
                </span>

                <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold tracking-[-0.025em]">
                  Téléphone
                </h3>

                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="mt-3 sm:mt-4 block text-lg sm:text-xl font-semibold tracking-tight text-[#171717] transition-colors hover:text-red-600"
                  >
                    {textData.phone}
                  </a>
                ) : (
                  <p className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold tracking-tight text-[#171717]">
                    {textData.phone || "—"}
                  </p>
                )}
              </div>

              <div className="mt-6 sm:mt-10 flex items-center gap-2.5 border-t border-[#e2e2e2] pt-4 sm:pt-6 text-xs font-medium text-[#6f6f6f]">
                <Clock size={15} className="shrink-0 text-red-600" />
                <span>Lundi – Vendredi : 8h00 – 19h00</span>
              </div>
            </div>

            {/* Email Card */}
            <div className="group flex flex-col justify-between border border-[#e2e2e2] bg-[#f8f8f8] p-6 transition-all duration-300 hover:border-red-600 sm:p-10">
              <div>
                <div className="mb-6 sm:mb-8 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white">
                  <Mail size={20} strokeWidth={1.5} className="sm:h-[22px] sm:w-[22px]" />
                </div>

                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-red-600">
                  Échanges écrits
                </span>

                <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold tracking-[-0.025em]">
                  Courrier électronique
                </h3>

                {mailtoHref ? (
                  <a
                    href={mailtoHref}
                    className="mt-3 sm:mt-4 block text-base sm:text-lg font-semibold break-all text-[#171717] transition-colors hover:text-red-600"
                  >
                    {textData.email}
                  </a>
                ) : (
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold break-all text-[#171717]">
                    {textData.email || "—"}
                  </p>
                )}
              </div>

              <div className="mt-6 sm:mt-10 flex items-center gap-2.5 border-t border-[#e2e2e2] pt-4 sm:pt-6 text-xs font-medium text-[#6f6f6f]">
                <ShieldCheck size={15} className="shrink-0 text-red-600" />
                <span>Réactivité garantie sous 24h ouvrées</span>
              </div>
            </div>

            {/* Address Card */}
            <div className="group flex flex-col justify-between border border-[#e2e2e2] bg-[#f8f8f8] p-6 transition-all duration-300 hover:border-red-600 sm:p-10">
              <div>
                <div className="mb-6 sm:mb-8 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white">
                  <MapPin size={20} strokeWidth={1.5} className="sm:h-[22px] sm:w-[22px]" />
                </div>

                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-red-600">
                  Implantation
                </span>

                <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold tracking-[-0.025em]">
                  Siège social
                </h3>

                <p className="mt-3 sm:mt-4 text-sm sm:text-base font-medium whitespace-pre-line leading-relaxed text-[#555555]">
                  {textData.address || "—"}
                </p>
              </div>

              <div className="mt-6 sm:mt-10 flex items-center gap-2.5 border-t border-[#e2e2e2] pt-4 sm:pt-6 text-xs font-medium text-[#6f6f6f]">
                <Building2 size={15} className="shrink-0 text-red-600" />
                <span>Bâtiment &amp; Bureaux administratifs</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          REASSURANCE BANNER
      ====================================================== */}

      <section className="border-t border-[#e8e8e8] bg-[#f8f8f8] px-5 py-14 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-red-600">
              <span className="h-px w-6 sm:w-8 bg-red-600" />
              Accompagnement de proximité
            </div>

            <h2 className="mt-3 sm:mt-4 max-w-2xl text-2xl font-semibold tracking-[-0.03em] sm:text-3xl lg:text-4xl">
              Vous avez un chantier spécifique en tête ?
            </h2>

            <p className="mt-2.5 sm:mt-3 max-w-xl text-xs sm:text-sm leading-6 text-[#6f6f6f]">
              Qu'il s'agisse d'un ravalement de façade ou de travaux d'isolation thermique, notre équipe vous écoute et vous oriente vers les bonnes solutions techniques.
            </p>
          </div>

          {phoneHref && (
            <a
              href={phoneHref}
              className="group inline-flex w-full sm:w-fit justify-center shrink-0 items-center gap-3 bg-red-600 px-6 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
            >
              Appeler directement nos équipes

              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          )}

        </div>
      </section>

    </main>
  );
}