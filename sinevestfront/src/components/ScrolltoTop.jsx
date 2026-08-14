import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 * Forces the window to scroll to the top whenever the route (pathname)
 * changes, since react-router does not do this by default.
 *
 * Usage — render once, near the top of your app, inside the Router:
 *
 *   <BrowserRouter>
 *     <ScrollToTop />
 *     <Header />
 *     <Routes>...</Routes>
 *     <Footer />
 *   </BrowserRouter>
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;