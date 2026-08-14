// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../components/api";

/**
 * Sinevest — Login
 * ------------------------------------------------------------------
 * POST /api/auth/login/ -> { access, refresh, user }
 * On success: persists session to localStorage and redirects to
 * /dashboard. On failure: handles 401 (bad credentials) and 403
 * (unverified email) distinctly, plus a general fallback.
 * Design system matches Register.jsx / Homecontent1.jsx: navy
 * gradient + amber accent, font-display/font-body, hand-drawn SVG
 * icons, framer-motion reveals.
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
    warning: "border-amber-200 bg-amber-50 text-amber-700",
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
        <path
          d="M12 9v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{children}</span>
    </motion.div>
  );
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

/* ================================================================
   Session persistence
   ================================================================ */

function persistSession({ access, refresh, user }) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("isAuthenticated", "true");
}

/* ================================================================
   Export — Login
   ================================================================ */

export default function Login() {
  const reducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState({ tone: "error", message: "" });

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

    if (!formData.email.trim() || !formData.password) {
      setErrors({
        ...(!formData.email.trim() && { email: ["This field is required."] }),
        ...(!formData.password && { password: ["This field is required."] }),
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        "/api/auth/login/",
        { email: formData.email.trim(), password: formData.password },
        { skipAuth: true }
      );

      const { access, refresh, user } = res.data;
      persistSession({ access, refresh, user });

      setBanner({ tone: "success", message: "Login successful. Redirecting..." });
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 401) {
        setBanner({ tone: "error", message: data?.detail || "Invalid email or password." });
      } else if (status === 403) {
        setBanner({
          tone: "warning",
          message: data?.detail || "Please verify your email before logging in.",
        });
      } else if (status === 400 && data && typeof data === "object") {
        setErrors(data);
      } else {
        setBanner({
          tone: "error",
          message: "Something went wrong while logging you in. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white py-10 sm:py-16">
      {/* Background grid texture, matching Homecontent1 / Register */}
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
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path
                    d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="m9 12 2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Welcome back
              </span>
              <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Log in to Sinevest Premium
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Enter your details to access your dashboard.
              </p>
            </div>

            <AnimatePresence>
              {banner.message && <Banner tone={banner.tone}>{banner.message}</Banner>}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email.join(" ")}</p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange("password")}
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password.join(" ")}</p>
                )}
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
                    Logging in...
                  </>
                ) : (
                  <>
                    Log In
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}