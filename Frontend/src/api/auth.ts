import { apiRequest } from "./http";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  plan: "free" | "starter" | "pro" | "agency";
};

export type AuthPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    apiRequest<ApiResponse<AuthPayload>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (input: { email: string; password: string }) =>
    apiRequest<ApiResponse<AuthPayload>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  me: (accessToken: string) =>
    apiRequest<ApiResponse<{ user: AuthUser }>>("/auth/me", {
      token: accessToken,
    }),

  logout: (accessToken: string, refreshToken?: string) =>
    apiRequest<ApiResponse<void>>("/auth/logout", {
      method: "POST",
      token: accessToken,
      body: JSON.stringify({ refreshToken }),
    }),
};
