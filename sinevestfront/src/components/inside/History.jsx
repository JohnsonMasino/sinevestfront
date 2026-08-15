// src/pages/dashboard/History.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Filter,
  X,
  CalendarDays,
  TrendingUp,
  Wallet,
  Landmark,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — History
 * ------------------------------------------------------------------
 * GET /api/transactions/         -> merged, filterable, paginated list.
 *                                    Accepts type ('deposit'|'withdrawal'
 *                                    |'trade'), status, date_from,
 *                                    date_to, page, page_size. This one
 *                                    endpoint already covers the filter
 *                                    UI, so the dedicated
 *                                    /deposits//withdrawals//trades/
 *                                    endpoints aren't called here to
 *                                    avoid duplicating the same fetch
 *                                    logic three times over.
 * GET /api/transactions/summary/ -> lightweight counts/totals per type,
 *                                    used for the stat cards up top.
 * ------------------------------------------------------------------
 */

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const TYPE_TABS = [
  { id: "all", label: "All" },
  { id: "deposit", label: "Deposits" },
  { id: "withdrawal", label: "Withdrawals" },
  { id: "trade", label: "Trades" },
];

const STATUS_OPTIONS = [
  { id: "all", label: "All statuses" },
  { id: "completed", label: "Completed" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "failed", label: "Failed" },
  { id: "rejected", label: "Rejected" },
  { id: "cancelled", label: "Cancelled" },
];

/* ================================================================
   Helpers
   ================================================================ */

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatUSD(value) {
  const n = toNumber(value);
  return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatSignedUSD(value) {
  const n = toNumber(value);
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}${formatUSD(n)}`;
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function humanize(value) {
  if (!value) return "";
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const TYPE_META = {
  deposit: { label: "Deposit", icon: ArrowDownToLine, wrap: "bg-emerald-50 text-emerald-600" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpFromLine, wrap: "bg-red-50 text-red-600" },
  trade: { label: "Trade", icon: Repeat, wrap: "bg-blue-50 text-blue-600" },
};

function getTypeMeta(type) {
  return TYPE_META[type] || { label: humanize(type) || "Transaction", icon: Repeat, wrap: "bg-slate-100 text-slate-500" };
}

/** Status tone via keyword sniffing — backend status strings aren't a
 *  fixed enum, so this stays correct even for values not in our list. */
function getStatusTone(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("complet") || s.includes("approv") || s.includes("success")) {
    return { chip: "bg-emerald-50 text-emerald-600" };
  }
  if (s.includes("pend") || s.includes("process") || s.includes("review")) {
    return { chip: "bg-amber-50 text-amber-600" };
  }
  if (s.includes("fail") || s.includes("reject") || s.includes("declin") || s.includes("cancel")) {
    return { chip: "bg-red-50 text-red-600" };
  }
  return { chip: "bg-slate-100 text-slate-500" };
}

function amountColor(type, amount) {
  if (type === "deposit") return "text-emerald-600";
  if (type === "withdrawal") return "text-red-600";
  return toNumber(amount) >= 0 ? "text-emerald-600" : "text-red-600";
}

function amountDisplay(type, amount) {
  if (type === "deposit") return `+${formatUSD(amount)}`;
  if (type === "withdrawal") return `-${formatUSD(amount)}`;
  return formatSignedUSD(amount);
}

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   1. Summary stat cards
   ================================================================ */

function SummaryCards({ summary, loading, error }) {
  const cards = [
    {
      key: "deposits",
      label: "Deposits",
      icon: ArrowDownToLine,
      wrap: "bg-emerald-50 text-emerald-600",
      count: summary?.deposits?.count,
      total: summary?.deposits?.total_approved,
      totalLabel: "Approved",
    },
    {
      key: "withdrawals",
      label: "Withdrawals",
      icon: Landmark,
      wrap: "bg-red-50 text-red-600",
      count: summary?.withdrawals?.count,
      total: summary?.withdrawals?.total_completed,
      totalLabel: "Completed",
    },
    {
      key: "trades",
      label: "Trades",
      icon: TrendingUp,
      wrap: "bg-blue-50 text-blue-600",
      count: summary?.trades?.count,
      total: summary?.trades?.total_profit_earned,
      totalLabel: "Profit earned",
      sub: summary?.trades
        ? `${summary.trades.active_count ?? 0} active · ${summary.trades.completed_count ?? 0} done`
        : null,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-3.5"
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${card.wrap}`}>
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2} />
            </span>
            <p className="mt-1.5 truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:mt-2 sm:text-[10px]">
              {card.label}
            </p>
            {loading ? (
              <div className="mt-1 h-4 w-12 animate-pulse rounded bg-slate-100" />
            ) : error ? (
              <p className="mt-1 text-[10px] text-red-400">—</p>
            ) : (
              <>
                <p className="truncate text-xs font-extrabold text-slate-900 sm:text-sm">{card.count ?? 0}</p>
                <p className="truncate text-[9px] text-slate-400 sm:text-[10px]">
                  {card.totalLabel}: {formatUSD(card.total)}
                </p>
                {card.sub && <p className="truncate text-[8px] text-slate-300 sm:text-[9px]">{card.sub}</p>}
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ================================================================
   2. Filter bar — type tabs + status/date panel
   ================================================================ */

function FilterBar({ filters, onTypeChange, onFieldChange, onReset, activeExtraCount }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-3.5">
      <div className="flex items-center gap-2">
        <div className="scrollbar-none -mx-0.5 flex flex-1 gap-1.5 overflow-x-auto px-0.5">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTypeChange(tab.id)}
              className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition-colors sm:text-xs ${
                filters.type === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className={`relative flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold transition-colors sm:text-xs ${
            panelOpen ? "border-blue-300 text-blue-700" : "border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-700"
          }`}
        >
          <Filter className="h-3 w-3" strokeWidth={2.2} />
          Filters
          {activeExtraCount > 0 && (
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white">
              {activeExtraCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5 sm:mt-3 sm:grid-cols-4 sm:gap-2.5 sm:pt-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => onFieldChange("status", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:text-xs"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">
                  <CalendarDays className="h-2.5 w-2.5" />
                  From
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => onFieldChange("date_from", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:text-xs"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">
                  <CalendarDays className="h-2.5 w-2.5" />
                  To
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => onFieldChange("date_to", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:text-xs"
                />
              </div>

              {activeExtraCount > 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="col-span-2 flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] font-semibold text-slate-500 transition-colors hover:border-red-300 hover:text-red-600 sm:col-span-4 sm:text-xs"
                >
                  <X className="h-3 w-3" strokeWidth={2.2} />
                  Clear filters
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
   3. Transaction row
   ================================================================ */

function TransactionRow({ tx, index }) {
  const meta = getTypeMeta(tx.type);
  const Icon = meta.icon;
  const statusTone = getStatusTone(tx.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.25), ease: [0.4, 0, 0.2, 1] }}
      className="min-w-0 rounded-lg border border-slate-100 p-2.5 transition-colors hover:bg-slate-50 sm:rounded-xl sm:p-3"
    >
      <div className="flex min-w-0 items-start gap-2 sm:gap-2.5">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${meta.wrap}`}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-1.5">
            <p className="min-w-0 truncate text-[11px] font-semibold text-slate-800 sm:text-xs">
              {tx.description || meta.label}
            </p>
            <p className={`shrink-0 text-[11px] font-bold sm:text-xs ${amountColor(tx.type, tx.amount)}`}>
              {amountDisplay(tx.type, tx.amount)}
            </p>
          </div>

          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1 sm:gap-1.5">
            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide sm:text-[9px] ${statusTone.chip}`}>
              {humanize(tx.status)}
            </span>
            <span className="truncate text-[9px] text-slate-400 sm:text-[10px]">{formatDateTime(tx.created_at)}</span>
          </div>

          {tx.resolved_at && (
            <p className="mt-0.5 truncate text-[8px] text-slate-300 sm:text-[9px]">
              Resolved {formatDateTime(tx.resolved_at)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================
   4. Pagination
   ================================================================ */

function PaginationBar({ page, totalPages, hasNext, hasPrevious, onPrev, onNext, disabled }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 sm:pt-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrevious || disabled}
        className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 sm:text-xs"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={2.2} />
        Prev
      </button>
      <span className="text-[9px] font-medium text-slate-400 sm:text-xs">
        Page <span className="font-bold text-slate-700">{page}</span>
        {totalPages ? <> of <span className="font-bold text-slate-700">{totalPages}</span></> : null}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext || disabled}
        className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 sm:text-xs"
      >
        Next
        <ChevronRight className="h-3 w-3" strokeWidth={2.2} />
      </button>
    </div>
  );
}

/* ================================================================
   Export — History
   ================================================================ */

const DEFAULT_FILTERS = { type: "all", status: "all", date_from: "", date_to: "" };

export default function History() {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState("");

  const totalPages = useMemo(() => (count ? Math.ceil(count / pageSize) : 0), [count, pageSize]);
  const activeExtraCount = useMemo(
    () => (filters.status !== "all" ? 1 : 0) + (filters.date_from ? 1 : 0) + (filters.date_to ? 1 : 0),
    [filters]
  );

  // ── Fetch summary (unauthenticated errors treated same as everywhere else) ──
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await api.get("/api/transactions/summary/");
      setSummary(res.data?.data ?? res.data);
      setSummaryError("");
    } catch {
      setSummaryError("Couldn't load summary.");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // ── Fetch merged, filtered transaction list ──────────────────────
  const loadTransactions = useCallback(async (targetPage, targetPageSize, targetFilters) => {
    setTxLoading(true);
    setTxError("");
    try {
      const params = { page: targetPage, page_size: targetPageSize };
      if (targetFilters.type !== "all") params.type = targetFilters.type;
      if (targetFilters.status !== "all") params.status = targetFilters.status;
      if (targetFilters.date_from) params.date_from = targetFilters.date_from;
      if (targetFilters.date_to) params.date_to = targetFilters.date_to;

      const res = await api.get("/api/transactions/", { params });
      const data = res.data?.data ?? res.data;
      const results = Array.isArray(data?.results) ? data.results : [];
      setTransactions(results);
      setCount(toNumber(data?.count));
      setHasNext(Boolean(data?.next));
      setHasPrevious(Boolean(data?.previous));

      if (results.length === 0 && targetPage > 1) {
        setPage(1);
        return;
      }
    } catch (err) {
      setTransactions([]);
      setTxError(
        err?.response?.status >= 500
          ? "Something went wrong on our end loading your transactions. Please try again."
          : "Couldn't load your transaction history."
      );
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadTransactions(page, pageSize, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters]);

  const handleTypeChange = (type) => {
    setFilters((prev) => ({ ...prev, type }));
    setPage(1);
  };
  const handleFieldChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };
  const handleReset = () => {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, type: prev.type }));
    setPage(1);
  };
  const handlePrev = () => hasPrevious && setPage((p) => Math.max(1, p - 1));
  const handleNext = () => hasNext && setPage((p) => p + 1);
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };
  const handleRetry = () => loadTransactions(page, pageSize, filters);

  return (
    <div className="mx-auto max-w-2xl space-y-2.5 overflow-x-hidden p-3 pb-10 sm:space-y-4 sm:p-5 lg:p-8">
      <Reveal>
        <div>
          <h1 className="font-display text-sm font-extrabold text-slate-900 sm:text-lg">Transaction history</h1>
          <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">Every deposit, withdrawal, and trade in one place.</p>
        </div>
      </Reveal>

      <Reveal delay={0.04}>
        <SummaryCards summary={summary} loading={summaryLoading} error={summaryError} />
      </Reveal>

      <Reveal delay={0.08}>
        <FilterBar
          filters={filters}
          onTypeChange={handleTypeChange}
          onFieldChange={handleFieldChange}
          onReset={handleReset}
          activeExtraCount={activeExtraCount}
        />
      </Reveal>

      <Reveal delay={0.12}>
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] text-slate-400 sm:text-xs">
              {txLoading ? "Loading…" : `${count.toLocaleString()} result${count === 1 ? "" : "s"}`}
            </p>
            <div className="flex items-center gap-1 rounded-full border border-slate-200 p-0.5">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePageSizeChange(size)}
                  disabled={txLoading}
                  className={`rounded-full px-2 py-0.5 text-[9px] font-semibold transition-colors sm:text-[10px] ${
                    pageSize === size ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2">
            {txLoading ? (
              Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100 sm:h-16" />
              ))
            ) : txError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertCircle className="h-4.5 w-4.5" strokeWidth={1.8} />
                </span>
                <p className="max-w-xs text-[11px] text-slate-500 sm:text-xs">{txError}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-1 flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 sm:text-xs"
                >
                  <RefreshCw className="h-3 w-3" strokeWidth={2} />
                  Retry
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-9 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Inbox className="h-4.5 w-4.5" strokeWidth={1.8} />
                </span>
                <p className="text-[11px] text-slate-400 sm:text-xs">
                  {activeExtraCount > 0 || filters.type !== "all"
                    ? "No transactions match these filters."
                    : "No transactions yet."}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {transactions.map((tx, i) => (
                  <TransactionRow key={tx.id || `${tx.type}-${tx.created_at}-${i}`} tx={tx} index={i} />
                ))}
              </AnimatePresence>
            )}
          </div>

          {!txLoading && !txError && transactions.length > 0 && (
            <div className="mt-2.5 sm:mt-3">
              <PaginationBar
                page={page}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onPrev={handlePrev}
                onNext={handleNext}
                disabled={txLoading}
              />
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}