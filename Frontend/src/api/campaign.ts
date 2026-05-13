import http from "./http";

/* ==========================================
   TYPES
========================================== */

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

  keywords: string[];

  steps: CampaignStep[];

  createdAt: string;
}

/* ==========================================
   CREATE CAMPAIGN
========================================== */

export const createCampaign = async (data: any) => {
  const response = await http.post("/campaigns", data);

  return response.data;
};

/* ==========================================
   GET CAMPAIGNS
========================================== */

export const getCampaigns = async () => {
  const response = await http.get("/campaigns");

  return response.data;
};

/* ==========================================
   GET SINGLE CAMPAIGN
========================================== */

export const getCampaign = async (id: string) => {
  const response = await http.get(`/campaigns/${id}`);

  return response.data;
};

/* ==========================================
   UPDATE CAMPAIGN
========================================== */

export const updateCampaign = async (id: string, data: any) => {
  const response = await http.put(`/campaigns/${id}`, data);

  return response.data;
};

/* ==========================================
   DELETE CAMPAIGN
========================================== */

export const deleteCampaign = async (id: string) => {
  const response = await http.delete(`/campaigns/${id}`);

  return response.data;
};

/* ==========================================
   TOGGLE CAMPAIGN STATUS
========================================== */

export const toggleCampaignStatus = async (id: string) => {
  const response = await http.patch(`/campaigns/${id}/toggle`);

  return response.data;
};

/* ==========================================
   CAMPAIGN API OBJECT
========================================== */

export const campaignApi = {
  getAll: getCampaigns,
  getOne: getCampaign,
  create: createCampaign,
  update: updateCampaign,
  delete: deleteCampaign,
  toggleStatus: toggleCampaignStatus,
};
