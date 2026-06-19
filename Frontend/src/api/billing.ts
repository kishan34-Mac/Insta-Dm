import http from "@/api/http";


export type PlanKey = "starter" | "pro" | "agency";

export type CreateOrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  plan: PlanKey;
};

export const billingApi = {
  createRazorpayOrder: async (input: { plan: PlanKey }) => {
    const response = await http.post<{
      success: boolean;
      message?: string;
      data: CreateOrderResponse;
    }>(
      "/billing/razorpay/create-order",


      input
    );

    return response.data.data;
  },
};

