"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Minimize2, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { chatWithAI, ChatMessage } from "../../actions/chat";

// Simple Markdown Formatter for the UI
const formatMessage = (text: string) => {
  // Bold: **text**
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-violet-600 dark:text-violet-400">$1</strong>');
  // Links: [text](url)
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-violet-600 underline inline-flex items-center gap-0.5 hover:opacity-80">$1 <span class="inline-block"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg></span></a>');
  // Newlines: \n
  formatted = formatted.replace(/\n/g, '<br />');
  return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
};

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Muraho! ✨ I'm your macyemacye Concierge. I can give you details on **local vendors**, **latest products**, or our **shipping policies**. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToUse = textOverride || inputText;
    if (!textToUse.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToUse,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    
    // Artificial delay to show typing indicator
    setTimeout(() => setIsTyping(true), 500);

    try {
      const history: ChatMessage[] = messages.slice(-8).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      history.push({ role: "user", content: textToUse });

      const response = await chatWithAI(history);

      setIsTyping(false);

      if (response.success && response.message) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having a small connection issue with my brain. 🧠 Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const SUGGESTED = [
    { label: "🔥 Trending", value: "What are the trending products?" },
    { label: "🚚 Delivery", value: "Tell me about shipping and delivery fees." },
    { label: "🏬 Shops", value: "Which shops are available on macyemacye?" },
    { label: "🔙 Returns", value: "What is your return policy?" },
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
              className="mb-6 w-[360px] sm:w-[400px] h-[550px] max-h-[85vh] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col border border-white/20 dark:border-zinc-800 pointer-events-auto ring-1 ring-black/5"
            >
              {/* Header */}
              <div className="bg-zinc-900 dark:bg-zinc-900 p-5 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform overflow-hidden p-1.5">
                      <img src="/logoo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-900 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base tracking-tight italic">macyemacye Concierge</h3>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 uppercase font-black">
                      AI assistant • Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  <Minimize2 size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar custom-scrollbar bg-zinc-50/50 dark:bg-black/40">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`rounded-[1.5rem] px-4.5 py-3 shadow-sm text-[13.5px] leading-relaxed transition-all ${
                          msg.sender === "user"
                            ? "bg-violet-600 text-white rounded-tr-none font-medium shadow-violet-500/10"
                            : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-none"
                        }`}
                      >
                        {formatMessage(msg.text)}
                      </div>
                      <span className="text-[10px] text-zinc-400 px-1 font-medium">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                   <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce"></span>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 shrink-0">
                {/* Suggested Questions */}
                <div className="flex gap-2.5 mb-4 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                  {SUGGESTED.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => handleSendMessage(q.value)}
                      className="whitespace-nowrap px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-violet-50 dark:hover:bg-violet-600/10 hover:text-violet-600 dark:hover:text-violet-400 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[12px] font-bold transition-all pointer-events-auto active:scale-95 shadow-sm active:shadow-none"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-2xl border border-transparent focus-within:border-violet-500/30 focus-within:ring-4 focus-within:ring-violet-500/5 transition-all shadow-inner">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 px-2 min-w-0"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isLoading}
                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                      inputText.trim() && !isLoading
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 px-1 text-[10px] text-zinc-400/80 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-400" /> Smart Assistant
                  </div>
                  <div className="flex items-center gap-1">
                    macyemacye engine <Bot size={10} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto relative group"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-zinc-900 border border-white/10 p-5 rounded-full text-white shadow-2xl flex items-center justify-center">
            <AnimatePresence mode="wait">
               {isOpen ? (
                  <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                  >
                      <X size={26} />
                  </motion.div>
               ) : (
                  <motion.div
                      key="chat"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center w-7 h-7"
                  >
                      <img src="/logoo.png" alt="Chat" className="w-full h-full object-contain brightness-0 invert" />
                      {!messages.some(m => m.id === 'unread') && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 border-2 border-zinc-900 rounded-full"></span>
                      )}
                  </motion.div>
               )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>
    </>
  );
}
