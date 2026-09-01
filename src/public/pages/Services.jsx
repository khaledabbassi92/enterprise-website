"use client";

import React, { useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Layers3,
  Hammer,
  Wrench,
  ThermometerSun,
  Paintbrush,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

/* ============================================================
   SERVICES DATA
============================================================ */

const services = [
  {
    id: "ravalement-facade",
    icon: Building2,
    title: "Ravalement de façade",
    intro:
      "Redonnez de l'éclat à votre immeuble tout en protégeant durablement sa structure contre les intempéries.",
    description:
      "Notre intervention commence par un nettoyage minutieux et un repérage des fragilités. Nous traitons les fissures et appliquons des revêtements de qualité supérieure pour une façade saine, esthétique et durable.",
    points: [
      "Lavage haute pression et décrassage en profondeur",
      "Traitement fongicide et anti-mousse",
      "Reprise des fissures et micro-fissures",
      "Application de peintures et enduits de protection",
    ],
  },
  {
    id: "isolation-thermique",
    icon: Layers3,
    title: "Isolation thermique par l'extérieur (ITE)",
    intro:
      "Réduisez vos factures d'énergie et gagnez en confort thermique toute l'année en enveloppant votre bâtiment.",
    description:
      "L'ITE supprime les ponts thermiques sans réduire votre espace de vie intérieur. C'est la solution idéale pour allier performance énergétique et modernisation esthétique de vos murs extérieurs.",
    points: [
      "Suppression radicale des ponts thermiques",
      "Baisse significative des dépenses de chauffage",
      "Valorisation immédiate de votre bien immobilier",
      "Zéro perte de surface habitable à l'intérieur",
    ],
  },
  {
    id: "enduits-finitions",
    icon: Hammer,
    title: "Enduits & finitions",
    intro:
      "Sublimez l'architecture de votre bâtiment avec un choix de finitions sur-mesure et soignées.",
    description:
      "Parce que le rendu visuel fait la fierté de votre propriété, nous maîtrisons l'art de l'enduit (gratté, taloché, écrasé) pour un aspect final parfaitement homogène et fidèle à vos attentes.",
    points: [
      "Large palette de teintes et de textures",
      "Enduits minéraux respirants",
      "Finitions soignées dans les moindres détails",
      "Harmonie parfaite avec le style local",
    ],
  },
  {
    id: "reparation-supports",
    icon: Wrench,
    title: "Réparation & traitement des supports",
    intro:
      "Stoppez les infiltrations et renforcez la maçonnerie avant qu'elle ne se dégrade davantage.",
    description:
      "Le temps et l'humidité fragilisent les murs. Nous consolidons les zones abîmées, traitons les armatures en acier apparentes et rebouchons les cavités pour garantir une base saine et pérenne.",
    points: [
      "Diagnostic précis des pathologies du mur",
      "Traitement des bétons épandus ou fissurés",
      "Reprise des solins et des éléments d'étanchéité",
      "Garantie d'une base structurelle solide",
    ],
  },
];

/* ============================================================
   PROCESS
============================================================ */

const process = [
  {
    number: "01",
    title: "Visite & Diagnostic",
    text: "Nous venons sur place évaluer l'état réel de vos murs, identifier vos besoins et répondre à vos questions en toute transparence.",
  },
  {
    number: "02",
    title: "Chiffrage & Conseils",
    text: "Vous recevez un devis clair et détaillé, sans frais cachés, avec des solutions techniques adaptées à votre budget.",
  },
  {
    number: "03",
    title: "Chantier & Propreté",
    text: "Nos équipes qualifiées interviennent avec rigueur, en protégeant vos abords et en maintenant un chantier propre au jour le jour.",
  },
  {
    number: "04",
    title: "Réception & Garanties",
    text: "Nous faisons le tour du travail accompli ensemble. Vous repartez l'esprit tranquille avec nos garanties travaux.",
  },
];

/* ============================================================
   BENEFITS
============================================================ */

const benefits = [
  {
    icon: ThermometerSun,
    title: "Confort thermique accru",
    text: "Profitez d'une température agréable en hiver comme en été grâce à des murs sains et bien isolés.",
  },
  {
    icon: Paintbrush,
    title: "Esthétique valorisée",
    text: "Offrez une seconde jeunesse à votre bien et démarquez-vous avec un aspect extérieur soigné et moderne.",
  },
  {
    icon: ShieldCheck,
    title: "Tranquillité sur le long terme",
    text: "Protégez votre investissement immobilier contre les agressions climatiques pour de nombreuses années.",
  },
];

/* ============================================================
   REVEAL ANIMATION
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
   MAIN PAGE
============================================================ */

export default function Services() {
  /* Scroll directly to the specified service section if hash is present */
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
    <main className="overflow-hidden bg-white text-[#171717]">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="border-b border-[#e8e8e8] bg-white px-6 pb-20 pt-24 sm:px-10 lg:px-16 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-[1200px]">

          <Reveal>
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
              <span className="h-px w-8 bg-red-600" />
              Nos services
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1] tracking-[-0.045em] text-[#171717] sm:text-6xl lg:text-[76px]">
              Protégez et embellissez
              <span className="block text-[#bdbdbd]">
                votre bâtiment au quotidien.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <p className="max-w-2xl text-base leading-7 text-[#6f6f6f] sm:text-lg">
                Des interventions professionnelles en ravalement, isolation
                par l'extérieur et réparation de façades. Nous donnons vie à
                vos projets de rénovation sans complications.
              </p>

              <a
                href="/contact"
                className="group inline-flex w-fit items-center gap-3 text-sm font-semibold text-red-600"
              >
                Nous contacter

                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>

            </div>
          </Reveal>

        </div>
      </section>

      {/* ======================================================
          INTRODUCTION
      ====================================================== */}

      <section className="px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.7fr_1.3fr]">

          <Reveal>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
              Notre engagement
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div>

              <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                Un travail rigoureux, du diagnostic aux finitions.
              </h2>

              <p className="mt-6 max-w-3xl text-[15px] leading-7 text-[#6f6f6f] sm:text-base">
                Chaque bâtiment a une histoire et des contraintes uniques :
                exposition aux intempéries, type de maçonnerie, âge de la
                construction. C'est pourquoi nous commençons toujours par
                analyser précisément vos murs avant de vous proposer la
                solution technique idéale.
              </p>

              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#6f6f6f] sm:text-base">
                Pas de mauvaises surprises : nous privilégions la transparence
                des conseils, le respect des délais annoncés et un chantier
                propre du début à la fin.
              </p>

            </div>
          </Reveal>

        </div>
      </section>

      {/* ======================================================
          SERVICES (#prestations)
      ====================================================== */}

      <section
        id="prestations"
        className="scroll-mt-24 border-y border-[#e8e8e8] bg-[#f8f8f8] px-6 py-20 sm:px-10 lg:px-16 lg:py-28"
      >
        <div className="mx-auto max-w-[1200px]">

          <Reveal>
            <div className="mb-14">

              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
                <span className="h-px w-8 bg-red-600" />
                Nos prestations
              </div>

              <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                Des solutions expertes
                <span className="block text-[#bdbdbd]">
                  adaptées à vos murs.
                </span>
              </h2>

            </div>
          </Reveal>

          <div className="border-t border-[#dcdcdc]">

            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <Reveal
                  key={service.id}
                  delay={index * 0.04}
                >
                  <article
                    id={service.id}
                    className="scroll-mt-24 group border-b border-[#dcdcdc] py-12 sm:py-14 lg:py-16"
                  >

                    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">

                      {/* TITLE */}

                      <div>

                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white">
                          <Icon
                            size={21}
                            strokeWidth={1.5}
                          />
                        </div>

                        <h3 className="max-w-md text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-3xl">
                          {service.title}
                        </h3>

                        <p className="mt-4 max-w-md text-sm leading-6 text-[#6f6f6f]">
                          {service.intro}
                        </p>

                      </div>

                      {/* DESCRIPTION */}

                      <div>

                        <p className="max-w-2xl text-[15px] leading-7 text-[#555555]">
                          {service.description}
                        </p>

                        <div className="mt-7 grid gap-3 sm:grid-cols-2">

                          {service.points.map((point) => (
                            <div
                              key={point}
                              className="flex items-start gap-2.5"
                            >
                              <CheckCircle2
                                size={15}
                                strokeWidth={1.8}
                                className="mt-0.5 shrink-0 text-red-600"
                              />

                              <span className="text-xs leading-5 text-[#555555]">
                                {point}
                              </span>
                            </div>
                          ))}

                        </div>

                        <a
                          href="/contact"
                          className="group/link mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-600"
                        >
                          Discuter de ce service

                          <ArrowRight
                            size={14}
                            className="transition-transform group-hover/link:translate-x-1"
                          />
                        </a>

                      </div>

                    </div>

                  </article>
                </Reveal>
              );
            })}

          </div>

        </div>
      </section>

      {/* ======================================================
          AVANTAGES (#avantages)
      ====================================================== */}

      <section id="avantages" className="scroll-mt-24 px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1200px]">

          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">

              <div>

                <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
                  <span className="h-px w-8 bg-red-600" />
                  Les avantages
                </div>

                <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                  Rénover vos murs,
                  <span className="block text-[#bdbdbd]">
                    c'est investir durablement.
                  </span>
                </h2>

              </div>

              <p className="max-w-2xl text-[15px] leading-7 text-[#6f6f6f]">
                Prendre soin de votre enveloppe extérieure va bien au-delà de
                l'esthétique : c'est l'assurance de préserver votre bien de
                l'usure du temps et d'y vivre mieux.
              </p>

            </div>
          </Reveal>

          <div className="mt-14 border-t border-[#dedede]">

            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <Reveal
                  key={benefit.title}
                  delay={index * 0.05}
                >
                  <div className="grid gap-5 border-b border-[#dedede] py-8 sm:grid-cols-[60px_260px_1fr] sm:items-center">

                    <Icon
                      size={25}
                      strokeWidth={1.5}
                      className="text-red-600"
                    />

                    <h3 className="text-lg font-semibold tracking-[-0.02em]">
                      {benefit.title}
                    </h3>

                    <p className="max-w-2xl text-sm leading-6 text-[#707070]">
                      {benefit.text}
                    </p>

                  </div>
                </Reveal>
              );
            })}

          </div>

        </div>
      </section>

      {/* ======================================================
          NOTRE MÉTHODE (#methode)
      ====================================================== */}

      <section id="methode" className="scroll-mt-24 border-y border-[#e8e8e8] bg-[#f8f8f8] px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1200px]">

          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
                  <span className="h-px w-8 bg-red-600" />
                  Notre méthode
                </div>

                <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                  Un accompagnement simple
                  <span className="block text-[#bdbdbd]">
                    et 100% transparent.
                  </span>
                </h2>

              </div>

              <p className="max-w-2xl text-[15px] leading-7 text-[#6f6f6f]">
                Nous savons qu'engager des travaux peut être source
                d'inquiétude. C'est pourquoi nous vous guidons pas à pas, avec
                des explications claires à chaque étape de votre chantier.
              </p>

            </div>
          </Reveal>

          {/* LINEAR PROCESS */}

          <div className="mt-14 border-t border-[#dcdcdc]">

            {process.map((step, index) => (
              <Reveal
                key={step.number}
                delay={index * 0.05}
              >
                <div className="grid gap-5 border-b border-[#dcdcdc] py-9 sm:grid-cols-[80px_250px_1fr] sm:items-center">

                  <div className="flex items-center gap-3">

                    <span className="text-sm font-semibold text-red-600">
                      {step.number}
                    </span>

                    {index !== process.length - 1 && (
                      <span className="hidden h-px w-6 bg-red-200 sm:block" />
                    )}

                  </div>

                  <h3 className="text-xl font-semibold tracking-[-0.02em]">
                    {step.title}
                  </h3>

                  <p className="max-w-2xl text-sm leading-6 text-[#707070]">
                    {step.text}
                  </p>

                </div>
              </Reveal>
            ))}

          </div>

        </div>
      </section>

      {/* ======================================================
          CTA
      ====================================================== */}

      <section className="px-6 py-20 sm:px-10 lg:px-16 lg:py-24">

        <Reveal>

          <div className="mx-auto flex max-w-[1200px] flex-col gap-8 border-t border-[#dedede] pt-12 sm:pt-14 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
                Parlons de vous
              </div>

              <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                Prêt à donner un nouveau souffle à votre façade ?
              </h2>

              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#707070]">
                Contactez-nous dès aujourd'hui pour discuter de votre projet et
                échanger avec notre équipe.
              </p>

            </div>

            <a
              href="/contact"
              className="group inline-flex w-fit shrink-0 items-center gap-3 bg-red-600 px-7 py-4 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
            >
              Nous contacter

              <ArrowUpRight
                size={17}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>

          </div>

        </Reveal>

      </section>

    </main>
  );
}