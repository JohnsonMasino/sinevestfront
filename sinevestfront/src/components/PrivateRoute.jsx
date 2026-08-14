// src/components/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";


const PrivateRoute = ({ children }) => {
  const location = useLocation();

  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const hasValidSession = isAuthenticated && Boolean(accessToken) && Boolean(refreshToken);

  if (!hasValidSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;