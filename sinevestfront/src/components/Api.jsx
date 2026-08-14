// src/components/Api.jsx
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach access token ──────────────
api.interceptors.request.use(
  (config) => {
    if (!config.skipAuth) {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ─────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        _clearSession();
        window.location.href = import.meta.env.VITE_LOGIN_URL;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_REFRESH_PATH}`,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        // Assumes /api/auth/token/refresh/ returns flat { access, refresh },
        // matching Sinevest's LoginResponseSerializer shape. Confirm against
        // the actual refresh view/serializer if this doesn't work.
        const newAccessToken = data.access;
        const newRefreshToken = data.refresh;

        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        _clearSession();
        window.location.href = import.meta.env.VITE_LOGIN_URL;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function _clearSession() {
  ["accessToken", "refreshToken", "user", "isAuthenticated"].forEach((key) =>
    localStorage.removeItem(key)
  );
}

export default api;