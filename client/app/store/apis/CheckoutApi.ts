import { apiSlice } from "../slices/ApiSlice";

export const checkoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initiateCheckout: builder.mutation<
      { sessionId: string; url: string; provider: string },
      { provider: "stripe" | "paystack" | "dpo"; phoneNumber?: string; mno?: string; couponCode?: string } | undefined
    >({
      query: (body) => ({
        url: "/checkout",
        method: "POST",
        body: body || { provider: "stripe" },
        credentials: "include",
      }),
    }),
  }),
});

export const { useInitiateCheckoutMutation } = checkoutApi;
