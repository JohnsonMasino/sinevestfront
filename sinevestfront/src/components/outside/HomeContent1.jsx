import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";

/**
 * Sinevest — Homecontent1
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed for
 *            Header/Footer/Hero). Same design system: font-display
 *            (Poppins) / font-body (Inter), navy gradient + amber
 *            accent, hand-drawn SVG icon style — no icon library.
 * Styling:   Tailwind CSS, mobile-first (base classes target mobile,
 *            sm:/md:/lg: layer up). Every scroll animation below runs
 *            identically on mobile and desktop — nothing is desktop-only.
 *
 * IMPORTANT — READ BEFORE SHIPPING TO PRODUCTION
 * ------------------------------------------------------------------
 * Two datasets in this file are placeholders, flagged with "// TODO"
 * and a PLACEHOLDER_DATA note. Replace them with real, verifiable
 * information before this goes live:
 *
 *   1. CREDIBILITY_STATS — figures like AUM, active investors, years
 *      operating, uptime. Do not publish invented numbers dressed up
 *      as real metrics; that's a materially misleading claim on a
 *      financial product. Swap in your actual, current figures.
 *
 *   2. SAMPLE_REVIEWS — generic placeholder quotes with anonymized
 *      labels (no invented full names/photos attributed to "real"
 *      people). Replace with genuine testimonials you've actually
 *      collected, ideally with the reviewer's consent to publish.
 *
 * Sections:
 *   1. WelcomeSection    — split welcome for (a) investors who were
 *                          migrated to Sinevest Premium and (b) new
 *                          visitors registering for the first time.
 *   2. CredibilitySection — trust stats with animated counters + bar
 *                          visualizations (security/uptime — no
 *                          payout-rate or return-guarantee framing).
 *   3. WhyInvestSection  — feature grid explaining the platform.
 *   4. ReviewsSection    — investor reviews carousel/grid, plus a
 *                          zoomable regulatory certificate image
 *                          (public/cert.jpeg) at the bottom.
 * ------------------------------------------------------------------
 */

/* ================================================================
   Shared: prefers-reduced-motion + count-up-on-scroll helpers
   ================================================================ */
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

function CountUp({ target, decimals = 0, suffix = "", prefix = "", duration = 1600 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (!inView || reducedMotion) return;
    let raf;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(from + (target - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reducedMotion, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* Reveal-on-scroll wrapper — identical behavior on mobile and desktop */
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

/* ================================================================
   1. Welcome section — migrated investors + brand-new visitors
   ================================================================ */

function WelcomeSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#123a91 1px, transparent 1px), linear-gradient(90deg, #123a91 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Introducing Sinevest Premium
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            A stronger, faster Sinevest —
            <br className="hidden sm:block" /> built on everything you trusted us for
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            Same commitment to your investments, now on an upgraded platform
            with sharper tools, tighter security, and clearer reporting.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {/* ---------- Card A: migrated / returning investors ---------- */}
          <Reveal delay={0.05}>
            <div
              style={{ background: "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)" }}
              className="relative flex h-full flex-col overflow-hidden rounded-2xl p-7 text-blue-100 shadow-xl md:p-9"
            >
              <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="m9 12 2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Existing investors
              </span>

              <h3 className="mt-4 font-display text-2xl font-bold text-white sm:text-[26px]">
                Welcome back — you've been upgraded
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-blue-100/75 sm:text-[15px]">
                Your Sinevest account was one of the first moved onto Sinevest
                Premium. Your history, holdings, and settings carried over —
                nothing to redo, nothing to reconfigure. Just log in and
                you're home.
              </p>

              <ul className="mt-5 space-y-2.5 text-sm text-blue-100/80">
                {[
                  "Your portfolio and history are already here",
                  "No new documents or re-verification needed",
                  "Same login, refreshed dashboard",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-amber-400">
                      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex-1" />

              <Link to="/login" className="mt-2 w-full sm:w-auto">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-shadow hover:shadow-xl hover:shadow-amber-400/35 sm:w-auto"
                >
                  Log In To Your Account
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </Link>
            </div>
          </Reveal>

          {/* ---------- Card B: brand-new visitors ---------- */}
          <Reveal delay={0.12}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-7 shadow-sm md:p-9">
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                New here
              </span>

              <h3 className="mt-4 font-display text-2xl font-bold text-slate-900 sm:text-[26px]">
                First time at Sinevest? Start here
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                Sinevest Premium is open to new investors too. Create an
                account, verify your identity, and get access to the same
                platform our existing investors were just moved onto.
              </p>

              <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
                {[
                  "Sign up in a few minutes",
                  "Clear, guided identity verification",
                  "Start exploring assets right away",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-blue-600">
                      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex-1" />

              <Link to="/signup" className="mt-2 w-full sm:w-auto">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl hover:shadow-blue-600/35 sm:w-auto"
                >
                  Create Your Account
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   2. Credibility section — trust stats + bar visualizations
   ================================================================ */

// PLACEHOLDER DATA — replace `value` with your real, current figures
// before publishing. Do not present invented numbers as verified fact.
// TODO: swap in real, verifiable metrics
const CREDIBILITY_STATS = [
  {
    id: "aum",
    label: "Assets under management",
    value: 67,
    prefix: "$",
    suffix: "B+",
    decimals: 0,
    icon: "vault",
  },
  {
    id: "investors",
    label: "Active investors",
    value: 120,
    prefix: "",
    suffix: "K+",
    decimals: 0,
    icon: "users",
  },
  {
    id: "years",
    label: "Years in operation",
    value: 20, // TODO: real years operating
    prefix: "",
    suffix: "+",
    decimals: 0,
    icon: "calendar",
  },
  {
    id: "countries",
    label: "Countries served",
    value: 12, // TODO: real country count
    prefix: "",
    suffix: "+",
    decimals: 0,
    icon: "globe",
  },
];

// Operational trust bars — uptime / security / support, not return promises.
// TODO: replace with real, current operational figures
const TRUST_BARS = [
  { id: "uptime", label: "Platform uptime", value: 87, suffix: "%" }, // TODO
  { id: "security", label: "Independent security rating", value: 95, suffix: "/100" }, // TODO
  { id: "support", label: "Support response satisfaction", value: 92, suffix: "%" }, // TODO
];

const STAT_ICONS = {
  vault: (
    <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  users: (
    <path d="M16 14a4 4 0 1 0-4-4 M8 21v-2a4 4 0 0 1 4-4h1 M17 21v-2a4 4 0 0 0-3-3.87 M12 7a4 4 0 1 1-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  calendar: (
    <path d="M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  globe: (
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  shield: (
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
};

function CredibilitySection() {
  return (
    <section
      style={{ background: "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)" }}
      className="relative overflow-hidden py-16 text-blue-100 md:py-24"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-100/70">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-amber-400">
              {STAT_ICONS.shield}
            </svg>
            Why investors trust us
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Built on transparency, not promises
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/70 sm:text-base">
            Every figure below reflects how the platform actually runs —
            not a projection of what your money could become.
          </p>
        </Reveal>

        {/* Stat cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {CREDIBILITY_STATS.map((stat, i) => (
            <Reveal key={stat.id} delay={i * 0.08}>
              <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center backdrop-blur-sm sm:items-start sm:text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    {STAT_ICONS[stat.icon]}
                  </svg>
                </span>
                <div>
                  <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                    <CountUp target={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1 text-xs text-blue-100/60 sm:text-sm">{stat.label}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Trust bars */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-3 sm:gap-5">
          {TRUST_BARS.map((bar, i) => (
            <Reveal key={bar.id} delay={0.1 + i * 0.08}>
              <TrustBar label={bar.label} value={bar.value} suffix={bar.suffix} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBar({ label, value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-blue-100/75">{label}</span>
        <span className="font-display font-bold text-white">
          <CountUp target={value} suffix={suffix} duration={1400} />
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-blue-400"
          initial={{ width: "0%" }}
          animate={inView || reducedMotion ? { width: `${Math.min(value, 100)}%` } : { width: "0%" }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
        />
      </div>
    </div>
  );
}

/* ================================================================
   3. Why invest section — feature grid
   ================================================================ */

const FEATURES = [
  {
    id: "security",
    title: "Bank-level security",
    text: "Multi-layer encryption, cold storage, and continuous monitoring protect every account.",
    icon: (
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    id: "licensed",
    title: "Licensed & regulated",
    text: "Operated under applicable financial regulations, with compliance built into every process.",
    icon: (
      <path d="m12 2 8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V5l8-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    id: "transparent",
    title: "Transparent reporting",
    text: "Full visibility into your portfolio — every position, every transaction, no hidden fees.",
    icon: (
      <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    id: "support",
    title: "24/7 human support",
    text: "A real support team, reachable around the clock, for questions big and small.",
    icon: (
      <path d="M18 10a6 6 0 1 0-12 0v4a2 2 0 0 0 2 2h1v-6H6v-0a6 6 0 0 1 12 0v0h-3v6h1a2 2 0 0 0 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    id: "withdrawals",
    title: "Fast withdrawals",
    text: "Requests are reviewed promptly, with clear status updates from start to finish.",
    icon: (
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    id: "diversified",
    title: "Diversified assets",
    text: "Access a curated range of digital assets instead of betting everything on one coin.",
    icon: (
      <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    ),
  },
];

function WhyInvestSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Why Sinevest Premium
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything your investing deserves
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
            The essentials of a serious platform — nothing gimmicky, nothing hidden.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4 }}
                className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    {f.icon}
                  </svg>
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   4. Reviews section
   ================================================================ */

// SAMPLE DATA — these are illustrative placeholders, not real customer
// quotes. Replace with genuine testimonials you've actually collected
// (ideally with the reviewer's consent to publish) before launch.
// TODO: replace with real, consented investor reviews
const SAMPLE_REVIEWS = [
  {
    id: 1,
    initials: "A.O.",
    location: "Lagos, Nigeria",
    rating: 5,
    quote: "Sample review — replace with a real investor quote before publishing.",
  },
  {
    id: 2,
    initials: "M.K.",
    location: "Nairobi, Kenya",
    rating: 5,
    quote: "Sample review — replace with a real investor quote before publishing.",
  },
  {
    id: 3,
    initials: "R.T.",
    location: "London, UK",
    rating: 4,
    quote: "Sample review — replace with a real investor quote before publishing.",
  },
  {
    id: 4,
    initials: "S.N.",
    location: "Accra, Ghana",
    rating: 5,
    quote: "Sample review — replace with a real investor quote before publishing.",
  },
];

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill={i < rating ? "currentColor" : "none"} className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-slate-200"}`}>
          <path d="m12 2 2.9 6.5 7.1.6-5.4 4.7 1.7 6.9L12 17.8 5.7 20.7l1.7-6.9L2 9.1l7.1-.6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % SAMPLE_REVIEWS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path d="M18 10a6 6 0 1 0-12 0v4a2 2 0 0 0 2 2h1v-6H6v-0a6 6 0 0 1 12 0v0h-3v6h1a2 2 0 0 0 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            What investors say
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Real accounts, real experiences
          </h2>
          <p className="mt-3 text-xs italic text-slate-400 sm:text-sm">
            Sample layout — replace with genuine, consented investor reviews.
          </p>
        </Reveal>

        {/* Mobile-first: one card at a time in a crossfade carousel */}
        <div className="mt-10 md:hidden">
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={SAMPLE_REVIEWS[index].id}
                initial={{ opacity: 0, x: reducedMotion ? 0 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reducedMotion ? 0 : -24 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <ReviewCardBody review={SAMPLE_REVIEWS[index]} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            {SAMPLE_REVIEWS.map((r, i) => (
              <button
                key={r.id}
                type="button"
                aria-label={`Show review ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-blue-600" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop/tablet: full grid, all visible */}
        <div className="mt-10 hidden grid-cols-2 gap-5 md:grid lg:grid-cols-4">
          {SAMPLE_REVIEWS.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <ReviewCardBody review={r} />
              </div>
            </Reveal>
          ))}
        </div>

        {/* ---------- Regulatory certificate — click to zoom ---------- */}
        <CertificateBlock />
      </div>
    </section>
  );
}

function ReviewCardBody({ review }) {
  return (
    <div className="flex h-full flex-col">
      <Stars rating={review.rating} />
      <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{review.quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-slate-900 text-xs font-bold text-white">
          {review.initials}
        </span>
        <div className="text-xs text-slate-500">
          <p className="font-semibold text-slate-700">{review.initials}</p>
          <p>{review.location}</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Regulatory certificate block — thumbnail + click-to-zoom modal
   Image lives at /cert.jpeg (public folder)
   ================================================================ */

function CertificateBlock() {
  const [open, setOpen] = useState(false);

  // Lock background scroll + support Escape-to-close while modal is open
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <Reveal delay={0.1} className="mt-14 md:mt-20">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="flex flex-col items-center gap-8 p-6 sm:p-8 md:flex-row md:gap-10 md:p-10">
            {/* Thumbnail — tap/click to zoom */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="View regulatory certificate in full size"
              className="group relative w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md sm:w-64 md:w-56"
            >
              <img
                src="/cert.jpg"
                alt="Sinevest regulatory certificate"
                className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors duration-300 group-hover:bg-slate-900/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-slate-900 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z M21 21l-4.35-4.35 M9 11h4M11 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
              {/* Always-visible mobile affordance (hover states don't exist on touch) */}
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold text-white sm:hidden">
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                  <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z M21 21l-4.35-4.35 M9 11h4M11 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Tap to zoom
              </span>
            </button>

            {/* Copy */}
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path d="m12 2 8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V5l8-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified & certified
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-slate-900 sm:text-2xl">
                Our regulatory certificate
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                Sinevest operates under official regulatory registration.
                View the full certificate for complete details and
                verification information.
              </p>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z M21 21l-4.35-4.35 M9 11h4M11 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                View full certificate
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------- Zoom modal ---------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="cert-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Regulatory certificate, full size"
          >
            <motion.div
              key="cert-modal-content"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close certificate view"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-sm transition-colors hover:bg-slate-900 sm:right-4 sm:top-4"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="max-h-[88vh] overflow-auto">
                <img
                  src="/cert.jpg"
                  alt="Sinevest regulatory certificate — full size"
                  className="h-auto w-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ================================================================
   Export — Homecontent1
   ================================================================ */

export default function Homecontent1() {
  return (
    <>
      <WelcomeSection />
      <CredibilitySection />
      <WhyInvestSection />
      <ReviewsSection />
    </>
  );
}