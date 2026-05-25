import http from "./http";

export interface CampaignStep {
  type: "message" | "delay";

  value: string;

  delaySeconds?: number;

  order: number;
}

export interface Campaign {
  _id: string;

  name: string;

  instagramAccount: string;

  status: "draft" | "active" | "paused";

  triggerKeywords: string[];
  keywords?: string[];

  steps: CampaignStep[];

  stats: {
    totalSent: number;
    totalDelivered: number;
    totalReplied: number;
  };

  createdAt: string;
}

export const createCampaign = async (data: Partial<Campaign> & Record<string, unknown>) => {
  const response = await http.post("/campaigns", data);

  return response.data;
};

export const getCampaigns = async () => {
  const response = await http.get("/campaigns");

  return response.data;
};

export const getCampaign = async (id: string) => {
  const response = await http.get(`/campaigns/${id}`);

  return response.data;
};

export const updateCampaign = async (id: string, data: Partial<Campaign> & Record<string, unknown>) => {
  const response = await http.put(`/campaigns/${id}`, data);

  return response.data;
};

export const deleteCampaign = async (id: string) => {
  const response = await http.delete(`/campaigns/${id}`);

  return response.data;
};

export const toggleCampaignStatus = async (id: string) => {
  const response = await http.patch(`/campaigns/${id}/toggle`);

  return response.data;
};

export const campaignApi = {
  getAll: getCampaigns,
  getOne: getCampaign,
  create: createCampaign,
  update: updateCampaign,
  delete: deleteCampaign,
  toggleStatus: toggleCampaignStatus,
};
