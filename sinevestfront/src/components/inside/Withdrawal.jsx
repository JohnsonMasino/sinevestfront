// src/pages/dashboard/Withdrawal.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Banknote,
  Coins,
  Check,
  Clock,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Landmark,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Info,
  Lock,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — Withdrawal
 * ------------------------------------------------------------------
 * GET  /api/wallet/                          -> total_balance +
 *                                                available_balance
 *                                                shown up top
 * POST /api/withdrawals/initiate/            -> { amount,
 *                                                wallet_address,
 *                                                transaction_pin }
 *                                                sends an OTP to the
 *                                                user's email, returns
 *                                                { id, status, ... }
 * POST /api/withdrawals/{id}/confirm/        -> { otp_code }
 *                                                finalises the request
 *                                                for admin review.
 *                                                410 = expired, the
 *                                                request was deleted
 *                                                by the cleanup cron.
 *
 * Wizard: enter USD amount (must be >= $50 and <= available_balance)
 * -> enter USDT (TRC20) wallet address -> enter transaction PIN
 * (link out to /dashboard/transaction-pin if the user has none yet)
 * -> initiate request, OTP is emailed -> enter OTP -> confirm ->
 * 3s "under review" animation -> /dashboard/history.
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

const MIN_WITHDRAWAL_USD = 50;
const PIN_LENGTH = 4;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const SUCCESS_ICON_SWITCH_MS = 1400;
const SUCCESS_TOTAL_MS = 3000;

const NETWORK_LABEL = "USDT · TRC20 network";

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

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

function isLikelyTrc20Address(address) {
  const a = (address || "").trim();
  return a.startsWith("T") && a.length >= 30 && a.length <= 36 && /^[a-zA-Z0-9]+$/.test(a);
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
   Segmented code input — used for both the transaction PIN and the
   email OTP. Auto-advances, supports backspace-to-previous and
   paste-to-fill.
   ================================================================ */

function SegmentedCodeInput({ length, value, onChange, masked = false, autoFocus = false, error = false }) {
  const inputsRef = useRef([]);
  const [reveal, setReveal] = useState(!masked);
  const digits = useMemo(() => {
    const arr = value.split("").slice(0, length);
    while (arr.length < length) arr.push("");
    return arr;
  }, [value, length]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const setDigitAt = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(""));
  };

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigitAt(index, "");
      return;
    }
    const chars = raw.split("");
    let cursor = index;
    chars.forEach((c) => {
      if (cursor < length) {
        setDigitAt(cursor, c);
        cursor += 1;
      }
    });
    const nextFocus = Math.min(index + chars.length, length - 1);
    inputsRef.current[nextFocus]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setDigitAt(index - 1, "");
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    onChange(text.padEnd(0, "").slice(0, length));
    const next = text.split("");
    while (next.length < length) next.push("");
    onChange(next.join(""));
    const focusIndex = Math.min(text.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type={masked && !reveal ? "password" : "text"}
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`h-11 w-9 shrink-0 rounded-xl border text-center text-base font-bold text-slate-900 outline-none transition-colors focus:ring-2 sm:h-12 sm:w-11 sm:text-lg ${
              error
                ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />
        ))}
      </div>
      {masked && (
        <button
          type="button"
          onClick={() => setReveal((v) => !v)}
          className="mx-auto mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 transition-colors hover:text-slate-600 sm:text-xs"
        >
          {reveal ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {reveal ? "Hide PIN" : "Show PIN"}
        </button>
      )}
    </div>
  );
}

/* ================================================================
   1. Balance strip — total + available
   ================================================================ */

function BalanceStrip({ wallet, loading, error }) {
  const lockedAmount = toNumber(wallet?.locked_balance);

  return (
    <div
      style={{ background: NAVY_GRADIENT }}
      className="relative overflow-hidden rounded-2xl p-4 text-blue-100 shadow-lg sm:rounded-3xl sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -right-14 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl"
      />
      <div className="relative">
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
            {formatUSD(wallet?.total_balance)}
          </p>
        )}

        <div className="mt-3.5 flex items-center gap-2 border-t border-white/10 pt-3.5 sm:mt-4 sm:pt-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300 sm:h-9 sm:w-9">
            <Banknote className="h-4 w-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-blue-100/50 sm:text-[10px]">
              Available to withdraw
            </p>
            {loading ? (
              <div className="mt-1 h-4 w-20 animate-pulse rounded bg-white/10" />
            ) : error ? (
              <p className="text-xs text-blue-100/50">—</p>
            ) : (
              <p className="text-sm font-bold text-white sm:text-base">{formatUSD(wallet?.available_balance)}</p>
            )}
          </div>
        </div>

        {!loading && !error && lockedAmount > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-100/50 sm:text-xs">
            <Lock className="h-3 w-3 shrink-0" />
            {formatUSD(lockedAmount)} locked in open trades
          </p>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   2. Step 1 — enter USD amount
   ================================================================ */

function StepAmount({ amount, onAmountChange, availableBalance, onContinue }) {
  const numericAmount = toNumber(amount);
  const hasAmount = numericAmount > 0;
  const meetsMinimum = !hasAmount || numericAmount >= MIN_WITHDRAWAL_USD;
  const withinAvailable = !hasAmount || numericAmount <= availableBalance;
  const canContinue = hasAmount && numericAmount >= MIN_WITHDRAWAL_USD && numericAmount <= availableBalance;

  return (
    <div>
      <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">How much do you want to withdraw?</h2>
      <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
        Minimum withdrawal is {formatUSD(MIN_WITHDRAWAL_USD)}.
      </p>

      <div className="mt-4 sm:mt-5">
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          Amount in USD
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 sm:text-lg">
            $
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-16 text-base font-semibold text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-lg"
          />
          <button
            type="button"
            onClick={() => onAmountChange(String(availableBalance > 0 ? availableBalance.toFixed(2) : ""))}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600 transition-colors hover:bg-blue-100 sm:text-xs"
          >
            Max
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 sm:px-4 sm:py-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
            Available balance
          </span>
          <span className="text-sm font-extrabold text-slate-800 sm:text-base">{formatUSD(availableBalance)}</span>
        </div>

        <AnimatePresence>
          {hasAmount && !meetsMinimum && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex items-start gap-1.5 overflow-hidden text-[11px] text-amber-600 sm:text-xs"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Minimum withdrawal is {formatUSD(MIN_WITHDRAWAL_USD)}. Enter a larger amount to continue.
            </motion.p>
          )}
          {hasAmount && meetsMinimum && !withinAvailable && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex items-start gap-1.5 overflow-hidden text-[11px] text-red-500 sm:text-xs"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              That's more than your available balance of {formatUSD(availableBalance)}.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:py-3.5 sm:text-sm"
      >
        Continue
        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}

/* ================================================================
   3. Step 2 — wallet address
   ================================================================ */

function StepWalletAddress({ address, onAddressChange, amount, onBack, onContinue }) {
  const trimmed = address.trim();
  const valid = trimmed.length > 0 ? isLikelyTrc20Address(trimmed) : true;
  const canContinue = trimmed.length > 0 && isLikelyTrc20Address(trimmed);

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
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:h-10 sm:w-10">
          <Coins className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display truncate text-sm font-bold text-slate-900 sm:text-base">Where should we send it?</h2>
          <p className="truncate text-[10px] text-slate-400 sm:text-xs">{NETWORK_LABEL}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-2.5 sm:mt-5 sm:px-4 sm:py-3">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
          Withdrawing
        </span>
        <p className="text-sm font-extrabold text-slate-800 sm:text-base">{formatUSD(amount)}</p>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          USDT (TRC20) wallet address
        </label>
        <div className="relative">
          <Landmark className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" strokeWidth={1.9} />
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="T..."
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className={`w-full rounded-xl border py-3 pl-10 pr-3.5 font-mono text-xs text-slate-900 outline-none transition-colors focus:ring-2 sm:text-sm ${
              !valid ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />
        </div>
        <AnimatePresence>
          {!valid && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex items-start gap-1.5 overflow-hidden text-[11px] text-red-500 sm:text-xs"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              That doesn't look like a valid TRC20 address.
            </motion.p>
          )}
        </AnimatePresence>
        <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          Only send to a USDT address on the TRC20 network. Funds sent to the wrong network or an
          incorrect address cannot be recovered.
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:py-3.5 sm:text-sm"
      >
        Continue
        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}

/* ================================================================
   4. Step 3 — transaction PIN
   ================================================================ */

function StepPin({ pin, onPinChange, amount, address, error, loading, onBack, onContinue }) {
  const navigate = useNavigate();
  const canContinue = pin.length === PIN_LENGTH && !loading;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-40 sm:text-xs"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
        Back
      </button>

      <div className="mt-2.5 flex items-center gap-2.5 sm:mt-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 sm:h-10 sm:w-10">
          <KeyRound className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display truncate text-sm font-bold text-slate-900 sm:text-base">Enter your transaction PIN</h2>
          <p className="truncate text-[10px] text-slate-400 sm:text-xs">Confirms this withdrawal is you</p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 px-3.5 py-3 text-[11px] sm:mt-5 sm:px-4 sm:text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Amount</span>
          <span className="font-bold text-slate-800">{formatUSD(amount)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="shrink-0 text-slate-400">To address</span>
          <span className="truncate font-mono text-slate-600">{address}</span>
        </div>
      </div>

      <div className="mt-5">
        <SegmentedCodeInput length={PIN_LENGTH} value={pin} onChange={onPinChange} masked autoFocus error={!!error} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-start justify-center gap-1.5 overflow-hidden text-center text-[11px] text-red-500 sm:text-xs"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => navigate("/dashboard/transaction-pin")}
        className="mx-auto mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 transition-colors hover:text-blue-700 sm:text-xs"
      >
        Don't have a PIN yet? Create one
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
      </button>

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:py-3.5 sm:text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
            Verifying…
          </>
        ) : (
          <>
            Confirm withdrawal
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </>
        )}
      </button>
    </div>
  );
}

/* ================================================================
   5. Step 4 — email OTP
   ================================================================ */

function StepOtp({ otp, onOtpChange, error, expired, loading, resendSeconds, resendLoading, onResend, onBack, onContinue }) {
  const canContinue = otp.length === OTP_LENGTH && !loading && !expired;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-40 sm:text-xs"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
        Back
      </button>

      <div className="mt-2.5 flex flex-col items-center text-center sm:mt-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600 sm:h-12 sm:w-12">
          <Mail className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <h2 className="font-display mt-2.5 text-sm font-bold text-slate-900 sm:text-base">Check your email</h2>
        <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-400 sm:text-xs">
          We sent a {OTP_LENGTH}-digit code to your registered email address. Enter it below to confirm this withdrawal.
        </p>
      </div>

      <div className="mt-5">
        <SegmentedCodeInput length={OTP_LENGTH} value={otp} onChange={onOtpChange} autoFocus error={!!error} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <p className="flex items-start justify-center gap-1.5 text-center text-[11px] text-red-500 sm:text-xs">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-center">
        {resendSeconds > 0 ? (
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
            <Clock className="h-3.5 w-3.5" strokeWidth={2} />
            Resend code in {formatMMSS(resendSeconds)}
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={resendLoading || expired}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50 sm:text-xs"
          >
            {resendLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.2} />}
            Resend code
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:py-3.5"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
            Confirming…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
            Confirm code
          </>
        )}
      </button>
    </div>
  );
}

/* ================================================================
   6. Step 5 — success / under review animation
   ================================================================ */

function StepSuccess() {
  const [phase, setPhase] = useState("loading");

  useEffect(() => {
    const t = setTimeout(() => setPhase("done"), SUCCESS_ICON_SWITCH_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center py-8 text-center sm:py-10">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === "loading" ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ rotate: { repeat: Infinity, duration: 1, ease: "linear" }, opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600"
            >
              <Loader2 className="h-7 w-7" strokeWidth={2} />
            </motion.span>
          ) : (
            <motion.span
              key="done"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
            >
              <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <h2 className="font-display mt-4 text-sm font-bold text-slate-900 sm:text-base">
        {phase === "loading" ? "Submitting your withdrawal" : "Withdrawal request submitted"}
      </h2>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm">
        Your request has been submitted for manual review by our admin team. This won't take long.
      </p>
    </div>
  );
}

/* ================================================================
   Export — Withdrawal
   ================================================================ */

const STEPS = ["amount", "wallet", "pin", "otp", "success"];

export default function Withdrawal() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  const [step, setStep] = useState("amount");
  const [amountUsd, setAmountUsd] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [withdrawalId, setWithdrawalId] = useState(null);

  const [initiateLoading, setInitiateLoading] = useState(false);
  const [initiateError, setInitiateError] = useState("");

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);

  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);

  const resendIntervalRef = useRef(null);
  const successNavTimerRef = useRef(null);

  const availableBalance = toNumber(wallet?.available_balance);

  // ── Fetch wallet balances ──────────────────────────────────────────
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

  // ── Resend-code cooldown while on the OTP step ─────────────────────
  useEffect(() => {
    if (step !== "otp") {
      clearInterval(resendIntervalRef.current);
      return;
    }
    setResendSeconds(RESEND_COOLDOWN_SECONDS);
    resendIntervalRef.current = setInterval(() => {
      setResendSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(resendIntervalRef.current);
  }, [step]);

  // ── Auto-navigate away once the success animation has played ──────
  useEffect(() => {
    if (step !== "success") return;
    successNavTimerRef.current = setTimeout(() => {
      navigate("/dashboard/history");
    }, SUCCESS_TOTAL_MS);
    return () => clearTimeout(successNavTimerRef.current);
  }, [step, navigate]);

  useEffect(
    () => () => {
      clearInterval(resendIntervalRef.current);
      clearTimeout(successNavTimerRef.current);
    },
    []
  );

  const handleBackToAmount = () => setStep("amount");
  const handleGoToWallet = () => setStep("wallet");
  const handleBackToWallet = () => {
    setStep("wallet");
    setPin("");
    setInitiateError("");
  };
  const handleGoToPin = () => setStep("pin");

  const runInitiate = useCallback(
    async ({ isResend = false } = {}) => {
      if (isResend) {
        setResendLoading(true);
      } else {
        setInitiateLoading(true);
        setInitiateError("");
      }
      try {
        const res = await api.post("/api/withdrawals/initiate/", {
          amount: toNumber(amountUsd).toFixed(2),
          wallet_address: walletAddress.trim(),
          transaction_pin: pin,
        });
        const data = res.data?.data ?? res.data;
        setWithdrawalId(data?.id ?? null);
        setOtp("");
        setOtpExpired(false);
        setConfirmError("");
        setResendSeconds(RESEND_COOLDOWN_SECONDS);
        if (!isResend) setStep("otp");
        return true;
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login");
          return false;
        }
        const message = extractErrorMessage(err, "Couldn't process your withdrawal request. Please try again.");
        if (isResend) {
          setConfirmError(message);
        } else {
          setInitiateError(message);
        }
        return false;
      } finally {
        if (isResend) {
          setResendLoading(false);
        } else {
          setInitiateLoading(false);
        }
      }
    },
    [amountUsd, walletAddress, pin, navigate]
  );

  const handleSubmitPin = () => runInitiate();
  const handleResendOtp = () => runInitiate({ isResend: true });

  const handleConfirmOtp = useCallback(async () => {
    if (!withdrawalId) return;
    setConfirmLoading(true);
    setConfirmError("");
    try {
      await api.post(`/api/withdrawals/${withdrawalId}/confirm/`, { otp_code: otp });
      setStep("success");
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      if (err?.response?.status === 410) {
        setOtpExpired(true);
        setConfirmError("This withdrawal request expired. Please start over.");
        return;
      }
      setConfirmError(extractErrorMessage(err, "That code didn't work. Please check and try again."));
      setOtp("");
    } finally {
      setConfirmLoading(false);
    }
  }, [withdrawalId, otp, navigate]);

  const handleStartOver = () => {
    setStep("amount");
    setAmountUsd("");
    setWalletAddress("");
    setPin("");
    setOtp("");
    setWithdrawalId(null);
    setInitiateError("");
    setConfirmError("");
    setOtpExpired(false);
  };

  return (
    <div className="mx-auto max-w-xl space-y-3 p-3 pb-10 sm:space-y-5 sm:p-5 lg:p-8">
      <Reveal>
        <BalanceStrip wallet={wallet} loading={walletLoading} error={walletError} />
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

          {otpExpired && step === "otp" ? (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </span>
              <h2 className="font-display mt-4 text-sm font-bold text-slate-900 sm:text-base">Request expired</h2>
              <p className="mt-1.5 max-w-xs text-xs text-slate-500 sm:text-sm">
                This withdrawal request expired before it was confirmed. Please start over.
              </p>
              <button
                type="button"
                onClick={handleStartOver}
                className="mt-4 flex items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 sm:text-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.2} />
                Start over
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {step === "amount" && (
                  <StepAmount
                    amount={amountUsd}
                    onAmountChange={setAmountUsd}
                    availableBalance={availableBalance}
                    onContinue={handleGoToWallet}
                  />
                )}

                {step === "wallet" && (
                  <StepWalletAddress
                    address={walletAddress}
                    onAddressChange={setWalletAddress}
                    amount={amountUsd}
                    onBack={handleBackToAmount}
                    onContinue={handleGoToPin}
                  />
                )}

                {step === "pin" && (
                  <StepPin
                    pin={pin}
                    onPinChange={setPin}
                    amount={amountUsd}
                    address={walletAddress}
                    error={initiateError}
                    loading={initiateLoading}
                    onBack={handleBackToWallet}
                    onContinue={handleSubmitPin}
                  />
                )}

                {step === "otp" && (
                  <StepOtp
                    otp={otp}
                    onOtpChange={setOtp}
                    error={confirmError}
                    expired={otpExpired}
                    loading={confirmLoading}
                    resendSeconds={resendSeconds}
                    resendLoading={resendLoading}
                    onResend={handleResendOtp}
                    onBack={() => setStep("pin")}
                    onContinue={handleConfirmOtp}
                  />
                )}

                {step === "success" && <StepSuccess />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </Reveal>
    </div>
  );
}