import http from "@/api/http";

export type AdminPlan = "free" | "starter" | "pro" | "agency";

export type AdminSubscriptionStatus = "free" | "pending" | "active" | "failed";

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  totalPayments: number;
  successfulPayments: number;
  totalCampaigns: number;
  totalLeads: number;
  totalRevenue: number;
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role?: "user" | "admin";

  plan: AdminPlan;

  subscriptionStatus: AdminSubscriptionStatus;

  billingStatus?: AdminSubscriptionStatus;

  instagramAccounts?: unknown[];

  createdAt: string;

  lastLoginAt?: string | null;
};

export type AdminPaymentStatus =
  | "pending"
  | "created"
  | "captured"
  | "authorized"
  | "failed"
  | "refunded"
  | "verified";

export type AdminPayment = {
  _id: string;

  userId: {
    _id?: string;
    name: string;
    email: string;
    plan?: AdminPlan;
  } | null;

  razorpayOrderId: string;

  razorpayPaymentId?: string | null;

  amount: number;

  currency: string;

  status: AdminPaymentStatus;

  plan: Exclude<AdminPlan, "free">;

  createdAt: string;

  updatedAt?: string;
};

export type AdminCampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "stopped";

export type AdminCampaign = {
  _id: string;

  name: string;

  description?: string;

  user: {
    _id?: string;
    name: string;
    email: string;
    plan?: AdminPlan;
  } | null;

  instagramAccount: string;

  status: AdminCampaignStatus;

  triggerType:
    | "comment"
    | "keyword"
    | "direct_message"
    | "story_reply"
    | string;

  stats?: {
    totalTriggered?: number;
    totalSent?: number;
    totalDelivered?: number;
    totalFailed?: number;
    totalReplied?: number;
    totalLeads?: number;
    conversionRate?: number;
  };

  createdAt: string;

  updatedAt?: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RevenueChartItem = {
  _id: string;
  revenue: number;
  payments: number;
};

export type PlanDistributionItem = {
  plan: string;
  count: number;
};

export type AdminDashboardResponse = {
  stats: AdminStats;
  revenueChart: RevenueChartItem[];
  planDistribution: PlanDistributionItem[];
  recentUsers: AdminUser[];
  recentPayments: AdminPayment[];
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type UpdateUserSubscriptionPayload = {
  plan?: AdminPlan;
  subscriptionStatus?: AdminSubscriptionStatus;
};

export const adminApi = {
  getDashboard: async () => {
    const response =
      await http.get<ApiResponse<AdminDashboardResponse>>("/admin/dashboard");

    return response.data.data;
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    plan?: AdminPlan;
    status?: AdminSubscriptionStatus;
  }) => {
    const response = await http.get<
      ApiResponse<{
        users: AdminUser[];
        pagination: Pagination;
      }>
    >("/admin/users", { params });

    return response.data.data;
  },

  getPayments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: AdminPaymentStatus;
    plan?: Exclude<AdminPlan, "free">;
  }) => {
    const response = await http.get<
      ApiResponse<{
        payments: AdminPayment[];
        pagination: Pagination;
      }>
    >("/admin/payments", { params });

    return response.data.data;
  },

  getCampaigns: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: AdminCampaignStatus;
  }) => {
    const response = await http.get<
      ApiResponse<{
        campaigns: AdminCampaign[];
        pagination: Pagination;
      }>
    >("/admin/campaigns", { params });

    return response.data.data;
  },

  updateUserPlan: async (
    userId: string,
    payload: UpdateUserSubscriptionPayload,
  ) => {
    const response = await http.patch<
      ApiResponse<{
        user: AdminUser;
      }>
    >(`/admin/users/${userId}/subscription`, payload);

    return response.data.data;
  },
};
