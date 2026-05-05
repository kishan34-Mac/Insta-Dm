import { apiRequest } from "./http";

export type CampaignStep = {
  id?: string;
  type: "message" | "delay";
  value: string;
};

export type Campaign = {
  _id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed" | "stopped";
  triggerType: "comment" | "keyword" | "direct_message";
  keywords: string[];
  postId?: string;
  steps: CampaignStep[];
  stats: {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalReplied: number;
  };
  createdAt: string;
  updatedAt: string;
};

export const campaignApi = {
  create: (data: Partial<Campaign>, token: string) =>
    apiRequest<{ data: Campaign }>("/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  getAll: (token: string) =>
    apiRequest<{ data: Campaign[] }>("/campaigns", {
      token,
    }),

  getById: (id: string, token: string) =>
    apiRequest<{ data: Campaign }>(`/campaigns/${id}`, {
      token,
    }),

  update: (id: string, data: Partial<Campaign>, token: string) =>
    apiRequest<{ data: Campaign }>(`/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiRequest<{ message: string }>(`/campaigns/${id}`, {
      method: "DELETE",
      token,
    }),

  toggleStatus: (id: string, token: string) =>
    apiRequest<{ data: Campaign }>(`/campaigns/${id}/toggle`, {
      method: "PATCH",
      token,
    }),
};
