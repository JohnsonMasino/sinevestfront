import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Sinevest — About
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed for
 *            Header/Footer/Homecontent1/Faq/PrivacyPolicy/Terms/Contact).
 *            Same design system: font-display (Poppins) / font-body
 *            (Inter), navy gradient + amber accent, hand-drawn SVG
 *            icon style — no icon library.
 * Styling:   Tailwind CSS, mobile-first.
 *
 * IMPORTANT — READ BEFORE SHIPPING TO PRODUCTION
 * ------------------------------------------------------------------
 * Three datasets here are placeholders, flagged with "// TODO":
 *
 *   1. MILESTONES — the achievement timeline since 2006. Dates and
 *      claims are illustrative. Replace with your real, verifiable
 *      company history before publishing.
 *
 *   2. TEAM_MEMBERS — CEO / CTO / Financial Manager cards use generic
 *      placeholder names, titles, and bios, with initials-based
 *      avatars (no invented photos attributed to "real" people).
 *      Replace with your actual leadership details and headshots,
 *      ideally with their consent to publish.
 *
 *   3. FOUNDING_YEAR / origin story copy — confirm the real
 *      registration year and founding narrative before publishing.
 *
 * Same spirit as CREDIBILITY_STATS / SAMPLE_REVIEWS in
 * Homecontent1.jsx: don't present invented facts as verified history.
 *
 * Sections:
 *   1. AboutHero         — intro banner: what Sinevest does.
 *   2. AboutStory        — founding story, anchored to the London
 *                         office address.
 *   3. AboutAchievements — animated milestone timeline since 2006.
 *   4. AboutTeam         — CEO / CTO / Financial Manager cards.
 *   5. AboutCTA          — closing card, Contact + Home buttons.
 * ------------------------------------------------------------------
 */

const FOUNDING_YEAR = 2006; // TODO: confirm real registration year

/* ================================================================
   Shared: reveal-on-scroll wrapper (same pattern as other pages)
   ================================================================ */
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Count-up helper, same behavior as Homecontent1.jsx */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function CountUp({ target, suffix = "", prefix = "", duration = 1500 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (!inView || reducedMotion) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reducedMotion, target, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {Math.round(value).toLocaleString()}
      {suffix}
    </span>
  );
}

/* ================================================================
   1. Hero — what Sinevest does
   ================================================================ */
function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-14 md:pt-24 md:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#123a91 1px, transparent 1px), linear-gradient(90deg, #123a91 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            About Sinevest
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Investing made clear, secure,
            <br className="hidden sm:block" /> and built to last
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            Sinevest is an investment platform that gives everyday investors
            access to a curated range of digital assets, backed by
            institutional-grade security and transparent reporting. Since
            our registration in {FOUNDING_YEAR}, our focus has stayed the
            same: help people invest with clarity and confidence, not
            guesswork.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   2. Story — founding narrative, anchored to the office address
   ================================================================ */
function AboutStory() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
          {/* Copy */}
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              Our story
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Where it all started
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              <p>
                Sinevest was registered in {FOUNDING_YEAR} and began life in
                a small office at 42 Willowbrook Lane, London — the address
                that's still home to our headquarters today. What started as
                a handful of people trying to make investing more
                approachable has grown into a full platform trusted by
                investors around the world.
              </p>
              <p>
                From day one, the goal was simple: strip away the jargon and
                friction that usually surrounds investing, and replace it
                with a platform people can actually understand and trust.
                Every feature we've shipped since — from identity
                verification to real-time reporting — has been built with
                that same principle in mind.
              </p>
              <p>
                Today, that founding office still anchors our operations,
                even as our team and investor base have grown well beyond
                what we imagined when we started.
              </p>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                  <path
                    d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Our headquarters</p>
                <p className="mt-0.5 leading-relaxed">
                  42 Willowbrook Lane
                  <br />
                  London, SW1A 2AB
                  <br />
                  United Kingdom
                </p>
              </div>
            </div>
          </Reveal>

          {/* Visual — founding year emblem, no stock photography needed */}
          <Reveal delay={0.1}>
            <div
              style={{
                background:
                  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)",
              }}
              className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-3xl shadow-xl sm:aspect-[5/4] md:aspect-[4/5]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl"
              />
              <div className="relative flex flex-col items-center text-center px-6">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-amber-300">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                    <path
                      d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="mt-6 font-display text-5xl font-extrabold text-white sm:text-6xl">
                  {FOUNDING_YEAR}
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-blue-100/70">
                  Registered in London
                </p>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-blue-100/70">
                  Two decades of building a platform investors can rely on.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   3. Achievements — milestone timeline since founding
   ================================================================ */

// PLACEHOLDER DATA — replace with your real, verifiable milestones.
// TODO: confirm real years, figures, and descriptions before publishing.
const MILESTONES = [
  {
    year: FOUNDING_YEAR,
    title: "Sinevest is founded",
    text: "Registered in London and opened our first office at 42 Willowbrook Lane.",
  },
  {
    year: FOUNDING_YEAR + 3,
    title: "First international investors onboarded",
    text: "Expanded beyond the UK, welcoming investors from multiple countries.",
  },
  {
    year: FOUNDING_YEAR + 8,
    title: "Regulatory registration achieved",
    text: "Formalized our compliance framework and secured regulatory registration.",
  },
  {
    year: FOUNDING_YEAR + 12,
    title: "Platform rebuilt for scale",
    text: "Re-engineered the platform's core infrastructure to support growing demand.",
  },
  {
    year: FOUNDING_YEAR + 17,
    title: "Passed a major AUM milestone",
    text: "Crossed a significant milestone in total assets under management.",
  },
  {
    year: 2026,
    title: "Sinevest Premium launches",
    text: "Migrated every existing investor onto a faster, more secure platform.",
  },
];

function AchievementsTimeline() {
  return (
    <div className="relative mt-12">
      {/* vertical line */}
      <div
        aria-hidden="true"
        className="absolute left-4 top-2 bottom-2 w-px bg-white/15 sm:left-1/2 sm:-ml-px"
      />
      <div className="space-y-8 sm:space-y-10">
        {MILESTONES.map((m, i) => {
          const alignRight = i % 2 === 1;
          return (
            <Reveal key={`${m.year}-${m.title}`} delay={i * 0.05}>
              <div
                className={`relative flex items-start gap-5 sm:gap-0 ${
                  alignRight ? "sm:flex-row-reverse" : "sm:flex-row"
                }`}
              >
                {/* dot */}
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-1.5 z-10 -ml-[7px] h-3.5 w-3.5 rounded-full border-2 border-amber-400 bg-[#0f2557] sm:left-1/2"
                />

                <div className="hidden sm:block sm:w-1/2" />

                <div
                  className={`pl-11 sm:w-1/2 sm:pl-0 ${
                    alignRight ? "sm:pr-10 sm:text-right" : "sm:pl-10"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300">
                    {m.year}
                  </span>
                  <h3 className="mt-2.5 font-display text-base font-bold text-white sm:text-lg">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-blue-100/70">
                    {m.text}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function AboutAchievements() {
  const yearsActive = new Date().getFullYear() - FOUNDING_YEAR;

  return (
    <section
      style={{
        background:
          "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)",
      }}
      className="relative overflow-hidden py-16 text-blue-100 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-100/70">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-amber-400">
              <path
                d="M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Our journey
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <CountUp target={yearsActive} suffix=" years of milestones" />
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/70 sm:text-base">
            A brief look at how Sinevest has grown since {FOUNDING_YEAR}.
          </p>
        </Reveal>

        <AchievementsTimeline />
      </div>
    </section>
  );
}

/* ================================================================
   4. Team — CEO / CTO / Financial Manager
   ================================================================ */

// PLACEHOLDER DATA — generic names/titles/bios and initials-based
// avatars, not real photos attributed to real people.
// TODO: replace with your actual leadership details (and headshots,
// with their consent) before publishing.
const TEAM_MEMBERS = [
  {
    id: "ceo",
    name: "Robert Charles",
    role: "Chief Executive Officer",
    initials: "CEO",
    image: "/ceo.jpg",
    bio: "Sets the company's overall direction and long-term strategy, and represents Sinevest to investors, regulators, and partners.",
  },
  {
    id: "cto",
    name: "Darnell Isaiah",
    role: "Chief Technology Officer",
    initials: "CTO",
    image: "/cto.jpg",
    bio: "Leads engineering and platform security, overseeing the infrastructure that keeps investor accounts fast, reliable, and protected.",
  },
//   PassCode@$2026
//   vestsine@gmail.com
  {
    id: "finance",
    name: "Petra Ursula",
    role: "Financial Manager",
    initials: "FM",
    image: "/fin.jpg",
    bio: "Oversees financial operations, reporting, and compliance controls, ensuring the platform runs on sound financial footing.",
  },
];

function TeamCard({ member, index }) {
  return (
    <Reveal delay={index * 0.08}>
      <motion.div
        whileHover={{ y: -4 }}
        className="flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="h-20 w-20 overflow-hidden rounded-full shadow-md ring-2 ring-slate-100">
          <img
            src={member.image}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        </div>
        <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
          {member.name}
        </h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
          {member.role}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          {member.bio}
        </p>
      </motion.div>
    </Reveal>
  );
}

function AboutTeam() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="M16 14a4 4 0 1 0-4-4 M8 21v-2a4 4 0 0 1 4-4h1 M17 21v-2a4 4 0 0 0-3-3.87 M12 7a4 4 0 1 1-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Leadership
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            The team behind Sinevest
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
            A small, focused leadership team steering strategy, technology,
            and financial integrity.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member, i) => (
            <TeamCard key={member.id} member={member} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   5. Closing CTA
   ================================================================ */
function AboutCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            Join us
          </span>
          <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Ready to invest with a platform built to last?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
            Have questions about our story, our team, or how Sinevest works?
            We'd love to hear from you.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/contact" className="w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl hover:shadow-blue-600/35 sm:w-auto"
              >
                Contact Us
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </Link>

            <Link to="/" className="w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700 sm:w-auto"
              >
                Back to Homepage
              </motion.button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   Export — About
   ================================================================ */

export default function About() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutAchievements />
      <AboutTeam />
      <AboutCTA />
    </>
  );
}