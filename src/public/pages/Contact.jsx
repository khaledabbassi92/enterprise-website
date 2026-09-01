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

  return (
    <main className="overflow-hidden bg-white text-[#171717]">

      {/* ======================================================
          HERO SECTION
      ====================================================== */}

      <section className="border-b border-[#e8e8e8] bg-white px-6 pb-20 pt-24 sm:px-10 lg:px-16 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-[1200px]">

          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
            <span className="h-px w-8 bg-red-600" />
            Service Client & Siège
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1] tracking-[-0.045em] text-[#171717] sm:text-6xl lg:text-[76px]">
            Échangons ensemble sur
            <span className="block text-[#bdbdbd]">
              vos projets de rénovation.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-7 text-[#6f6f6f] sm:text-lg">
            Une question technique, un besoin d'intervention rapide ou envie d'en savoir plus sur nos prestations ? 
            Nos équipes basées au siège vous répondent avec écoute et transparence.
          </p>

        </div>
      </section>

      {/* ======================================================
          CARDS SECTION
      ====================================================== */}

      <section className="px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1200px]">

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

            {/* Phone Card */}
            <div className="group flex flex-col justify-between border border-[#e2e2e2] bg-[#f8f8f8] p-8 transition-all duration-300 hover:border-red-600 sm:p-10">
              <div>
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white">
                  <Phone size={22} strokeWidth={1.5} />
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
                  Ligne directe
                </span>

                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                  Téléphone
                </h3>

                <p className="mt-4 text-xl font-semibold tracking-tight text-[#171717]">
                  {textData.phone}
                </p>
              </div>

              <div className="mt-10 flex items-center gap-2.5 border-t border-[#e2e2e2] pt-6 text-xs font-medium text-[#6f6f6f]">
                <Clock size={15} className="text-red-600" />
                <span>Lundi – Vendredi : 8h00 – 19h00</span>
              </div>
            </div>

            {/* Email Card */}
            <div className="group flex flex-col justify-between border border-[#e2e2e2] bg-[#f8f8f8] p-8 transition-all duration-300 hover:border-red-600 sm:p-10">
              <div>
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white">
                  <Mail size={22} strokeWidth={1.5} />
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
                  Échanges écrits
                </span>

                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                  Courrier électronique
                </h3>

                <p className="mt-4 text-lg font-semibold break-all text-[#171717]">
                  {textData.email}
                </p>
              </div>

              <div className="mt-10 flex items-center gap-2.5 border-t border-[#e2e2e2] pt-6 text-xs font-medium text-[#6f6f6f]">
                <ShieldCheck size={15} className="text-red-600" />
                <span>Réactivité garantie sous 24h ouvrées</span>
              </div>
            </div>

            {/* Address Card */}
            <div className="group flex flex-col justify-between border border-[#e2e2e2] bg-[#f8f8f8] p-8 transition-all duration-300 hover:border-red-600 sm:p-10">
              <div>
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white">
                  <MapPin size={22} strokeWidth={1.5} />
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
                  Implantation
                </span>

                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                  Siège social
                </h3>

                <p className="mt-4 text-base font-medium whitespace-pre-line leading-relaxed text-[#555555]">
                  {textData.address}
                </p>
              </div>

              <div className="mt-10 flex items-center gap-2.5 border-t border-[#e2e2e2] pt-6 text-xs font-medium text-[#6f6f6f]">
                <Building2 size={15} className="text-red-600" />
                <span>Bâtiment &amp; Bureaux administratifs</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          REASSURANCE BANNER
      ====================================================== */}

      <section className="border-t border-[#e8e8e8] bg-[#f8f8f8] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
              <span className="h-px w-8 bg-red-600" />
              Accompagnement de proximité
            </div>

            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Vous avez un chantier spécifique en tête ?
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f6f6f]">
              Qu'il s'agisse d'un ravalement de façade ou de travaux d'isolation thermique, notre équipe vous écoute et vous oriente vers les bonnes solutions techniques.
            </p>
          </div>

          {textData.phone && (
            <a
              href={`tel:${textData.phone.replace(/\s+/g, "")}`}
              className="group inline-flex w-fit shrink-0 items-center gap-3 bg-red-600 px-7 py-4 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
            >
              Appeler directement nos équipes

              <ArrowUpRight
                size={17}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          )}

        </div>
      </section>

    </main>
  );
}