// src/pages/dashboard/WalletLedger.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  BookOpen,
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  LockOpen,
  TrendingUp,
  TrendingDown,
  Repeat,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Hash,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — WalletLedger
 * ------------------------------------------------------------------
 * GET /api/wallet/ledger/?page=&page_size=  -> paginated audit trail
 *   { count, next, previous, results: [{ entry_type, amount,
 *     balance_after_available, balance_after_locked, reference,
 *     created_at }] }
 *
 * GET /api/wallet/  -> balance summary strip up top for context
 *
 * This is the raw, immutable audit trail — every balance mutation,
 * in order — distinct from the human-facing transaction history
 * page. Read-only, page-based pagination, no client-side caching
 * beyond the current page.
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/* ================================================================
   Helpers
   ================================================================ */

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatUSD(value) {
  const n = toNumber(value);
  const abs = Math.abs(n);
  return `${n < 0 ? "-" : ""}$${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Best-effort presentation for whatever entry_type the backend sends —
 *  a few known types get a precise icon/label/tone, anything else
 *  falls back to keyword sniffing so new entry types never render broken. */
const KNOWN_ENTRY_TYPES = {
  deposit_credit: { label: "Deposit credited", icon: ArrowDownToLine, tone: "emerald", sign: "+" },
  withdrawal_debit: { label: "Withdrawal debited", icon: ArrowUpFromLine, tone: "red", sign: "-" },
  trade_lock: { label: "Funds locked for trade", icon: Lock, tone: "amber", sign: "" },
  trade_unlock: { label: "Funds unlocked from trade", icon: LockOpen, tone: "blue", sign: "" },
  trade_profit: { label: "Trade profit", icon: TrendingUp, tone: "emerald", sign: "+" },
  trade_loss: { label: "Trade loss", icon: TrendingDown, tone: "red", sign: "-" },
};

const TONE_CLASSES = {
  emerald: { wrap: "bg-emerald-50 text-emerald-600", amount: "text-emerald-600" },
  red: { wrap: "bg-red-50 text-red-600", amount: "text-red-600" },
  amber: { wrap: "bg-amber-50 text-amber-600", amount: "text-amber-600" },
  blue: { wrap: "bg-blue-50 text-blue-600", amount: "text-blue-600" },
  slate: { wrap: "bg-slate-100 text-slate-500", amount: "text-slate-700" },
};

function getEntryMeta(entryType) {
  if (KNOWN_ENTRY_TYPES[entryType]) return KNOWN_ENTRY_TYPES[entryType];

  const t = (entryType || "").toLowerCase();
  if (t.includes("credit") || t.includes("deposit") || t.includes("profit")) {
    return { label: humanize(entryType), icon: ArrowDownToLine, tone: "emerald", sign: "+" };
  }
  if (t.includes("debit") || t.includes("withdraw") || t.includes("loss")) {
    return { label: humanize(entryType), icon: ArrowUpFromLine, tone: "red", sign: "-" };
  }
  if (t.includes("unlock")) {
    return { label: humanize(entryType), icon: LockOpen, tone: "blue", sign: "" };
  }
  if (t.includes("lock")) {
    return { label: humanize(entryType), icon: Lock, tone: "amber", sign: "" };
  }
  return { label: humanize(entryType) || "Ledger entry", icon: Repeat, tone: "slate", sign: "" };
}

function humanize(value) {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
   1. Compact balance strip — just enough context, full detail
      lives on the dashboard.
   ================================================================ */

function BalanceStrip({ wallet, loading, error }) {
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
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 sm:h-9 sm:w-9">
            <BookOpen className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="font-display text-sm font-extrabold text-white sm:text-lg">Wallet ledger</h1>
            <p className="text-[10px] text-blue-100/60 sm:text-xs">Full audit trail of balance changes</p>
          </div>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-100/80 sm:flex">
          <Wallet className="h-3 w-3" strokeWidth={1.8} />
          Wallet
        </span>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 sm:mt-5 sm:gap-3 sm:pt-4">
        {[
          { label: "Available", value: wallet?.available_balance },
          { label: "Locked", value: wallet?.locked_balance },
          { label: "Total", value: wallet?.total_balance },
        ].map((stat) => (
          <div key={stat.label} className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-blue-100/45 sm:text-[9px]">{stat.label}</p>
            {loading ? (
              <div className="mt-1 h-4 w-14 animate-pulse rounded bg-white/10" />
            ) : error ? (
              <p className="mt-0.5 text-[10px] text-red-300">—</p>
            ) : (
              <p className="truncate text-xs font-bold text-white sm:text-sm">{formatUSD(stat.value)}</p>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="relative mt-3 flex items-center gap-1.5 text-[11px] text-red-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ================================================================
   2. Ledger entry row
   ================================================================ */

function LedgerEntryRow({ entry, index }) {
  const meta = getEntryMeta(entry.entry_type);
  const Icon = meta.icon;
  const toneClasses = TONE_CLASSES[meta.tone] || TONE_CLASSES.slate;
  const amountNum = Math.abs(toNumber(entry.amount));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3), ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50 sm:p-3.5"
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${toneClasses.wrap}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-slate-800 sm:text-sm">{meta.label}</p>
            <p className={`shrink-0 text-xs font-bold sm:text-sm ${toneClasses.amount}`}>
              {meta.sign}
              {formatUSD(amountNum)}
            </p>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">{formatDateTime(entry.created_at)}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-[10px] text-slate-500 sm:text-[11px]">
            <span>
              Available after:{" "}
              <span className="font-semibold text-slate-700">{formatUSD(entry.balance_after_available)}</span>
            </span>
            <span>
              Locked after:{" "}
              <span className="font-semibold text-slate-700">{formatUSD(entry.balance_after_locked)}</span>
            </span>
            {entry.reference && (
              <span className="flex min-w-0 items-center gap-1 text-slate-400">
                <Hash className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate font-mono">{entry.reference}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================
   3. Pagination controls
   ================================================================ */

function PaginationBar({ page, totalPages, hasNext, hasPrevious, onPrev, onNext, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrevious || disabled}
        className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 sm:text-xs"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
        Prev
      </button>

      <span className="text-[10px] font-medium text-slate-400 sm:text-xs">
        Page <span className="font-bold text-slate-700">{page}</span>
        {totalPages ? <> of <span className="font-bold text-slate-700">{totalPages}</span></> : null}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext || disabled}
        className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 sm:text-xs"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} />
      </button>
    </div>
  );
}

/* ================================================================
   Export — WalletLedger
   ================================================================ */

export default function WalletLedger() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  const [entries, setEntries] = useState([]);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [ledgerError, setLedgerError] = useState("");

  const totalPages = useMemo(() => (count ? Math.ceil(count / pageSize) : 0), [count, pageSize]);

  // ── Fetch wallet balance (context strip) ───────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/wallet/");
        const data = res.data?.data ?? res.data;
        if (!cancelled) setWallet(data);
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          navigate("/login");
          return;
        }
        setWalletError("Couldn't load your balance.");
      } finally {
        if (!cancelled) setWalletLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ── Fetch ledger page ────────────────────────────────────────────
  const loadLedger = useCallback(
    async (targetPage, targetPageSize) => {
      setLedgerLoading(true);
      setLedgerError("");
      try {
        const res = await api.get("/api/wallet/ledger/", {
          params: { page: targetPage, page_size: targetPageSize },
        });
        const data = res.data?.data ?? res.data;
        const results = Array.isArray(data?.results) ? data.results : [];
        setEntries(results);
        setCount(toNumber(data?.count));
        setHasNext(Boolean(data?.next));
        setHasPrevious(Boolean(data?.previous));

        // Backend returned a page beyond the real last page (e.g. after
        // a page_size change) — snap back to page 1 rather than showing
        // an empty state that looks broken.
        if (results.length === 0 && targetPage > 1) {
          setPage(1);
          return;
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login");
          return;
        }
        setEntries([]);
        setLedgerError(
          err?.response?.status >= 500
            ? "Something went wrong on our end loading the ledger. Please try again."
            : "Couldn't load your ledger entries."
        );
      } finally {
        setLedgerLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    loadLedger(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handlePrev = () => {
    if (hasPrevious) setPage((p) => Math.max(1, p - 1));
  };
  const handleNext = () => {
    if (hasNext) setPage((p) => p + 1);
  };
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };
  const handleRetry = () => loadLedger(page, pageSize);

  return (
    <div className="mx-auto max-w-2xl space-y-3 p-3 pb-10 sm:space-y-5 sm:p-5 lg:p-8">
      <Reveal>
        <BalanceStrip wallet={wallet} loading={walletLoading} error={walletError} />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">Ledger entries</h2>
              <p className="text-[10px] text-slate-400 sm:text-xs">
                {ledgerLoading ? "Loading…" : `${count.toLocaleString()} total entries`}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-slate-200 p-0.5">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePageSizeChange(size)}
                  disabled={ledgerLoading}
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold transition-colors sm:text-xs ${
                    pageSize === size
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
            {ledgerLoading ? (
              Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                <div key={i} className="h-[4.5rem] animate-pulse rounded-xl bg-slate-100 sm:h-20" />
              ))
            ) : ledgerError ? (
              <div className="flex flex-col items-center gap-2.5 py-8 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertCircle className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <p className="max-w-xs text-xs text-slate-500 sm:text-sm">{ledgerError}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-1 flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 sm:text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                  Retry
                </button>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Inbox className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <p className="text-xs text-slate-400 sm:text-sm">No ledger entries yet.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {entries.map((entry, i) => (
                  <LedgerEntryRow key={`${entry.created_at}-${entry.entry_type}-${i}`} entry={entry} index={i} />
                ))}
              </AnimatePresence>
            )}
          </div>

          {!ledgerLoading && !ledgerError && entries.length > 0 && (
            <div className="mt-3 sm:mt-4">
              <PaginationBar
                page={page}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onPrev={handlePrev}
                onNext={handleNext}
                disabled={ledgerLoading}
              />
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Link
          to="/dashboard/history"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
        >
          <BookOpen className="h-4 w-4" strokeWidth={1.9} />
          View full transaction history
        </Link>
      </Reveal>
    </div>
  );
}