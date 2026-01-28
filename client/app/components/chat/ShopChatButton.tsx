"use client";

import { useState } from "react";
import { MessageCircle, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShopChatModal from "./ShopChatModal";

interface ShopChatButtonProps {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  productName?: string;
  variant?: "full" | "compact";
}

export default function ShopChatButton({ 
  shopId, 
  shopName, 
  shopLogo,
  productName,
  variant = "full"
}: ShopChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "full" ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transition-all font-sans tracking-tight"
        >
          <MessageCircle size={20} />
          <span>Chat with {shopName}</span>
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border-2 border-violet-600 text-violet-600 rounded-lg font-bold text-sm hover:bg-violet-50 dark:hover:bg-violet-950 transition-all shadow-sm"
        >
          <MessageCircle size={18} />
          <span>Ask Shop</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <ShopChatModal
            shopId={shopId}
            shopName={shopName}
            shopLogo={shopLogo}
            productContext={productName}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
