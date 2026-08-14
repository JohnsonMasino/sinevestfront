// src/pages/auth/Register.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../components/Api";

/**
 * Sinevest — Register
 * ------------------------------------------------------------------
 * Two-step flow:
 *   1. Registration form  -> POST /api/auth/register/
 *   2. OTP verification   -> POST /api/auth/verify-otp/
 *      (with resend -> POST /api/auth/resend-otp/, 60s countdown)
 * On successful verification, redirects to /login.
 * Design system matches Homecontent1.jsx: navy gradient + amber accent,
 * font-display/font-body, hand-drawn SVG icons, framer-motion reveals.
 * ------------------------------------------------------------------
 */

const RESEND_COOLDOWN = 60;

/* ================================================================
   Shared bits
   ================================================================ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function FieldError({ messages }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600">
      <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-3.5 w-3.5 shrink-0">
        <path
          d="M12 9v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{messages.join(" ")}</span>
    </p>
  );
}

function Banner({ tone = "error", children }) {
  if (!children) return null;
  const tones = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0">
        {tone === "success" ? (
          <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path
            d="M12 9v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <span>{children}</span>
    </motion.div>
  );
}

function TopNav() {
  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between px-1 pb-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Home
      </Link>
    </div>
  );
}

/* ================================================================
   Step 1 — Registration form
   ================================================================ */

function RegisterForm({ formData, setFormData, onSuccess }) {
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});

    if (formData.password !== formData.confirm_password) {
      setErrors({ confirm_password: ["Passwords do not match."] });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        "/api/auth/register/",
        {
          email: formData.email.trim(),
          password: formData.password,
          confirm_password: formData.confirm_password,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
        },
        { skipAuth: true }
      );

      const email = res.data?.email || formData.email.trim();
      onSuccess(email);
    } catch (err) {
      const data = err?.response?.data;
      if (err?.response?.status === 400 && data && typeof data === "object") {
        // Field-keyed validation errors, e.g. { email: ["..."], password: ["..."] }
        setErrors(data);
      } else {
        setGeneralError(
          data?.detail || "Something went wrong while creating your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      key="register-form"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      <AnimatePresence>
        {generalError && <Banner tone="error">{generalError}</Banner>}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">First name</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={handleChange("first_name")}
            placeholder="Jane"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              errors.first_name ? "border-red-300" : "border-slate-200"
            }`}
          />
          <FieldError messages={errors.first_name} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Last name</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={handleChange("last_name")}
            placeholder="Doe"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              errors.last_name ? "border-red-300" : "border-slate-200"
            }`}
          />
          <FieldError messages={errors.last_name} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email address</label>
        <input
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          placeholder="jane@example.com"
          autoComplete="email"
          className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            errors.email ? "border-red-300" : "border-slate-200"
          }`}
        />
        <FieldError messages={errors.email} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange("password")}
            placeholder="••••••••"
            autoComplete="new-password"
            className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              errors.password ? "border-red-300" : "border-slate-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        <FieldError messages={errors.password} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Confirm password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={formData.confirm_password}
            onChange={handleChange("confirm_password")}
            placeholder="••••••••"
            autoComplete="new-password"
            className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              errors.confirm_password ? "border-red-300" : "border-slate-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <EyeIcon open={showConfirm} />
          </button>
        </div>
        <FieldError messages={errors.confirm_password} />
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ y: loading ? 0 : -2 }}
        whileTap={{ scale: loading ? 1 : 0.97 }}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl hover:shadow-blue-600/35 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Spinner />
            Creating your account...
          </>
        ) : (
          <>
            Create Your Account
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </motion.button>

      <p className="pt-1 text-center text-xs leading-relaxed text-slate-400">
        By creating an account you agree to Sinevest Premium's Terms of Service and Privacy Policy.
      </p>
    </motion.form>
  );
}

/* ================================================================
   Step 2 — OTP verification
   ================================================================ */

function OtpStep({ email, onBackToEdit }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const otpCode = otp.join("");

  const handleDigitChange = (index) => (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("");
    while (next.length < 6) next.push("");
    setOtp(next);
    const lastIndex = Math.min(pasted.length, 6) - 1;
    inputsRef.current[lastIndex]?.focus();
  };

  const handleVerify = useCallback(
    async (e) => {
      e?.preventDefault();
      setError("");
      setNotice("");

      if (otpCode.length !== 6) {
        setError("Enter the full 6-digit code sent to your email.");
        return;
      }

      setVerifying(true);
      try {
        await api.post(
          "/api/auth/verify-otp/",
          { email, otp_code: otpCode },
          { skipAuth: true }
        );
        setNotice("Email verified successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1200);
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        if (status === 400) {
          setError(data?.detail || "Invalid or expired OTP.");
        } else if (status === 404) {
          setError(data?.detail || "No account exists for this email.");
        } else {
          setError("Something went wrong while verifying your code. Please try again.");
        }
      } finally {
        setVerifying(false);
      }
    },
    [email, otpCode, navigate]
  );

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setError("");
    setNotice("");
    setResending(true);
    try {
      const res = await api.post("/api/auth/resend-otp/", { email }, { skipAuth: true });
      setNotice(res.data?.message || "A new OTP has been sent to your email.");
      setCountdown(RESEND_COOLDOWN);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 429) {
        setError(data?.detail || "Please wait a minute before requesting another OTP.");
      } else if (status === 404) {
        setError(data?.detail || "No account exists for this email.");
      } else {
        setError("Couldn't resend the code right now. Please try again shortly.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      key="otp-step"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <button
        type="button"
        onClick={onBackToEdit}
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Edit email address
      </button>

      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path
              d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z M3 7l9 6 9-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-slate-900 sm:text-2xl">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          We sent a 6-digit code to
          <br className="sm:hidden" /> <span className="font-semibold text-slate-700">{email}</span>
        </p>
      </div>

      <AnimatePresence>
        {error && <Banner tone="error">{error}</Banner>}
        {!error && notice && <Banner tone="success">{notice}</Banner>}
      </AnimatePresence>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={handleDigitChange(i)}
              onKeyDown={handleKeyDown(i)}
              className="h-12 w-10 rounded-xl border border-slate-200 text-center text-lg font-bold text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:w-12 sm:text-xl"
            />
          ))}
        </div>

        <motion.button
          type="submit"
          disabled={verifying}
          whileHover={{ y: verifying ? 0 : -2 }}
          whileTap={{ scale: verifying ? 1 : 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-shadow hover:shadow-xl hover:shadow-amber-400/35 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {verifying ? (
            <>
              <Spinner dark />
              Verifying...
            </>
          ) : (
            <>
              Verify Email
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Didn't get the code?{" "}
        {countdown > 0 ? (
          <span className="font-semibold text-slate-400">
            Resend in <span className="tabular-nums text-slate-600">{countdown}s</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-blue-600 underline-offset-2 transition-colors hover:text-blue-800 hover:underline disabled:opacity-60"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ================================================================
   Small shared visuals
   ================================================================ */

function EyeIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      {open ? (
        <path
          d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.5A9.6 9.6 0 0 1 12 5c5 0 9 4 10 7-1 2-2.5 3.7-4.4 5M6.3 6.3C4.4 7.6 2.9 9.3 2 12c1 3 5 7 10 7 1.5 0 2.9-.3 4.1-.9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function Spinner({ dark = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-4 w-4 animate-spin ${dark ? "text-slate-900" : "text-white"}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ================================================================
   Export — Register
   ================================================================ */

export default function Register() {
  const reducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
  });

  return (
    <section className="relative min-h-screen overflow-hidden bg-white py-10 sm:py-16">
      {/* Background grid texture, matching Homecontent1 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#123a91 1px, transparent 1px), linear-gradient(90deg, #123a91 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative px-5 md:px-8">
        <TopNav />

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="mx-auto w-full max-w-md"
        >
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
            {step === "form" && (
              <div className="mb-7 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                    <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  New here
                </span>
                <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Create your Sinevest Premium account
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Sign up in a few minutes and get access to the platform.
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "form" ? (
                <RegisterForm
                  key="form-step"
                  formData={formData}
                  setFormData={setFormData}
                  onSuccess={(email) => {
                    setFormData((prev) => ({ ...prev, email }));
                    setStep("otp");
                  }}
                />
              ) : (
                <OtpStep key="otp-step" email={formData.email} onBackToEdit={() => setStep("form")} />
              )}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
              Log in instead
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}