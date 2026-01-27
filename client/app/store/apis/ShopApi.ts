import { apiSlice } from "../slices/ApiSlice";

export const shopApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMyShop: builder.query({
            query: () => ({
                url: "/shops/my-shop",
                method: "GET",
            }),
            providesTags: ["Shop"],
        }),
        getShopById: builder.query({
            query: (id) => ({
                url: `/shops/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Shop", id }],
        }),
        updateShop: builder.mutation({
            query: ({ id, data }) => ({
                url: `/shops/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Shop"],
        }),
    }),
});

export const { useGetMyShopQuery, useGetShopByIdQuery, useUpdateShopMutation } = shopApi;
