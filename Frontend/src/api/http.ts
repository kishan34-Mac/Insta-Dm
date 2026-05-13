import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:5002/api"
).replace(/\/$/, "");

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor to inject Authorization header
http.interceptors.request.use((config) => {
  const rawAuth = localStorage.getItem("athenura.auth");
  if (rawAuth) {
    try {
      const auth = JSON.parse(rawAuth);
      if (auth.accessToken) {
        config.headers.Authorization = `Bearer ${auth.accessToken}`;
      }
    } catch (e) {
      console.error("Failed to parse auth from localStorage", e);
    }
  }
  return config;
});

// Interceptor to handle 401 errors and refresh token
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      try {
        const rawAuth = localStorage.getItem("athenura.auth");
        if (rawAuth) {
          const auth = JSON.parse(rawAuth);
          if (auth.refreshToken) {
            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: auth.refreshToken,
            });
            const newTokens = res.data.data;
            const newAuth = { ...auth, ...newTokens };
            localStorage.setItem("athenura.auth", JSON.stringify(newAuth));
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            
            // Dispatch a custom event to notify AuthContext
            window.dispatchEvent(new CustomEvent("athenura:auth-refresh", { detail: newAuth }));
            
            return http(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem("athenura.auth");
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default http;
