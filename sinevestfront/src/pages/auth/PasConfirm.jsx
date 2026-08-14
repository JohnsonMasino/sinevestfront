// src/pages/auth/PasConfirm.jsx
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../components/Api";

/**
 * Sinevest — Reset Password Confirm
 * ------------------------------------------------------------------
 * Route:  /reset-password/:id/:token
 * (matches FRONTEND_URL + "/reset-password/{id}/{token}" built by
 * ForgotPasswordView on the backend)
 *
 * POST /api/auth/reset-password-confirm/ with { id, token,
 * new_password, confirm_password }. On success, redirects to /login.
 * Design matches ForgotPass.jsx / Login.jsx / Register.jsx.
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

function FieldError({ messages }) {
  if (!messages || messages.length === 0) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{messages.join(" ")}</p>;
}

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
    <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 animate-spin ${dark ? "text-slate-900" : "text-white"}`}>
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

export default function PasConfirm() {
  const reducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const { id, token } = useParams();

  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState({ tone: "error", message: "" });
  const [success, setSuccess] = useState(false);

  const linkIsMalformed = !id || !token;

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
    setErrors({});
    setBanner({ tone: "error", message: "" });

    if (formData.new_password !== formData.confirm_password) {
      setErrors({ confirm_password: ["Passwords do not match."] });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        "/api/auth/reset-password-confirm/",
        {
          id,
          token,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password,
        },
        { skipAuth: true }
      );
      setBanner({
        tone: "success",
        message: res.data?.message || "Password has been reset successfully.",
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 400 && data && typeof data === "object") {
        if (data.detail) {
          // Invalid/expired/used token — nothing the form can fix, surface as banner.
          setBanner({ tone: "error", message: data.detail });
        } else if (data.confirm_password || data.new_password || data.non_field_errors) {
          setErrors({
            confirm_password: data.confirm_password,
            new_password: data.new_password,
          });
          if (data.non_field_errors) {
            setBanner({ tone: "error", message: data.non_field_errors.join(" ") });
          }
        } else {
          setBanner({ tone: "error", message: "Please check your details and try again." });
        }
      } else {
        setBanner({
          tone: "error",
          message: "Something went wrong while resetting your password. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white py-10 sm:py-16">
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
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
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
                Set a new password
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Choose a new password for your account.
              </p>
            </div>

            <AnimatePresence>
              {banner.message && <Banner tone={banner.tone}>{banner.message}</Banner>}
            </AnimatePresence>

            {linkIsMalformed ? (
              <div className="text-center">
                <p className="text-sm text-slate-500">
                  This reset link looks incomplete or malformed. Please request a new one.
                </p>
                <Link
                  to="/forgot-password"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl"
                >
                  Request a new link
                </Link>
              </div>
            ) : !success ? (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">New password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={formData.new_password}
                      onChange={handleChange("new_password")}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        errors.new_password ? "border-red-300" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      aria-label={showNew ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <EyeIcon open={showNew} />
                    </button>
                  </div>
                  <FieldError messages={errors.new_password} />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Confirm new password</label>
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
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-shadow hover:shadow-xl hover:shadow-amber-400/35 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Spinner dark />
                      Resetting password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </motion.button>

                {banner.tone === "error" && banner.message && (
                  <p className="pt-1 text-center text-xs text-slate-400">
                    Link expired or already used?{" "}
                    <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                      Request a new one
                    </Link>
                  </p>
                )}
              </form>
            ) : (
              <div className="text-center">
                <p className="text-sm text-slate-500">
                  Your password has been updated. Redirecting you to login...
                </p>
              </div>
            )}
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