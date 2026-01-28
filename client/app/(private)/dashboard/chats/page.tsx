"use client";
import { useState } from "react";
import { useGetAllChatsQuery, useGetAllShopChatsQuery, useGetShopChatsQuery, useGetUserChatsQuery } from "@/app/store/apis/ChatApi";
import { useAdminSocketEvents } from "../../(chat)/useAdminSocketEvents";
import ChatContainer from "../../(chat)";
import useToast from "@/app/hooks/ui/useToast";
import { withAuth } from "@/app/components/HOC/WithAuth";
import { useAuth } from "@/app/hooks/useAuth";
import { Store, MessageSquare } from "lucide-react";

const AdminChatsPage = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"SUPPORT" | "SHOP">("SHOP");
  
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const isVendor = user?.role === "VENDOR";

  // Fetch user's chats (works for both Customer and Vendor roles)
  const { data: userChatsData, isLoading: isLoadingUserChats, refetch: refetchUserChats } = useGetUserChatsQuery(undefined);

  // Fetch support chats (Admin only)
  const { data: supportChats, isLoading: isLoadingSupport, refetch: refetchSupport } = useGetAllChatsQuery("OPEN", {
    skip: !isAdmin
  });

  // Determine which chats to show
  const chats = isAdmin && viewType === "SUPPORT" ? supportChats?.chats : userChatsData?.chats;
  const isLoading = isAdmin && viewType === "SUPPORT" ? isLoadingSupport : isLoadingUserChats;

  // Listen for admin socket events
  useAdminSocketEvents(
    () => {
      showToast("New chat activity", "success");
      refetchUserChats();
      if (isAdmin) refetchSupport();
    },
    () => {
      showToast("Chat status updated", "success");
      refetchUserChats();
      if (isAdmin) refetchSupport();
    }
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Tabs */}
      {isAdmin && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setViewType("SHOP")}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              viewType === "SHOP" ? "text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Store size={18} /> Shop Chats
          </button>
          <button
            onClick={() => setViewType("SUPPORT")}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              viewType === "SUPPORT" ? "text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <MessageSquare size={18} /> Support Chats
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 bg-white border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Active Conversations</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                Loading chats...
              </div>
            ) : chats?.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-gray-500 text-sm font-medium">No active chats found</p>
                <p className="text-xs text-gray-400 mt-1">Wait for clients to reach out</p>
              </div>
            ) : (
              chats?.map((chat: any) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    activeChatId === chat.id
                      ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-100"
                      : "bg-transparent border-transparent hover:bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-gray-900 text-sm truncate max-w-[140px]">
                      {chat.user?.name || "Anonymous User"}
                    </div>
                    {chat.shop && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                        {chat.shop.name}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${chat.status === "OPEN" ? "bg-green-500" : "bg-gray-400"}`} />
                    {chat.messages?.[0]?.content ? (
                      <span className="truncate flex-1 italic">"{chat.messages[0].content}"</span>
                    ) : (
                      <span>New conversation</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 bg-zinc-50 flex flex-col">
          {activeChatId ? (
            <ChatContainer chatId={activeChatId} />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} />
              </div>
              <p className="text-sm font-medium">Select a conversation to start chatting</p>
              <p className="text-xs mt-1">Clients are waiting for your response 🤞</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminChatsPage);
