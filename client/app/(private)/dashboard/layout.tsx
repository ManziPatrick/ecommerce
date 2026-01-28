"use client";
import React, { useState } from "react";
import { User, Menu } from "lucide-react";
import BreadCrumb from "@/app/components/feedback/BreadCrumb";
import Sidebar from "../../components/layout/Sidebar";
import DashboardSearchBar from "@/app/components/molecules/DashboardSearchbar";
import { useAuth } from "@/app/hooks/useAuth";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row relative">
      {/* Sidebar - Handles its own mobile responsiveness */}
      <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <BreadCrumb />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <DashboardSearchBar />
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || "User"}
                    fill
                    sizes="(max-width: 640px) 32px, 40px"
                    className="object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight">
                  {user?.name || "Guest"}
                </span>
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                  {user?.role || "User"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <div className="sm:hidden mb-4">
             <BreadCrumb />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
