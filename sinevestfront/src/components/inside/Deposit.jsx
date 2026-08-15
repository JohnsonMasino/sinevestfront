// src/pages/dashboard/Deposit.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Bitcoin,
  Gem,
  Coins,
  Copy,
  Check,
  Clock,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  X,
  ChevronDown,
  Inbox,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Info,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — Deposit
 * ------------------------------------------------------------------
 * GET  /api/wallet/            -> only total_balance is shown up top
 * GET  /api/deposits/          -> paginated list, powers the "View
 *                                  deposit requests" popup
 * GET  /api/deposits/{id}/     -> fresh single-record status, used
 *                                  when a request row is expanded
 *                                  (admin approval happens outside
 *                                  this app, so this is how the user
 *                                  finds out it changed)
 * POST /api/deposits/          -> { amount } — the live USD
 *                                  equivalent of the crypto sent, NOT
 *                                  the crypto amount itself
 *
 * Wizard: select crypto -> enter crypto amount (live USD conversion,
 * $50 minimum) -> show wallet address + 5-minute countdown -> "I've
 * paid" -> 5s submitting animation -> /dashboard/history.
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

const MIN_DEPOSIT_USD = 50;
const COUNTDOWN_SECONDS = 5 * 60;
const PRICE_POLL_MS = 15000;

/* ================================================================
   EDIT WALLET ADDRESSES HERE
   ================================================================ */
const CRYPTO_ADDRESSES = {
  BTC: "bc1qxwe3rmw2fnkf5x60lnc0shx2nj8jtmt70fghte",
  ETH: "0xf3De63824657C68aA4E09E0C21594d3487aca979",
  USDT_TRC20: "TLGSMku9c74FjqkMKgcp88cYZb1xv48ooW",
};

const CRYPTOS = [
  {
    key: "BTC",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin network",
    icon: Bitcoin,
    wrap: "bg-amber-50 text-amber-600",
    address: CRYPTO_ADDRESSES.BTC,
    coingeckoId: "bitcoin",
    coincapId: "bitcoin",
    ccSymbol: "BTC",
  },
  {
    key: "ETH",
    name: "Ethereum",
    symbol: "ETH",
    network: "ERC20 network",
    icon: Gem,
    wrap: "bg-blue-50 text-blue-600",
    address: CRYPTO_ADDRESSES.ETH,
    coingeckoId: "ethereum",
    coincapId: "ethereum",
    ccSymbol: "ETH",
  },
  {
    key: "USDT_TRC20",
    name: "USDT",
    symbol: "USDT",
    network: "TRC20 network",
    icon: Coins,
    wrap: "bg-emerald-50 text-emerald-600",
    address: CRYPTO_ADDRESSES.USDT_TRC20,
    coingeckoId: "tether",
    coincapId: "tether",
    ccSymbol: "USDT",
  },
];

/* ================================================================
   Live price — 3-source fallback chain, same pattern as the
   dashboard's crypto ticker.
   ================================================================ */

const PRICE_SOURCES = [
  {
    name: "CoinGecko",
    url: (coin) => `https://api.coingecko.com/api/v3/simple/price?ids=${coin.coingeckoId}&vs_currencies=usd`,
    parse: (data, coin) => Number(data?.[coin.coingeckoId]?.usd),
  },
  {
    name: "CoinCap",
    url: (coin) => `https://api.coincap.io/v2/assets/${coin.coincapId}`,
    parse: (data) => Number(data?.data?.priceUsd),
  },
  {
    name: "CryptoCompare",
    url: (coin) => `https://min-api.cryptocompare.com/data/price?fsym=${coin.ccSymbol}&tsyms=USD`,
    parse: (data) => Number(data?.USD),
  },
];

async function fetchPriceWithFallback(coin) {
  let lastError = null;
  for (const source of PRICE_SOURCES) {
    try {
      const res = await fetch(source.url(coin));
      if (!res.ok) throw new Error(`${source.name} responded ${res.status}`);
      const data = await res.json();
      const price = source.parse(data, coin);
      if (Number.isFinite(price) && price > 0) return price;
      throw new Error(`${source.name} returned no usable price`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("All price sources failed");
}

/* ================================================================
   Helpers
   ================================================================ */

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatUSD(value) {
  const n = toNumber(value);
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCrypto(value, symbol) {
  const n = toNumber(value);
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${symbol}`;
}

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

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

function getStatusTone(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("approv") || s.includes("complet") || s.includes("success")) return "bg-emerald-50 text-emerald-600";
  if (s.includes("pend") || s.includes("review")) return "bg-amber-50 text-amber-600";
  if (s.includes("reject") || s.includes("declin") || s.includes("fail")) return "bg-red-50 text-red-600";
  return "bg-slate-100 text-slate-500";
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
   1. Balance strip
   ================================================================ */

function BalanceStrip({ totalBalance, loading, error, onOpenRequests }) {
  return (
    <div
      style={{ background: NAVY_GRADIENT }}
      className="relative overflow-hidden rounded-2xl p-4 text-blue-100 shadow-lg sm:rounded-3xl sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -right-14 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl"
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-100/50 sm:text-xs">
            <Wallet className="h-3 w-3" strokeWidth={1.8} />
            Total balance
          </p>
          {loading ? (
            <div className="mt-1.5 h-7 w-28 animate-pulse rounded-lg bg-white/10 sm:h-9 sm:w-36" />
          ) : error ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-red-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          ) : (
            <p className="font-display mt-0.5 truncate text-xl font-extrabold text-white sm:text-3xl">
              {formatUSD(totalBalance)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenRequests}
          className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-[10px] font-semibold text-white transition-colors hover:bg-white/20 sm:text-xs"
        >
          View requests
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   2. Step 1 — choose crypto
   ================================================================ */

function StepSelectCrypto({ selected, onSelect, onContinue }) {
  return (
    <div>
      <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">Choose a crypto to deposit</h2>
      <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">Pick the currency you'll be sending.</p>

      <div className="mt-3.5 space-y-2 sm:mt-4 sm:space-y-2.5">
        {CRYPTOS.map((coin, i) => {
          const Icon = coin.icon;
          const active = selected === coin.key;
          return (
            <motion.button
              key={coin.key}
              type="button"
              onClick={() => onSelect(coin.key)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileTap={{ scale: 0.98 }}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:rounded-2xl sm:p-3.5 ${
                active ? "border-blue-400 bg-blue-50/60 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${coin.wrap}`}>
                <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800 sm:text-sm">{coin.name}</p>
                <p className="truncate text-[10px] text-slate-400 sm:text-xs">{coin.network}</p>
              </div>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  active ? "border-blue-500 bg-blue-500" : "border-slate-200"
                }`}
              >
                {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:py-3.5 sm:text-sm"
      >
        Continue
        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}

/* ================================================================
   3. Step 2 — enter crypto amount, live USD conversion
   ================================================================ */

function StepEnterAmount({ coin, amount, onAmountChange, price, priceLoading, priceError, onBack, onContinue }) {
  const usdValue = price ? toNumber(amount) * price : 0;
  const hasAmount = toNumber(amount) > 0;
  const meetsMinimum = hasAmount && !!price && usdValue >= MIN_DEPOSIT_USD;
  const Icon = coin.icon;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-600 sm:text-xs"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
        Back
      </button>

      <div className="mt-2.5 flex items-center gap-2.5 sm:mt-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${coin.wrap}`}>
          <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display truncate text-sm font-bold text-slate-900 sm:text-base">
            Enter {coin.name} amount
          </h2>
          <p className="truncate text-[10px] text-slate-400 sm:text-xs">{coin.network}</p>
        </div>
      </div>

      <div className="mt-4 sm:mt-5">
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          Amount in {coin.symbol}
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 pr-16 text-base font-semibold text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-lg"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 sm:text-sm">
            {coin.symbol}
          </span>
        </div>

        {/* Live USD conversion */}
        <motion.div
          layout
          className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 sm:px-4 sm:py-3"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
            Live USD value
          </span>
          {priceLoading && !price ? (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 sm:text-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Fetching price…
            </span>
          ) : priceError ? (
            <span className="flex items-center gap-1.5 text-xs text-red-500 sm:text-sm">
              <AlertCircle className="h-3.5 w-3.5" />
              Price unavailable
            </span>
          ) : (
            <motion.span
              key={usdValue.toFixed(2)}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className={`text-sm font-extrabold sm:text-base ${meetsMinimum ? "text-emerald-600" : "text-slate-800"}`}
            >
              {formatUSD(usdValue)}
            </motion.span>
          )}
        </motion.div>

        <AnimatePresence>
          {hasAmount && price && !meetsMinimum && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex items-start gap-1.5 overflow-hidden text-[11px] text-amber-600 sm:text-xs"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Minimum deposit is {formatUSD(MIN_DEPOSIT_USD)}. Enter a larger amount to continue.
            </motion.p>
          )}
        </AnimatePresence>

        {price && (
          <p className="mt-2 text-[10px] text-slate-300 sm:text-xs">
            1 {coin.symbol} ≈ {formatUSD(price)} · refreshes automatically
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!meetsMinimum}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:py-3.5 sm:text-sm"
      >
        Continue to payment
        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}

/* ================================================================
   4. Step 3 — wallet address, countdown, "I've paid"
   ================================================================ */

function StepPay({ coin, amount, usdValue, secondsLeft, onBack, onPaid }) {
  const [copied, setCopied] = useState(false);
  const Icon = coin.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coin.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — the address is still selectable/visible.
    }
  };

  const urgent = secondsLeft <= 60;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-600 sm:text-xs"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
        Back
      </button>

      <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-3">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${coin.wrap}`}>
            <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display truncate text-sm font-bold text-slate-900 sm:text-base">Send payment</h2>
            <p className="truncate text-[10px] text-slate-400 sm:text-xs">{coin.network}</p>
          </div>
        </div>

        <motion.span
          animate={urgent ? { scale: [1, 1.06, 1] } : {}}
          transition={{ repeat: urgent ? Infinity : 0, duration: 1 }}
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold tabular-nums sm:text-sm ${
            urgent ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          <Clock className="h-3.5 w-3.5" strokeWidth={2.2} />
          {formatMMSS(secondsLeft)}
        </motion.span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:mt-5 sm:rounded-2xl sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">Amount to send</p>
        </div>
        <p className="mt-1 text-base font-extrabold text-slate-900 sm:text-lg">{formatCrypto(amount, coin.symbol)}</p>
        <p className="text-[11px] text-slate-400 sm:text-xs">≈ {formatUSD(usdValue)}</p>

        <div className="mt-3 border-t border-slate-200 pt-3 sm:mt-3.5 sm:pt-3.5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">
            {coin.name} deposit address
          </p>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3">
            <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-700 sm:text-xs">
              {coin.address}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy address"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-8 sm:w-8 ${
                copied ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2} />}
            </button>
          </div>
          <AnimatePresence>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1 text-[10px] font-semibold text-emerald-600 sm:text-xs"
              >
                Address copied to clipboard
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          Send only {coin.symbol} on the {coin.network} to this address. Sending any other asset or using
          the wrong network may result in permanent loss of funds.
        </p>
      </div>

      <button
        type="button"
        onClick={onPaid}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-shadow hover:shadow-xl sm:py-3.5"
      >
        <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
        I have paid
      </button>
      <p className="mt-2 text-center text-[10px] text-slate-400 sm:text-xs">
        This request expires and returns you to the dashboard if the timer runs out.
      </p>
    </div>
  );
}

/* ================================================================
   5. Step 4 — submitting animation
   ================================================================ */

function StepSubmitting({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center py-8 text-center sm:py-10">
      {error ? (
        <>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </span>
          <h2 className="font-display mt-4 text-sm font-bold text-slate-900 sm:text-base">Couldn't submit your deposit</h2>
          <p className="mt-1.5 max-w-xs text-xs text-slate-500 sm:text-sm">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 flex items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 sm:text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.2} />
            Try again
          </button>
        </>
      ) : (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600"
          >
            <Loader2 className="h-6 w-6" strokeWidth={2} />
          </motion.span>
          <h2 className="font-display mt-4 text-sm font-bold text-slate-900 sm:text-base">Submitting your deposit</h2>
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm">
            Your request has been submitted for manual review by our admin team. This won't take long.
          </p>
        </>
      )}
    </div>
  );
}

/* ================================================================
   6. Deposit requests modal — list + expandable live-refresh detail
   ================================================================ */

function DepositRequestRow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(entry);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const refresh = async (e) => {
    e.stopPropagation();
    setRefreshing(true);
    setRefreshError("");
    try {
      const res = await api.get(`/api/deposits/${entry.id}/`);
      setDetail(res.data?.data ?? res.data);
    } catch {
      setRefreshError("Couldn't refresh status.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-100 sm:rounded-xl">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-2.5 text-left transition-colors hover:bg-slate-50 sm:p-3"
      >
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 sm:text-sm">{formatUSD(detail.amount)}</p>
          <p className="truncate text-[10px] text-slate-400 sm:text-xs">{formatDateTime(detail.created_at)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:text-[10px] ${getStatusTone(detail.status)}`}>
            {detail.status}
          </span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50"
          >
            <div className="space-y-1.5 p-2.5 text-[10px] sm:p-3 sm:text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Processed at</span>
                <span className="font-semibold text-slate-700">{formatDateTime(detail.processed_at)}</span>
              </div>
              {detail.admin_notes && (
                <div>
                  <span className="text-slate-400">Admin notes</span>
                  <p className="mt-0.5 font-medium text-slate-700">{detail.admin_notes}</p>
                </div>
              )}
              {refreshError && <p className="text-red-500">{refreshError}</p>}
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="mt-1 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
              >
                {refreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" strokeWidth={2.2} />}
                Refresh status
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DepositRequestsModal({ open, onClose }) {
  const [entries, setEntries] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 10;

  const load = useCallback(async (targetPage) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/deposits/", { params: { page: targetPage, page_size: pageSize } });
      const data = res.data?.data ?? res.data;
      setEntries(Array.isArray(data?.results) ? data.results : []);
      setCount(toNumber(data?.count));
      setHasNext(Boolean(data?.next));
      setHasPrevious(Boolean(data?.previous));
    } catch {
      setEntries([]);
      setError("Couldn't load your deposit requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page]);

  useEffect(() => {
    if (!open) setPage(1);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-3.5 sm:p-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">Deposit requests</h3>
                <p className="text-[10px] text-slate-400 sm:text-xs">{loading ? "Loading…" : `${count} total`}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[55vh] space-y-1.5 overflow-y-auto p-3 sm:p-3.5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))
              ) : error ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-xs text-slate-500">{error}</p>
                  <button
                    type="button"
                    onClick={() => load(page)}
                    className="mt-1 flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700"
                  >
                    <RefreshCw className="h-3 w-3" strokeWidth={2.2} />
                    Retry
                  </button>
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Inbox className="h-5 w-5 text-slate-300" />
                  <p className="text-xs text-slate-400">No deposit requests yet.</p>
                </div>
              ) : (
                entries.map((entry) => <DepositRequestRow key={entry.id} entry={entry} />)
              )}
            </div>

            {!loading && !error && entries.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 p-3 sm:p-3.5">
                <button
                  type="button"
                  onClick={() => hasPrevious && setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevious}
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Prev
                </button>
                <span className="text-[10px] text-slate-400">Page {page}</span>
                <button
                  type="button"
                  onClick={() => hasNext && setPage((p) => p + 1)}
                  disabled={!hasNext}
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
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
   Export — Deposit
   ================================================================ */

const STEPS = ["select", "amount", "pay", "submitting"];

export default function Deposit() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  const [step, setStep] = useState("select");
  const [selectedCryptoKey, setSelectedCryptoKey] = useState(null);
  const [cryptoAmount, setCryptoAmount] = useState("");

  const [price, setPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [submitError, setSubmitError] = useState("");
  const [requestsOpen, setRequestsOpen] = useState(false);

  const countdownRef = useRef(null);
  const priceIntervalRef = useRef(null);

  const selectedCrypto = useMemo(() => CRYPTOS.find((c) => c.key === selectedCryptoKey) || null, [selectedCryptoKey]);
  const usdValue = price ? toNumber(cryptoAmount) * price : 0;

  // ── Fetch wallet total balance ────────────────────────────────────
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
        setWalletError("Couldn't load balance.");
      } finally {
        if (!cancelled) setWalletLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ── Live price polling while on amount/pay steps ─────────────────
  useEffect(() => {
    if (!selectedCrypto || (step !== "amount" && step !== "pay")) {
      clearInterval(priceIntervalRef.current);
      return;
    }

    let cancelled = false;
    const fetchPrice = async () => {
      setPriceLoading(true);
      try {
        const p = await fetchPriceWithFallback(selectedCrypto);
        if (!cancelled) {
          setPrice(p);
          setPriceError("");
        }
      } catch {
        if (!cancelled) setPriceError("Live prices are temporarily unavailable.");
      } finally {
        if (!cancelled) setPriceLoading(false);
      }
    };

    fetchPrice();
    priceIntervalRef.current = setInterval(fetchPrice, PRICE_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(priceIntervalRef.current);
    };
  }, [selectedCrypto, step]);

  // ── 5-minute countdown on the pay step ────────────────────────────
  useEffect(() => {
    if (step !== "pay") {
      clearInterval(countdownRef.current);
      return;
    }
    setSecondsLeft(COUNTDOWN_SECONDS);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => () => {
    clearInterval(countdownRef.current);
    clearInterval(priceIntervalRef.current);
  }, []);

  const handleSelectCrypto = (key) => setSelectedCryptoKey(key);
  const handleGoToAmount = () => {
    if (selectedCryptoKey) setStep("amount");
  };
  const handleBackToSelect = () => {
    setStep("select");
    setPrice(null);
  };
  const handleGoToPay = () => setStep("pay");
  const handleBackToAmount = () => setStep("amount");

  const handleSubmitDeposit = useCallback(async () => {
    setStep("submitting");
    setSubmitError("");
    const startedAt = Date.now();
    const finalUsdValue = usdValue;
    try {
      await api.post("/api/deposits/", { amount: finalUsdValue.toFixed(2) });
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 5000 - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));
      navigate("/dashboard/history");
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setSubmitError(extractErrorMessage(err, "Something went wrong submitting your deposit. Please try again."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdValue, navigate]);

  return (
    <div className="mx-auto max-w-xl space-y-3 p-3 pb-10 sm:space-y-5 sm:p-5 lg:p-8">
      <Reveal>
        <BalanceStrip
          totalBalance={wallet?.total_balance}
          loading={walletLoading}
          error={walletError}
          onOpenRequests={() => setRequestsOpen(true)}
        />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          {/* step progress dots */}
          <div className="mb-4 flex items-center gap-1.5 sm:mb-5">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  STEPS.indexOf(step) >= i ? "bg-blue-600" : "bg-slate-100"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {step === "select" && (
                <StepSelectCrypto
                  selected={selectedCryptoKey}
                  onSelect={handleSelectCrypto}
                  onContinue={handleGoToAmount}
                />
              )}

              {step === "amount" && selectedCrypto && (
                <StepEnterAmount
                  coin={selectedCrypto}
                  amount={cryptoAmount}
                  onAmountChange={setCryptoAmount}
                  price={price}
                  priceLoading={priceLoading}
                  priceError={priceError}
                  onBack={handleBackToSelect}
                  onContinue={handleGoToPay}
                />
              )}

              {step === "pay" && selectedCrypto && (
                <StepPay
                  coin={selectedCrypto}
                  amount={cryptoAmount}
                  usdValue={usdValue}
                  secondsLeft={secondsLeft}
                  onBack={handleBackToAmount}
                  onPaid={handleSubmitDeposit}
                />
              )}

              {step === "submitting" && <StepSubmitting error={submitError} onRetry={handleSubmitDeposit} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>

      <DepositRequestsModal open={requestsOpen} onClose={() => setRequestsOpen(false)} />
    </div>
  );
}