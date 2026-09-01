"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  ArrowUpRight,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
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

  /* Prestations & Services with #id anchors */
  const services = [
    { label: "Ravalement de façade", href: "/services#ravalement-facade" },
    { label: "Isolation thermique (ITE)", href: "/services#isolation-thermique" },
    { label: "Enduits & finitions", href: "/services#enduits-finitions" },
    { label: "Réparation & traitement", href: "/services#reparation-supports" },
    { label: "Notre méthode & processus", href: "/services#methode" },
  ];

  /* Informations sections with #id anchors */
  const informations = [
    { label: "À propos de notre équipe", href: "/informations#a-propos" },
    { label: "Garanties & assurance décennale", href: "/informations#garanties" },
    { label: "Informations réglementaires", href: "/informations#reglementaire" },
    { label: "Demander un devis gratuit", href: "/contact" },
  ];

  return (
    <footer className="relative bg-white text-zinc-600 border-t border-zinc-200">
      
      {/* Top Accent Line */}
      <div className="w-full h-[3px] bg-red-600" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12">

        {/* TOP CTA STRIP */}
        <div className="py-10 border-b border-zinc-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">Travaux sous Garantie Décennale</p>
              <p className="text-xs text-zinc-400">Entreprise certifiée & conformité aux normes BTP</p>
            </div>
          </div>

          <a
            href="/contact"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200"
          >
            Obtenir un devis gratuit
            <ArrowUpRight size={15} />
          </a>
        </div>

        {/* MAIN FOOTER CONTENT */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">

          {/* 1. BRAND BLOCK: AAA centered on top of MIRA with identical font size */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <a href="/" className="inline-block group">
                <div className="inline-flex flex-col items-center select-none">
                  {/* TOP: AAA (Same size, centered) */}
                  <span className="text-[32px] font-black text-center text-red-600 tracking-tight leading-none">
                    AAA
                  </span>
                  {/* BOTTOM: MIRA (Same size, centered) */}
                  <span className="text-[32px] font-black text-center text-zinc-950 tracking-tight leading-none group-hover:text-red-600 transition-colors">
                    MIRA
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="w-5 h-[2px] bg-red-600" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-400">
                    Bâtiment & Rénovation
                  </span>
                </div>
              </a>

              <p className="mt-6 text-sm leading-relaxed text-zinc-500 max-w-sm">
                Spécialistes en ravalement de façades, isolation thermique extérieure (ITE), 
                enduits décoratifs et rénovation générale du bâti.
              </p>
            </div>

            {/* Address */}
            {textData.address && (
              <div className="mt-8 pt-6 border-t border-zinc-100 flex items-start gap-3">
                <MapPin size={16} className="text-red-600 shrink-0 mt-1" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                    Siège social
                  </span>
                  <p className="text-xs leading-relaxed text-zinc-600 whitespace-pre-line">
                    {textData.address}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. SERVICES SECTION */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-900">
                Nos Prestations
              </h3>
            </div>

            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.href}>
                  <a
                    href={service.href}
                    className="group inline-flex items-center text-sm text-zinc-500 hover:text-red-600 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-red-600 transition-colors mr-2.5 shrink-0" />
                    <span>{service.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. INFORMATIONS SECTION */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-900">
                Informations
              </h3>
            </div>

            <ul className="space-y-3">
              {informations.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group inline-flex items-center text-sm text-zinc-500 hover:text-red-600 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-red-600 transition-colors mr-2.5 shrink-0" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. CONTACT & REACH US */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-900">
                Contact Direct
              </h3>
            </div>

            <div className="space-y-3">
              {/* Phone Card */}
              {textData.phone && (
                <a
                  href={`tel:${textData.phone.replace(/\s+/g, "")}`}
                  className="group flex items-center gap-3.5 p-3.5 bg-zinc-50 hover:bg-red-50/50 border border-zinc-200/80 hover:border-red-600/30 transition-all"
                >
                  <div className="w-8 h-8 bg-white border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 shadow-2xs">
                    <Phone size={14} />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider font-semibold text-zinc-400">
                      Appelez-nous
                    </span>
                    <span className="block text-xs font-bold text-zinc-900 group-hover:text-red-600 transition-colors">
                      {textData.phone}
                    </span>
                  </div>
                </a>
              )}

              {/* Email Card */}
              {textData.email && (
                <a
                  href={`mailto:${textData.email}`}
                  className="group flex items-center gap-3.5 p-3.5 bg-zinc-50 hover:bg-red-50/50 border border-zinc-200/80 hover:border-red-600/30 transition-all"
                >
                  <div className="w-8 h-8 bg-white border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 shadow-2xs">
                    <Mail size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] uppercase tracking-wider font-semibold text-zinc-400">
                      Email
                    </span>
                    <span className="block text-xs font-bold text-zinc-900 group-hover:text-red-600 transition-colors truncate">
                      {textData.email}
                    </span>
                  </div>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="py-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© 2026 AAA MIRA. Tous droits réservés.</span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span>RCS Créteil 928 791 672</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="/mentions-legales" className="hover:text-red-600 transition-colors">
              Mentions légales
            </a>
            <a href="/confidentialite" className="hover:text-red-600 transition-colors">
              Confidentialité
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}