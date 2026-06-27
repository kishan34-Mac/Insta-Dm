import http from "./http";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: "free" | "starter" | "pro" | "agency";
};

export type AuthPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
};

export type MfaLoginPayload = {
  mfaRequired: true;
  tempToken: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const authApi = {
  /* ==========================================================
      REGISTER
  ========================================================== */

  register: async (input: {
    name: string;
    email: string;
    password: string;
    plan?: string;

    isAdmin?: boolean;
    adminSecret?: string;
  }) => {
    try {
      const response = await http.post<ApiResponse<AuthPayload>>(
        "/auth/register",
        input,
      );

      return response.data.data;
    } catch (error) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      throw new Error(
        err?.response?.data?.message || err.message || "Registration failed",
      );
    }
  },

  /* ==========================================================
      LOGIN
  ========================================================== */

  login: async (input: {
    email: string;
    password: string;

    isAdmin?: boolean;
    adminSecret?: string;
  }) => {
    try {
      const response = await http.post<ApiResponse<AuthPayload | MfaLoginPayload>>(
        "/auth/login",
        input,
      );

      return response.data.data;
    } catch (error) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      throw new Error(
        err?.response?.data?.message || err.message || "Login failed",
      );
    }
  },

  /* ==========================================================
      GOOGLE LOGIN
  ========================================================== */

  googleAuth: async (
    credential: string,
    mode: "login" | "signup",
    plan?: string,
  ) => {
    try {
      const response = await http.post<ApiResponse<AuthPayload>>(
        "/auth/google",
        {
          credential,
          mode,
          plan,
        },
      );

      return response.data.data;
    } catch (error) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      throw new Error(
        err?.response?.data?.message || err.message || "Google Login failed",
      );
    }
  },

  /* ==========================================================
      CURRENT USER
  ========================================================== */

  me: async () => {
    const response = await http.get<
      ApiResponse<{
        user: AuthUser;
      }>
    >("/auth/me");

    return response.data;
  },

  /* ==========================================================
      LOGOUT
  ========================================================== */

  logout: async (refreshToken?: string) => {
    const response = await http.post<ApiResponse<void>>("/auth/logout", {
      refreshToken,
    });

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    return response.data;
  },
};

export default authApi;
