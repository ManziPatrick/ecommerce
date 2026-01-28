"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, ShoppingBag } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { io } from "socket.io-client";
import { API_BASE_URL } from "@/app/lib/constants/config";
import { playNotificationSound } from "@/app/utils/notifications";

interface Notification {
  id: string;
  type: "message" | "order";
  title: string;
  body: string;
  icon?: string;
  timestamp: number;
}

export default function NotificationToast() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const socket = io(API_BASE_URL.replace("/api/v1", ""), {
      withCredentials: true,
    });

    // Join user and vendor rooms
    socket.emit("joinRoom", `user:${user.id}`);
    socket.emit("joinRoom", `vendor:${user.id}`);

    // Listen for shop messages
    socket.on("shop:newMessage", (data: any) => {
      if (data.senderId !== user.id) {
        playNotificationSound("message");
        
        // If I am the shop owner, show customer name. If I am the customer, show shop name.
        const isShopOwner = data.chat?.shop?.ownerId === user.id;
        const notificationTitle = isShopOwner 
          ? `Message from ${data.chat?.user?.name || "Customer"}`
          : `New message from ${data.chat?.shop?.name || "Shop"}`;

        const notification: Notification = {
          id: `msg-${Date.now()}`,
          type: "message",
          title: notificationTitle,
          body: data.content || "You have a new message",
          icon: isShopOwner ? data.chat?.user?.avatar : data.chat?.shop?.logo,
          timestamp: Date.now(),
        };

        setNotifications((prev) => [...prev, notification]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        }, 5000);
      }
    });

    // Listen for orders
    socket.on("order:created", (data: any) => {
      playNotificationSound("order");
      
      const notification: Notification = {
        id: `order-${Date.now()}`,
        type: "order",
        title: "New Order! 🎉",
        body: `Order #${data.id?.slice(0, 8)}`,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [...prev, notification]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 7000);
    });

    return () => {
      socket.emit("leaveRoom", `user:${user.id}`);
      socket.disconnect();
    };
  }, [user]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-3 w-[280px] sm:w-[320px]"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  notification.type === "order"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-violet-100 dark:bg-violet-900/30"
                }`}
              >
                {notification.icon ? (
                  <img
                    src={notification.icon}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : notification.type === "order" ? (
                  <ShoppingBag size={18} className="text-green-600" />
                ) : (
                  <MessageCircle size={18} className="text-violet-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[13px] text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                  {notification.title}
                </h4>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {notification.body}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => removeNotification(notification.id)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
              >
                <X size={14} className="text-zinc-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
