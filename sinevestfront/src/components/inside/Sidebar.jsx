// src/components/dashboard/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  ArrowUpFromLine,
  TrendingUp,
  KeyRound,
  ShieldCheck,
  UserCircle2,
  LogOut,
  X,
  House
} from "lucide-react";

/**
 * Sinevest — Dashboard Sidebar
 * ------------------------------------------------------------------
 * Same design system as Homecontent1: navy gradient panel, amber
 * accent, font-display/font-body, hand-drawn icon feel (via lucide,
 * thin stroke weight to match). Desktop = permanent fixed panel.
 * Mobile = off-canvas drawer controlled by `isOpen`/`onClose` from
 * Head.jsx.
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

const FUNCTION_ITEMS = [
  { to: "/dashboard/", label: "Home", icon: House },
  { to: "/dashboard/deposit", label: "Deposit", icon: Banknote },
  { to: "/dashboard/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { to: "/dashboard/investment", label: "Investment", icon: TrendingUp },
  { to: "/dashboard/transaction-pin", label: "Transaction PIN", icon: KeyRound },
  { to: "/dashboard/kyc-view", label: "KYC", icon: ShieldCheck },
];

function isActivePath(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("isAuthenticated");
}

export default function Sidebar({ isOpen, onClose, onLogoutClick }) {
  const { pathname } = useLocation();

  return (
    <>
      {/* ---------- Desktop — permanent panel ---------- */}
      <aside
        style={{ background: NAVY_GRADIENT }}
        className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[264px] flex-col text-blue-100"
      >
        <SidebarContent pathname={pathname} onLogoutClick={onLogoutClick} />
      </aside>

      {/* ---------- Mobile — off-canvas drawer ---------- */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{ background: NAVY_GRADIENT }}
              className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-[300px] flex-col text-blue-100 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <span className="font-display text-base font-bold text-white">
                  Sine<span className="text-amber-400">vest</span>
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="rounded-full p-2 text-blue-100/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <SidebarContent
                pathname={pathname}
                onNavigate={onClose}
                onLogoutClick={onLogoutClick}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ pathname, onNavigate, onLogoutClick }) {
  return (
    <>
      {/* Brand — desktop only (mobile drawer has its own header row) */}
      <div className="hidden items-center gap-2.5 border-b border-white/10 px-6 py-6 lg:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-display text-lg font-bold text-white">
          Sine<span className="text-amber-400">vest</span>
        </span>
      </div>

      {/* Function buttons */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-6">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-blue-100/40">
          Actions
        </p>
        {FUNCTION_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-blue-100/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dashboard-sidebar-active-bar"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-amber-400"
                />
              )}
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-amber-400/20 text-amber-300"
                    : "bg-white/5 text-blue-100/60 group-hover:text-amber-300"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile + Logout — bottom */}
      <div className="space-y-1.5 border-t border-white/10 px-3.5 py-5">
        <Link
          to="/dashboard/profile"
          onClick={onNavigate}
          className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
            isActivePath(pathname, "/dashboard/profile")
              ? "bg-white/10 text-white"
              : "text-blue-100/70 hover:bg-white/5 hover:text-white"
          }`}
        >
          {isActivePath(pathname, "/dashboard/profile") && (
            <motion.span
              layoutId="dashboard-sidebar-active-bar"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-amber-400"
            />
          )}
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-blue-100/60 group-hover:text-amber-300">
            <UserCircle2 className="h-4 w-4" strokeWidth={1.8} />
          </span>
          Profile
        </Link>

        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onLogoutClick();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-300">
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
          </span>
          Log out
        </button>

        <p className="flex items-center gap-1.5 px-3.5 pt-3 text-[11px] text-blue-100/40">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          Your session is encrypted &amp; secure.
        </p>
      </div>
    </>
  );
}

export { clearSession };