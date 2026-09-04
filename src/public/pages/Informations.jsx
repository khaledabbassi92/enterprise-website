"use client";

import React, { useEffect } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Award, Users, CheckCircle2, ArrowUpRight, FileText } from "lucide-react";

/* ============================================================
    REVEAL COMPONENT
============================================================ */

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
    INFORMATIONS / À PROPOS PAGE
============================================================ */

export default function InfosPage() {
  /* Scroll directly to the specified section if hash is present in URL */
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const targetElement = document.getElementById(id);
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 150);
        }
      }
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return (
    <main className="overflow-x-hidden bg-white text-[#171717]">

      {/* ======================================================
          HERO & À PROPOS (#a-propos)
      ====================================================== */}
      <section id="a-propos" className="scroll-mt-24 border-b border-[#e8e8e8] bg-white px-5 pb-14 pt-16 sm:px-10 sm:pb-20 sm:pt-24 lg:px-16 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-red-600">
              <span className="h-px w-6 sm:w-8 bg-red-600" />
              À propos de nous
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-4 sm:mt-6 max-w-4xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#171717] sm:text-5xl sm:leading-[1] lg:text-[76px]">
              L'exigence du travail bien fait,
              <span className="block text-[#bdbdbd]">
                au service de vos bâtiments.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-5 sm:mt-8 max-w-2xl text-sm sm:text-lg leading-6 sm:leading-7 text-[#6f6f6f]">
              Spécialistes du ravalement de façade et de l'isolation thermique, nous mettons notre savoir-faire 
              technique au service de la durabilité et de l'esthétique de votre patrimoine immobilier.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ======================================================
          ENGAGEMENTS & GARANTIES (#garanties)
      ====================================================== */}
      <section id="garanties" className="scroll-mt-24 px-5 py-14 sm:px-10 sm:py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <div className="mb-10 sm:mb-14">
              <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-red-600">
                <span className="h-px w-6 sm:w-8 bg-red-600" />
                Nos garanties
              </div>
              <h2 className="mt-3 sm:mt-5 text-2xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] sm:leading-[1.05] tracking-[-0.035em] sm:tracking-[-0.04em]">
                Pourquoi nos clients
                <span className="block text-[#bdbdbd]">nous font confiance.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:gap-8 lg:grid-cols-3">
            
            <Reveal delay={0.04}>
              <div className="group border border-[#e2e2e2] bg-[#f8f8f8] p-6 sm:p-8 lg:p-10 transition hover:border-red-600">
                <div className="mb-5 sm:mb-6 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5">
                  <ShieldCheck size={22} strokeWidth={1.5} className="sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">Garantie Décennale</h3>
                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-6 text-[#6f6f6f]">
                  Tous nos chantiers sont couverts par une <strong className="text-[#171717] font-semibold">assurance décennale officielle</strong>, vous offrant une protection et une sécurité juridique indispensables sur 10 ans.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="group border border-[#e2e2e2] bg-[#f8f8f8] p-6 sm:p-8 lg:p-10 transition hover:border-red-600">
                <div className="mb-5 sm:mb-6 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5">
                  <Award size={22} strokeWidth={1.5} className="sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">Certifications &amp; Expérience</h3>
                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-6 text-[#6f6f6f]">
                  Forts d'une solide expérience de terrain et de <strong className="text-[#171717] font-semibold">certifications techniques reconnues</strong>, nous maîtrisons chaque pathologie de bâtiment.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="group border border-[#e2e2e2] bg-[#f8f8f8] p-6 sm:p-8 lg:p-10 transition hover:border-red-600">
                <div className="mb-5 sm:mb-6 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5">
                  <Users size={22} strokeWidth={1.5} className="sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">Équipe Qualifiée</h3>
                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-6 text-[#6f6f6f]">
                  Nos techniciens sont <strong className="text-[#171717] font-semibold">formés en continu</strong> aux exigences strictes des normes de sécurité et aux innovations en <strong className="text-[#171717] font-semibold">isolation thermique (ITE)</strong>.
                </p>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ======================================================
          INFORMATIONS RÉGLEMENTAIRES (#reglementaire)
      ====================================================== */}
      <section id="reglementaire" className="scroll-mt-24 border-y border-[#e8e8e8] bg-[#f8f8f8] px-5 py-14 sm:px-10 sm:py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-red-600">
                  <span className="h-px w-6 sm:w-8 bg-red-600" />
                  Transparence administrative
                </div>
                <h2 className="mt-3 sm:mt-5 text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-[-0.035em]">
                  Informations réglementaires
                </h2>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-6 text-[#6f6f6f]">
                  Parce que la confiance passe aussi par le respect du cadre légal, voici les informations clés de notre structure :
                </p>

                <div className="mt-6 sm:mt-8 space-y-3.5 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="mt-0.5 text-red-600 shrink-0 sm:h-[18px] sm:w-[18px]" />
                    <span className="text-xs sm:text-sm text-[#555555]"><strong>Statut :</strong> Entreprise de bâtiment spécialisée en rénovation extérieure.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="mt-0.5 text-red-600 shrink-0 sm:h-[18px] sm:w-[18px]" />
                    <span className="text-xs sm:text-sm text-[#555555]"><strong>Zone d'intervention :</strong> Île-de-France et environs.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="mt-0.5 text-red-600 shrink-0 sm:h-[18px] sm:w-[18px]" />
                    <span className="text-xs sm:text-sm text-[#555555]"><strong>Assurance :</strong> Couverture responsabilité civile et décennale à jour.</span>
                  </div>
                </div>
              </div>

              <div className="border border-[#dcdcdc] bg-white p-6 sm:p-8 lg:p-10">
                <div className="flex items-center gap-3 text-red-600 mb-4 sm:mb-6">
                  <FileText size={24} strokeWidth={1.5} className="sm:h-[26px] sm:w-[26px]" />
                  <h3 className="text-lg sm:text-xl font-semibold text-[#171717]">Besoin d'un document spécifique ?</h3>
                </div>
                <p className="text-xs sm:text-sm leading-6 text-[#6f6f6f]">
                  Vous avez besoin de notre attestation d'assurance décennale ou de notre KBIS pour votre dossier de copropriété ou vos démarches ? Contactez notre secrétariat.
                </p>
                <a
                  href="/contact"
                  className="mt-6 sm:mt-8 inline-flex items-center justify-center w-full sm:w-auto gap-3 bg-red-600 px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Nous contacter
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}