// src/pages/dashboard/KycView.jsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Lock,
  ChevronDown,
  Pencil,
  AlertTriangle,
  Info,
  User,
  Briefcase,
  CreditCard,
  LineChart,
  Scale,
  ArrowRight,
  FileText,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — KycView
 * ------------------------------------------------------------------
 * Read-only counterpart to KycEdit. Nothing here is editable —
 * every action funnels to /dashboard/kyc-edit.
 *
 * GET /api/kyc/             -> full profile, grouped into sections
 *                               (personal_and_address, employment,
 *                               government_id, trading_expertise,
 *                               compliance) + status/submitted_at/
 *                               reviewed_at/admin_notes
 * GET /api/kyc/completion/  -> { overall_percentage, sections }
 * GET /api/kyc/status/      -> lightweight { status, submitted_at,
 *                               reviewed_at } — used so the status
 *                               chip renders instantly even if the
 *                               heavier /api/kyc/ call is slower.
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

/* ================================================================
   Section field labels — mirrors KycEdit's field config so values
   render with the same human-readable labels, purely for display.
   ================================================================ */

const SECTIONS = [
  {
    id: "personal_and_address",
    title: "Personal & address",
    icon: User,
    fields: [
      { name: "date_of_birth", label: "Date of birth", type: "date" },
      { name: "gender", label: "Gender", type: "select" },
      { name: "nationality", label: "Nationality", type: "text" },
      { name: "phone_number", label: "Phone number", type: "text" },
      { name: "country", label: "Country", type: "text" },
      { name: "state", label: "State / Province", type: "text" },
      { name: "city", label: "City", type: "text" },
      { name: "street_address", label: "Street address", type: "text" },
      { name: "postal_code", label: "Postal code", type: "text" },
    ],
  },
  {
    id: "employment",
    title: "Employment",
    icon: Briefcase,
    fields: [
      { name: "employment_status", label: "Employment status", type: "select" },
      { name: "employer_name", label: "Employer name", type: "text" },
      { name: "occupation", label: "Occupation", type: "text" },
      { name: "annual_income_range", label: "Annual income range", type: "select" },
      { name: "source_of_funds", label: "Source of funds", type: "select" },
    ],
  },
  {
    id: "government_id",
    title: "Government ID",
    icon: CreditCard,
    fields: [
      { name: "id_type", label: "ID type", type: "select" },
      { name: "id_number", label: "ID number", type: "text" },
      { name: "id_issuing_country", label: "Issuing country", type: "text" },
      { name: "id_expiry_date", label: "Expiry date", type: "date" },
    ],
  },
  {
    id: "trading_expertise",
    title: "Trading expertise",
    icon: LineChart,
    fields: [
      { name: "trading_experience_level", label: "Experience level", type: "select" },
      { name: "years_of_trading_experience", label: "Years of experience", type: "text" },
      { name: "risk_tolerance", label: "Risk tolerance", type: "select" },
      { name: "preferred_markets", label: "Preferred markets", type: "text" },
    ],
  },
  {
    id: "compliance",
    title: "Compliance",
    icon: Scale,
    fields: [
      { name: "is_politically_exposed_person", label: "Politically exposed person (PEP)", type: "checkbox" },
      { name: "agreed_to_terms", label: "Agreed to terms & KYC policy", type: "checkbox" },
    ],
  },
];

const STATUS_META = {
  not_submitted: {
    label: "Not submitted",
    chip: "bg-slate-100 text-slate-600",
    icon: ShieldAlert,
  },
  rejected: {
    label: "Rejected",
    chip: "bg-red-50 text-red-600",
    icon: ShieldX,
  },
  pending: {
    label: "Pending review",
    chip: "bg-amber-50 text-amber-600",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    chip: "bg-emerald-50 text-emerald-600",
    icon: ShieldCheck,
  },
};

/* ================================================================
   Helpers
   ================================================================ */

function progressTone(pct) {
  if (pct >= 100) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (pct >= 50) return { bar: "bg-amber-400", text: "text-amber-600" };
  return { bar: "bg-red-500", text: "text-red-600" };
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

/** Render a single field's value the way a human should read it. */
function displayValue(field, rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === "") return null;
  if (field.type === "checkbox") return rawValue === true || rawValue === "true" ? "Yes" : "No";
  if (field.type === "date") return formatDate(rawValue);
  if (field.type === "select") return String(rawValue).replace(/_/g, " ");
  return String(rawValue);
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
   One read-only section — collapsible, shows filled fields, greys
   out anything not yet provided.
   ================================================================ */

function KycSectionView({ section, sectionData, completionPct }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  const tone = progressTone(completionPct ?? 0);

  const filledCount = section.fields.filter(
    (f) => displayValue(f, sectionData?.[f.name]) !== null
  ).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-3.5 text-left sm:p-4"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-10 sm:w-10">
          <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">{section.title}</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 sm:w-32">
              <div
                className={`h-full rounded-full ${tone.bar}`}
                style={{ width: `${Math.min(completionPct ?? 0, 100)}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold sm:text-xs ${tone.text}`}>{completionPct ?? 0}%</span>
            <span className="text-[10px] text-slate-400 sm:text-xs">
              &middot; {filledCount}/{section.fields.length} provided
            </span>
          </div>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="grid grid-cols-1 gap-3 p-3.5 sm:grid-cols-2 sm:p-4">
              {section.fields.map((field) => {
                const value = displayValue(field, sectionData?.[field.name]);
                return (
                  <div key={field.name}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
                      {field.label}
                    </p>
                    <p
                      className={`mt-0.5 truncate text-xs font-medium capitalize sm:text-sm ${
                        value ? "text-slate-800" : "text-slate-300"
                      }`}
                    >
                      {value ?? "Not provided"}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   Export — KycView
   ================================================================ */

export default function KycView() {
  const navigate = useNavigate();

  const [status, setStatus] = useState(null); // { status, submitted_at, reviewed_at }
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");

  const [completion, setCompletion] = useState(null); // { overall_percentage, sections }
  const [completionLoading, setCompletionLoading] = useState(true);

  const [profile, setProfile] = useState(null); // full /api/kyc/ payload
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // ── Fetch status (lightweight, so the chip renders fast) ──────────
  const loadStatus = useCallback(async () => {
    try {
      const res = await api.get("/api/kyc/status/");
      setStatus(res.data?.data ?? res.data);
      setStatusError("");
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setStatusError("Couldn't load your KYC status.");
    } finally {
      setStatusLoading(false);
    }
  }, [navigate]);

  // ── Fetch completion breakdown ──────────────────────────────────
  const loadCompletion = useCallback(async () => {
    try {
      const res = await api.get("/api/kyc/completion/");
      setCompletion(res.data?.data ?? res.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      // Non-fatal — sections still render without percentages.
    } finally {
      setCompletionLoading(false);
    }
  }, [navigate]);

  // ── Fetch full profile ───────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get("/api/kyc/");
      const data = res.data?.data ?? res.data;
      setProfile(data);
      // /api/kyc/ also returns status/submitted_at/reviewed_at — use it
      // to keep the header in sync even before /status/ resolves.
      if (data?.status) {
        setStatus((prev) => prev ?? { status: data.status, submitted_at: data.submitted_at, reviewed_at: data.reviewed_at });
      }
      setProfileError("");
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setProfileError("Couldn't load your KYC details.");
    } finally {
      setProfileLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadStatus();
    loadCompletion();
    loadProfile();
  }, [loadStatus, loadCompletion, loadProfile]);

  const meta = STATUS_META[status?.status] || STATUS_META.not_submitted;
  const StatusIcon = meta.icon;
  const overall = completion?.overall_percentage ?? 0;
  const currentStatus = status?.status || "not_submitted";

  return (
    <div className="mx-auto max-w-2xl space-y-3 p-3 pb-10 sm:space-y-5 sm:p-5 lg:p-8">
      {/* ---------- Status header ---------- */}
      <Reveal>
        <div
          style={{ background: NAVY_GRADIENT }}
          className="relative overflow-hidden rounded-2xl p-4 text-blue-100 shadow-lg sm:rounded-3xl sm:p-6"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-14 -right-14 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl"
          />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="font-display text-base font-extrabold text-white sm:text-xl">
                My KYC details
              </h1>
              <p className="mt-0.5 text-[11px] text-blue-100/60 sm:text-xs">
                View-only — head to the edit page to make changes.
              </p>
            </div>
            {statusLoading ? (
              <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
            ) : (
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${meta.chip}`}>
                <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                {meta.label}
              </span>
            )}
          </div>

          {!statusLoading && !statusError && (status?.submitted_at || status?.reviewed_at) && (
            <div className="relative mt-4 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-3 sm:mt-5 sm:gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-blue-100/50 sm:text-[10px]">
                  Submitted
                </p>
                <p className="text-xs font-semibold text-white sm:text-sm">{formatDate(status?.submitted_at)}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-blue-100/50 sm:text-[10px]">
                  Reviewed
                </p>
                <p className="text-xs font-semibold text-white sm:text-sm">{formatDate(status?.reviewed_at)}</p>
              </div>
            </div>
          )}

          {statusError && (
            <p className="relative mt-3 flex items-center gap-1.5 text-xs text-red-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {statusError}
            </p>
          )}
        </div>
      </Reveal>

      {/* ---------- Admin notes (rejected profiles almost always have one) ---------- */}
      {!profileLoading && profile?.admin_notes && (
        <Reveal delay={0.04}>
          <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-red-700 sm:p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold sm:text-sm">Note from the review team</p>
              <p className="mt-0.5 text-xs leading-relaxed sm:text-sm">{profile.admin_notes}</p>
            </div>
          </div>
        </Reveal>
      )}

      {/* ---------- Status-specific guidance ---------- */}
      <Reveal delay={0.06}>
        {currentStatus === "not_submitted" && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-blue-200 bg-blue-50 p-3.5 text-blue-800 sm:p-4">
            <FileText className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold sm:text-sm">You haven't submitted your KYC yet</p>
              <p className="mt-0.5 text-xs leading-relaxed sm:text-sm">
                Fill in each section on the edit page, then submit for review. This page will update
                once you've saved details there.
              </p>
              <Link
                to="/dashboard/kyc-edit"
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-blue-700 sm:text-xs"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                Start my KYC
              </Link>
            </div>
          </div>
        )}

        {currentStatus === "rejected" && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-red-700 sm:p-4">
            <ShieldX className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold sm:text-sm">Your submission was rejected</p>
              <p className="mt-0.5 text-xs leading-relaxed sm:text-sm">
                Review the note above, correct the relevant section on the edit page, and resubmit
                for review.
              </p>
              <Link
                to="/dashboard/kyc-edit"
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-red-700 sm:text-xs"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                Fix and resubmit
              </Link>
            </div>
          </div>
        )}

        {currentStatus === "pending" && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-amber-800 sm:p-4">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold sm:text-sm">Your KYC is under review</p>
              <p className="mt-0.5 text-xs leading-relaxed sm:text-sm">
                You'll see a status change here once an admin reviews your profile. Editing is
                locked while review is in progress.
              </p>
            </div>
          </div>
        )}

        {currentStatus === "approved" && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800 sm:p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold sm:text-sm">You're verified</p>
              <p className="mt-0.5 text-xs leading-relaxed sm:text-sm">
                Your KYC is approved. If any of your details change, contact support — this profile
                is locked from further edits.
              </p>
            </div>
          </div>
        )}
      </Reveal>

      {/* ---------- Overall completion ---------- */}
      <Reveal delay={0.08}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">
              Overall completion
            </h2>
            <span className={`text-sm font-extrabold ${progressTone(overall).text} sm:text-base`}>
              {completionLoading ? "—" : `${overall}%`}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 sm:h-2.5">
            <motion.div
              className={`h-full rounded-full ${progressTone(overall).bar}`}
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(overall, 100)}%` }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>
      </Reveal>

      {/* ---------- Read-only section breakdown ---------- */}
      {profileError ? (
        <Reveal delay={0.1}>
          <p className="flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 sm:p-4 sm:text-sm">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {profileError}
          </p>
        </Reveal>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {SECTIONS.map((section, i) => (
            <Reveal key={section.id} delay={0.1 + i * 0.05}>
              {profileLoading ? (
                <div className="h-16 animate-pulse rounded-2xl bg-slate-100 sm:h-[4.5rem]" />
              ) : (
                <KycSectionView
                  section={section}
                  sectionData={profile?.[section.id]}
                  completionPct={completion?.sections?.[section.id]}
                />
              )}
            </Reveal>
          ))}
        </div>
      )}

      {/* ---------- Edit link — always available ---------- */}
      <Reveal delay={0.1 + SECTIONS.length * 0.05 + 0.05}>
        <Link to="/dashboard/kyc-edit" className="block">
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-shadow hover:shadow-xl sm:py-3.5"
          >
            {currentStatus === "pending" || currentStatus === "approved" ? (
              <>
                <Lock className="h-4 w-4" />
                View edit page
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edit my KYC details
              </>
            )}
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </motion.button>
        </Link>
      </Reveal>
    </div>
  );
}