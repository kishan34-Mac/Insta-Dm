import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authApi, type AuthPayload, type AuthUser } from "@/api/auth";

const STORAGE_KEY = "reel2revenue.auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const readStoredAuth = (): AuthPayload | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthPayload | null>(() => readStoredAuth());

  const persistAuth = useCallback((payload: AuthPayload | null) => {
    setAuth(payload);
    if (payload) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const response = await authApi.login(input);
      persistAuth(response.data);
    },
    [persistAuth],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const response = await authApi.register(input);
      persistAuth(response.data);
    },
    [persistAuth],
  );

  const logout = useCallback(async () => {
    if (auth?.accessToken) {
      await authApi.logout(auth.accessToken, auth.refreshToken ?? undefined).catch(() => undefined);
    }
    persistAuth(null);
  }, [auth, persistAuth]);

  const value = useMemo<AuthState>(
    () => ({
      user: auth?.user ?? null,
      accessToken: auth?.accessToken ?? null,
      refreshToken: auth?.refreshToken ?? null,
      login,
      register,
      logout,
    }),
    [auth, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
