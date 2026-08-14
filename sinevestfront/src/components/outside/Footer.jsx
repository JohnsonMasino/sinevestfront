import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Sinevest — Footer
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed for Header)
 * Styling:   Tailwind CSS
 *
 * Uses the same font setup as Header.jsx — Poppins (display) + Inter (body).
 * If you've already done the one-time setup from Header.jsx (Google Fonts
 * link in index.html + fontFamily.display/body in tailwind.config.js),
 * this file just works. If not, see the comment block at the top of
 * Header.jsx for the two snippets to add.
 *
 * Layout (desktop):
 *   [ Logo + quote            ]  [ Quick Links ]  [ Legal ]  [ Social + Live stats ]
 *   [ Contact details (email, address) — anchored to bottom of first column   ]
 *   -------------------------------------------------------------------------
 *   [                 Certification strip → /certificate                     ]
 *   -------------------------------------------------------------------------
 *   [                 © {year} Sinevest. All rights reserved.                ]
 *
 * Notes:
 * - Put your logo file at:  /public/logo.png
 * - Assumes <Footer /> renders inside a <BrowserRouter>.
 * - Live stats below are simulated for visual effect — wire NUMBERS up to
 *   your real-time data source (websocket / polling endpoint) in production.
 * - Replace social hrefs and legal/quick-link routes with your real ones.
 * ------------------------------------------------------------------
 */

const QUICK_LINKS = [
  { id: "home", label: "Home", to: "/" },
  { id: "contact", label: "Contact Us", to: "/contact" },
  { id: "investments", label: "Investments", to: "/investments" },
  { id: "about", label: "About", to: "/about" },
];

const LEGAL_LINKS = [
  { id: "privacy", label: "Privacy Policy", to: "/privacy-policy" },
  { id: "terms", label: "Terms & Conditions", to: "/terms" },
  { id: "faqs", label: "FAQs", to: "/faqs" },
];

const SOCIAL_LINKS = [
  {
    id: "facebook",
    label: "Facebook",
    href: "https://facebook.com",
    path: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.78 8.44-4.94 8.44-9.94Z",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    href: "https://x.com",
    path: "M18.9 2.5h3.1l-6.8 7.77L23.2 21.5h-6.27l-4.9-6.4-5.61 6.4H3.3l7.28-8.31L2 2.5h6.43l4.43 5.85 5.04-5.85Zm-1.09 17.1h1.72L7.3 4.29H5.45l12.36 15.31Z",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.16c2.72 0 3.04.01 4.12.06 1.06.05 1.79.22 2.43.47.68.26 1.25.62 1.82 1.19.57.57.93 1.14 1.19 1.82.25.64.42 1.37.47 2.43.05 1.08.06 1.4.06 4.12s-.01 3.04-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.92 4.92 0 0 1-1.19 1.82 4.92 4.92 0 0 1-1.82 1.19c-.64.25-1.37.42-2.43.47-1.08.05-1.4.06-4.12.06s-3.04-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.92 4.92 0 0 1-1.82-1.19 4.92 4.92 0 0 1-1.19-1.82c-.25-.64-.42-1.37-.47-2.43C2.17 15.04 2.16 14.72 2.16 12s.01-3.04.06-4.12c.05-1.06.22-1.79.47-2.43.26-.68.62-1.25 1.19-1.82A4.92 4.92 0 0 1 5.7 2.44c.64-.25 1.37-.42 2.43-.47C9.21 1.92 9.53 1.91 12.25 1.91Zm0 1.8c-2.68 0-3 .01-4.05.06-.97.04-1.5.2-1.85.34-.46.18-.79.4-1.14.75-.35.35-.57.68-.75 1.14-.14.35-.3.88-.34 1.85-.05 1.05-.06 1.37-.06 4.05s.01 3 .06 4.05c.04.97.2 1.5.34 1.85.18.46.4.79.75 1.14.35.35.68.57 1.14.75.35.14.88.3 1.85.34 1.05.05 1.37.06 4.05.06s3-.01 4.05-.06c.97-.04 1.5-.2 1.85-.34.46-.18.79-.4 1.14-.75.35-.35.57-.68.75-1.14.14-.35.3-.88.34-1.85.05-1.05.06-1.37.06-4.05s-.01-3-.06-4.05c-.04-.97-.2-1.5-.34-1.85a3.1 3.1 0 0 0-.75-1.14 3.1 3.1 0 0 0-1.14-.75c-.35-.14-.88-.3-1.85-.34-1.05-.05-1.37-.06-4.05-.06ZM12 6.87A5.13 5.13 0 1 1 6.87 12 5.13 5.13 0 0 1 12 6.87Zm0 1.8A3.33 3.33 0 1 0 15.33 12 3.33 3.33 0 0 0 12 8.67Zm5.34-1.99a1.2 1.2 0 1 1-1.2-1.2 1.2 1.2 0 0 1 1.2 1.2Z",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56Z",
  },
];

// Base values for the simulated live-stats ticker.
const BASE_STATS = {
  activeTrades: 1284,
  usersOnline: 6531,
  totalFunds: 48250000, // in currency units
};

function formatCurrency(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const [stats, setStats] = useState(BASE_STATS);

  // Lightweight "live" feel — nudges numbers every few seconds.
  // Swap this effect out for a real websocket/polling source in production.
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        activeTrades: Math.max(0, prev.activeTrades + Math.floor(Math.random() * 11) - 5),
        usersOnline: Math.max(0, prev.usersOnline + Math.floor(Math.random() * 21) - 10),
        totalFunds: prev.totalFunds + Math.floor(Math.random() * 5000),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      // Inline gradient backs up the Tailwind classes below so the dark
      // background can never render transparent, even if a class gets
      // missed during Tailwind's content scan.
      style={{ background: "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)" }}
      className="relative w-full overflow-hidden font-body text-blue-100"
    >
      {/* decorative ambient glows — purely visual, kept subtle */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-14 md:pt-16">
        {/* ================= Main grid ================= */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_0.9fr_0.9fr_1.1fr]">
          {/* ---------- Column 1: Logo + quote + contact (bottom-anchored) ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-between gap-8"
          >
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Sinevest logo" className="h-7 w-auto object-contain" />
                <span className="font-display font-bold text-lg tracking-tight">
                  <span className="text-white">Sine</span>
                  <span className="text-amber-400">vest</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-blue-100/70 italic">
                &ldquo;Wealth is built one disciplined decision at a time — we just help you
                make each one count.&rdquo;
              </p>
            </div>

            <div className="space-y-2 text-sm text-blue-100/80">
              <a href="mailto:support@sinevest.com" className="flex items-center gap-2 transition-colors hover:text-amber-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-amber-400">
                  <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                support@sinevest.com
              </a>
              <p className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-amber-400">
                  <path
                    d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <span>42 Willowbrook Lane, London, SW1A 2AB United Kingdom.</span>
              </p>
            </div>
          </motion.div>

          {/* ---------- Column 2: Quick Links ---------- */}
          <motion.nav
            aria-label="Quick links"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center text-sm text-blue-100/75 transition-colors hover:text-amber-400"
                  >
                    <span className="mr-0 h-px w-0 bg-amber-400 transition-all duration-200 group-hover:mr-2 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* ---------- Column 3: Legal ---------- */}
          <motion.nav
            aria-label="Legal"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Legal</h3>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center text-sm text-blue-100/75 transition-colors hover:text-amber-400"
                  >
                    <span className="mr-0 h-px w-0 bg-amber-400 transition-all duration-200 group-hover:mr-2 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* ---------- Column 4: Social + live stats ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Connect With Us</h3>
            <div className="mt-4 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ y: -3, backgroundColor: "#fbbf24", color: "#0a1930" }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]">
                    <path d={social.path} />
                  </svg>
                </motion.a>
              ))}
            </div>

            {/* Live stats */}
            <div className="mt-7 rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-100/70">Live Stats</span>
              </div>

              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-blue-100/70">Active Trades</dt>
                  <dd className="font-semibold text-white tabular-nums">
                    {stats.activeTrades.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-blue-100/70">Users Online</dt>
                  <dd className="font-semibold text-white tabular-nums">
                    {stats.usersOnline.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-blue-100/70">Total Funds Traded</dt>
                  <dd className="font-semibold text-amber-400 tabular-nums">
                    {formatCurrency(stats.totalFunds)}
                  </dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </div>
        
        {/* ================= Bottom bar ================= */}
        <div className="border-t border-white/10 py-6 text-center">
          <p className="text-xs text-blue-100/50">
            © {year} Sinevest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}