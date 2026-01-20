import { apiSlice } from "../slices/ApiSlice";

export const vendorRequestApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        submitVendorRequest: builder.mutation({
            query: (data) => ({
                url: "/vendor-requests",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        getAllVendorRequests: builder.query({
            query: (params) => ({
                url: "/vendor-requests",
                method: "GET",
                params,
            }),
            providesTags: ["User"],
        }),
        updateVendorRequestStatus: builder.mutation({
            query: ({ id, status, adminNotes }) => ({
                url: `/vendor-requests/${id}`,
                method: "PATCH",
                body: { status, adminNotes },
            }),
            invalidatesTags: ["User", "Shop"],
        }),
    }),
});

export const {
    useSubmitVendorRequestMutation,
    useGetAllVendorRequestsQuery,
    useUpdateVendorRequestStatusMutation,
} = vendorRequestApi;
