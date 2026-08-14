// src/components/dashboard/Head.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, LogOut, UserCircle2, AlertCircle, X } from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure
import Sidebar, { clearSession } from "./Sidebar";

/**
 * Sinevest — Dashboard Head (layout wrapper)
 * ------------------------------------------------------------------
 * Wraps every /dashboard/* page. Renders the Sidebar + a sticky top
 * bar: hamburger (mobile) — first name (center) — profile dropdown
 * (right). Fetches GET /api/auth/me/ for the live first name, with
 * a cached-localStorage instant paint the same way Homecontent1's
 * older Header did it.
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

export default function Head({ children }) {
  const navigate = useNavigate();

  // ── Cached user (instant paint) + live profile (source of truth) ──
  const [cachedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(cachedUser);
  const [fetchError, setFetchError] = useState("");

  // ── UI state ──────────────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  // ── Fetch live profile from /api/auth/me/ ──────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await api.get("/api/auth/me/");
        const data = res.data?.data ?? res.data; // tolerate either shape
        if (cancelled) return;

        setProfile(data);
        setFetchError("");

        try {
          const existing = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem("user", JSON.stringify({ ...existing, ...data }));
        } catch {
          // ignore storage write failures
        }
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;

        if (status === 401) {
          clearSession();
          navigate("/login");
          return;
        }

        setFetchError("Showing saved profile info — couldn't refresh just now.");
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ── Click-outside to close the profile dropdown ────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // ── Lock body scroll while the mobile drawer is open ────────────────
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const handleLogout = () => {
    clearSession();
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  const firstName = profile?.first_name || cachedUser?.first_name || "there";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        onLogoutClick={() => setShowLogoutConfirm(true)}
      />

      {/* Content column — offset on desktop to sit beside the fixed sidebar */}
      <div className="flex min-h-screen flex-col lg:pl-[264px]">
        {/* ---------- Top bar ---------- */}
        <header
          style={{ background: NAVY_GRADIENT }}
          className="sticky top-0 z-30 text-blue-100 shadow-lg"
        >
          {/* Non-401 fetch failure banner */}
          <AnimatePresence>
            {fetchError && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-amber-400/20 bg-amber-400/10"
              >
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-amber-200">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1">{fetchError}</span>
                  <button
                    type="button"
                    onClick={() => setFetchError("")}
                    aria-label="Dismiss"
                    className="rounded p-0.5 transition-colors hover:bg-white/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* hamburger — first name — profile icon (all breakpoints) */}
          <div className="flex h-16 items-center justify-between px-4 sm:h-[72px] sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-full p-2 text-blue-100 transition-colors hover:bg-white/10 active:scale-95 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Spacer keeps the name centered on desktop where there's no hamburger */}
            <div className="hidden flex-1 lg:block" />

            <AnimatePresence mode="wait">
              <motion.span
                key={firstName}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3 }}
                className="font-display flex-1 truncate text-center text-sm font-semibold text-white sm:text-base"
              >
                Hi, {firstName}
              </motion.span>
            </AnimatePresence>

            <div className="hidden flex-1 justify-end lg:flex">
              <ProfileMenu
                dropdownRef={dropdownRef}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                onLogoutClick={() => setShowLogoutConfirm(true)}
              />
            </div>

            <div className="lg:hidden">
              <ProfileMenu
                dropdownRef={dropdownRef}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                onLogoutClick={() => setShowLogoutConfirm(true)}
              />
            </div>
          </div>
        </header>

        {/* ---------- Page content ---------- */}
        <main className="flex-1">{children}</main>
      </div>

      <LogoutConfirmModal
        show={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

/* ================================================================
   Profile icon + dropdown — unisex icon, Profile / Logout
   ================================================================ */

function ProfileMenu({ dropdownRef, dropdownOpen, setDropdownOpen, onLogoutClick }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => setDropdownOpen((v) => !v)}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-10 sm:w-10"
      >
        <User className="h-5 w-5" strokeWidth={1.8} />
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 z-40 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            <Link
              to="/dashboard/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <UserCircle2 className="h-4.5 w-4.5 text-slate-400" />
              Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onLogoutClick();
              }}
              className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4.5 w-4.5" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   Logout confirmation modal
   ================================================================ */

function LogoutConfirmModal({ show, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-5 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-7"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
              Log out of Sinevest?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              You'll need to log in again to access your dashboard.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl"
              >
                Log out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}