import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  authApi,
  type AuthPayload,
  type AuthUser,
} from "@/api/auth";
import http from "@/api/http";

type AuthState = {
  user: AuthUser | null;

  accessToken: string | null;

  loading: boolean;

  login: (input: {
    email: string;
    password: string;
  }) => Promise<any>;

  register: (input: {
    name: string;
    email: string;
    password: string;
    plan?: string;
  }) => Promise<void>;

  loginWithGoogle: (
    credential: string,
    mode: "login" | "signup",
    plan?: string
  ) => Promise<any>;

  logout: () => Promise<void>;

  verifyMfa: (input: {
    code?: string;
    tempToken: string;
    recoveryCode?: string;
  }) => Promise<void>;
};

const AuthContext =
  createContext<AuthState | null>(
    null
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] = useState<AuthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Silent bootstrap: attempt to refresh tokens on app load using HTTP-only cookies
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const refreshResponse = await http.post("/auth/refresh");
        const payload = refreshResponse.data.data;
        if (payload?.user && payload?.accessToken) {
          setAuth({
            user: payload.user,
            accessToken: payload.accessToken,
            refreshToken: "",
          });
        }
      } catch (err) {
        console.log("No active session recovered on startup");
      } finally {
        setLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  // Listen to background logout event from HTTP client interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setAuth(null);
    };

    window.addEventListener(
      "athenura:auth-logout",
      handleAuthLogout
    );

    return () =>
      window.removeEventListener(
        "athenura:auth-logout",
        handleAuthLogout
      );
  }, []);

  const login =
    useCallback(
      async (input: {
        email: string;
        password: string;
      }) => {
        const response =
          await authApi.login(
            input
          );

        if (response.mfaRequired) {
          return response;
        }

        setAuth(response);
        return response;
      },
      []
    );

  const register =
    useCallback(
      async (input: {
        name: string;
        email: string;
        password: string;
        plan?: string;
      }) => {
        const response =
          await authApi.register(
            input
          );

        setAuth(response);
      },
      []
    );

  const loginWithGoogle =
    useCallback(
      async (
        credential: string,
        mode:
          | "login"
          | "signup",
        plan?: string
      ) => {
        const response =
          await authApi.googleAuth(
            credential,
            mode,
            plan
          );

        if (response.mfaRequired) {
          return response;
        }

        setAuth(response);
        return response;
      },
      []
    );

  const verifyMfa =
    useCallback(
      async (input: {
        code?: string;
        tempToken: string;
        recoveryCode?: string;
      }) => {
        const response = await http.post("/auth/mfa/login", input);
        const payload = response.data.data;
        if (payload?.user && payload?.accessToken) {
          setAuth({
            user: payload.user,
            accessToken: payload.accessToken,
            refreshToken: "",
          });
        }
      },
      []
    );

  const logout =
    useCallback(async () => {
      try {
        await authApi.logout();
      } catch (error) {
        console.error(error);
      }

      setAuth(null);
    }, []);

  const value =
    useMemo<AuthState>(
      () => ({
        user:
          auth?.user ?? null,

        accessToken:
          auth?.accessToken ??
          null,

        loading,

        login,

        register,

        loginWithGoogle,

        logout,

        verifyMfa,
      }),
      [
        auth,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        verifyMfa,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {!loading ? children : <div className="min-h-screen bg-background" />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};