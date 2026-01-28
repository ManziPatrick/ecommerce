import { apiSlice } from "../slices/ApiSlice";
import { setUser, logout } from "../slices/AuthSlice";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  avatar: string | null;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<
      { accessToken: string; user: User },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/sign-in",
        method: "POST",
        body: credentials,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Backend returns { success, message, user }
          dispatch(setUser({ user: data.user }));
        } catch (error) {
          // Error handling is managed by the mutation hook in the component
        }
      },
    }),
    signup: builder.mutation<
      { accessToken: string; user: User },
      { name: string; email: string; password: string }
    >({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Backend returns { success, message, user }
          dispatch(setUser({ user: data.user }));
        } catch (error) {
          // Error handled by component
        }
      },
    }),
    signOut: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/sign-out",
        method: "GET",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          // Error handled by component
        }
      },
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: ({ email }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { token, password },
      }),
    }),
    checkAuth: builder.mutation<{ accessToken: string; user: User }, void>({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser({ user: data.user }));
        } catch (error) {
          // Error handled by component
        }
      },
    }),
    googleLogin: builder.mutation<{ accessToken: string; user: User }, { idToken: string }>({
      query: (data) => ({
        url: "/auth/google/verify",
        method: "POST",
        body: data,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser({ user: data.user }));
        } catch (error) {
          // Error handled by component
        }
      },
    }),
  }),
});

export const {
  useSignInMutation,
  useSignupMutation,
  useSignOutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCheckAuthMutation,
  useGoogleLoginMutation,
} = authApi;
