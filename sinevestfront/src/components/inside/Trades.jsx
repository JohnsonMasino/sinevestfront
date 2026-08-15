// src/pages/dashboard/Trades.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Lock,
  TrendingUp,
  Plus,
  ArrowRight,
  ArrowLeft,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
  Coins,
  Gem,
  Building2,
  Home,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Info,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — Trades (Trades.jsx)
 * ------------------------------------------------------------------
 * Same design system as Dash.jsx: navy gradient + amber accent,
 * font-display/font-body, framer-motion reveals, mobile-first Tailwind.
 *
 * Data sources:
 *   GET  /api/wallet/          -> balance summary
 *   GET  /api/trades/active/   -> active trades w/ live countdown
 *   GET  /api/trades/{id}/     -> single trade detail (drawer)
 *   GET  /api/trade-plans/     -> the five investable plans
 *   POST /api/trades/          -> open a new trade
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

/* ================================================================
   Helpers
   ================================================================ */

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatUSD(value, { compact = false } = {}) {
  const n = toNumber(value);
  const abs = Math.abs(n);
  const formatted = compact
    ? abs.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })
    : abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${n < 0 ? "-" : ""}$${formatted}`;
}

function formatDuration(hours) {
  const h = toNumber(hours);
  if (h % 24 === 0 && h >= 24) return `${h / 24}d`;
  return `${h}h`;
}

function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCountdown(msRemaining) {
  if (msRemaining <= 0) return "Maturing";
  const totalSec = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (days > 0) return `${days}d ${String(hours).padStart(2, "0")}h`;
  if (hours > 0) return `${hours}h ${String(mins).padStart(2, "0")}m`;
  if (mins > 0) return `${mins}m ${String(secs).padStart(2, "0")}s`;
  return `${secs}s`;
}

const PLAN_THEME = {
  silver: { icon: Coins, wrap: "bg-slate-100 text-slate-600", ring: "ring-slate-300", bar: "#64748b" },
  gold: { icon: Gem, wrap: "bg-amber-50 text-amber-600", ring: "ring-amber-300", bar: "#d97706" },
  forex: { icon: TrendingUp, wrap: "bg-blue-50 text-blue-600", ring: "ring-blue-300", bar: "#2563eb" },
  company_shares: { icon: Building2, wrap: "bg-indigo-50 text-indigo-600", ring: "ring-indigo-300", bar: "#4f46e5" },
  real_estate: { icon: Home, wrap: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-300", bar: "#059669" },
};

function planTheme(code) {
  return PLAN_THEME[code] || { icon: TrendingUp, wrap: "bg-blue-50 text-blue-600", ring: "ring-blue-300", bar: "#2563eb" };
}

/* ================================================================
   Live tick — re-renders every second so countdowns stay accurate
   without drift (derived from matures_at, not a stored countdown).
   ================================================================ */

function useLiveTick(intervalMs = 1000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

/* ================================================================
   Reveal wrapper — consistent with the rest of the app
   ================================================================ */

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
   1. Balance hero — available / locked / total, trading context
   ================================================================ */

function TradeBalanceHero({ wallet, loading, error }) {
  return (
    <div
      style={{ background: NAVY_GRADIENT }}
      className="relative overflow-hidden rounded-2xl p-4 text-blue-100 shadow-lg sm:rounded-3xl sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -right-14 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-100/60 sm:text-xs">
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} />
          Investment balance
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-100/80">
          <Wallet className="h-3 w-3" strokeWidth={1.8} />
          Wallet
        </span>
      </div>

      {error ? (
        <p className="relative mt-4 flex items-center gap-1.5 text-xs text-red-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        <>
          <div className="relative mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="rounded-xl bg-white/5 p-2.5 sm:p-3.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-300/90 sm:text-[10px]">
                Available to invest
              </p>
              {loading ? (
                <div className="mt-1.5 h-6 w-20 animate-pulse rounded bg-white/10 sm:h-7" />
              ) : (
                <p className="mt-1 truncate text-lg font-extrabold text-white sm:text-2xl">
                  {formatUSD(wallet?.available_balance)}
                </p>
              )}
            </div>
            <div className="rounded-xl bg-white/5 p-2.5 sm:p-3.5">
              <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-amber-300/90 sm:text-[10px]">
                <Lock className="h-2.5 w-2.5" strokeWidth={2} />
                Locked in trades
              </p>
              {loading ? (
                <div className="mt-1.5 h-6 w-20 animate-pulse rounded bg-white/10 sm:h-7" />
              ) : (
                <p className="mt-1 truncate text-lg font-extrabold text-white sm:text-2xl">
                  {formatUSD(wallet?.locked_balance)}
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-2.5 flex items-center justify-between border-t border-white/10 pt-2.5 sm:mt-3 sm:pt-3.5">
            <p className="text-[9px] uppercase tracking-wide text-blue-100/45 sm:text-[10px]">Total balance</p>
            <p className="text-xs font-bold text-blue-100 sm:text-sm">
              {loading ? "—" : formatUSD(wallet?.total_balance)}
            </p>
          </div>

          <p className="relative mt-2 flex items-start gap-1 text-[9px] leading-relaxed text-blue-100/45 sm:text-[10px]">
            <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" strokeWidth={2} />
            Only your available balance can be used to open a new trade — locked funds are already working in active trades.
          </p>
        </>
      )}
    </div>
  );
}

/* ================================================================
   2. Status badge
   ================================================================ */

function StatusBadge({ status }) {
  const map = {
    active: "bg-blue-50 text-blue-600",
    completed: "bg-emerald-50 text-emerald-600",
    cancelled: "bg-red-50 text-red-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize sm:text-[10px] ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

/* ================================================================
   3. Active trade card
   ================================================================ */

function ActiveTradeCard({ trade, onView, index }) {
  useLiveTick(1000); // forces this card to re-render every second

  const msRemaining = new Date(trade.matures_at).getTime() - Date.now();
  const matured = msRemaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.35 }}
      className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:rounded-3xl sm:p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">{trade.plan_name}</p>
          <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">Principal {formatUSD(trade.amount)}</p>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold tabular-nums sm:text-[10px] ${
            matured ? "animate-pulse bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
          }`}
        >
          <Clock className="h-2.5 w-2.5" strokeWidth={2.4} />
          {formatCountdown(msRemaining)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-2 sm:px-3">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">
          Expected profit
        </p>
        <p className="text-xs font-bold text-emerald-600 sm:text-sm">+{formatUSD(trade.expected_profit)}</p>
      </div>

      <button
        onClick={() => onView(trade.id)}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-[10px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 sm:text-xs"
      >
        View details
        <ChevronRight className="h-3 w-3" strokeWidth={2.2} />
      </button>
    </motion.div>
  );
}

/* ================================================================
   4. Empty state
   ================================================================ */

function EmptyTradesState({ onCreate }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center sm:rounded-3xl sm:py-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:h-14 sm:w-14">
        <TrendingUp className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <p className="mt-3 text-sm font-bold text-slate-900 sm:text-base">No active trades yet</p>
      <p className="mt-1 max-w-xs text-[11px] text-slate-400 sm:text-xs">
        Put your available balance to work — open a trade on any plan you can afford and watch it mature.
      </p>
      <button
        onClick={onCreate}
        className="mt-4 flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 sm:text-sm"
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
        Start a new trade
      </button>
    </div>
  );
}

/* ================================================================
   5. Trade detail drawer/modal
   ================================================================ */

function TradeDetailModal({ tradeId, onClose }) {
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tradeId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await api.get(`/api/trades/${tradeId}/`);
        const data = res.data?.data ?? res.data;
        if (!cancelled) setTrade(data);
      } catch (err) {
        if (!cancelled) setError("Couldn't load this trade's details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tradeId]);

  const theme = planTheme(trade?.plan_code);
  const Icon = theme.icon;

  return (
    <AnimatePresence>
      {tradeId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="w-full max-w-md rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900 sm:text-base">Trade details</p>
              <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : error ? (
              <p className="mt-6 flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            ) : (
              trade && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.wrap}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{trade.plan_name}</p>
                      <StatusBadge status={trade.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <DetailRow label="Principal" value={formatUSD(trade.amount)} />
                    <DetailRow label="Profit rate" value={`${toNumber(trade.profit_percentage)}%`} />
                    <DetailRow label="Expected profit" value={`+${formatUSD(trade.expected_profit)}`} accent="text-emerald-600" />
                    <DetailRow
                      label="Actual profit paid"
                      value={trade.actual_profit_paid != null ? `+${formatUSD(trade.actual_profit_paid)}` : "Pending"}
                      accent={trade.actual_profit_paid != null ? "text-emerald-600" : "text-slate-400"}
                    />
                    <DetailRow label="Started" value={formatDateTime(trade.started_at)} />
                    <DetailRow label="Matures" value={formatDateTime(trade.matures_at)} />
                  </div>

                  {trade.closed_at && (
                    <div className="rounded-xl bg-emerald-50 p-3 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Closed</p>
                      <p className="mt-0.5 text-xs font-bold text-emerald-700">{formatDateTime(trade.closed_at)}</p>
                    </div>
                  )}
                </div>
              )
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value, accent = "text-slate-800" }) {
  return (
    <div className="rounded-xl border border-slate-100 p-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-0.5 truncate text-xs font-bold sm:text-sm ${accent}`}>{value}</p>
    </div>
  );
}

/* ================================================================
   6. New trade modal — Step 1: pick plan, Step 2: enter amount
   ================================================================ */

function PlanCard({ plan, affordable, selected, onSelect }) {
  const theme = planTheme(plan.code);
  const Icon = theme.icon;

  return (
    <motion.button
      type="button"
      disabled={!affordable}
      onClick={() => affordable && onSelect(plan)}
      whileTap={affordable ? { scale: 0.98 } : {}}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors sm:p-3.5 ${
        !affordable
          ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
          : selected
          ? `border-transparent bg-blue-50 ring-2 ${theme.ring}`
          : "border-slate-200 bg-white hover:border-blue-300"
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${theme.wrap}`}>
        {!affordable ? <Lock className="h-4 w-4" strokeWidth={2} /> : <Icon className="h-5 w-5" strokeWidth={1.8} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">{plan.name}</p>
        <p className="text-[10px] text-slate-400 sm:text-xs">
          {formatUSD(plan.min_amount)}
          {plan.max_amount != null ? ` – ${formatUSD(plan.max_amount)}` : "+"} &middot; {formatDuration(plan.duration_hours)}
        </p>
        {!affordable && (
          <p className="mt-0.5 text-[9px] font-semibold text-red-500 sm:text-[10px]">
            Requires at least {formatUSD(plan.min_amount)} available
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-extrabold text-emerald-600 sm:text-base">+{toNumber(plan.profit_percentage)}%</p>
        <p className="text-[9px] text-slate-400 sm:text-[10px]">return</p>
      </div>
    </motion.button>
  );
}

function NewTradeModal({ open, onClose, wallet, onCreated }) {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const availableBalance = toNumber(wallet?.available_balance);

  // reset + fetch plans every time the modal opens
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setSelectedPlan(null);
    setAmount("");
    setAmountError("");
    setSubmitError("");
    setSuccess(false);
    setPlansLoading(true);
    setPlansError("");

    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/trade-plans/");
        const data = res.data?.results ?? res.data?.data ?? res.data ?? [];
        if (!cancelled) setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setPlansError("Couldn't load trade plans. Pull down to try again.");
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setAmount("");
    setAmountError("");
    setTimeout(() => setStep(2), 150);
  };

  const maxUsable = useMemo(() => {
    if (!selectedPlan) return 0;
    const planMax = selectedPlan.max_amount != null ? toNumber(selectedPlan.max_amount) : Infinity;
    return Math.min(planMax, availableBalance);
  }, [selectedPlan, availableBalance]);

  const expectedProfit = useMemo(() => {
    const amt = toNumber(amount);
    if (!selectedPlan || !amt) return 0;
    return (amt * toNumber(selectedPlan.profit_percentage)) / 100;
  }, [amount, selectedPlan]);

  const validateAmount = (raw) => {
    const amt = toNumber(raw);
    if (!raw || amt <= 0) return "Enter an amount.";
    if (amt < toNumber(selectedPlan.min_amount)) return `Minimum for this plan is ${formatUSD(selectedPlan.min_amount)}.`;
    if (selectedPlan.max_amount != null && amt > toNumber(selectedPlan.max_amount))
      return `Maximum for this plan is ${formatUSD(selectedPlan.max_amount)}.`;
    if (amt > availableBalance) return "Amount exceeds your available balance.";
    return "";
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    if (submitError) setSubmitError("");
    if (amountError) setAmountError(validateAmount(value));
  };

  const handleSubmit = async () => {
    const error = validateAmount(amount);
    if (error) {
      setAmountError(error);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/api/trades/", { plan_code: selectedPlan.code, amount: toNumber(amount).toFixed(2) });
      setSuccess(true);
      setTimeout(() => {
        onCreated?.();
        onClose();
      }, 1200);
    } catch (err) {
      const apiMsg =
        err?.response?.data?.amount?.[0] ||
        err?.response?.data?.plan_code?.[0] ||
        err?.response?.data?.detail ||
        "Couldn't open this trade. Please try again.";
      setSubmitError(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const theme = selectedPlan ? planTheme(selectedPlan.code) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !submitting && onClose()}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                {step === 2 && !success && (
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900 sm:text-base">
                    {success ? "Trade started" : step === 1 ? "Choose a plan" : "Set your amount"}
                  </p>
                  <p className="text-[10px] text-slate-400 sm:text-xs">
                    {success ? "Funds locked, profit on the way." : `Step ${step} of 2`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !submitting && onClose()}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                    >
                      <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
                    </motion.span>
                    <p className="mt-3 text-sm font-bold text-slate-900">
                      {formatUSD(amount)} locked into {selectedPlan?.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">It'll appear in your active trades now.</p>
                  </motion.div>
                ) : step === 1 ? (
                  <motion.div key="step1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-2.5">
                    {plansLoading ? (
                      Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)
                    ) : plansError ? (
                      <p className="flex items-center gap-1.5 py-4 text-xs text-red-500">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {plansError}
                      </p>
                    ) : plans.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">No trade plans are available right now.</p>
                    ) : (
                      plans.map((plan) => (
                        <PlanCard
                          key={plan.code}
                          plan={plan}
                          affordable={availableBalance >= toNumber(plan.min_amount)}
                          selected={selectedPlan?.code === plan.code}
                          onSelect={handleSelectPlan}
                        />
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-4">
                    <div className={`flex items-center gap-3 rounded-2xl p-3 ${theme.wrap}`}>
                      <theme.icon className="h-6 w-6 shrink-0" strokeWidth={1.8} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{selectedPlan.name}</p>
                        <p className="text-[10px] opacity-80 sm:text-xs">
                          {formatDuration(selectedPlan.duration_hours)} duration &middot; +{toNumber(selectedPlan.profit_percentage)}% return
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                        Amount to invest
                      </label>
                      <div className="relative mt-1.5">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={amount}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          placeholder="0.00"
                          className={`w-full rounded-xl border py-3 pl-7 pr-3 text-base font-bold text-slate-900 outline-none transition-colors focus:border-blue-400 ${
                            amountError ? "border-red-300" : "border-slate-200"
                          }`}
                        />
                      </div>
                      {amountError ? (
                        <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-red-500 sm:text-xs">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {amountError}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-[10px] text-slate-400 sm:text-xs">
                          {formatUSD(selectedPlan.min_amount)}
                          {selectedPlan.max_amount != null ? ` – ${formatUSD(selectedPlan.max_amount)}` : "+"} &middot; you have{" "}
                          {formatUSD(availableBalance)} available
                        </p>
                      )}

                      <div className="mt-2.5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAmountChange(String(toNumber(selectedPlan.min_amount)))}
                          className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700"
                        >
                          Min
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAmountChange(String(maxUsable.toFixed(2)))}
                          className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700"
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    {toNumber(amount) > 0 && !amountError && (
                      <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
                        <p className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 sm:text-xs">
                          <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                          Expected profit
                        </p>
                        <p className="text-sm font-extrabold text-emerald-600">+{formatUSD(expectedProfit)}</p>
                      </div>
                    )}

                    {submitError && (
                      <p className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-[10px] font-medium text-red-500 sm:text-xs">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                        {submitError}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!success && step === 2 && (
              <div className="border-t border-slate-100 p-4 sm:p-5">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !amount || !!amountError}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-700 py-3 text-sm font-bold text-white shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
                      Opening trade…
                    </>
                  ) : (
                    <>
                      Confirm & invest {amount ? formatUSD(amount) : ""}
                      <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================
   Export — Trades (Active Trades page)
   ================================================================ */

export default function Trades() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  const [trades, setTrades] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [tradesError, setTradesError] = useState("");

  const [viewingTradeId, setViewingTradeId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await api.get("/api/wallet/");
      const data = res.data?.data ?? res.data;
      setWallet(data);
      setWalletError("");
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setWalletError("Couldn't load your balance.");
    } finally {
      setWalletLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchActiveTrades = useCallback(async () => {
    try {
      const res = await api.get("/api/trades/active/");
      const data = res.data?.results ?? res.data?.data ?? res.data ?? [];
      setTrades(Array.isArray(data) ? data : []);
      setTradesError("");
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setTradesError("Couldn't load your active trades.");
    } finally {
      setTradesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    fetchWallet();
    fetchActiveTrades();
  }, [fetchWallet, fetchActiveTrades]);

  const handleTradeCreated = () => {
    setWalletLoading(true);
    setTradesLoading(true);
    fetchWallet();
    fetchActiveTrades();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-3 pb-8 sm:space-y-5 sm:p-5 lg:p-8">
      <Reveal>
        <TradeBalanceHero wallet={wallet} loading={walletLoading} error={walletError} />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-sm font-bold text-slate-900 sm:text-base">Active trades</h1>
            <p className="text-[10px] text-slate-400 sm:text-xs">
              {tradesLoading ? "Loading…" : `${trades.length} trade${trades.length === 1 ? "" : "s"} in progress`}
            </p>
          </div>
          <Link
            to="/dashboard/investment-history"
            className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 sm:text-xs"
          >
            <History className="h-3 w-3" strokeWidth={2} />
            History
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        {tradesLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100 sm:rounded-3xl" />
            ))}
          </div>
        ) : tradesError ? (
          <p className="flex items-center gap-1.5 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {tradesError}
          </p>
        ) : trades.length === 0 ? (
          <EmptyTradesState onCreate={() => setModalOpen(true)} />
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {trades.map((trade, i) => (
                <ActiveTradeCard key={trade.id} trade={trade} index={i} onView={setViewingTradeId} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Reveal>

      {trades.length > 0 && (
        <Reveal delay={0.14}>
          <button
            onClick={() => setModalOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 py-3.5 text-xs font-bold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 sm:rounded-3xl sm:text-sm"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Add a new trade
          </button>
        </Reveal>
      )}

      <NewTradeModal open={modalOpen} onClose={() => setModalOpen(false)} wallet={wallet} onCreated={handleTradeCreated} />
      <TradeDetailModal tradeId={viewingTradeId} onClose={() => setViewingTradeId(null)} />
    </div>
  );
}