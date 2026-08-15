// src/pages/dashboard/TradeHistory.jsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  X,
  AlertCircle,
  Loader2,
  Coins,
  Gem,
  Building2,
  Home,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  CalendarRange,
  RotateCcw,
  Inbox,
  CheckCircle2,
  Layers,
  Wallet as WalletIcon,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — Investment History (TradeHistory.jsx)
 * ------------------------------------------------------------------
 * Same design system as Dash.jsx / Trades.jsx: navy gradient + amber
 * accent, font-display/font-body, framer-motion reveals, mobile-first.
 *
 * Data source:
 *   GET /api/trades/history/ — paginated, all statuses (active,
 *   completed, cancelled). The list serializer does NOT include
 *   plan_code (only plan_name), so plan filtering below is done by
 *   plan_name. Full detail (incl. plan_code) is fetched per-trade
 *   from GET /api/trades/{id}/ when a card is opened.
 *
 * The endpoint takes no filter query params today, so filtering is
 * done client-side over whatever pages have been loaded so far. A
 * "Load more" control fetches the next DRF page (via its `next` URL)
 * so filters can reach further back than page 1 alone.
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

function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

const PLAN_THEME = {
  silver: { icon: Coins, wrap: "bg-slate-100 text-slate-600" },
  gold: { icon: Gem, wrap: "bg-amber-50 text-amber-600" },
  forex: { icon: TrendingUp, wrap: "bg-blue-50 text-blue-600" },
  company_shares: { icon: Building2, wrap: "bg-indigo-50 text-indigo-600" },
  real_estate: { icon: Home, wrap: "bg-emerald-50 text-emerald-600" },
};

function themeForPlanName(name = "") {
  const key = Object.keys(PLAN_THEME).find((code) => name.toLowerCase().includes(code.split("_")[0]));
  return PLAN_THEME[key] || { icon: TrendingUp, wrap: "bg-blue-50 text-blue-600" };
}

const STATUS_STYLES = {
  active: { badge: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  completed: { badge: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  cancelled: { badge: "bg-red-50 text-red-600", dot: "bg-red-500" },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize sm:text-[10px] ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

/* within-range check, inclusive; dateTo treated as end-of-day */
function isWithinDateRange(iso, dateFrom, dateTo) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  if (dateFrom) {
    const from = new Date(dateFrom + "T00:00:00").getTime();
    if (t < from) return false;
  }
  if (dateTo) {
    const to = new Date(dateTo + "T23:59:59").getTime();
    if (t > to) return false;
  }
  return true;
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
   1. Header — back to /dashboard/investment
   ================================================================ */

function HistoryHeader() {
  return (
    <div
      style={{ background: NAVY_GRADIENT }}
      className="relative overflow-hidden rounded-2xl p-4 text-blue-100 shadow-lg sm:rounded-3xl sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -right-14 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl"
      />
      <div className="relative flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-100/60 sm:text-xs">Investments</p>
          <p className="font-display truncate text-lg font-extrabold text-white sm:text-2xl">Trade history</p>
        </div>
      </div>
      <Link
        to="/dashboard/investment"
        className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-blue-100 transition-colors hover:bg-white/20 sm:text-xs"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={2.2} />
        Back to active trades
      </Link>
    </div>
  );
}

/* ================================================================
   2. Summary stats
   ================================================================ */

function SummaryStats({ trades, loading }) {
  const stats = useMemo(() => {
    const active = trades.filter((t) => t.status === "active").length;
    const completed = trades.filter((t) => t.status === "completed").length;
    const cancelled = trades.filter((t) => t.status === "cancelled").length;
    const totalInvested = trades.reduce((sum, t) => sum + toNumber(t.amount), 0);
    const totalProfitPaid = trades
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + toNumber(t.actual_profit_paid), 0);
    return { active, completed, cancelled, totalInvested, totalProfitPaid };
  }, [trades]);

  const cards = [
    { label: "Active", value: stats.active, icon: Clock, wrap: "bg-blue-50 text-blue-600" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, wrap: "bg-emerald-50 text-emerald-600" },
    { label: "Total invested", value: formatUSD(stats.totalInvested, { compact: true }), icon: WalletIcon, wrap: "bg-amber-50 text-amber-600" },
    { label: "Profit earned", value: formatUSD(stats.totalProfitPaid, { compact: true }), icon: TrendingUp, wrap: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.3 }}
            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-3.5"
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${card.wrap}`}>
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </span>
            {loading ? (
              <div className="mt-2 h-5 w-12 animate-pulse rounded bg-slate-100" />
            ) : (
              <p className="mt-2 truncate text-sm font-extrabold text-slate-900 sm:text-base">{card.value}</p>
            )}
            <p className="text-[9px] font-medium text-slate-400 sm:text-[10px]">{card.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ================================================================
   3. Filter bar — status tabs + plan/date filters (collapsible)
   ================================================================ */

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function FilterBar({ planOptions, filters, onChange, onReset, hasActiveFilters }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4">
      {/* Status tabs — horizontally scrollable on mobile */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange({ ...filters, status: tab.value })}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors sm:text-xs ${
              filters.status === tab.value ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toggle for plan/date filters */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-2.5 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-600 sm:text-xs"
      >
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3 w-3" strokeWidth={2.2} />
          Plan & date filters
          {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2.2} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">Plan</label>
                <select
                  value={filters.plan}
                  onChange={(e) => onChange({ ...filters, plan: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-400 sm:text-sm"
                >
                  <option value="all">All plans</option>
                  {planOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-400 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-400 sm:text-sm"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-red-500 hover:text-red-600 sm:text-xs"
                >
                  <RotateCcw className="h-3 w-3" strokeWidth={2.2} />
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   4. History card
   ================================================================ */

function HistoryCard({ trade, index, onView }) {
  const theme = themeForPlanName(trade.plan_name);
  const Icon = theme.icon;
  const isCompleted = trade.status === "completed";

  return (
    <motion.button
      onClick={() => onView(trade.id)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.3 }}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-blue-200 sm:rounded-3xl sm:p-3.5"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${theme.wrap}`}>
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">{trade.plan_name}</p>
          <StatusBadge status={trade.status} />
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
          {formatDateShort(trade.started_at)} &middot; {formatUSD(trade.amount)} principal
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className={`text-xs font-bold sm:text-sm ${isCompleted ? "text-emerald-600" : "text-slate-400"}`}>
          {isCompleted ? `+${formatUSD(trade.actual_profit_paid)}` : `+${formatUSD(trade.expected_profit)} exp.`}
        </p>
        <ChevronRight className="ml-auto mt-0.5 h-3.5 w-3.5 text-slate-300" strokeWidth={2.2} />
      </div>
    </motion.button>
  );
}

/* ================================================================
   5. Trade detail modal (self-contained — fetches full detail)
   ================================================================ */

function DetailRow({ label, value, accent = "text-slate-800" }) {
  return (
    <div className="rounded-xl border border-slate-100 p-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-0.5 truncate text-xs font-bold sm:text-sm ${accent}`}>{value}</p>
    </div>
  );
}

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

  const theme = trade ? themeForPlanName(trade.plan_name) : null;
  const Icon = theme?.icon;

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

/* ================================================================
   6. Empty states
   ================================================================ */

function EmptyState({ hasActiveFilters, onReset }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center sm:rounded-3xl sm:py-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 sm:h-14 sm:w-14">
        <Inbox className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <p className="mt-3 text-sm font-bold text-slate-900 sm:text-base">
        {hasActiveFilters ? "No trades match these filters" : "No trade history yet"}
      </p>
      <p className="mt-1 max-w-xs text-[11px] text-slate-400 sm:text-xs">
        {hasActiveFilters
          ? "Try widening your date range or switching plans."
          : "Once you open a trade, it'll show up here — active or completed."}
      </p>
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="mt-4 flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.2} />
          Clear filters
        </button>
      )}
    </div>
  );
}

/* ================================================================
   Export — TradeHistory
   ================================================================ */

const DEFAULT_FILTERS = { status: "all", plan: "all", dateFrom: "", dateTo: "" };

export default function TradeHistory() {
  const navigate = useNavigate();

  const [trades, setTrades] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [totalCount, setTotalCount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewingTradeId, setViewingTradeId] = useState(null);

  const ingestPage = (data) => {
    // Handles either a plain array or DRF's {count, next, previous, results} shape.
    if (Array.isArray(data)) {
      setTrades((prev) => [...prev, ...data]);
      setNextUrl(null);
      setTotalCount((prevCount) => (prevCount == null ? data.length : prevCount));
    } else {
      const results = data?.results ?? [];
      setTrades((prev) => [...prev, ...results]);
      setNextUrl(data?.next ?? null);
      setTotalCount(typeof data?.count === "number" ? data.count : null);
    }
  };

  // Bumping this re-runs the fetch effect below — used by the "Try again" retry.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Guards against React StrictMode's dev-only double-invoke of effects:
    // without this, the effect fires twice, both async calls resolve, and
    // both append to `trades` (since ingestPage appends via functional
    // setState) even though only the last one's `count` sticks — which is
    // exactly the "N loaded but count says N-1" symptom. Every state
    // update below checks `ignore` first, so only the run whose cleanup
    // hasn't fired gets to commit its results.
    let ignore = false;

    setLoading(true);
    setError("");
    setTrades([]);
    setNextUrl(null);
    setTotalCount(null);

    (async () => {
      try {
        const res = await api.get("/api/trades/history/");
        if (ignore) return;
        ingestPage(res.data);
      } catch (err) {
        if (ignore) return;
        if (err?.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError("Couldn't load your trade history.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [navigate, reloadKey]);

  const fetchNextPage = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      const res = await api.get(nextUrl);
      ingestPage(res.data);
    } catch (err) {
      setError("Couldn't load more trades. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const planOptions = useMemo(() => {
    const names = new Set(trades.map((t) => t.plan_name).filter(Boolean));
    return Array.from(names).sort();
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.plan !== "all" && t.plan_name !== filters.plan) return false;
      if (!isWithinDateRange(t.started_at, filters.dateFrom, filters.dateTo)) return false;
      return true;
    });
  }, [trades, filters]);

  const hasActiveFilters =
    filters.status !== "all" || filters.plan !== "all" || !!filters.dateFrom || !!filters.dateTo;

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-3 pb-8 sm:space-y-5 sm:p-5 lg:p-8">
      <Reveal>
        <HistoryHeader />
      </Reveal>

      <Reveal delay={0.05}>
        <SummaryStats trades={trades} loading={loading} />
      </Reveal>

      <Reveal delay={0.1}>
        <FilterBar
          planOptions={planOptions}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          hasActiveFilters={hasActiveFilters}
        />
      </Reveal>

      <Reveal delay={0.14}>
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 sm:rounded-3xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50 sm:text-xs"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={2.2} />
              Try again
            </button>
          </div>
        ) : filteredTrades.length === 0 ? (
          <EmptyState hasActiveFilters={hasActiveFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
        ) : (
          <>
            <div className="flex items-center justify-between px-0.5">
              <p className="flex items-center gap-1 text-[10px] text-slate-400 sm:text-xs">
                <Layers className="h-3 w-3" strokeWidth={2} />
                Showing {filteredTrades.length} of {totalCount ?? trades.length} loaded
              </p>
            </div>
            <div className="mt-2 space-y-2.5">
              <AnimatePresence>
                {filteredTrades.map((trade, i) => (
                  <HistoryCard key={trade.id} trade={trade} index={i} onView={setViewingTradeId} />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </Reveal>

      {!loading && nextUrl && (
        <Reveal delay={0.18}>
          <button
            onClick={fetchNextPage}
            disabled={loadingMore}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60 sm:text-sm"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
                Loading more…
              </>
            ) : (
              <>
                <CalendarRange className="h-4 w-4" strokeWidth={2.2} />
                Load older trades
              </>
            )}
          </button>
        </Reveal>
      )}

      <TradeDetailModal tradeId={viewingTradeId} onClose={() => setViewingTradeId(null)} />
    </div>
  );
}