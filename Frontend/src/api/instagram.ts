import http, { API_BASE_URL } from "./http";

export interface InstagramAccount {
  _id?: string;
  igUserId: string;
  igUsername: string;
  pageId: string;
  pageName?: string;
  connectedAt?: string;
  tokenExpiresAt?: string;
  isActive?: boolean;
}

export interface InstagramAccountsResponse {
  success: boolean;
  data: InstagramAccount[];
}

export const connectInstagram =
  async (): Promise<void> => {
    const auth = JSON.parse(
      localStorage.getItem(
        "dmpilot.auth"
      ) || "{}"
    );

    const token =
      auth?.accessToken;

    if (!token) {
      throw new Error(
        "Authentication required"
      );
    }

    window.location.href =
      `${API_BASE_URL}/instagram/connect?token=${token}`;
  };

export const getInstagramAccounts =
  async (): Promise<
    InstagramAccountsResponse
  > => {
    const response =
      await http.get(
        "/instagram/accounts"
      );

    return response.data;
  };

export const disconnectInstagram =
  async (
    igUserId: string
  ) => {
    const response =
      await http.delete(
        `/instagram/disconnect/${igUserId}`
      );

    return response.data;
  };

export default {
  connectInstagram,
  getInstagramAccounts,
  disconnectInstagram,
}; 