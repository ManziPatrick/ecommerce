import { apiSlice } from "../slices/ApiSlice";

export const paymentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        verifyDPOPayment: builder.mutation<any, { transToken: string }>({
            query: (body) => ({
                url: "/payments/verify-dpo",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useVerifyDPOPaymentMutation } = paymentApi;
