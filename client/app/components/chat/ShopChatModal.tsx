"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Store, User, CheckCheck, Check, Minimize2, Sparkles, MessageCircle } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { API_BASE_URL } from "@/app/lib/constants/config";
import { io, Socket } from "socket.io-client";
import { playNotificationSound, showBrowserNotification } from "@/app/utils/notifications";

// Simple Markdown-ish formatter (matching ChatBot)
const formatMessage = (text: string) => {
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-violet-600 dark:text-violet-400">$1</strong>');
  formatted = formatted.replace(/\n/g, '<br />');
  return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
};

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    name: string;
    avatar?: string;
  };
}

interface ShopChatModalProps {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  productContext?: string;
  onClose: () => void;
}

export default function ShopChatModal({
  shopId,
  shopName,
  shopLogo,
  productContext,
  onClose,
}: ShopChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    if (!user) return;

    const initChat = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/shop/${shopId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to create chat");

        const { chat } = await response.json();
        setChatId(chat.id);
        setMessages(chat.messages || []);

        // Mark messages as read
        if (chat.messages?.length > 0) {
          await fetch(`${API_BASE_URL}/chat/${chat.id}/read`, {
            method: "PATCH",
            credentials: "include",
          });
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [shopId, user]);

  // Socket.IO connection
  useEffect(() => {
    if (!chatId || !user) return;

    const socket = io(API_BASE_URL.replace("/api/v1", ""), {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("joinRoom", `chat:${chatId}`);
      socket.emit("joinRoom", `user:${user.id}`);
      socket.emit("joinRoom", `vendor:${user.id}`);
    });

    // Main message handler for the active chat window
    socket.on("newMessage", (message: Message) => {
      console.log("📩 New message received via socket:", message);
      
      // Update messages state if not already present
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      
      // Play sound if from other user
      if (message.senderId !== user.id) {
        playNotificationSound("message");
      }
    });

    // Notification handler for other chats (not this one)
    socket.on("shop:newMessage", (data: any) => {
      // If message is for a DIFFERENT chat, show a browser notification
      // (The NotificationToast component handles the UI toast)
      if (data.chatId !== chatId && data.senderId !== user.id) {
        showBrowserNotification(
          `New message from ${shopName}`,
          data.content || "New message",
          shopLogo
        );
      }
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId, user, shopName, shopLogo]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatId || isSending) return;

    const messageText = inputText;
    setInputText("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          chatId,
          content: messageText,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // Message will be added via Socket.IO
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputText(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-[2rem] p-10 max-w-md text-center shadow-2xl border border-white/20"
        >
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-violet-600">
            <User size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight">Sign In Required</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            Join macyemacye to chat directly with <span className="font-bold text-zinc-900 dark:text-zinc-100">{shopName}</span>.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98]"
          >
            Got it
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[120] pointer-events-none flex items-end justify-end">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50, filter: "blur(15px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, y: 50, filter: "blur(15px)" }}
        className="pointer-events-auto w-full sm:w-[380px] md:w-[420px] h-[100vh] sm:h-[600px] bg-white dark:bg-zinc-950 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:rounded-[2rem] overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="bg-zinc-900 p-5 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform overflow-hidden">
                {shopLogo ? (
                  <img src={shopLogo} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                  <Store size={24} className="text-zinc-900" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight italic">{shopName}</h3>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 uppercase font-black">
                Vendor • Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
          >
            <Minimize2 size={22} />
          </button>
        </div>

        {/* Product Context */}
        {productContext && (
          <div className="bg-violet-50/50 dark:bg-violet-950/20 px-5 py-3 text-[12px] text-violet-700 dark:text-violet-300 border-b border-violet-100 dark:border-violet-900/50 flex items-center gap-2 font-medium">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            Asking about: <span className="font-bold underline decoration-violet-300 underline-offset-2">{productContext}</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-zinc-50/50 dark:bg-black/40 no-scrollbar custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-violet-600" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-[2rem] flex items-center justify-center mb-6 text-violet-600">
                <MessageCircle size={40} />
              </div>
              <h4 className="font-bold text-xl mb-2 tracking-tight">Direct Access</h4>
              <p className="text-zinc-500 dark:text-zinc-400 text-[14px] max-w-[280px] leading-relaxed">
                Connect directly with <span className="text-zinc-900 dark:text-zinc-100 font-bold">{shopName}</span> for instant support.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === user.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: isOwn ? 20 : -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex flex-col gap-1.5 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-[1.5rem] px-5 py-3.5 shadow-sm text-[13.5px] leading-relaxed transition-all ${
                        isOwn
                          ? "bg-violet-600 text-white rounded-tr-none font-medium shadow-violet-500/10"
                          : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-none"
                      }`}
                    >
                      {formatMessage(msg.content)}
                    </div>
                    <div className="flex items-center gap-2 px-2">
                       <span className="text-[10px] text-zinc-400 font-medium font-mono uppercase tracking-tighter">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isOwn && (
                        msg.isRead ? (
                          <CheckCheck size={14} className="text-violet-500" />
                        ) : (
                          <Check size={14} className="text-zinc-300" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-2xl border border-transparent focus-within:border-violet-500/30 focus-within:ring-4 focus-within:ring-violet-500/5 transition-all shadow-inner">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Write to vendor..."
              disabled={isSending || isLoading}
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 px-3 min-w-0"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isSending || isLoading}
              className={`p-3 rounded-xl transition-all active:scale-95 ${
                inputText.trim() && !isSending
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
              }`}
            >
              {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-4 px-1 text-[9px] text-zinc-400/80 font-black uppercase tracking-[0.1em]">
            <div className="flex items-center gap-1.5">
              <Sparkles size={10} className="text-amber-400" /> Secure Channel
            </div>
            <div className="flex items-center gap-1.5">
              macyemacye bridge <Store size={10} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
