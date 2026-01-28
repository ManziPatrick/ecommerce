"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/hooks/useAuth";
import { API_BASE_URL } from "@/app/lib/constants/config";
import { io } from "socket.io-client";

export default function UnreadBadge() {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !token) return;

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/unread/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { unreadCount } = await response.json();
          setUnreadCount(unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();

    // Socket.IO for real-time updates
    const socket = io(API_BASE_URL.replace("/api/v1", ""), {
      auth: { token },
    });

    socket.emit("joinRoom", `user:${user.id}`);

    socket.on("shop:newMessage", (data: any) => {
      if (data.senderId !== user.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("newMessage", (data: any) => {
      if (data.senderId !== user.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.emit("leaveRoom", `user:${user.id}`);
      socket.disconnect();
    };
  }, [user, token]);

  if (!user || unreadCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 ring-2 ring-white dark:ring-zinc-900"
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </motion.div>
    </AnimatePresence>
  );
}
