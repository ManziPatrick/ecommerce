import { apiSlice } from "../slices/ApiSlice";

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReviewsByProduct: builder.query<any, string>({
      query: (productId) => ({
        url: `/reviews/product/${productId}`,
        method: "GET",
      }),
      providesTags: (result, error, productId) => [{ type: "Review", id: productId }],
    }),
    createReview: builder.mutation<any, { productId: string; rating: number; comment?: string; images?: File[] }>({
      query: (data) => {
        const formData = new FormData();
        formData.append("productId", data.productId);
        formData.append("rating", data.rating.toString());
        if (data.comment) formData.append("comment", data.comment);
        if (data.images) {
          data.images.forEach((image) => formData.append("images", image));
        }
        return {
          url: "/reviews",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { productId }) => [{ type: "Review", id: productId }],
    }),
    deleteReview: builder.mutation<any, string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useGetReviewsByProductQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
