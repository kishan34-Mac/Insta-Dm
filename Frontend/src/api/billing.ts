import http from "@/api/http";

export type PlanKey = "starter" | "pro" | "agency";

export type CreateOrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  plan: PlanKey;
};

export type CreateOrderRequest = {
  // Backend expects upper-case plan keys: STARTER | PRO | AGENCY
  plan: "STARTER" | "PRO" | "AGENCY";
};

export type VerifyPaymentRequest = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan?: PlanKey;
};

export const billingApi = {
  createRazorpayOrder: async (input: CreateOrderRequest) => {
    const response = await http.post<{
      success: boolean;
      message?: string;
      data: CreateOrderResponse;
    }>("/billing/razorpay/create-order", input);

    return response.data.data;
  },

  verifyRazorpayPayment: async (input: VerifyPaymentRequest) => {
    const response = await http.post<{
      success: boolean;
      message?: string;
    }>("/billing/razorpay/verify", input);

    return response.data;
  },
};



