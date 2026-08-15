// src/pages/dashboard/TransactionPin.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  CalendarClock,
  RefreshCw,
  Info,
  Mail,
} from "lucide-react";

import api from "../../components/Api"; // adjust path to match your project structure

/**
 * Sinevest — Transaction PIN
 * ------------------------------------------------------------------
 * GET  /api/transaction-pin/                    -> { is_set,
 *                                                    created_at,
 *                                                    updated_at }
 * POST /api/transaction-pin/create/              -> first-time setup,
 *                                                    { pin, confirm_pin }
 *                                                    no OTP required
 * POST /api/transaction-pin/change/initiate/      -> verifies current
 *                                                    PIN, emails an OTP
 *                                                    { current_pin,
 *                                                    new_pin,
 *                                                    confirm_new_pin }
 * POST /api/transaction-pin/change/confirm/       -> { otp_code }
 *                                                    finalizes the new
 *                                                    PIN
 *
 * Flow: fetch status -> if no PIN set, show the create form only ->
 * if a PIN is set, show status + a "Change PIN" action -> current/new/
 * confirm -> OTP emailed -> enter OTP -> success -> back to status.
 * ------------------------------------------------------------------
 */

const NAVY_GRADIENT =
  "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)";

const PIN_LENGTH = 4;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const SUCCESS_DISPLAY_MS = 2200;

/* ================================================================
   Helpers
   ================================================================ */

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
   Segmented code input — reused for PINs and the email OTP.
   Auto-advances, supports backspace-to-previous and paste-to-fill.
   ================================================================ */

function SegmentedCodeInput({ length, value, onChange, masked = false, autoFocus = false, error = false }) {
  const inputsRef = useRef([]);
  const [reveal, setReveal] = useState(!masked);
  const digits = (() => {
    const arr = value.split("").slice(0, length);
    while (arr.length < length) arr.push("");
    return arr;
  })();

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
          {reveal ? "Hide" : "Show"}
        </button>
      )}
    </div>
  );
}

/* ================================================================
   1. Status strip
   ================================================================ */

function StatusStrip({ status, loading, error }) {
  const isSet = !!status?.is_set;

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
            <Lock className="h-3 w-3" strokeWidth={1.8} />
            Transaction PIN
          </p>

          {loading ? (
            <div className="mt-1.5 h-7 w-32 animate-pulse rounded-lg bg-white/10 sm:h-8 sm:w-40" />
          ) : error ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-red-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          ) : (
            <p className="font-display mt-0.5 flex items-center gap-2 text-lg font-extrabold text-white sm:text-2xl">
              {isSet ? "PIN is active" : "No PIN set yet"}
            </p>
          )}
        </div>

        {!loading && !error && (
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${
              isSet ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {isSet ? <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} /> : <ShieldAlert className="h-3.5 w-3.5" strokeWidth={2.2} />}
            {isSet ? "Secured" : "Not set"}
          </span>
        )}
      </div>

      {!loading && !error && isSet && (
        <div className="relative mt-3.5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-white/10 pt-3.5 sm:mt-4 sm:pt-4">
          <p className="flex items-center gap-1.5 text-[10px] text-blue-100/60 sm:text-xs">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
            Created {formatDateTime(status?.created_at)}
          </p>
          <p className="flex items-center gap-1.5 text-[10px] text-blue-100/60 sm:text-xs">
            <RefreshCw className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
            Updated {formatDateTime(status?.updated_at)}
          </p>
        </div>
      )}

      {!loading && !error && !isSet && (
        <p className="relative mt-3 text-[11px] leading-relaxed text-blue-100/60 sm:text-xs">
          You'll need a transaction PIN to confirm withdrawals. Set one up below — it only takes a moment.
        </p>
      )}
    </div>
  );
}

/* ================================================================
   2. Overview — shown when a PIN already exists
   ================================================================ */

function StepOverview({ status, onChangePin }) {
  return (
    <div>
      <h2 className="font-display text-sm font-bold text-slate-900 sm:text-base">Your PIN is protecting withdrawals</h2>
      <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
        You'll be asked for this 4-digit PIN whenever you request a withdrawal.
      </p>

      <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 px-3.5 py-3 text-[11px] sm:mt-5 sm:px-4 sm:text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Status</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
            Active
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Created</span>
          <span className="font-semibold text-slate-700">{formatDateTime(status?.created_at)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Last updated</span>
          <span className="font-semibold text-slate-700">{formatDateTime(status?.updated_at)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onChangePin}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl sm:py-3.5 sm:text-sm"
      >
        <KeyRound className="h-4 w-4" strokeWidth={2.2} />
        Change PIN
      </button>

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-400 sm:text-[11px]">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        Changing your PIN requires your current PIN plus a one-time code sent to your email.
      </p>
    </div>
  );
}

/* ================================================================
   3. Create PIN — first-time setup, no OTP
   ================================================================ */

function StepCreate({ pin, confirmPin, onPinChange, onConfirmPinChange, error, loading, onSubmit }) {
  const bothFilled = pin.length === PIN_LENGTH && confirmPin.length === PIN_LENGTH;
  const mismatch = bothFilled && pin !== confirmPin;
  const canSubmit = bothFilled && pin === confirmPin && !loading;

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 sm:h-10 sm:w-10">
          <KeyRound className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display truncate text-sm font-bold text-slate-900 sm:text-base">Create your transaction PIN</h2>
          <p className="truncate text-[10px] text-slate-400 sm:text-xs">A {PIN_LENGTH}-digit code, yours alone</p>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          Enter new PIN
        </label>
        <SegmentedCodeInput length={PIN_LENGTH} value={pin} onChange={onPinChange} masked autoFocus />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          Confirm new PIN
        </label>
        <SegmentedCodeInput length={PIN_LENGTH} value={confirmPin} onChange={onConfirmPinChange} masked error={mismatch} />
      </div>

      <AnimatePresence>
        {mismatch && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-start justify-center gap-1.5 overflow-hidden text-center text-[11px] text-red-500 sm:text-xs"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            PINs don't match.
          </motion.p>
        )}
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
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:py-3.5 sm:text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
            Creating…
          </>
        ) : (
          <>
            Create PIN
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </>
        )}
      </button>
    </div>
  );
}

/* ================================================================
   4. Change PIN — step A: current + new + confirm
   ================================================================ */

function StepChangeForm({
  currentPin,
  newPin,
  confirmNewPin,
  onCurrentPinChange,
  onNewPinChange,
  onConfirmNewPinChange,
  error,
  loading,
  onBack,
  onSubmit,
}) {
  const newBothFilled = newPin.length === PIN_LENGTH && confirmNewPin.length === PIN_LENGTH;
  const mismatch = newBothFilled && newPin !== confirmNewPin;
  const canSubmit = currentPin.length === PIN_LENGTH && newBothFilled && newPin === confirmNewPin && !loading;

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
          <h2 className="font-display truncate text-sm font-bold text-slate-900 sm:text-base">Change your PIN</h2>
          <p className="truncate text-[10px] text-slate-400 sm:text-xs">We'll verify your current PIN first</p>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          Current PIN
        </label>
        <SegmentedCodeInput length={PIN_LENGTH} value={currentPin} onChange={onCurrentPinChange} masked autoFocus />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          New PIN
        </label>
        <SegmentedCodeInput length={PIN_LENGTH} value={newPin} onChange={onNewPinChange} masked />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          Confirm new PIN
        </label>
        <SegmentedCodeInput length={PIN_LENGTH} value={confirmNewPin} onChange={onConfirmNewPinChange} masked error={mismatch} />
      </div>

      <AnimatePresence>
        {mismatch && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-start justify-center gap-1.5 overflow-hidden text-center text-[11px] text-red-500 sm:text-xs"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            New PINs don't match.
          </motion.p>
        )}
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
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:py-3.5 sm:text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
            Verifying…
          </>
        ) : (
          <>
            Send verification code
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </>
        )}
      </button>
    </div>
  );
}

/* ================================================================
   5. Change PIN — step B: email OTP
   ================================================================ */

function StepChangeOtp({ otp, onOtpChange, error, loading, resendSeconds, resendLoading, onResend, onBack, onContinue }) {
  const canContinue = otp.length === OTP_LENGTH && !loading;

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
          We sent a {OTP_LENGTH}-digit code to your registered email address. Enter it below to confirm your new PIN.
        </p>
      </div>

      <div className="mt-5">
        <SegmentedCodeInput length={OTP_LENGTH} value={otp} onChange={onOtpChange} autoFocus error={!!error} />
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
            disabled={resendLoading}
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
            Confirm new PIN
          </>
        )}
      </button>
    </div>
  );
}

/* ================================================================
   6. Success — shared by create + change flows
   ================================================================ */

function StepSuccess({ message }) {
  return (
    <div className="flex flex-col items-center py-8 text-center sm:py-10">
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
      >
        <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
      </motion.span>
      <h2 className="font-display mt-4 text-sm font-bold text-slate-900 sm:text-base">All set</h2>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm">
        {message || "Your transaction PIN has been saved."}
      </p>
    </div>
  );
}

/* ================================================================
   Export — TransactionPin
   ================================================================ */

export default function TransactionPin() {
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");

  const [step, setStep] = useState("overview"); // overview | create | change-form | change-otp | success

  // create-PIN form
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // change-PIN form
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [initiateLoading, setInitiateLoading] = useState(false);
  const [initiateError, setInitiateError] = useState("");

  // change-PIN OTP
  const [otp, setOtp] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const resendIntervalRef = useRef(null);
  const successTimerRef = useRef(null);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError("");
    try {
      const res = await api.get("/api/transaction-pin/");
      const data = res.data?.data ?? res.data;
      setStatus(data);
      return data;
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return null;
      }
      setStatusError("Couldn't load your PIN status.");
      return null;
    } finally {
      setStatusLoading(false);
    }
  }, [navigate]);

  // ── Initial status fetch, decides the starting step ────────────────
  useEffect(() => {
    (async () => {
      const data = await loadStatus();
      if (data && !data.is_set) setStep("create");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resend-code cooldown while on the change-OTP step ──────────────
  useEffect(() => {
    if (step !== "change-otp") {
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

  // ── Auto-return to overview once the success animation has played ──
  useEffect(() => {
    if (step !== "success") return;
    successTimerRef.current = setTimeout(async () => {
      const data = await loadStatus();
      resetAllForms();
      setStep(data?.is_set ? "overview" : "create");
    }, SUCCESS_DISPLAY_MS);
    return () => clearTimeout(successTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(
    () => () => {
      clearInterval(resendIntervalRef.current);
      clearTimeout(successTimerRef.current);
    },
    []
  );

  const resetAllForms = () => {
    setPin("");
    setConfirmPin("");
    setCreateError("");
    setCurrentPin("");
    setNewPin("");
    setConfirmNewPin("");
    setInitiateError("");
    setOtp("");
    setConfirmError("");
  };

  const handleGoToCreate = () => setStep("create");
  const handleGoToChangeForm = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmNewPin("");
    setInitiateError("");
    setStep("change-form");
  };
  const handleBackToOverview = () => {
    resetAllForms();
    setStep(status?.is_set ? "overview" : "create");
  };
  const handleBackToChangeForm = () => setStep("change-form");

  const handleCreatePin = async () => {
    setCreateLoading(true);
    setCreateError("");
    try {
      const res = await api.post("/api/transaction-pin/create/", { pin, confirm_pin: confirmPin });
      const data = res.data?.data ?? res.data;
      setSuccessMessage(data?.message || "Your transaction PIN has been created.");
      setStep("success");
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setCreateError(extractErrorMessage(err, "Couldn't create your PIN. Please try again."));
    } finally {
      setCreateLoading(false);
    }
  };

  const runInitiateChange = useCallback(
    async ({ isResend = false } = {}) => {
      if (isResend) {
        setResendLoading(true);
      } else {
        setInitiateLoading(true);
        setInitiateError("");
      }
      try {
        const res = await api.post("/api/transaction-pin/change/initiate/", {
          current_pin: currentPin,
          new_pin: newPin,
          confirm_new_pin: confirmNewPin,
        });
        const data = res.data?.data ?? res.data;
        setOtp("");
        setConfirmError("");
        setResendSeconds(RESEND_COOLDOWN_SECONDS);
        if (!isResend) {
          setSuccessMessage(data?.message || "Your transaction PIN has been updated.");
          setStep("change-otp");
        }
        return true;
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login");
          return false;
        }
        const message = extractErrorMessage(err, "Couldn't verify your current PIN. Please try again.");
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
    [currentPin, newPin, confirmNewPin, navigate]
  );

  const handleSubmitChangeForm = () => runInitiateChange();
  const handleResendOtp = () => runInitiateChange({ isResend: true });

  const handleConfirmChange = async () => {
    setConfirmLoading(true);
    setConfirmError("");
    try {
      await api.post("/api/transaction-pin/change/confirm/", { otp_code: otp });
      setStep("success");
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setConfirmError(extractErrorMessage(err, "That code didn't work. Please check and try again."));
      setOtp("");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-3 p-3 pb-10 sm:space-y-5 sm:p-5 lg:p-8">
      <Reveal>
        <StatusStrip status={status} loading={statusLoading} error={statusError} />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          {statusLoading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <p className="text-xs text-slate-400">Loading your PIN status…</p>
            </div>
          ) : statusError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <p className="text-xs text-slate-500">{statusError}</p>
              <button
                type="button"
                onClick={loadStatus}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700"
              >
                <RefreshCw className="h-3 w-3" strokeWidth={2.2} />
                Retry
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
                {step === "overview" && <StepOverview status={status} onChangePin={handleGoToChangeForm} />}

                {step === "create" && (
                  <StepCreate
                    pin={pin}
                    confirmPin={confirmPin}
                    onPinChange={setPin}
                    onConfirmPinChange={setConfirmPin}
                    error={createError}
                    loading={createLoading}
                    onSubmit={handleCreatePin}
                  />
                )}

                {step === "change-form" && (
                  <StepChangeForm
                    currentPin={currentPin}
                    newPin={newPin}
                    confirmNewPin={confirmNewPin}
                    onCurrentPinChange={setCurrentPin}
                    onNewPinChange={setNewPin}
                    onConfirmNewPinChange={setConfirmNewPin}
                    error={initiateError}
                    loading={initiateLoading}
                    onBack={handleBackToOverview}
                    onSubmit={handleSubmitChangeForm}
                  />
                )}

                {step === "change-otp" && (
                  <StepChangeOtp
                    otp={otp}
                    onOtpChange={setOtp}
                    error={confirmError}
                    loading={confirmLoading}
                    resendSeconds={resendSeconds}
                    resendLoading={resendLoading}
                    onResend={handleResendOtp}
                    onBack={handleBackToChangeForm}
                    onContinue={handleConfirmChange}
                  />
                )}

                {step === "success" && <StepSuccess message={successMessage} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </Reveal>
    </div>
  );
}