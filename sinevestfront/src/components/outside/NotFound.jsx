import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Sinevest — NotFound (404)
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed)
 * Styling:   Tailwind CSS — same design system as Header.jsx / Footer.jsx
 *
 * Palette / type, matched exactly to Header + Footer:
 *   - Gradient:   linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)
 *   - Headings:   font-display (Poppins)
 *   - Body:       font-body (Inter), text-blue-100 / text-blue-100/70
 *   - Accent:     amber-400 (Sign Up button, active nav, footer links)
 *
 * Signature element:
 *   A hand-drawn SVG "ticker line" that plots a normal path, then breaks
 *   off-chart into a dashed, erratic detour before flattening out —
 *   this is a trading-platform's version of "you've wandered off the
 *   map," instead of a generic broken-robot or magnifying-glass 404.
 *   The line draws itself in on load using a stroke-dashoffset animation.
 *
 * Notes:
 * - Assumes <NotFound /> is rendered inside a <BrowserRouter>, on a route
 *   with a catch-all path (e.g. `<Route path="*" element={<NotFound />} />`).
 * - "Go Home" routes to `/`; "Contact Support" routes to `/contact` —
 *   update the `to` props if your routes differ.
 * ------------------------------------------------------------------
 */

export default function NotFound() {
  return (
    <main
      style={{
        background:
          "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)",
      }}
      className="relative flex min-h-screen w-full items-center overflow-hidden font-body text-blue-100"
    >
      {/* decorative ambient glows — same treatment as Header/Footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-24 text-center md:px-8">
        {/* ---------- Signature: ticker line that runs off-chart ---------- */}
        <TickerLine />

        {/* ---------- 404 numeral ---------- */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 font-display text-[clamp(4.5rem,16vw,8rem)] font-extrabold leading-none tracking-tight text-white"
        >
          4
          <span className="relative inline-block text-amber-400">
            0
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 -z-10 h-2 -translate-y-1/2 rounded-full bg-amber-400/25 blur-md"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>
          4
        </motion.h1>

        {/* ---------- Headline + copy ---------- */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.65 }}
          className="mt-4 font-display text-xl font-semibold text-white sm:text-2xl"
        >
          This path isn&rsquo;t on our chart.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.75 }}
          className="mt-3 max-w-md text-sm leading-relaxed text-blue-100/70 sm:text-base"
        >
          The page you&rsquo;re looking for has moved, been renamed, or never
          existed. Let&rsquo;s get you back to solid ground.
        </motion.p>

        {/* ---------- Actions ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.9 }}
          className="mt-9 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row"
        >
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto"
          >
            <Link
              to="/"
              className="group flex w-full items-center justify-center gap-1.5 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/30 transition-shadow hover:shadow-lg hover:shadow-amber-400/40 sm:w-auto"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
                <path
                  d="m3 11 9-8 9 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 10v10h5v-6h4v6h5V10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Back to Home</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto"
          >
            <Link
              to="/contact"
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-amber-400/50 hover:bg-white/10 sm:w-auto"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
                <path
                  d="M3 6h18v12H3z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="m3 7 9 6 9-6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Contact Support</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* ---------- Quiet reassurance line ---------- */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="mt-8 text-xs text-blue-100/50"
        >
          Error code:{" "}
          <span className="font-semibold text-blue-100/70">
            404 — Page Not Found
          </span>
        </motion.p>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------
   TickerLine — the page's signature element.
   A stock-ticker line plots a normal, steady climb, then breaks into a
   dashed, erratic detour ("off the chart") before settling flat. Drawn
   with a stroke-dashoffset reveal so it animates in like a live chart
   loading, then a small amber dot pulses at the point it goes off-course.
   ------------------------------------------------------------------ */
function TickerLine() {
  return (
    <motion.svg
      viewBox="0 0 320 90"
      className="h-auto w-full max-w-[280px] text-blue-100/40 sm:max-w-xs"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-hidden="true"
    >
      {/* steady climb — solid line */}
      <motion.path
        d="M4 70 L48 58 L92 62 L136 40 L172 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
      {/* off-chart detour — dashed, amber */}
      <motion.path
        d="M172 34 L196 66 L214 20 L236 74 L256 30 L286 46 L312 44"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut", delay: 0.75 }}
      />
      {/* the exact point it derails */}
      <motion.circle
        cx="172"
        cy="34"
        r="4.5"
        fill="#fbbf24"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 1], opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      />
      <motion.circle
        cx="172"
        cy="34"
        r="4.5"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.5"
        animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1.2,
        }}
      />
    </motion.svg>
  );
}