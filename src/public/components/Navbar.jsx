"use client";

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Phone,
  ArrowUpRight,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const API_URL = "";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadCompanyInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/api/text`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const result = await response.json();
        const data = result?.data || result;

        if (
          !cancelled &&
          typeof data?.phone === "string" &&
          data.phone.trim()
        ) {
          setPhone(data.phone.trim());
        }
      } catch (error) {
        console.error("Impossible de charger le téléphone:", error);
      }
    };

    loadCompanyInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  const phoneHref = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : null;

  /* Exact public routes matching App.jsx */
  const links = [
    { label: "Accueil", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Réalisations", href: "/realisations" },
    { label: "À propos", href: "/informations" },
    { label: "Avis Clients", href: "/reviews" },
    { label: "Contact", href: "/contact" },
  ];

  /* Smoothly navigate to /contact and scroll top */
  const handleDevisGratuitClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    navigate("/contact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Red Accent */}
      <div className="h-[4px] bg-red-700" />

      <div className="border-b border-gray-200/80 bg-white/98 shadow-[0_8px_30px_rgba(0,0,0,0.07)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10">
          <div className="flex h-[92px] items-center justify-between">
            
            {/* BRAND: AAA centered on top of MIRA (Same font size) */}
            <Link
              to="/"
              onClick={handleLinkClick}
              className="group flex shrink-0 items-center"
            >
              <div className="flex flex-col items-center select-none leading-none">
                {/* AAA on top */}
                <span className="text-[20px] sm:text-[23px] font-black text-center text-red-700 tracking-tight leading-none">
                  AAA
                </span>
                {/* MIRA on bottom */}
                <span className="text-[20px] sm:text-[23px] font-black text-center text-gray-950 tracking-tight leading-none transition-colors duration-200 group-hover:text-red-700">
                  MIRA
                </span>

                <div className="mt-[5px] flex items-center gap-1.5">
                  <span className="h-[2px] w-4 rounded-full bg-red-700" />
                  <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    Ravalement & ITE
                  </span>
                </div>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION (Links to all public routes) */}
            <nav className="ml-auto mr-10 hidden items-center lg:flex">
              <div className="flex items-center">
                {links.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={handleLinkClick}
                      className="group relative px-[16px] py-4"
                    >
                      <span
                        className={`text-[13px] font-semibold transition-colors duration-200 ${
                          isActive
                            ? "text-gray-950"
                            : "text-gray-600 group-hover:text-red-700"
                        }`}
                      >
                        {link.label}
                      </span>
                      <span
                        className={`absolute bottom-0 left-[16px] right-[16px] h-[2px] origin-left rounded-full bg-red-700 transition-transform duration-300 ${
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* DESKTOP ACTIONS */}
            <div className="hidden items-center gap-4 lg:flex">
              {/* PHONE (Only rendered if available from server) */}
              {phone && phoneHref && (
                <a
                  href={phoneHref}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-red-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <Phone
                      size={16}
                      strokeWidth={2}
                      className="text-red-700 transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                  <div className="leading-none">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      Appelez-nous
                    </span>
                    <span className="mt-[6px] block text-[13px] font-bold tracking-wide text-red-700 transition-colors duration-200 group-hover:text-red-800">
                      {phone}
                    </span>
                  </div>
                </a>
              )}

              {/* DIVIDER */}
              {phone && <div className="mx-1 h-10 w-px bg-gray-200" />}

              {/* CTA: DEVIS GRATUIT -> Takes directly to /contact */}
              <Link
                to="/contact"
                onClick={handleDevisGratuitClick}
                className="group flex items-center gap-3 rounded-xl bg-red-700 px-5 py-3.5 text-white shadow-[0_7px_20px_rgba(185,28,28,0.2)] transition-all duration-300 hover:bg-red-800 hover:shadow-[0_10px_28px_rgba(185,28,28,0.3)]"
              >
                <span className="text-[13px] font-bold tracking-wide">
                  Devis gratuit
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15 transition-colors group-hover:bg-white/25">
                  <ArrowUpRight
                    size={14}
                    strokeWidth={2.5}
                    className="transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
                  />
                </span>
              </Link>
            </div>

            {/* MOBILE CONTROLS */}
            <div className="flex items-center gap-3 lg:hidden">
              {/* MOBILE PHONE (Only rendered if available from server) */}
              {phone && phoneHref && (
                <a
                  href={phoneHref}
                  aria-label={`Appeler AAA MIRA au ${phone}`}
                  className="group flex items-center gap-2 text-red-700 transition-colors hover:text-red-800"
                >
                  <Phone
                    size={17}
                    strokeWidth={2}
                    className="shrink-0 text-red-700"
                  />
                  <span className="whitespace-nowrap text-[11px] font-bold tracking-wide text-red-700 sm:text-[13px]">
                    {phone}
                  </span>
                </a>
              )}

              {/* MENU TOGGLE */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isOpen}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 transition-all duration-200 hover:bg-red-50 hover:shadow-sm"
              >
                {isOpen ? (
                  <X size={20} strokeWidth={2.2} />
                ) : (
                  <Menu size={20} strokeWidth={2.2} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out lg:hidden ${
            isOpen
              ? "max-h-[650px] opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-100 bg-white">
            <div className="mx-auto max-w-[1500px] px-5 py-5 sm:px-8">
              {/* MOBILE NAVIGATION LINKS */}
              <nav className="flex flex-col">
                {links.map((link, index) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={handleLinkClick}
                      className="group flex items-center justify-between border-b border-gray-100 py-[17px]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-5 text-[9px] font-bold tracking-widest text-gray-300">
                          0{index + 1}
                        </span>
                        <span
                          className={`text-[15px] font-semibold transition-colors ${
                            isActive
                              ? "text-red-700"
                              : "text-gray-800 group-hover:text-red-700"
                          }`}
                        >
                          {link.label}
                        </span>
                      </div>
                      <ChevronRight
                        size={17}
                        className="text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-red-700"
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* MOBILE CTA: DEVIS GRATUIT -> /contact */}
              <Link
                to="/contact"
                onClick={handleDevisGratuitClick}
                className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 p-4 text-white shadow-sm transition-all duration-200 hover:bg-red-800 hover:shadow-md"
              >
                <span className="text-sm font-bold">
                  Demander un devis
                </span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              {/* MOBILE FOOTER SIGNATURE */}
              <div className="mt-6 flex flex-col gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  AAA MIRA · Ravalement & ITE
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-red-700">
                  Qualité · Durabilité
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}