import axios from "axios";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ??
  "http://localhost:8002/api/v1"
).replace(/\/$/, "");

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

http.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized =
      error.response?.status === 401;

    const isRetry =
      originalRequest?._retry;

    const isLoginRoute =
      originalRequest?.url?.includes(
        "/auth/login"
      );

    const isRefreshRoute =
      originalRequest?.url?.includes(
        "/auth/refresh"
      );

    if (
      isUnauthorized &&
      !isRetry &&
      !isLoginRoute &&
      !isRefreshRoute
    ) {
      originalRequest._retry = true;

      try {
        // Silent token refresh: cookies are automatically sent and received by the browser
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        return http(originalRequest);
      } catch (refreshError) {
        console.error(
          "Token refresh failed",
          refreshError
        );

        localStorage.removeItem("user");

        window.dispatchEvent(
          new CustomEvent("athenura:auth-logout")
        );

        window.location.href =
          "/login";

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

export default http;