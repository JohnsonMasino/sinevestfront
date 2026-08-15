// src/pages/dashboard/Profile.jsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
  Mail,
  BadgeCheck,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — Profile
 * ------------------------------------------------------------------
 * GET /api/auth/me/            -> basic account info
 * GET /api/kyc/completion/     -> overall % + per-section breakdown
 *
 * If overall_percentage < 100, an incomplete-KYC warning modal opens
 * automatically once the data has loaded, nudging the user toward
 * /dashboard/kyc-submit. Same navy/amber design system, mobile-first,
 * fully animated via framer-motion.
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

const SECTION_LABELS = {
  personal_and_address: "Personal & address",
  employment: "Employment",
  government_id: "Government ID",
  trading_expertise: "Trading expertise",
  compliance: "Compliance",
};

/* ================================================================
   Helpers
   ================================================================ */

function initialsOf(firstName, lastName) {
  const a = (firstName || "").trim()[0] || "";
  const b = (lastName || "").trim()[0] || "";
  return (a + b).toUpperCase() || "U";
}

function formatJoinDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });
}

function progressTone(pct) {
  if (pct >= 100) return { bar: "bg-emerald-500", text: "text-emerald-600", chip: "bg-emerald-50 text-emerald-600" };
  if (pct >= 50) return { bar: "bg-amber-400", text: "text-amber-600", chip: "bg-amber-50 text-amber-600" };
  return { bar: "bg-red-500", text: "text-red-600", chip: "bg-red-50 text-red-600" };
}

/* Count-up number, matches the pattern used elsewhere in the app */
function CountUp({ target, duration = 1100 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <span className="tabular-nums">{value}</span>;
}

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   1. Profile details card
   ================================================================ */

function ProfileCard({ user, loading, error }) {
  return (
    <div
      style={{ background: NAVY_GRADIENT }}
      className="relative overflow-hidden rounded-2xl p-4 text-blue-100 shadow-lg sm:rounded-3xl sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -right-14 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl"
      />

      {loading ? (
        <div className="relative flex items-center gap-3 sm:gap-4">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-white/10 sm:h-16 sm:w-16" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-white/10 sm:w-40" />
            <div className="h-3 w-40 animate-pulse rounded bg-white/10 sm:w-52" />
          </div>
        </div>
      ) : error ? (
        <p className="relative flex items-center gap-1.5 text-xs text-red-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-400/15 font-display text-lg font-bold text-amber-300 sm:h-16 sm:w-16 sm:text-xl"
            >
              {initialsOf(user?.first_name, user?.last_name)}
            </motion.span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display truncate text-base font-extrabold text-white sm:text-xl">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-blue-100/70 sm:text-sm">
                <Mail className="h-3 w-3 shrink-0" strokeWidth={1.8} />
                <span className="truncate">{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2.5 sm:p-3">
              {user?.is_verified ? (
                <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-300" strokeWidth={1.9} />
              ) : (
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" strokeWidth={1.9} />
              )}
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wide text-blue-100/50 sm:text-[10px]">
                  Verification
                </p>
                <p className="truncate text-xs font-semibold text-white sm:text-sm">
                  {user?.is_verified ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2.5 sm:p-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-blue-200" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wide text-blue-100/50 sm:text-[10px]">
                  Member since
                </p>
                <p className="truncate text-xs font-semibold text-white sm:text-sm">
                  {formatJoinDate(user?.date_joined)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   2. KYC completion card — overall ring + per-section breakdown
   ================================================================ */

function KycRing({ percentage }) {
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone = progressTone(percentage);

  return (
    <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center sm:h-[104px] sm:w-[104px]">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={percentage >= 100 ? "#10b981" : percentage >= 50 ? "#fbbf24" : "#ef4444"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - percentage / 100) }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-display text-lg font-extrabold sm:text-xl ${tone.text}`}>
          <CountUp target={percentage} />%
        </span>
      </div>
    </div>
  );
}

function KycSection({ label, percentage, delay }) {
  const tone = progressTone(percentage);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={`text-[11px] font-bold sm:text-xs ${tone.text}`}>{percentage}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 sm:h-2">
        <motion.div
          className={`h-full rounded-full ${tone.bar}`}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.9, delay: delay + 0.1, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </motion.div>
  );
}

function KycCard({ kyc, loading, error }) {
  const sections = kyc?.sections || {};
  const overall = kyc?.overall_percentage ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">
            KYC completion
          </h2>
          <p className="text-[10px] text-slate-400 sm:text-xs">Verify your identity to unlock full access</p>
        </div>
        <ClipboardCheck className="h-4 w-4 text-slate-300 sm:h-5 sm:w-5" strokeWidth={1.8} />
      </div>

      {loading ? (
        <div className="mt-4 flex items-center gap-4 sm:mt-5">
          <div className="h-[88px] w-[88px] shrink-0 animate-pulse rounded-full bg-slate-100 sm:h-[104px] sm:w-[104px]" />
          <div className="flex-1 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 w-full animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </div>
      ) : error ? (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-red-500">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4 sm:mt-5 sm:gap-6">
            <KycRing percentage={overall} />
            <div className="min-w-0 flex-1 space-y-2.5 sm:space-y-3">
              {Object.entries(sections).map(([key, pct], i) => (
                <KycSection
                  key={key}
                  label={SECTION_LABELS[key] || key.replace(/_/g, " ")}
                  percentage={pct}
                  delay={0.06 * i}
                />
              ))}
            </div>
          </div>

          <Link to="/dashboard/kyc-submit" className="mt-5 block sm:mt-6">
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl sm:py-3.5 sm:text-sm"
            >
              {overall >= 100 ? "Review your KYC details" : "Complete your KYC"}
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </motion.button>
          </Link>
        </>
      )}
    </div>
  );
}

/* ================================================================
   3. Incomplete-KYC warning modal — auto-opens once data has loaded
   ================================================================ */

function KycWarningModal({ show, percentage, onDismiss }) {
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
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-7"
          >
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50"
            >
              <ShieldAlert className="h-6 w-6 text-amber-500" />
            </motion.div>

            <h2 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
              Your KYC is {percentage}% complete
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Some of Sinevest's services
              require full identity verification. Finish your KYC to unlock full access
              to the platform.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={onDismiss}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Later
              </button>
              <Link to="/dashboard/kyc-submit" className="flex-1">
                <button
                  type="button"
                  className="w-full rounded-full bg-gradient-to-br from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-shadow hover:shadow-xl"
                >
                  Complete now
                </button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================
   Export — Profile
   ================================================================ */

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  const [kyc, setKyc] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycError, setKycError] = useState("");

  const [warningOpen, setWarningOpen] = useState(false);
  const [warningShown, setWarningShown] = useState(false);

  // ── Fetch account info ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/auth/me/");
        const data = res.data?.data ?? res.data;
        if (!cancelled) setUser(data);
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          navigate("/login");
          return;
        }
        setUserError("Couldn't load your profile.");
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ── Fetch KYC completion ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/kyc/completion/");
        const data = res.data?.data ?? res.data;
        if (!cancelled) setKyc(data);
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          navigate("/login");
          return;
        }
        setKycError("Couldn't load your KYC status.");
      } finally {
        if (!cancelled) setKycLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ── Auto-open the warning modal once, if KYC isn't fully complete ──
  useEffect(() => {
    if (kycLoading || kycError || warningShown) return;
    const overall = kyc?.overall_percentage ?? 100;
    if (overall < 100) {
      setWarningOpen(true);
      setWarningShown(true);
    }
  }, [kyc, kycLoading, kycError, warningShown]);

  return (
    <div className="mx-auto max-w-2xl space-y-3 p-3 pb-8 sm:space-y-5 sm:p-5 lg:p-8">
      <Reveal>
        <ProfileCard user={user} loading={userLoading} error={userError} />
      </Reveal>

      <Reveal delay={0.08}>
        <KycCard kyc={kyc} loading={kycLoading} error={kycError} />
      </Reveal>

      <KycWarningModal
        show={warningOpen}
        percentage={kyc?.overall_percentage ?? 0}
        onDismiss={() => setWarningOpen(false)}
      />
    </div>
  );
}