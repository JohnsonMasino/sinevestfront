// src/pages/dashboard/KycEdit.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Lock,
  ChevronDown,
  Save,
  Send,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  User,
  Briefcase,
  CreditCard,
  LineChart,
  Scale,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — KycEdit
 * ------------------------------------------------------------------
 * GET   /api/kyc/status/       -> { status, submitted_at, reviewed_at }
 * GET   /api/kyc/completion/   -> { overall_percentage, sections }
 * GET   /api/kyc/              -> (undocumented, attempted defensively
 *                                  to prefill the form — ignored if
 *                                  it doesn't exist on your backend)
 * PATCH /api/kyc/              -> partial field update, section by
 *                                  section. Locked (403) once status
 *                                  is 'pending' or 'approved'.
 * POST  /api/kyc/submit/       -> moves 'not_submitted'/'rejected'
 *                                  to 'pending'. Requires
 *                                  agreed_to_terms already true.
 *
 * Two distinct actions, deliberately styled differently so they're
 * never confused:
 *   - "Save section" (per section)  -> quiet, blue/outline, PATCH
 *   - "Submit KYC for review" (once)-> bold, amber, POST, irreversible
 *     until an admin resets the profile.
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

/* ================================================================
   Section + field config — field names match the PATCH schema
   exactly. Select options are best-guess from the example payload;
   confirm against your backend's real choice values.
   ================================================================ */

const SECTIONS = [
  {
    id: "personal_and_address",
    title: "Personal & address",
    icon: User,
    fields: [
      { name: "date_of_birth", label: "Date of birth", type: "date" },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["male", "female", "other"],
      },
      { name: "nationality", label: "Nationality", type: "text" },
      { name: "phone_number", label: "Phone number", type: "tel" },
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
      {
        name: "employment_status",
        label: "Employment status",
        type: "select",
        options: ["employed", "self_employed", "unemployed", "student", "retired"],
      },
      { name: "employer_name", label: "Employer name", type: "text" },
      { name: "occupation", label: "Occupation", type: "text" },
      {
        name: "annual_income_range",
        label: "Annual income range",
        type: "select",
        options: ["under_10k", "10k_50k", "50k_100k", "100k_500k", "above_500k"],
      },
      {
        name: "source_of_funds",
        label: "Source of funds",
        type: "select",
        options: ["salary", "business", "investments", "inheritance", "other"],
      },
    ],
  },
  {
    id: "government_id",
    title: "Government ID",
    icon: CreditCard,
    fields: [
      {
        name: "id_type",
        label: "ID type",
        type: "select",
        options: ["passport", "national_id", "drivers_license"],
      },
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
      {
        name: "trading_experience_level",
        label: "Experience level",
        type: "select",
        options: ["beginner", "intermediate", "advanced", "expert"],
      },
      { name: "years_of_trading_experience", label: "Years of experience", type: "number" },
      {
        name: "risk_tolerance",
        label: "Risk tolerance",
        type: "select",
        options: ["low", "medium", "high"],
      },
      { name: "preferred_markets", label: "Preferred markets (e.g. forex, stocks, crypto)", type: "text" },
    ],
  },
  {
    id: "compliance",
    title: "Compliance",
    icon: Scale,
    fields: [
      { name: "is_politically_exposed_person", label: "I am a politically exposed person (PEP)", type: "checkbox" },
      { name: "agreed_to_terms", label: "I agree to Sinevest's terms & KYC policy", type: "checkbox" },
    ],
  },
];

const SECTION_LABELS = Object.fromEntries(SECTIONS.map((s) => [s.id, s.title]));

const STATUS_META = {
  not_submitted: {
    label: "Not submitted",
    tone: "text-slate-600",
    chip: "bg-slate-100 text-slate-600",
    icon: ShieldAlert,
    editable: true,
  },
  rejected: {
    label: "Rejected — please review and resubmit",
    tone: "text-red-600",
    chip: "bg-red-50 text-red-600",
    icon: ShieldX,
    editable: true,
  },
  pending: {
    label: "Pending review",
    tone: "text-amber-600",
    chip: "bg-amber-50 text-amber-600",
    icon: Clock,
    editable: false,
  },
  approved: {
    label: "Approved",
    tone: "text-emerald-600",
    chip: "bg-emerald-50 text-emerald-600",
    icon: ShieldCheck,
    editable: false,
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

/** Extract a readable message from an axios error, however the backend shaped it. */
function extractErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const firstVal = data[firstKey];
    if (Array.isArray(firstVal)) return `${firstKey.replace(/_/g, " ")}: ${firstVal[0]}`;
    if (typeof firstVal === "string") return `${firstKey.replace(/_/g, " ")}: ${firstVal}`;
  }
  return fallback;
}

/** Normalize backend field-error shape ({field: ["msg"]}) into {field: "msg"}. */
function extractFieldErrors(err) {
  const data = err?.response?.data;
  if (!data || typeof data !== "object" || data.detail || data.message) return {};
  const out = {};
  for (const [key, val] of Object.entries(data)) {
    out[key] = Array.isArray(val) ? val.join(" ") : String(val);
  }
  return out;
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
   Field input — renders text/select/date/number/checkbox uniformly
   ================================================================ */

function FieldInput({ field, value, onChange, error, disabled }) {
  const baseClass = `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
    error ? "border-red-300" : "border-slate-200"
  }`;

  if (field.type === "checkbox") {
    return (
      <label className="flex items-start gap-2.5 py-1">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-400 disabled:cursor-not-allowed"
        />
        <span className="text-xs leading-relaxed text-slate-700 sm:text-sm">{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-slate-600 sm:text-xs">
          {field.label}
        </label>
        <select
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          disabled={disabled}
          className={baseClass}
        >
          <option value="">Select…</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-slate-600 sm:text-xs">
        {field.label}
      </label>
      <input
        type={field.type}
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        disabled={disabled}
        className={baseClass}
      />
      {error && <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

/* ================================================================
   Inline banner (success / error / info)
   ================================================================ */

function InlineBanner({ tone, children }) {
  if (!children) return null;
  const tones = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={`mt-3 flex items-start gap-2 overflow-hidden rounded-lg border px-3 py-2 text-xs ${tones[tone]}`}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </motion.div>
  );
}

/* ================================================================
   One collapsible section — its own form state slice, its own
   "Save section" action (PATCH), independent of every other section
   ================================================================ */

function KycSectionCard({ section, completionPct, formData, onFieldChange, disabled, onSaved }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ tone: "", text: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const tone = progressTone(completionPct ?? 0);
  const Icon = section.icon;

  const handleSave = async (e) => {
    e.stopPropagation();
    setSaving(true);
    setMessage({ tone: "", text: "" });
    setFieldErrors({});

    // Only send fields that actually have a value — never overwrite
    // saved data on the backend with a blank the user didn't touch.
    const payload = {};
    section.fields.forEach((f) => {
      const v = formData[f.name];
      if (f.type === "checkbox") {
        if (typeof v === "boolean") payload[f.name] = v;
      } else if (v !== undefined && v !== null && v !== "") {
        payload[f.name] = f.type === "number" ? Number(v) : v;
      }
    });

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      setMessage({ tone: "error", text: "Fill in at least one field before saving this section." });
      return;
    }

    try {
      const res = await api.patch("/api/kyc/", payload);
      setMessage({ tone: "success", text: "Section saved." });
      onSaved(res.data?.data ?? res.data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        setMessage({
          tone: "error",
          text: extractErrorMessage(err, "This section is locked while your KYC is under review."),
        });
      } else if (status === 400) {
        setFieldErrors(extractFieldErrors(err));
        setMessage({ tone: "error", text: "Please fix the highlighted fields and try again." });
      } else {
        setMessage({ tone: "error", text: "Something went wrong saving this section. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

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
            <div className="space-y-3 p-3.5 sm:p-4">
              {disabled && (
                <p className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500 sm:text-xs">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  Locked while your KYC is under review or approved.
                </p>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field.name} className={field.type === "checkbox" ? "sm:col-span-2" : ""}>
                    <FieldInput
                      field={field}
                      value={formData[field.name]}
                      onChange={onFieldChange}
                      error={fieldErrors[field.name]}
                      disabled={disabled || saving}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={disabled || saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-5"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? "Saving…" : "Save section"}
              </button>

              <AnimatePresence>
                {message.text && <InlineBanner tone={message.tone}>{message.text}</InlineBanner>}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   Export — KycEdit
   ================================================================ */

export default function KycEdit() {
  const navigate = useNavigate();

  const [status, setStatus] = useState(null); // { status, submitted_at, reviewed_at }
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");

  const [completion, setCompletion] = useState(null); // { overall_percentage, sections }
  const [completionLoading, setCompletionLoading] = useState(true);

  const [formData, setFormData] = useState({});

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ tone: "", text: "" });

  const meta = STATUS_META[status?.status] || STATUS_META.not_submitted;
  const locked = !meta.editable;

  // ── Fetch status ──────────────────────────────────────────────────
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

  // ── Fetch completion breakdown ───────────────────────────────────
  const loadCompletion = useCallback(async () => {
    try {
      const res = await api.get("/api/kyc/completion/");
      setCompletion(res.data?.data ?? res.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      // Non-fatal — the form still works without the progress breakdown.
    } finally {
      setCompletionLoading(false);
    }
  }, [navigate]);

  // ── Best-effort prefill (endpoint not guaranteed to exist) ────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/kyc/");
        const data = res.data?.data ?? res.data;
        if (!cancelled && data && typeof data === "object") {
          setFormData((prev) => ({ ...data, ...prev }));
        }
      } catch {
        // Fine — no such endpoint, or nothing to prefill. Form starts blank.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadStatus();
    loadCompletion();
  }, [loadStatus, loadCompletion]);

  const handleFieldChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // A section save can change status (e.g. rejected -> not_submitted
  // isn't typical, but re-sync anyway so lock state stays accurate).
  const handleSectionSaved = useCallback(
    (patchResponse) => {
      if (patchResponse?.status) {
        setStatus((prev) => ({ ...prev, status: patchResponse.status }));
      }
      loadCompletion();
    },
    [loadCompletion]
  );

  const handleSubmitForReview = async () => {
    setSubmitLoading(true);
    setSubmitMessage({ tone: "", text: "" });
    try {
      const res = await api.post("/api/kyc/submit/");
      const data = res.data?.data ?? res.data;
      setStatus((prev) => ({
        ...prev,
        status: data?.status || "pending",
        submitted_at: data?.submitted_at,
      }));
      setSubmitMessage({ tone: "success", text: data?.message || "KYC submitted for review." });
    } catch (err) {
      setSubmitMessage({
        tone: "error",
        text: extractErrorMessage(
          err,
          "Couldn't submit your KYC. Make sure every required section is complete and you've agreed to the terms."
        ),
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const overall = completion?.overall_percentage ?? 0;
  const StatusIcon = meta.icon;

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
                KYC verification
              </h1>
              <p className="mt-0.5 text-[11px] text-blue-100/60 sm:text-xs">
                Complete each section, then submit for review.
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

      {/* ---------- Overall completion ---------- */}
      <Reveal delay={0.06}>
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

      {/* ---------- Locked notice ---------- */}
      {!statusLoading && locked && (
        <Reveal delay={0.08}>
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-amber-800 sm:p-4">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs leading-relaxed sm:text-sm">
              {status?.status === "approved"
                ? "Your KYC is approved. Editing is disabled — contact support if any of your details need to change."
                : "Your KYC is pending review. Editing is disabled until an admin resets the profile or completes the review."}
            </p>
          </div>
        </Reveal>
      )}

      {/* ---------- Section forms ---------- */}
      <div className="space-y-2.5 sm:space-y-3">
        {SECTIONS.map((section, i) => (
          <Reveal key={section.id} delay={0.1 + i * 0.05}>
            <KycSectionCard
              section={section}
              completionPct={completion?.sections?.[section.id]}
              formData={formData}
              onFieldChange={handleFieldChange}
              disabled={locked}
              onSaved={handleSectionSaved}
            />
          </Reveal>
        ))}
      </div>

      {/* ---------- Submit for review — visually distinct action ---------- */}
      <Reveal delay={0.1 + SECTIONS.length * 0.05 + 0.05}>
        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 sm:rounded-3xl sm:p-6">
          <div className="flex items-start gap-2.5">
            <Send className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">Submit KYC for review</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                Once submitted, your profile locks and moves to <strong>pending</strong> — no further
                edits until an admin reviews it. Make sure every section above is saved first, and
                that you've agreed to the terms in the Compliance section.
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleSubmitForReview}
            disabled={locked || submitLoading}
            whileHover={{ y: locked || submitLoading ? 0 : -2 }}
            whileTap={{ scale: locked || submitLoading ? 1 : 0.97 }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5"
          >
            {submitLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : locked ? (
              <>
                <Lock className="h-4 w-4" />
                {status?.status === "approved" ? "Already approved" : "Already submitted"}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit KYC for review
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {submitMessage.text && <InlineBanner tone={submitMessage.tone}>{submitMessage.text}</InlineBanner>}
          </AnimatePresence>
        </div>
      </Reveal>

      {/* ---------- View details ---------- */}
      <Reveal delay={0.1 + SECTIONS.length * 0.05 + 0.1}>
        <Link to="/dashboard/kyc-view" className="block">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" strokeWidth={1.9} />
            View my KYC details
          </button>
        </Link>
      </Reveal>
    </div>
  );
}