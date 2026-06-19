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

const STORAGE_KEY =
  "athenura.auth";

type AuthState = {
  user: AuthUser | null;

  accessToken: string | null;

  refreshToken: string | null;

  login: (input: {
    email: string;
    password: string;
  }) => Promise<void>;

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
  ) => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthState | null>(
    null
  );

const readStoredAuth =
  (): AuthPayload | null => {
    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return null;
      }

      const payload =
        JSON.parse(raw);

      if (
        !payload?.user ||
        !payload?.accessToken
      ) {
        localStorage.removeItem(
          STORAGE_KEY
        );

        return null;
      }

      return payload;
    } catch {
      localStorage.removeItem(
        STORAGE_KEY
      );

      return null;
    }
  };

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] =
    useState<AuthPayload | null>(
      () => readStoredAuth()
    );

  const persistAuth =
    useCallback(
      (
        payload:
          | AuthPayload
          | null
      ) => {
        setAuth(payload);

        if (payload) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(payload)
          );

          localStorage.setItem(
            "token",
            payload.accessToken
          );

          localStorage.setItem(
            "accessToken",
            payload.accessToken
          );

          if (
            payload.refreshToken
          ) {
            localStorage.setItem(
              "refreshToken",
              payload.refreshToken
            );
          }

          localStorage.setItem(
            "user",
            JSON.stringify(
              payload.user
            )
          );

          console.log(
            "TOKEN SAVED:",
            payload.accessToken
          );
        } else {
          localStorage.removeItem(
            STORAGE_KEY
          );

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "accessToken"
          );

          localStorage.removeItem(
            "refreshToken"
          );

          localStorage.removeItem(
            "user"
          );
        }
      },
      []
    );

  useEffect(() => {
    const handleAuthRefresh = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<AuthPayload>;

      setAuth(
        customEvent.detail
      );
    };

    window.addEventListener(
      "athenura:auth-refresh",
      handleAuthRefresh
    );

    return () =>
      window.removeEventListener(
        "athenura:auth-refresh",
        handleAuthRefresh
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

        persistAuth(response);
      },
      [persistAuth]
    );
//nnn
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

        persistAuth(response);
      },
      [persistAuth]
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

        persistAuth(response);
      },
      [persistAuth]
    );

  const logout =
    useCallback(async () => {
      try {
        if (
          auth?.accessToken
        ) {
          await authApi.logout(
            auth.refreshToken ??
              undefined
          );
        }
      } catch (error) {
        console.error(error);
      }

      persistAuth(null);
    }, [auth, persistAuth]);

  const value =
    useMemo<AuthState>(
      () => ({
        user:
          auth?.user ?? null,

        accessToken:
          auth?.accessToken ??
          null,

        refreshToken:
          auth?.refreshToken ??
          null,

        login,

        register,

        loginWithGoogle,

        logout,
      }),
      [
        auth,
        login,
        register,
        loginWithGoogle,
        logout,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
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