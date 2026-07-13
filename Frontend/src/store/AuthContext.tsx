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

type MfaLoginResponse = {
  mfaRequired: true;
  tempToken: string;
};

type LoginResponse = AuthPayload | MfaLoginResponse;

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (input: {
    email: string;
    password: string;
    isAdmin?: boolean;
    adminSecret?: string;
  }) => Promise<LoginResponse>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    plan?: string;
    isAdmin?: boolean;
    adminSecret?: string;
  }) => Promise<AuthPayload>;
  loginWithGoogle: (
    credential: string,
    mode: "login" | "signup",
    plan?: string,
  ) => Promise<AuthPayload>;
  logout: () => Promise<void>;
  verifyMfa: (input: {
    code?: string;
    tempToken: string;
    recoveryCode?: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const syncStoredUser = (user: AuthUser | null) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] = useState<AuthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuthPayload = useCallback((payload: AuthPayload | null) => {
    setAuth(payload);
    syncStoredUser(payload?.user ?? null);
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const refreshResponse = await http.post("/auth/refresh");
        const tokens = refreshResponse.data.data;

        if (!tokens?.accessToken) {
          setAuth(null);
          syncStoredUser(null);
          return;
        }

        const meResponse = await authApi.me();
        const user = meResponse.data.user;

        applyAuthPayload({
          user,
          accessToken: tokens.accessToken,
        });
      } catch {
        setAuth(null);
        syncStoredUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapSession();
  }, [applyAuthPayload]);

  useEffect(() => {
    const handleAuthLogout = () => {
      applyAuthPayload(null);
    };

    window.addEventListener("dmpilot:auth-logout", handleAuthLogout);

    return () =>
      window.removeEventListener("dmpilot:auth-logout", handleAuthLogout);
  }, [applyAuthPayload]);

  const login = useCallback(
    async (input: {
      email: string;
      password: string;
      isAdmin?: boolean;
      adminSecret?: string;
    }) => {
      const response = await authApi.login(input);

      if ("mfaRequired" in response && response.mfaRequired) {
        return response;
      }

      applyAuthPayload(response);
      return response;
    },
    [applyAuthPayload],
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      plan?: string;
      isAdmin?: boolean;
      adminSecret?: string;
    }) => {
      const response = await authApi.register(input);
      applyAuthPayload(response);
      return response;
    },
    [applyAuthPayload],
  );

  const loginWithGoogle = useCallback(
    async (
      credential: string,
      mode: "login" | "signup",
      plan?: string,
    ) => {
      const response = await authApi.googleAuth(credential, mode, plan);
      applyAuthPayload(response);
      return response;
    },
    [applyAuthPayload],
  );

  const verifyMfa = useCallback(
    async (input: {
      code?: string;
      tempToken: string;
      recoveryCode?: string;
    }) => {
      const response = await http.post("/auth/mfa/login", input);
      const payload = response.data.data;

      if (payload?.user && payload?.accessToken) {
        applyAuthPayload(payload);
      }
    },
    [applyAuthPayload],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error(error);
    } finally {
      applyAuthPayload(null);
    }
  }, [applyAuthPayload]);

  const value = useMemo<AuthState>(
    () => ({
      user: auth?.user ?? null,
      accessToken: auth?.accessToken ?? null,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      verifyMfa,
    }),
    [auth, loading, login, register, loginWithGoogle, logout, verifyMfa],
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div className="min-h-screen bg-background" />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
