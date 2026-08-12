import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Sinevest — Header
 * ------------------------------------------------------------------
 * Requires:  npm install react-router-dom framer-motion
 * Styling:   Tailwind CSS
 *
 * ONE-TIME SETUP for the Google Fonts used below (Poppins for display
 * text, Inter for body/UI text) — do both of these once for the whole
 * project, not just this component:
 *
 * 1) Add to the <head> of your index.html:
 *
 *    <link rel="preconnect" href="https://fonts.googleapis.com">
 *    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *    <link
 *      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
 *      rel="stylesheet"
 *    >
 *
 * 2) Extend tailwind.config.js:
 *
 *    theme: {
 *      extend: {
 *        fontFamily: {
 *          display: ['Poppins', 'sans-serif'],
 *          body: ['Inter', 'sans-serif'],
 *        },
 *      },
 *    },
 *
 * Desktop:  [ Logo + Wordmark ]   [ Log In | Sign Up ]   [ Nav links ]
 * Mobile:   [ Logo only ]         [ Log In | Sign Up ]   [ Hamburger ]
 *
 * Mobile sidebar palette now mirrors Footer.jsx exactly:
 *   - Gradient:   linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)
 *   - Body text:  font-body (Inter) + text-blue-100 / text-blue-100/70
 *   - Headings:   font-display (Poppins)
 *   - Accent:     amber-400 (matches the footer's "View Certificate" / live-stat accents)
 *   - The panel is wrapped in `relative overflow-hidden` (same as <footer>) so the
 *     inline gradient always paints edge-to-edge and the decorative blurred glows
 *     stay clipped inside the panel instead of leaking out or reading as transparent.
 *
 * Notes:
 * - Put your logo file at:  /public/logo.png
 * - This assumes <Header /> is rendered inside a <BrowserRouter>.
 * - Replace the social hrefs in SOCIAL_LINKS with your real profiles.
 * ------------------------------------------------------------------
 */

const NAV_LINKS = [
  { id: "home", label: "Home", to: "/", end: true },
  { id: "contact", label: "Contact Us", to: "/contact" },
  { id: "investments", label: "Investments", to: "/investments" },
  { id: "about", label: "About", to: "/about" },
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

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b transition-shadow duration-300 font-body ${
        scrolled ? "shadow-lg shadow-slate-900/5 border-transparent" : "border-slate-100"
      }`}
    >
      <div className="mx-auto grid h-16 md:h-[76px] max-w-7xl grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center gap-4 px-5 md:px-8">
        {/* ---------- Left: Logo (+ wordmark on tablet/desktop only) ---------- */}
        <NavLink to="/" className="flex items-center gap-2.5 justify-self-start min-w-0">
          <img src="/logo.png" alt="Sinevest logo" className="h-8 md:h-9 w-auto object-contain" />
          <span className="hidden md:inline-flex font-display font-bold text-xl tracking-tight whitespace-nowrap">
            <span className="text-slate-900">Sine</span>
            <span className="text-blue-600">vest</span>
          </span>
        </NavLink>

        {/* ---------- Center: Auth buttons ---------- */}
        <div className="flex items-center gap-2 md:gap-3 justify-self-center">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full border-[1.5px] border-slate-200 px-3.5 md:px-5 py-2 text-xs md:text-sm font-semibold text-slate-800 transition-colors hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"
          >
            Log In
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group flex items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-3.5 md:px-5 py-2 text-xs md:text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-shadow hover:shadow-lg hover:shadow-blue-600/40"
          >
            <span>Sign Up</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>

        {/* ---------- Right (desktop): Nav links ---------- */}
        <nav aria-label="Primary" className="hidden md:flex justify-self-end">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <DesktopNavLink link={link} />
              </li>
            ))}
          </ul>
        </nav>

        {/* ---------- Right (mobile): Hamburger ---------- */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden justify-self-end"
        >
          <motion.span
            className="h-0.5 w-[22px] rounded bg-slate-900"
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.span
            className="h-0.5 w-[22px] rounded bg-slate-900"
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="h-0.5 w-[22px] rounded bg-slate-900"
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
          />
        </button>
      </div>

      {/* ---------- Mobile menu overlay ---------- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setMenuOpen(false)}
          >
            {/*
              Sidebar panel — palette now matches Footer.jsx exactly:
              same 175deg gradient stops, same font-body base, same
              blue-100/amber-400 text treatment.

              `relative overflow-hidden` (mirroring the <footer> element
              itself) is the key fix: it gives the inline gradient a
              properly bounded, opaque box to paint into and clips the
              decorative blurred glows inside the panel, instead of the
              gradient/glow escaping and letting the backdrop show through.
            */}
            <motion.div
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.35 }}
              style={{ background: "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)" }}
              className="absolute right-0 top-0 flex h-full w-[86vw] max-w-[380px] flex-col overflow-hidden px-7 pb-8 pt-6 shadow-2xl font-body text-blue-100"
            >
              {/* decorative ambient glows — same treatment as the footer */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 -left-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
              />

              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="relative ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all hover:rotate-90 hover:bg-white/15"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Logo + wordmark, matching the footer's brand mark styling */}
              <div className="relative mt-5 flex items-center gap-2.5">
                <img src="/logo.png" alt="Sinevest logo" className="h-7 w-auto object-contain" />
                <span className="font-display font-bold text-lg tracking-tight">
                  <span className="text-white">Sine</span>
                  <span className="text-amber-400">vest</span>
                </span>
              </div>

              <motion.nav
                aria-label="Primary mobile"
                className="relative mt-8"
                initial="closed"
                animate="open"
                variants={{
                  open: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
                  closed: {},
                }}
              >
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <motion.li
                      key={link.id}
                      variants={{
                        open: { opacity: 1, x: 0 },
                        closed: { opacity: 0, x: 24 },
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <NavLink
                        to={link.to}
                        end={link.end}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `relative block rounded-xl border-b border-white/10 py-3.5 font-display text-xl font-semibold transition-all ${
                            isActive ? "pl-5 text-white bg-white/10" : "pl-3 text-blue-100/80 hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <motion.span
                                layoutId="mobile-active-bar"
                                className="absolute left-0 top-1/2 h-[22px] w-1 -translate-y-1/2 rounded bg-amber-400"
                              />
                            )}
                            {link.label}
                          </>
                        )}
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              {/* Auth actions mirrored inside the sidebar for quick access */}
              <div className="relative mt-8 flex flex-col gap-2.5">
                <button
                  type="button"
                  className="rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/30 transition-transform hover:-translate-y-0.5"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </button>
              </div>

              {/* Social row — hover state now matches the footer's amber treatment */}
              <div className="relative mt-auto flex items-center gap-3.5 pt-6 border-t border-white/10">
                {SOCIAL_LINKS.map((social) => (
                  <motion.a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ y: -3, backgroundColor: "#fbbf24", color: "#0a1930" }}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]">
                      <path d={social.path} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------------------------------------------
   Desktop nav link — each link gets its own "active" signature so
   the current page is unmistakable at a glance.
   ------------------------------------------------------------------ */
function DesktopNavLink({ link }) {
  return (
    <NavLink
      to={link.to}
      end={link.end}
      className={({ isActive }) =>
        `relative flex items-center rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
          isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Investments — pulsing status dot */}
          {link.id === "investments" && (
            <span className="relative mr-2 flex h-1.5 w-1.5">
              {isActive && (
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                  animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
            </span>
          )}

          {/* About — brackets that clip in around the label */}
          {link.id === "about" && (
            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 4 }}
                  className="mr-1.5 text-blue-600"
                  aria-hidden="true"
                >
                  [
                </motion.span>
              )}
            </AnimatePresence>
          )}

          <span className={link.id === "about" && isActive ? "tracking-wide" : ""}>{link.label}</span>

          {link.id === "about" && (
            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  className="ml-1.5 text-blue-600"
                  aria-hidden="true"
                >
                  ]
                </motion.span>
              )}
            </AnimatePresence>
          )}

          {/* Contact Us — filled pill grows in behind the label */}
          {link.id === "contact" && isActive && (
            <motion.span
              layoutId="contact-pill"
              className="absolute inset-0 -z-10 rounded-full bg-blue-50"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
          )}

          {/* Home — underline bar grows from center */}
          {link.id === "home" && (
            <motion.span
              className="absolute bottom-0.5 left-1/2 h-[2.5px] w-8 -translate-x-1/2 rounded-full bg-blue-600"
              initial={false}
              animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}