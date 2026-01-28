"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Store, MessageCircle, ArrowRight, Loader2, Search } from "lucide-react";
import { useGetUserChatsQuery } from "@/app/store/apis/ChatApi";
import { useAuth } from "@/app/hooks/useAuth";
import ShopChatModal from "./ShopChatModal";

interface UserChatListModalProps {
  onClose: () => void;
}

export default function UserChatListModal({ onClose }: UserChatListModalProps) {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useGetUserChatsQuery(undefined);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const chats = data?.chats || [];
  const filteredChats = chats.filter((chat: any) => 
    chat.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedChat) {
    return (
      <ShopChatModal
        shopId={selectedChat.shopId}
        shopName={selectedChat.shop?.name || "Shop"}
        shopLogo={selectedChat.shop?.logo}
        onClose={() => {
          setSelectedChat(null);
          refetch();
        }}
      />
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[110] pointer-events-none flex items-end justify-end">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="pointer-events-auto bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.3)] w-[90vw] sm:w-[500px] md:w-[672px] h-[700px] flex flex-col overflow-hidden border border-white/20 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-black/20">
          <div>
            <h3 className="font-bold text-xl tracking-tight">Your Chats</h3>
            <p className="text-xs text-zinc-500 font-medium">Conversations with vendors</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border-none outline-none text-sm focus:ring-2 focus:ring-violet-500/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 px-6 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-violet-600" size={32} />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 text-zinc-400">
                <MessageCircle size={32} />
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100">No chats yet</h4>
              <p className="text-zinc-500 text-sm mt-1">Start a conversation from any product page!</p>
            </div>
          ) : (
            filteredChats.map((chat: any) => (
              <motion.div
                key={chat.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedChat(chat)}
                className="group p-4 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-2xl transition-all cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-md"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center overflow-hidden border border-white dark:border-zinc-800">
                    {chat.shop?.logo ? (
                      <img src={chat.shop.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Store size={20} className="text-violet-600" />
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-violet-600 transition-colors">
                      {chat.shop?.name || "Unknown Shop"}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      {new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5 italic">
                    {chat.messages?.[0]?.content || "No messages yet"}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={16} className="text-violet-600" />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50/50 dark:bg-black/20 border-t border-zinc-100 dark:border-zinc-900 text-center">
             <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                macyemacye secure messaging system
             </p>
        </div>
      </motion.div>
    </div>
  );
}
