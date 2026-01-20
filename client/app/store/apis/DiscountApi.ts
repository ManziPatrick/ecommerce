import { apiSlice } from "../slices/ApiSlice";

export const discountApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        validateDiscount: builder.mutation({
            query: ({ code, amount }) => ({
                url: "/discounts/validate",
                method: "POST",
                body: { code, amount },
                credentials: "include",
            }),
        }),
        getAllDiscounts: builder.query({
            query: () => ({
                url: "/discounts",
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["Discount"],
        }),
        createDiscount: builder.mutation({
            query: (data) => ({
                url: "/discounts",
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["Discount"],
        }),
        deleteDiscount: builder.mutation({
            query: (id) => ({
                url: `/discounts/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["Discount"],
        }),
    }),
});

export const {
    useValidateDiscountMutation,
    useGetAllDiscountsQuery,
    useCreateDiscountMutation,
    useDeleteDiscountMutation,
} = discountApi;
