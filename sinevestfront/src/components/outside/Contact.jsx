import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Sinevest — ContactUs
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed for
 *            Header/Footer/Homecontent1/Faq/PrivacyPolicy/Terms).
 *            Same design system: font-display (Poppins) / font-body
 *            (Inter), navy gradient + amber accent, hand-drawn SVG
 *            icon style — no icon library.
 * Styling:   Tailwind CSS, mobile-first.
 *
 * NOTE — WIRE UP BEFORE PRODUCTION
 * ------------------------------------------------------------------
 * The form below only simulates a submission (a short delay, then a
 * success state) so the UI/animation is fully in place. Replace the
 * body of `handleSubmit` with a real call to your backend / email
 * service (e.g. an API route, Formspree, SendGrid, etc.) before this
 * goes live — same spirit as the other placeholder call-outs across
 * these files: don't ship a form that silently goes nowhere.
 *
 * Sections:
 *   1. ContactHeader — intro banner.
 *   2. ContactDetails — support email, office address, social
 *                      handles, live chat pointer — navy gradient
 *                      card, same treatment as Footer/CredibilitySection.
 *   3. ContactForm   — name / email / message fields with inline
 *                      validation, animated success confirmation.
 * ------------------------------------------------------------------
 */

/* ================================================================
   Shared: reveal-on-scroll wrapper (same pattern as other pages)
   ================================================================ */
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   1. Header
   ================================================================ */
function ContactHeader() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-10 md:pt-24 md:pb-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#123a91 1px, transparent 1px), linear-gradient(90deg, #123a91 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="M18 10a6 6 0 1 0-12 0v4a2 2 0 0 0 2 2h1v-6H6v-0a6 6 0 0 1 12 0v0h-3v6h1a2 2 0 0 0 2-2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            We're here to help
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Get in touch with Sinevest
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            Have a question about your account, an investment, or anything
            else? Reach us using the details below, or send us a message
            and our team will get back to you.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   2. Contact details — email, address, social, live chat pointer
   ================================================================ */

const SOCIAL_LINKS = [
  {
    id: "facebook",
    label: "Facebook",
    href: "https://facebook.com/sinevest",
    path: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.78 8.44-4.94 8.44-9.94Z",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    href: "https://x.com/sinevest",
    path: "M18.9 2.5h3.1l-6.8 7.77L23.2 21.5h-6.27l-4.9-6.4-5.61 6.4H3.3l7.28-8.31L2 2.5h6.43l4.43 5.85 5.04-5.85Zm-1.09 17.1h1.72L7.3 4.29H5.45l12.36 15.31Z",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/sinevest",
    path: "M12 2.16c2.72 0 3.04.01 4.12.06 1.06.05 1.79.22 2.43.47.68.26 1.25.62 1.82 1.19.57.57.93 1.14 1.19 1.82.25.64.42 1.37.47 2.43.05 1.08.06 1.4.06 4.12s-.01 3.04-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.92 4.92 0 0 1-1.19 1.82 4.92 4.92 0 0 1-1.82 1.19c-.64.25-1.37.42-2.43.47-1.08.05-1.4.06-4.12.06s-3.04-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.92 4.92 0 0 1-1.82-1.19 4.92 4.92 0 0 1-1.19-1.82c-.25-.64-.42-1.37-.47-2.43C2.17 15.04 2.16 14.72 2.16 12s.01-3.04.06-4.12c.05-1.06.22-1.79.47-2.43.26-.68.62-1.25 1.19-1.82A4.92 4.92 0 0 1 5.7 2.44c.64-.25 1.37-.42 2.43-.47C9.21 1.92 9.53 1.91 12.25 1.91Zm0 1.8c-2.68 0-3 .01-4.05.06-.97.04-1.5.2-1.85.34-.46.18-.79.4-1.14.75-.35.35-.57.68-.75 1.14-.14.35-.3.88-.34 1.85-.05 1.05-.06 1.37-.06 4.05s.01 3 .06 4.05c.04.97.2 1.5.34 1.85.18.46.4.79.75 1.14.35.35.68.57 1.14.75.35.14.88.3 1.85.34 1.05.05 1.37.06 4.05.06s3-.01 4.05-.06c.97-.04 1.5-.2 1.85-.34.46-.18.79-.4 1.14-.75.35-.35.57-.68.75-1.14.14-.35.3-.88.34-1.85.05-1.05.06-1.37.06-4.05s-.01-3-.06-4.05c-.04-.97-.2-1.5-.34-1.85a3.1 3.1 0 0 0-.75-1.14 3.1 3.1 0 0 0-1.14-.75c-.35-.14-.88-.3-1.85-.34-1.05-.05-1.37-.06-4.05-.06ZM12 6.87A5.13 5.13 0 1 1 6.87 12 5.13 5.13 0 0 1 12 6.87Zm0 1.8A3.33 3.33 0 1 0 15.33 12 3.33 3.33 0 0 0 12 8.67Zm5.34-1.99a1.2 1.2 0 1 1-1.2-1.2 1.2 1.2 0 0 1 1.2 1.2Z",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/company/sinevest",
    path: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56Z",
  },
];

function ContactDetails() {
  return (
    <section
      style={{
        background:
          "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)",
      }}
      className="relative overflow-hidden py-14 text-blue-100 md:py-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Email */}
          <Reveal delay={0}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-100/60">Support Email</p>
                <a
                  href="mailto:support@sinevest.com"
                  className="mt-1 block text-sm font-semibold text-white transition-colors hover:text-amber-400 sm:text-base"
                >
                  support@sinevest.com
                </a>
              </div>
            </div>
          </Reveal>

          {/* Office address */}
          <Reveal delay={0.06}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-100/60">Office Address</p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-white sm:text-base">
                  42 Willowbrook Lane
                  <br />
                  London
                  <br />
                  SW1A 2AB
                  <br />
                  United Kingdom
                </p>
              </div>
            </div>
          </Reveal>

          {/* Social */}
          <Reveal delay={0.12}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity="0" />
                  <path
                    d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-100/60">Follow Us</p>
                <p className="mt-1 text-sm font-semibold text-white sm:text-base">@sinevest on every platform</p>
              </div>
              <div className="mt-1 flex items-center gap-2.5">
                {SOCIAL_LINKS.map((social) => (
                  <motion.a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ y: -3, backgroundColor: "#fbbf24", color: "#0a1930" }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]">
                      <path d={social.path} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Live chat pointer */}
          <Reveal delay={0.18}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-6 backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-100/60">Fastest Response</p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-white sm:text-base">
                  Chat with support live via the widget in the bottom-right
                  corner of the page.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   3. Contact form
   ================================================================ */

function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!values.email.trim()) {
      next.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!values.message.trim()) next.message = "Please enter a message.";
    else if (values.message.trim().length < 10)
      next.message = "Your message should be at least 10 characters.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("submitting");

    // TODO: replace this simulated delay with a real API call, e.g.:
    // await fetch("/api/contact", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(values),
    // });
    await new Promise((resolve) => setTimeout(resolve, 1100));

    setStatus("success");
  };

  const handleSendAnother = () => {
    setValues({ name: "", email: "", message: "" });
    setErrors({});
    setStatus("idle");
  };

  return (
    <section className="relative bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Send a message
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Prefer email? Write to us
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
            Fill out the form and our support team will reply directly to
            your inbox.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="flex flex-col items-center py-6 text-center"
                >
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                      <path
                        d="m5 13 4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.span>

                  <h3 className="mt-5 font-display text-xl font-bold text-slate-900 sm:text-2xl">
                    Message sent
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                    Thanks, {values.name.split(" ")[0] || "there"} — our support
                    team will reply to you via email within the next{" "}
                    <span className="font-semibold text-slate-700">48 hours</span>.
                    Need a faster answer? Use the live chat widget in the
                    bottom-right corner of the page.
                  </p>

                  <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSendAnother}
                      className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
                    >
                      Send another message
                    </button>
                    <Link to="/">
                      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-shadow hover:shadow-lg hover:shadow-blue-600/35">
                        Back to Homepage
                      </span>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-5"
                >
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Jane Okafor"
                      className={`mt-2 w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                        errors.name
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      }`}
                    />
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-1.5 text-xs font-medium text-red-500"
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className={`mt-2 w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                        errors.email
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      }`}
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-1.5 text-xs font-medium text-red-500"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={values.message}
                      onChange={handleChange}
                      placeholder="Tell us what you need help with..."
                      className={`mt-2 w-full resize-none rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                        errors.message
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      }`}
                    />
                    <AnimatePresence>
                      {errors.message && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-1.5 text-xs font-medium text-red-500"
                        >
                          {errors.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === "submitting"}
                    whileHover={status === "submitting" ? {} : { y: -2 }}
                    whileTap={status === "submitting" ? {} : { scale: 0.98 }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl hover:shadow-blue-600/35 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "submitting" ? (
                      <>
                        <motion.span
                          className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                          <path
                            d="M5 12h14M13 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-slate-400">
                    Prefer a faster answer? Use the live chat widget in the
                    bottom-right corner of the page.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   Export — ContactUs
   ================================================================ */

export default function ContactUs() {
  return (
    <>
      <ContactHeader />
      <ContactDetails />
      <ContactForm />
    </>
  );
}