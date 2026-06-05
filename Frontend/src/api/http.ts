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

const getStoredAuth = () => {
  try {
    const rawAuth =
      localStorage.getItem("athenura.auth");

    if (!rawAuth) return null;

    return JSON.parse(rawAuth);
  } catch (error) {
    console.error(
      "Failed to parse auth data",
      error
    );

    return null;
  }
};

http.interceptors.request.use(
  (config) => {
    const auth = getStoredAuth();

    const token = auth?.accessToken;

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

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
        const auth = getStoredAuth();

        if (!auth?.refreshToken) {
          throw new Error(
            "No refresh token found"
          );
        }

        const refreshResponse =
          await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {
              refreshToken:
                auth.refreshToken,
            }
          );

        const refreshData =
          refreshResponse.data.data;

        const updatedAuth = {
          ...auth,
          accessToken:
            refreshData.accessToken,
          refreshToken:
            refreshData.refreshToken ||
            auth.refreshToken,
        };

        localStorage.setItem(
          "athenura.auth",
          JSON.stringify(updatedAuth)
        );

        window.dispatchEvent(
          new CustomEvent(
            "athenura:auth-refresh",
            {
              detail: updatedAuth,
            }
          )
        );

        originalRequest.headers.Authorization =
          `Bearer ${updatedAuth.accessToken}`;

        return http(originalRequest);
      } catch (refreshError) {
        console.error(
          "Token refresh failed",
          refreshError
        );

        localStorage.removeItem(
          "athenura.auth"
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