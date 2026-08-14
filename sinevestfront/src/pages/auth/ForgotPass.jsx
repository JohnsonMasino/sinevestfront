// src/pages/auth/ForgotPass.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../components/Api";

/**
 * Sinevest — Forgot Password
 * ------------------------------------------------------------------
 * POST /api/auth/forgot-password/ -> always 200 with a generic message
 * (account-enumeration protection). Design matches Login.jsx /
 * Register.jsx: navy gradient + amber accent, font-display/font-body,
 * framer-motion reveals.
 * ------------------------------------------------------------------
 */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function Banner({ tone = "error", children }) {
  if (!children) return null;
  const tones = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
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

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin text-white">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function TopNav() {
  return (
    <div className="mx-auto flex w-full max-w-md items-center px-1 pb-6">
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

export default function ForgotPass() {
  const reducedMotion = usePrefersReducedMotion();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [banner, setBanner] = useState({ tone: "error", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError("");
    setBanner({ tone: "error", message: "" });

    if (!email.trim()) {
      setFieldError("This field is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        "/api/auth/forgot-password/",
        { email: email.trim() },
        { skipAuth: true }
      );
      setBanner({
        tone: "success",
        message:
          res.data?.message ||
          "If an account exists for this email, a reset link has been sent.",
      });
      setSubmitted(true);
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object" && data.email) {
        setFieldError(Array.isArray(data.email) ? data.email.join(" ") : String(data.email));
      } else {
        setBanner({
          tone: "error",
          message: "Something went wrong while sending your reset link. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    setSubmitted(false);
    setBanner({ tone: "error", message: "" });
    setFieldError("");
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white py-10 sm:py-16">
      {/* Background grid texture, matching the rest of the auth flow */}
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
            <div className="mb-7 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <path
                    d="M12 15v3m-7-3a7 7 0 1 1 14 0v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-5Zm7-9a4 4 0 0 1 4 4v2H8v-2a4 4 0 0 1 4-4Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Forgot your password?
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Enter your email and we'll send you a link to reset it.
              </p>
            </div>

            <AnimatePresence>
              {banner.message && <Banner tone={banner.tone}>{banner.message}</Banner>}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="forgot-form"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldError) setFieldError("");
                      }}
                      placeholder="jane@example.com"
                      autoComplete="email"
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        fieldError ? "border-red-300" : "border-slate-200"
                      }`}
                    />
                    {fieldError && <p className="mt-1.5 text-xs font-medium text-red-600">{fieldError}</p>}
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
                        Sending reset link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="forgot-sent"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="text-center"
                >
                  <p className="text-sm text-slate-500">
                    Sent to <span className="font-semibold text-slate-700">{email}</span>. Check your inbox
                    (and spam folder) for the reset link.
                  </p>
                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                      <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Entered the wrong email? Edit it
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}