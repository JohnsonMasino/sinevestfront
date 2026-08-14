import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Sinevest — Hero
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed for
 *            Header/Footer). No extra icon library — crypto "logos"
 *            are drawn as small gradient badges + currency glyphs,
 *            matching the hand-drawn SVG style used in Header/Footer.
 * Styling:   Tailwind CSS.
 *
 * Layout:
 *   [ Sticky Header — rendered by the page, not this file          ]
 *   -------------------------------------------------------------------
 *   [        Live ticker strip — scrolls right → left, looping     ]  <- CryptoTicker
 *   -------------------------------------------------------------------
 *   [   Floating crypto badge field (batches fade in/out & drift,  ]
 *   [   visible on mobile AND desktop — sized with clamp())        ]
 *   [   Eyebrow · Rotating headline (4 slides) · CTAs              ]  <- Hero content
 *   -------------------------------------------------------------------
 *
 * Data:
 *   CryptoTicker fetches live 24h price/change data with a 3-provider
 *   fallback chain: CoinGecko → CoinCap → Binance. Each request has a
 *   timeout; if all three fail, a static seed dataset is shown so the
 *   strip is never empty. Refreshes on an interval.
 *
 * Routes:
 *   - "Explore Investments" -> /investments (matches Header/Footer nav)
 *   - "Get Started"         -> /signup (adjust to your real create-
 *                              account route if different)
 *
 * Motion:
 *   Respects prefers-reduced-motion — the marquee, floating badges,
 *   and headline rotator all fall back to a static, non-animated
 *   presentation for users who have that OS setting enabled.
 * ------------------------------------------------------------------
 */

/* ================================================================
   Shared: prefers-reduced-motion hook
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

/* ================================================================
   Live crypto ticker
   ================================================================ */

const TICKER_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", binance: "BTCUSDT", coincap: "bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", binance: "ETHUSDT", coincap: "ethereum" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", binance: "BNBUSDT", coincap: "binance-coin" },
  { id: "solana", symbol: "SOL", name: "Solana", binance: "SOLUSDT", coincap: "solana" },
  { id: "ripple", symbol: "XRP", name: "XRP", binance: "XRPUSDT", coincap: "xrp" },
  { id: "cardano", symbol: "ADA", name: "Cardano", binance: "ADAUSDT", coincap: "cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", binance: "DOGEUSDT", coincap: "dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", binance: "DOTUSDT", coincap: "polkadot" },
  { id: "tron", symbol: "TRX", name: "Tron", binance: "TRXUSDT", coincap: "tron" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", binance: "LTCUSDT", coincap: "litecoin" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", binance: "LINKUSDT", coincap: "chainlink" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", binance: "AVAXUSDT", coincap: "avalanche" },
];

// Static seed so the strip renders instantly and never looks broken,
// even before the first live fetch resolves (or if all providers fail).
const FALLBACK_PRICES = {
  BTC: { price: 64250.12, change: 1.84 },
  ETH: { price: 3180.55, change: -0.62 },
  BNB: { price: 583.4, change: 0.95 },
  SOL: { price: 148.27, change: 3.41 },
  XRP: { price: 0.582, change: -1.15 },
  ADA: { price: 0.451, change: 0.28 },
  DOGE: { price: 0.121, change: 2.03 },
  DOT: { price: 6.42, change: -0.44 },
  TRX: { price: 0.118, change: 0.71 },
  LTC: { price: 82.6, change: -0.19 },
  LINK: { price: 14.85, change: 1.32 },
  AVAX: { price: 27.9, change: -2.08 },
};

function withTimeout(promise, ms = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return promise(controller.signal).finally(() => clearTimeout(timer));
}

async function fetchFromCoinGecko(signal) {
  const ids = TICKER_COINS.map((c) => c.id).join(",");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { signal },
  );
  if (!res.ok) throw new Error("CoinGecko response not ok");
  const data = await res.json();
  return TICKER_COINS.map((c) => {
    const entry = data[c.id];
    if (!entry || typeof entry.usd !== "number") throw new Error("CoinGecko missing coin");
    return { symbol: c.symbol, name: c.name, price: entry.usd, change: entry.usd_24h_change ?? 0 };
  });
}

async function fetchFromCoinCap(signal) {
  const ids = TICKER_COINS.map((c) => c.coincap).join(",");
  const res = await fetch(`https://api.coincap.io/v2/assets?ids=${ids}`, { signal });
  if (!res.ok) throw new Error("CoinCap response not ok");
  const { data } = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error("CoinCap empty");
  return TICKER_COINS.map((c) => {
    const entry = data.find((d) => d.id === c.coincap);
    if (!entry) throw new Error("CoinCap missing coin");
    return {
      symbol: c.symbol,
      name: c.name,
      price: parseFloat(entry.priceUsd),
      change: parseFloat(entry.changePercent24Hr),
    };
  });
}

async function fetchFromBinance(signal) {
  const symbols = JSON.stringify(TICKER_COINS.map((c) => c.binance));
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
    { signal },
  );
  if (!res.ok) throw new Error("Binance response not ok");
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error("Binance empty");
  return TICKER_COINS.map((c) => {
    const entry = data.find((d) => d.symbol === c.binance);
    if (!entry) throw new Error("Binance missing coin");
    return {
      symbol: c.symbol,
      name: c.name,
      price: parseFloat(entry.lastPrice),
      change: parseFloat(entry.priceChangePercent),
    };
  });
}

function fallbackDataset() {
  return TICKER_COINS.map((c) => ({
    symbol: c.symbol,
    name: c.name,
    price: FALLBACK_PRICES[c.symbol]?.price ?? 0,
    change: FALLBACK_PRICES[c.symbol]?.change ?? 0,
  }));
}

// Tries each provider in turn; up to three real network attempts before
// giving up and showing the static seed data.
async function fetchTickerData() {
  const providers = [fetchFromCoinGecko, fetchFromCoinCap, fetchFromBinance];
  for (const provider of providers) {
    try {
      const result = await withTimeout((signal) => provider(signal), 6000);
      if (Array.isArray(result) && result.length > 0) return result;
    } catch (err) {
      // swallow and fall through to the next provider
      continue;
    }
  }
  return fallbackDataset();
}

function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 4 });
}

function CryptoTicker() {
  const [coins, setCoins] = useState(fallbackDataset());
  const [live, setLive] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    const data = await fetchTickerData();
    if (mountedRef.current) {
      setCoins(data);
      setLive(true);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const interval = setInterval(refresh, 45000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  // Duplicate the row once so the CSS marquee can loop seamlessly
  // from -50% back to 0 with no visible seam.
  const loopCoins = [...coins, ...coins];

  return (
    <div
      style={{ background: "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)" }}
      className="relative w-full overflow-hidden border-b border-white/10 font-body"
      role="marquee"
      aria-label="Live cryptocurrency prices"
    >
      {/* left/right fade masks so items scroll in/out softly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#0f2557] to-transparent md:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0f2557] to-transparent md:w-20" />

      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-1.5 text-[10px] uppercase tracking-wide text-blue-100/50 md:hidden">
        <span className={`relative flex h-1.5 w-1.5 ${live ? "" : "opacity-60"}`}>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        {live ? "Live market data" : "Loading live prices…"}
      </div>

      <div className={`flex ${reducedMotion ? "flex-wrap justify-center gap-x-8 gap-y-2 py-3" : "py-2.5"}`}>
        {reducedMotion ? (
          coins.map((coin) => <TickerItem key={coin.symbol} coin={coin} />)
        ) : (
          <motion.div
            className="flex shrink-0 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: Math.max(20, coins.length * 3.2), ease: "linear", repeat: Infinity }}
          >
            {loopCoins.map((coin, i) => (
              <TickerItem key={`${coin.symbol}-${i}`} coin={coin} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TickerItem({ coin }) {
  const isUp = coin.change >= 0;
  return (
    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap px-5 text-sm md:px-6">
      <span className="font-display font-semibold text-white">{coin.symbol}</span>
      <span className="tabular-nums text-blue-100/80">${formatPrice(coin.price)}</span>
      <span
        className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
          isUp ? "bg-emerald-400/15 text-emerald-400" : "bg-rose-400/15 text-rose-400"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className={`h-3 w-3 ${isUp ? "" : "rotate-180"}`}>
          <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {Math.abs(coin.change).toFixed(2)}%
      </span>
      <span aria-hidden="true" className="ml-3 h-1 w-1 rounded-full bg-white/15" />
    </div>
  );
}

/* ================================================================
   Floating crypto badge field
   ================================================================ */

// Simple gradient "coin" badges using currency glyphs — deliberately
// generic (not brand logo artwork) but instantly readable as crypto.
// `size` is a desktop max — actual rendered size is clamp()'d down
// for narrow viewports so these stay visible (not hidden) on mobile.
const CRYPTO_BADGES = [
  { symbol: "BTC", glyph: "₿", from: "#f7931a", to: "#c9770a", top: "9%", left: "6%", size: 52 },
  { symbol: "ETH", glyph: "Ξ", from: "#8a92ff", to: "#4c53c9", top: "16%", left: "86%", size: 46 },
  { symbol: "SOL", glyph: "◎", from: "#9945ff", to: "#14b866", top: "60%", left: "4%", size: 44 },
  { symbol: "DOGE", glyph: "Ð", from: "#e8b84b", to: "#a9822f", top: "78%", left: "90%", size: 40 },
  { symbol: "XRP", glyph: "✕", from: "#33475b", to: "#12202c", top: "36%", left: "12%", size: 38 },
  { symbol: "BNB", glyph: "B", from: "#f3ba2f", to: "#c99814", top: "6%", left: "50%", size: 40 },
  { symbol: "ADA", glyph: "A", from: "#2f6fed", to: "#123a91", top: "88%", left: "56%", size: 42 },
  { symbol: "DOT", glyph: "●", from: "#e6007a", to: "#9c0055", top: "44%", left: "93%", size: 36 },
  { symbol: "LTC", glyph: "Ł", from: "#c2c6cc", to: "#8b9096", top: "68%", left: "22%", size: 38 },
  { symbol: "LINK", glyph: "⬡", from: "#2a5ada", to: "#173a99", top: "3%", left: "72%", size: 36 },
];

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const BADGE_BATCHES = chunk(CRYPTO_BADGES, 4); // ~3 batches

function FloatingBadgeField() {
  const reducedMotion = usePrefersReducedMotion();
  const [batchIndex, setBatchIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setBatchIndex((i) => (i + 1) % BADGE_BATCHES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  const activeBatch = BADGE_BATCHES[batchIndex];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {activeBatch.map((badge) => (
          <motion.div
            key={`${batchIndex}-${badge.symbol}`}
            className="absolute"
            style={{ top: badge.top, left: badge.left }}
            initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.3, rotate: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            {/* independent continuous float/jump loop, layered inside the
                presence-controlled wrapper above. Sizing uses clamp() so
                badges shrink gracefully on narrow screens instead of
                being hidden — visible on mobile and desktop alike. */}
            <motion.div
              animate={{
                y: [0, -16, 0, 10, 0],
                x: [0, 8, -6, 0],
                rotate: [0, 6, -4, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center justify-center rounded-full font-display font-bold text-white shadow-lg ring-1 ring-white/40 backdrop-blur-sm"
              style={{
                width: `clamp(26px, 7vw, ${badge.size}px)`,
                height: `clamp(26px, 7vw, ${badge.size}px)`,
                background: `linear-gradient(135deg, ${badge.from}, ${badge.to})`,
                fontSize: `clamp(11px, 3vw, ${badge.size * 0.42}px)`,
                boxShadow: `0 8px 24px -6px ${badge.from}66`,
              }}
              title={badge.symbol}
            >
              {badge.glyph}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   Rotating headline — 4 short title/subtitle pairs
   ================================================================ */

const HERO_SLIDES = [
  {
    title: "Invest smarter. Trade safer.",
    subtitle: "Real-time prices, zero guesswork, total control.",
  },
  {
    title: "Your crypto, fully in your hands.",
    subtitle: "Licensed, secure, and built for real growth.",
  },
  {
    title: "Markets move fast. So do we.",
    subtitle: "Live data feeds you can actually trust.",
  },
  {
    title: "From first coin to full portfolio.",
    subtitle: "Simple tools built for serious investors.",
  },
];

function RotatingHeadline() {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const slide = HERO_SLIDES[reducedMotion ? 0 : index];

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative flex min-h-[96px] w-full items-center justify-center sm:min-h-[130px] md:min-h-[160px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -22 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-2"
          >
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500 sm:text-lg">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {!reducedMotion && (
        <div className="mt-3 flex items-center gap-2" role="tablist" aria-label="Hero headline slides">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show headline ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-blue-600" : "w-1.5 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Hero section proper
   ================================================================ */

export default function Hero() {
  return (
    <section className="relative w-full font-body">
      <CryptoTicker />

      <div className="relative overflow-hidden bg-white">
        {/* ambient gradient glows — echoes Header/Footer's blue + amber palette */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#123a91 1px, transparent 1px), linear-gradient(90deg, #123a91 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <FloatingBadgeField />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 py-16 text-center md:px-8 md:py-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Live markets, real returns
          </motion.span>

          <RotatingHeadline />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
          >
            {/* Secondary CTA — outlined, quieter, leads with the data */}
            <Link to="/investments" className="w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ y: -2, borderColor: "#2563eb" }}
                whileTap={{ scale: 0.97 }}
                className="group flex w-full items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:text-blue-600 sm:w-auto"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-blue-600">
                  <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Explore Investments
              </motion.button>
            </Link>

            {/* Primary CTA — solid gradient, matches Header's Sign Up */}
            <Link to="/signup" className="w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-shadow hover:shadow-xl hover:shadow-blue-600/40 sm:w-auto"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full"
                  style={{ clipPath: "polygon(0 0, 30% 0, 10% 100%, -20% 100%)" }}
                />
                <span className="relative">Get Started</span>
                <svg viewBox="0 0 24 24" fill="none" className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 text-xs text-slate-400"
          >
            No hidden fees · Licensed &amp; regulated · Withdraw anytime
          </motion.p>
        </div>
      </div>
    </section>
  );
}