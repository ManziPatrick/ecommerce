"use client";
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import useStorage from "@/app/hooks/state/useStorage";
import { useAuth } from "@/app/hooks/useAuth";
import { useSignOutMutation } from "@/app/store/apis/AuthApi";
import {
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Users,
  LogOut,
  PanelsRightBottom,
  Boxes,
  ChartCandlestick,
  ClipboardPlus,
  ClipboardCheck,
  Section,
  ChartArea,
  Settings,
  X,
} from "lucide-react";
import UnreadBadge from "../chat/UnreadBadge";

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isOpen, setIsOpen] = useStorage<boolean>(
    "sidebarOpen",
    true,
    "local"
  );
  const [isDesktop, setIsDesktop] = React.useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [signout] = useSignOutMutation();
  const { user } = useAuth();

  React.useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const sections = useMemo(() => {
    const isVendor = user?.role === "VENDOR";
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

    return [
      {
        title: "Overview",
        links: [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ],
      },
      {
        title: "macyemacye",
        links: [
          { name: "Products", href: "/products", icon: Layers },
          { name: "Orders", href: "/orders", icon: ShoppingCart },
          { name: "Inventory", href: "/inventory", icon: Section },
          { name: "Attributes", href: "/attributes", icon: Layers },
          { name: "Categories", href: "/categories", icon: Boxes },
          { name: "Transactions", href: "/transactions", icon: ShoppingCart, show: isAdmin },
          { name: "Users", href: "/users", icon: Users, show: isAdmin },
          { name: "Vendor Requests", href: "/vendor-requests", icon: Section, show: isAdmin },
          { name: "Shop Settings", href: "/shop-settings", icon: Settings, show: isVendor },
          { name: "Chats", href: "/chats", icon: ChartArea },
        ].filter(link => link.show !== false),
      },
      {
        title: "Stats",
        links: [
          { name: "Analytics", href: "/analytics", icon: ChartCandlestick },
          { name: "Reports", href: "/reports", icon: ClipboardPlus },
          { name: "Logs", href: "/logs", icon: ClipboardCheck, show: isAdmin },
        ].filter(link => link.show !== false),
      },
    ];
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signout().unwrap();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const SidebarLink = ({
    name,
    href,
    Icon,
  }: {
    name: string;
    href: string;
    Icon: React.ElementType;
  }) => {
    const fullHref = href.startsWith("/dashboard") ? href : `/dashboard${href}`;
    const isActive = pathname === fullHref;

    return (
      <Link
        href={fullHref}
        prefetch={false}
        onClick={() => setIsMobileOpen?.(false)}
        className={`relative group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
          ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200"
          : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
          }`}
      >
        <div className="flex shrink-0">
          <Icon size={20} className={isActive ? "text-white" : "group-hover:text-indigo-600"} />
        </div>
        <span className={`text-sm tracking-tight whitespace-nowrap ${(isOpen || isMobileOpen) ? "opacity-100" : "opacity-0 md:hidden"}`}>
          {name}
        </span>
        {name === "Chats" && (
          <div className="absolute top-2 right-2 text-white">
            <UnreadBadge />
          </div>
        )}
      </Link>
    );
  };

  const sidebarVariants = {
    open: { width: 280, x: 0 },
    closed: { width: 88, x: 0 },
    mobileOpen: { x: 0, width: "100%", maxWidth: 300 },
    mobileClosed: { x: "-100%", width: "100%", maxWidth: 300 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen?.(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isDesktop ? (isOpen ? "open" : "closed") : (isMobileOpen ? "mobileOpen" : "mobileClosed")}
        variants={sidebarVariants}
        className={`bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-[100] md:static transition-shadow ${
          isMobileOpen ? "shadow-2xl" : "shadow-xl sm:shadow-none"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className={`flex items-center gap-3 ${(isOpen || isMobileOpen) ? "opacity-100" : "opacity-0 md:hidden"}`}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">M</div>
              <span className="font-black text-lg tracking-tighter text-gray-900">MACYE.</span>
            </div>
            <button
              onClick={() => isMobileOpen ? setIsMobileOpen?.(false) : setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              {isMobileOpen ? <X size={20} /> : <PanelsRightBottom size={20} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 custom-scrollbar pr-1">
            {sections.map((section) => (section.links.length > 0 && (
              <div key={section.title}>
                {(isOpen || isMobileOpen) && (
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 px-4">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.links.map((link) => (
                    <SidebarLink
                      key={link.name}
                      name={link.name}
                      href={link.href}
                      Icon={link.icon}
                    />
                  ))}
                </div>
              </div>
            )))}
          </nav>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group font-medium ${
                 !(isOpen || isMobileOpen) ? "justify-center" : ""
              }`}
            >
              <LogOut size={20} />
              {(isOpen || isMobileOpen) && <span className="text-sm">Log Out</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
