import { apiSlice } from "../slices/ApiSlice";

export const wishlistApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWishlist: builder.query({
            query: () => ({
                url: "/wishlist",
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["Wishlist"],
        }),
        addToWishlist: builder.mutation({
            query: (variantId) => ({
                url: "/wishlist",
                method: "POST",
                body: { variantId },
                credentials: "include",
            }),
            invalidatesTags: ["Wishlist"],
        }),
        removeFromWishlist: builder.mutation({
            query: (variantId) => ({
                url: `/wishlist/${variantId}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["Wishlist"],
        }),
    }),
});

export const {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} = wishlistApi;
