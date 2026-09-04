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

  const links = [
    { label: "Accueil", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Réalisations", href: "/realisations" },
    { label: "À propos", href: "/informations" },
    { label: "Avis Clients", href: "/reviews" },
    { label: "Contact", href: "/contact" },
  ];

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
        <div className="mx-auto max-w-[1500px] px-3 sm:px-6 lg:px-10">
          <div className="flex h-[74px] items-center justify-between sm:h-[88px] lg:h-[92px]">

            {/* BRAND */}
            <Link
              to="/"
              onClick={handleLinkClick}
              className="group flex shrink-0 items-center"
            >
              <div className="flex flex-col items-center select-none leading-none">
                <span className="text-[17px] sm:text-[23px] font-black text-center text-red-700 tracking-tight leading-none">
                  AAA
                </span>

                <span className="text-[17px] sm:text-[23px] font-black text-center text-gray-950 tracking-tight leading-none transition-colors duration-200 group-hover:text-red-700">
                  MIRA
                </span>

                <div className="mt-[3px] flex items-center gap-1 sm:mt-[5px] sm:gap-1.5">
                  <span className="h-[2px] w-3 sm:w-4 rounded-full bg-red-700" />

                  <span className="text-[6px] sm:text-[8px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-gray-500">
                    Ravalement & ITE
                  </span>
                </div>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}
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

              {phone && <div className="mx-1 h-10 w-px bg-gray-200" />}

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
            <div className="flex items-center gap-2 sm:gap-3 lg:hidden">

              {/* PHONE BUTTON (Now clearly displays the phone number on mobile) */}
              {phone && phoneHref && (
                <a
                  href={phoneHref}
                  aria-label={`Appeler au ${phone}`}
                  className="group flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-red-700 transition-all active:scale-95 border border-red-100 sm:px-3 sm:py-2"
                >
                  <Phone
                    size={14}
                    strokeWidth={2.2}
                    className="shrink-0 text-red-700"
                  />

                  {/* FIXED: Removed `hidden sm:inline`, now always visible and neatly sized */}
                  <span className="text-[11px] sm:text-[13px] font-bold tracking-tight text-red-700 whitespace-nowrap">
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 transition-all duration-200 hover:bg-red-50 hover:shadow-sm sm:h-10 sm:w-10 active:scale-95"
              >
                {isOpen ? (
                  <X size={19} strokeWidth={2.2} />
                ) : (
                  <Menu size={19} strokeWidth={2.2} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out lg:hidden ${
            isOpen
              ? "max-h-[720px] opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-100 bg-white">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-8 sm:py-5">

              {/* DIRECT CALL CARD IN MOBILE MENU */}
              {phone && phoneHref && (
                <a
                  href={phoneHref}
                  className="mb-4 flex items-center justify-between rounded-xl bg-red-50 p-3.5 border border-red-100 text-red-700 transition active:bg-red-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
                      <Phone size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                        Appelez-nous directement
                      </div>
                      <div className="text-sm font-bold text-gray-950">
                        {phone}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-red-500" />
                </a>
              )}

              <nav className="flex flex-col">
                {links.map((link, index) => {
                  const isActive = location.pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={handleLinkClick}
                      className="group flex items-center justify-between border-b border-gray-100 py-[15px] sm:py-[17px]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-5 text-[9px] font-bold tracking-widest text-gray-300">
                          0{index + 1}
                        </span>

                        <span
                          className={`text-[14px] sm:text-[15px] font-semibold transition-colors ${
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

              <Link
                to="/contact"
                onClick={handleDevisGratuitClick}
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 p-3.5 text-white shadow-sm transition-all duration-200 hover:bg-red-800 hover:shadow-md sm:mt-5 sm:p-4"
              >
                <span className="text-sm font-bold">
                  Demander un devis
                </span>

                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:mt-6 sm:pt-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                  AAA MIRA · Ravalement & ITE
                </span>

                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] text-red-700">
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