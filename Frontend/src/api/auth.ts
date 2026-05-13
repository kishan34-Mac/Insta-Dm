import http from "./http";

/* ==========================================
   TYPES
========================================== */

export type AuthUser = {
  _id: string;

  name: string;

  email: string;

  plan:
    | "free"
    | "starter"
    | "pro"
    | "agency";
};

export type AuthPayload = {
  user: AuthUser;

  accessToken: string;

  refreshToken: string;
};

export type ApiResponse<T> = {
  success: boolean;

  message?: string;

  data: T;
};

/* ==========================================
   AUTH API
========================================== */

export const authApi = {
  /* ==========================================
     REGISTER
  ========================================== */

  register: async (input: {
    name: string;

    email: string;

    password: string;
  }) => {
    try {
      const response =
        await http.post<
          ApiResponse<AuthPayload>
        >("/auth/register", input);

      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err.message || "Registration failed";
      console.error("Register error:", message);
      throw new Error(message);
    }
  },

  /* ==========================================
     LOGIN
  ========================================== */

  login: async (input: {
    email: string;

    password: string;
  }) => {
    try {
      const response =
        await http.post<
          ApiResponse<AuthPayload>
        >("/auth/login", input);

      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err.message || "Login failed";
      console.error("Login error:", message);
      throw new Error(message);
    }
  },

  /* ==========================================
     GET CURRENT USER
  ========================================== */

  me: async () => {
    try {
      const response =
        await http.get<
          ApiResponse<{
            user: AuthUser;
          }>
        >("/auth/me");

      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err.message || "Failed to fetch user";
      console.error("Fetch user error:", message);
      throw new Error(message);
    }
  },

  /* ==========================================
     LOGOUT
  ========================================== */

  logout: async (
    refreshToken?: string
  ) => {
    try {
      const response =
        await http.post<
          ApiResponse<void>
        >("/auth/logout", {
          refreshToken,
        });

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      localStorage.removeItem(
        "user"
      );

      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err.message || "Logout failed";
      console.error("Logout error:", message);
      throw new Error(message);
    }
  },
};

export default authApi;