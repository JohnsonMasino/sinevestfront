// src/pages/dashboard/Dash.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Wallet,
  Lock,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  BookOpen,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Repeat,
  AlertCircle,
  Loader2,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — Dashboard Home (Dash.jsx)
 * ------------------------------------------------------------------
 * Same design system as the rest of the app: navy gradient + amber
 * accent, font-display/font-body, framer-motion reveals, mobile-first
 * Tailwind (every block is deliberately compact on small screens).
 *
 * Data sources:
 *   GET /api/wallet/        -> balance summary (available/locked/total + totals)
 *   GET /api/transactions/  -> merged history -> last 2 shown + feeds the chart
 *   Public crypto APIs      -> top 10 markets, 3-source fallback chain
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

function formatSignedUSD(value) {
  const n = toNumber(value);
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function timeAgo(isoDate) {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(isoDate).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
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
   Live date/time strip
   ================================================================ */

function LiveClock() {
  const now = useLiveClock();
  const datePart = now.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = now.toLocaleTimeString(undefined, { hour12: true });

  return (
    <div className="flex items-center gap-1.5 text-blue-100/70">
      <Clock className="h-3 w-3 shrink-0" strokeWidth={1.8} />
      <span className="text-[10px] font-medium tracking-wide sm:text-xs">
        {datePart} &middot;{" "}
        <span className="tabular-nums text-amber-300">{timePart}</span>
      </span>
    </div>
  );
}

/* ================================================================
   1. Balance hero card
   ================================================================ */

function BalanceHero({ wallet, loading, error }) {
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
        <LiveClock />
        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-100/80">
          <Wallet className="h-3 w-3" strokeWidth={1.8} />
          Wallet
        </span>
      </div>

      <div className="relative mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-100/50 sm:text-xs">
          Total balance
        </p>
        {loading ? (
          <div className="mt-2 h-8 w-40 animate-pulse rounded-lg bg-white/10 sm:h-10 sm:w-56" />
        ) : error ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : (
          <motion.p
            key={wallet?.total_balance}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            {formatUSD(wallet?.total_balance)}
          </motion.p>
        )}
      </div>

      {/* Available / Locked */}
      <div className="relative mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3">
        <div className="rounded-xl bg-white/5 p-2.5 sm:p-3.5">
          <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-emerald-300/90 sm:text-[10px]">
            <ArrowDownToLine className="h-3 w-3" strokeWidth={2} />
            Available
          </p>
          <p className="mt-1 truncate text-sm font-bold text-white sm:text-lg">
            {loading ? "—" : formatUSD(wallet?.available_balance)}
          </p>
          <p className="mt-0.5 text-[9px] text-blue-100/50 sm:text-[10px]">Withdrawable</p>
        </div>
        <div className="rounded-xl bg-white/5 p-2.5 sm:p-3.5">
          <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-amber-300/90 sm:text-[10px]">
            <Lock className="h-3 w-3" strokeWidth={2} />
            Locked
          </p>
          <p className="mt-1 truncate text-sm font-bold text-white sm:text-lg">
            {loading ? "—" : formatUSD(wallet?.locked_balance)}
          </p>
          <p className="mt-0.5 text-[9px] text-blue-100/50 sm:text-[10px]">In active trades</p>
        </div>
      </div>

      {/* Deposited / Withdrawn / Profit — tiny stats row */}
      <div className="relative mt-2.5 grid grid-cols-3 gap-2 border-t border-white/10 pt-2.5 sm:mt-3 sm:gap-3 sm:pt-3.5">
        {[
          { label: "Deposited", value: wallet?.total_deposited },
          { label: "Withdrawn", value: wallet?.total_withdrawn },
          { label: "Profit", value: wallet?.total_profit_earned },
        ].map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <p className="truncate text-[10px] font-semibold text-blue-100 sm:text-xs">
              {loading ? "—" : formatUSD(stat.value, { compact: true })}
            </p>
            <p className="text-[8px] uppercase tracking-wide text-blue-100/45 sm:text-[9px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   2. Balance movement chart — self-contained animated SVG,
      no external charting library required
   ================================================================ */

function BalanceChart({ points, loading, error }) {
  const width = 600;
  const height = 160;
  const padding = 8;

  const chart = useMemo(() => {
    if (!points.length) return null;
    const values = points.map((p) => p.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    const range = max - min || 1;
    const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

    const coords = points.map((p, i) => ({
      x: padding + i * stepX,
      y: height - padding - ((p.value - min) / range) * (height - padding * 2),
    }));

    const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padding} L ${coords[0].x.toFixed(1)} ${height - padding} Z`;
    const trendingUp = values[values.length - 1] >= values[0];

    return { linePath, areaPath, trendingUp };
  }, [points]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">
            Balance movement
          </h2>
          <p className="text-[10px] text-slate-400 sm:text-xs">Last 30 transactions</p>
        </div>
        {chart && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
              chart.trendingUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            {chart.trendingUp ? (
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.2} />
            ) : (
              <ArrowDownRight className="h-3 w-3" strokeWidth={2.2} />
            )}
            {chart.trendingUp ? "Trending up" : "Trending down"}
          </span>
        )}
      </div>

      <div className="mt-3 h-32 w-full sm:mt-4 sm:h-40">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" />
        ) : error ? (
          <div className="flex h-full items-center justify-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        ) : !chart ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No transaction activity yet.
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chart.trendingUp ? "#34d399" : "#f87171"} stopOpacity="0.35" />
                <stop offset="100%" stopColor={chart.trendingUp ? "#34d399" : "#f87171"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={chart.areaPath}
              fill="url(#balanceFill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
            <motion.path
              d={chart.linePath}
              fill="none"
              stroke={chart.trendingUp ? "#10b981" : "#ef4444"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
            />
          </svg>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   3. Quick actions — Deposit / Invest / Withdraw + Ledger link
   ================================================================ */

const ACTIONS = [
  { label: "Deposit", to: "/dashboard/deposit", icon: ArrowDownToLine, wrap: "bg-emerald-50 text-emerald-600" },
  { label: "Invest", to: "/dashboard/investment", icon: TrendingUp, wrap: "bg-amber-50 text-amber-600" },
  { label: "Withdraw", to: "/dashboard/withdraw", icon: ArrowUpFromLine, wrap: "bg-blue-50 text-blue-600" },
];

function QuickActions() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">Quick actions</h2>
        <Link
          to="/dashboard/wallet-ledger"
          className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 sm:text-xs"
        >
          <BookOpen className="h-3 w-3" strokeWidth={2} />
          Ledger
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:mt-4 sm:gap-3">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
            >
              <Link to={action.to} className="group flex flex-col items-center gap-1.5">
                <motion.span
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.93 }}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-shadow group-hover:shadow-md sm:h-14 sm:w-14 ${action.wrap}`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.9} />
                </motion.span>
                <span className="text-[10px] font-semibold text-slate-700 sm:text-xs">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   4. Recent transactions — last two + See all
   ================================================================ */

const TX_STYLES = {
  deposit: { icon: ArrowDownRight, wrap: "bg-emerald-50 text-emerald-600", sign: "+" },
  withdrawal: { icon: ArrowUpRight, wrap: "bg-red-50 text-red-600", sign: "-" },
  trade: { icon: Repeat, wrap: "bg-blue-50 text-blue-600", sign: "" },
};

function RecentTransactions({ transactions, loading, error }) {
  const recent = transactions.slice(0, 2);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">Recent activity</h2>
        <Link
          to="/dashboard/history"
          className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 sm:text-xs"
        >
          See all
          <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
        </Link>
      </div>

      <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 sm:h-16" />
          ))
        ) : error ? (
          <p className="flex items-center gap-1.5 py-2 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : recent.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-400">No transactions yet.</p>
        ) : (
          recent.map((tx) => {
            const style = TX_STYLES[tx.type] || TX_STYLES.trade;
            const Icon = style.icon;
            const amountNum = toNumber(tx.amount);
            const displaySigned =
              tx.type === "trade" ? formatSignedUSD(amountNum) : `${style.sign}${formatUSD(Math.abs(amountNum))}`;
            const amountColor =
              tx.type === "deposit"
                ? "text-emerald-600"
                : tx.type === "withdrawal"
                ? "text-red-600"
                : amountNum >= 0
                ? "text-emerald-600"
                : "text-red-600";

            return (
              <div
                key={tx.id}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 transition-colors hover:bg-slate-50 sm:gap-3 sm:p-3"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${style.wrap}`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold capitalize text-slate-800 sm:text-sm">
                    {tx.description || tx.type}
                  </p>
                  <p className="text-[10px] capitalize text-slate-400 sm:text-xs">
                    {tx.status} &middot; {timeAgo(tx.created_at)}
                  </p>
                </div>
                <p className={`shrink-0 text-xs font-bold sm:text-sm ${amountColor}`}>{displaySigned}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ================================================================
   5. Crypto ticker — top 10 markets, 3-source fallback
   ================================================================ */

const CRYPTO_SOURCES = [
  {
    name: "CoinGecko",
    url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false",
    parse: (data) =>
      data.map((c) => ({
        id: c.id,
        symbol: (c.symbol || "").toUpperCase(),
        name: c.name,
        image: c.image,
        price: c.current_price,
        change24h: c.price_change_percentage_24h,
      })),
  },
  {
    name: "CoinCap",
    url: "https://api.coincap.io/v2/assets?limit=10",
    parse: (payload) =>
      (payload.data || []).map((c) => ({
        id: c.id,
        symbol: (c.symbol || "").toUpperCase(),
        name: c.name,
        image: `https://assets.coincap.io/assets/icons/${(c.symbol || "").toLowerCase()}@2x.png`,
        price: Number(c.priceUsd),
        change24h: Number(c.changePercent24Hr),
      })),
  },
  {
    name: "CryptoCompare",
    url: "https://min-api.cryptocompare.com/data/top/mktcapfull?limit=10&tsym=USD",
    parse: (payload) =>
      (payload.Data || []).map((entry) => {
        const info = entry.CoinInfo || {};
        const raw = entry.RAW?.USD || {};
        return {
          id: info.Id,
          symbol: info.Name,
          name: info.FullName,
          image: info.ImageUrl ? `https://www.cryptocompare.com${info.ImageUrl}` : "",
          price: raw.PRICE ?? 0,
          change24h: raw.CHANGEPCT24HOUR ?? 0,
        };
      }),
  },
];

async function fetchCryptoWithFallback() {
  let lastError = null;
  for (const source of CRYPTO_SOURCES) {
    try {
      const res = await fetch(source.url);
      if (!res.ok) throw new Error(`${source.name} responded ${res.status}`);
      const data = await res.json();
      const parsed = source.parse(data).filter((c) => c && c.price);
      if (parsed.length) return parsed;
      throw new Error(`${source.name} returned no usable data`);
    } catch (err) {
      lastError = err;
      // try the next source
    }
  }
  throw lastError || new Error("All crypto data sources failed");
}

function CryptoTicker() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCryptoWithFallback();
        if (!cancelled) setCoins(data);
      } catch {
        if (!cancelled) setError("Live prices are temporarily unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">Live crypto markets</h2>
      <p className="text-[10px] text-slate-400 sm:text-xs">Top 10 by market cap</p>

      <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mt-4 sm:gap-2.5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 w-28 shrink-0 animate-pulse rounded-xl bg-slate-100 sm:h-24 sm:w-32" />
          ))
        ) : error ? (
          <p className="flex items-center gap-1.5 py-2 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : (
          coins.map((coin, i) => {
            const up = toNumber(coin.change24h) >= 0;
            return (
              <motion.div
                key={coin.id || coin.symbol}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="w-28 shrink-0 rounded-xl border border-slate-100 p-2.5 sm:w-32 sm:p-3"
              >
                <div className="flex items-center gap-1.5">
                  {coin.image ? (
                    <img
                      src={coin.image}
                      alt={coin.symbol}
                      className="h-4 w-4 rounded-full sm:h-5 sm:w-5"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <span className="truncate text-[10px] font-bold text-slate-800 sm:text-xs">
                    {coin.symbol}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-xs font-bold text-slate-900 sm:text-sm">
                  {formatUSD(coin.price)}
                </p>
                <span
                  className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:text-[10px] ${
                    up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  {up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {Math.abs(toNumber(coin.change24h)).toFixed(2)}%
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Export — Dash (Dashboard Home)
   ================================================================ */

export default function Dash() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState("");

  // ── Fetch wallet balance ──────────────────────────────────────────
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

  // ── Fetch transactions (feeds recent list + chart) ──────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/transactions/", { params: { page_size: 30 } });
        const data = res.data?.results ?? res.data?.data?.results ?? [];
        if (!cancelled) setTransactions(data);
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          navigate("/login");
          return;
        }
        setTxError("Couldn't load transaction history.");
      } finally {
        if (!cancelled) setTxLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ── Derive chart points: cumulative net change, oldest -> newest ────
  const chartPoints = useMemo(() => {
    if (!transactions.length) return [];
    const chronological = [...transactions].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    let running = 0;
    return chronological.map((t) => {
      const amt = toNumber(t.amount);
      const signed = t.type === "withdrawal" ? -Math.abs(amt) : t.type === "deposit" ? Math.abs(amt) : amt;
      running += signed;
      return { date: t.created_at, value: running };
    });
  }, [transactions]);

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-3 pb-8 sm:space-y-5 sm:p-5 lg:p-8">
      <Reveal>
        <BalanceHero wallet={wallet} loading={walletLoading} error={walletError} />
      </Reveal>

      <Reveal delay={0.06}>
        <BalanceChart points={chartPoints} loading={txLoading} error={txError && !transactions.length ? txError : ""} />
      </Reveal>

      <Reveal delay={0.1}>
        <QuickActions />
      </Reveal>

      <Reveal delay={0.14}>
        <RecentTransactions transactions={transactions} loading={txLoading} error={txError} />
      </Reveal>

      <Reveal delay={0.18}>
        <CryptoTicker />
      </Reveal>
    </div>
  );
}