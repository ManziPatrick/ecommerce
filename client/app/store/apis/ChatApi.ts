import { apiSlice } from "../slices/ApiSlice";

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /chat/:id
    getChat: builder.query({
      query: (id: string) => `/chat/${id}`,
    }),

    // GET /chat/user/:userId
    getUserChats: builder.query({
      query: () => `/chat/user`,
    }),

    // GET /chat
    getAllChats: builder.query({
      query: () => "/chat",
    }),

    // POST /chat
    createChat: builder.mutation({
      query: () => ({
        url: "/chat",
        method: "POST",
      }),
    }),

    // POST /chat/:chatId/message
    sendMessage: builder.mutation({
      query: ({
        chatId,
        content,
        file,
      }: {
        chatId: string;
        content?: string;
        file?: File;
      }) => {
        const formData = new FormData();
        formData.append("chatId", chatId);
        if (content) formData.append("content", content);
        if (file) formData.append("file", file);
        return {
          url: `/chat/${chatId}/message`,
          method: "POST",
          body: formData,
        };
      },
    }),
    // PATCH /chat/:chatId/status
    updateChatStatus: builder.mutation({
      query: ({
        chatId,
        status,
      }: {
        chatId: string;
        status: "OPEN" | "RESOLVED";
      }) => ({
        url: `/chat/${chatId}/status`,
        method: "PATCH",
        body: { status },
      }),
    }),
    // POST /chat/shop/:shopId
    createShopChat: builder.mutation({
      query: (shopId: string) => ({
        url: `/chat/shop/${shopId}`,
        method: "POST",
      }),
    }),

    // GET /chat/shop/:shopId/chats
    getShopChats: builder.query({
      query: (shopId: string) => `/chat/shop/${shopId}/chats`,
    }),

    // GET /chat/shop/all
    getAllShopChats: builder.query({
      query: (status?: string) => `/chat/shop/all${status ? `?status=${status}` : ""}`,
    }),

    // PATCH /chat/:chatId/read
    markAsRead: builder.mutation({
      query: (chatId: string) => ({
        url: `/chat/${chatId}/read`,
        method: "PATCH",
      }),
    }),
    // GET /chat/unread/count
    getUnreadCount: builder.query({
      query: () => "/chat/unread/count",
    }),
  }),
});

export const {
  useGetChatQuery,
  useGetUserChatsQuery,
  useGetAllChatsQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useUpdateChatStatusMutation,
  useCreateShopChatMutation,
  useGetShopChatsQuery,
  useGetAllShopChatsQuery,
  useMarkAsReadMutation,
  useGetUnreadCountQuery,
} = chatApi;
