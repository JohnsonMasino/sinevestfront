// Global Imports
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Public Imports
import ScrollToTop from './components/ScrolltoTop';
import PrivateRoute from './components/PrivateRoute';

// Pages Imports
import Home from './pages/outer/HomePage';
import Contact from './pages/outer/ContactPage';  
import About from './pages/outer/AboutPage';
import Invest from './pages/outer/InvestPage';

// Legal Pages
import Faqs from './pages/legal/Faq';
import PrivacyPolicy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';

// Not Found Page Import
import NotFound from './components/outside/NotFound';

// Authentication Pages Imports
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ForgotPass from './pages/auth/ForgotPass';
import PassConfirm from './pages/auth/PasConfirm';

// Protected Inner Pages (lazy-loaded)
const DashboardPage = lazy(() => import("./pages/inner/DashPage"));
const ProfilePage = lazy(() => import("./pages/inner/ProfilePage"));
const KycPage = lazy(() => import("./pages/inner/KycPage"));
const KycEdit = lazy(() => import("./components/inside/KycEdit"));
const WalletLedger = lazy(() => import("./components/inside/WalletLedger"));
const HistoryPage = lazy(() => import("./pages/inner/HistoryPage"));
const DepositPage = lazy(() => import("./pages/inner/DepositPage"));
const WithdrawPage = lazy(() => import("./pages/inner/WithdrawPage"));
const PinPage = lazy(() => import("./pages/inner/PinPage"));


// ─────────────────────────────────────────────────────────
export const LoadingContext = createContext({
  showLoader: () => {},
  hideLoader: () => {},
  isLoading:  false,
  message:    "",
});

export function useLoading() {
  return useContext(LoadingContext);
}


// ─────────────────────────────────────────────────────────
// GLOBAL LOADING SPINNER OVERLAY
// ─────────────────────────────────────────────────────────
function GlobalLoader({ visible, message }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="global-loader"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "rgba(4,6,26,0.88)", backdropFilter: "blur(10px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* ── Spinner core ── */}
          <div className="relative flex items-center justify-center">

            {/* Outer slow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width:  "90px",
                height: "90px",
                border: "1px solid rgba(59,130,246,0.18)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            {/* Middle dashed ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width:       "70px",
                height:      "70px",
                border:      "1px dashed rgba(167,139,250,0.22)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* Spinning gradient arc */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width:  "56px",
                height: "56px",
                border: "2px solid transparent",
                borderTopColor:   "#3b82f6",
                borderRightColor: "#a78bfa",
                filter: "drop-shadow(0 0 6px #3b82f6) drop-shadow(0 0 10px #a78bfa44)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner counter-arc */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width:  "42px",
                height: "42px",
                border: "1.5px solid transparent",
                borderBottomColor: "#34d399",
                borderLeftColor:   "#f472b688",
                filter: "drop-shadow(0 0 5px #34d39977)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            />

            {/* Centre icon */}
            <motion.div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
                border:     "1px solid rgba(96,165,250,0.45)",
              }}
              animate={{
                boxShadow: [
                  "0 0 10px rgba(37,99,235,0.35)",
                  "0 0 28px rgba(37,99,235,0.75)",
                  "0 0 10px rgba(37,99,235,0.35)",
                ],
              }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              {/* DexteraRobo "D" wordmark / pulse dot */}
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: "linear-gradient(135deg,#93c5fd,#60a5fa)",
                  boxShadow:  "0 0 8px #60a5fa",
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.85, repeat: Infinity }}
              />
            </motion.div>

          </div>

          {/* ── Rainbow progress bar ── */}
          <div
            className="mt-10 overflow-hidden rounded-full"
            style={{
              width:      "160px",
              height:     "3px",
              background: "rgba(59,130,246,0.1)",
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg,#3b82f6,#a78bfa,#34d399,#f472b6,#3b82f6)",
                backgroundSize: "300% 100%",
              }}
              animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* ── Message text ── */}
          <motion.div
            className="mt-5 text-center space-y-1 px-8"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p
              style={{
                fontFamily:    "'Orbitron', sans-serif",
                fontSize:      "0.58rem",
                color:         "#60a5fa",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {message || "Thinking..."}
            </p>
            {/* Animated ellipsis dots */}
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#3b82f6" }}
                  animate={{ scale: [1, 1.7, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}
                />
              ))}
            </div>
            <p
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize:   "0.75rem",
                color:      "#1e3a5f",
                marginTop:  "6px",
              }}
            >
              Please do not close or refresh this page
            </p>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}


// ─────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────
function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [message,   setMessage]   = useState("");

  const showLoader = useCallback((msg = "") => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
    setMessage("");
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader, isLoading, message }}>

      {/* Scrolls the window to the top on every route change */}
      <ScrollToTop />

      {/* Global loading overlay — sits above everything */}
      <GlobalLoader visible={isLoading} message={message} />

      <Suspense>
          <Routes>

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />

            {/* Authentication Routes */}
            <Route path="/register" element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/forgot-password' element={<ForgotPass />} />
            <Route path="/reset-password/:id/:token" element={<PassConfirm />} />

            {/* Pages Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/investments" element={<Invest />} />

            {/* Legal Pages Routes */}
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Private routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              <Route path="/dashboard/kyc-view" element={<KycPage />} />
              <Route path="/dashboard/kyc-edit" element={<KycEdit />} />
              <Route path="/dashboard/wallet-ledger" element={<WalletLedger />} />
              <Route path="/dashboard/history" element={<HistoryPage />} />
              <Route path="/dashboard/deposit" element={<DepositPage />} />
              <Route path="/dashboard/withdraw" element={<WithdrawPage />} />
              <Route path="/dashboard/transaction-pin" element={<PinPage />} />
            </Route>

          </Routes>
      </Suspense>

    </LoadingContext.Provider>
  )
}

export default App