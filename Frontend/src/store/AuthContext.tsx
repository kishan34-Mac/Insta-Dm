import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { authApi, type AuthPayload, type AuthUser } from "@/api/auth";

const STORAGE_KEY = "athenura.auth";
const LEGACY_STORAGE_KEYS = ["Insta Dm.auth", "reel2revenue.auth"];

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const readStoredAuth = (): AuthPayload | null => {
  for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const payload = JSON.parse(raw) as AuthPayload;
      if (!payload?.user || !payload?.accessToken) {
        localStorage.removeItem(key);
        continue;
      }

      if (key !== STORAGE_KEY) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        localStorage.removeItem(key);
      }

      return payload;
    } catch {
      localStorage.removeItem(key);
    }
  }

  return null;
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
      await authApi
        .logout(auth.accessToken, auth.refreshToken ?? undefined)
        .catch(() => undefined);
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
