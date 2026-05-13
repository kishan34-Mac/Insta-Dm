import http from "./http";

/* ==========================================
   TYPES
========================================== */

export interface InstagramAccount {
  igUserId: string;
  igUsername: string;

  pageId: string;
  pageName?: string;

  connectedAt: string;

  tokenExpiry: string;

  isActive: boolean;

  webhookSubscribed?: boolean;
}

export interface InstagramAccountsResponse {
  success: boolean;

  data: {
    accounts: InstagramAccount[];
  };
}

/* ==========================================
   CONNECT INSTAGRAM
========================================== */

export const connectInstagram =
  async (): Promise<{
    success: boolean;
    url: string;
  }> => {
    try {
      const response =
        await http.get("/instagram/connect");

      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err.message || "Instagram connect failed";
      console.error("Instagram connect error:", message);
      throw new Error(message);
    }
  };

/* ==========================================
   GET CONNECTED ACCOUNTS
========================================== */

export const getInstagramAccounts =
  async (): Promise<InstagramAccountsResponse> => {
    try {
      const response =
        await http.get(
          "/instagram/accounts"
        );

      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err.message || "Failed to fetch Instagram accounts";
      console.error("Fetch Instagram accounts error:", message);
      throw new Error(message);
    }
  };

/* ==========================================
   DISCONNECT ACCOUNT
========================================== */

export const disconnectInstagram =
  async (
    igUserId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response =
        await http.post(
          "/instagram/disconnect",
          {
            igUserId,
          }
        );

      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err.message || "Disconnect Instagram failed";
      console.error("Disconnect Instagram error:", message);
      throw new Error(message);
    }
  };

/* ==========================================
   WEBHOOK STATUS
   (FOR FUTURE USE)
========================================== */

export const getWebhookStatus =
  async () => {
    try {
      const response =
        await http.get(
          "/instagram/webhook"
        );

      return response.data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  };

/* ==========================================
   VERIFY CONNECTION
========================================== */

export const verifyInstagramConnection =
  async () => {
    try {
      const response =
        await http.get(
          "/instagram/health"
        );

      return response.data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  };

export default {
  connectInstagram,
  getInstagramAccounts,
  disconnectInstagram,
  getWebhookStatus,
  verifyInstagramConnection,
};