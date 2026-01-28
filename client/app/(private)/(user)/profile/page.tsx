"use client";
import { withAuth } from "@/app/components/HOC/WithAuth";
import MainLayout from "@/app/components/templates/MainLayout";
import { useGetMeQuery, useUpdateAvatarMutation } from "@/app/store/apis/UserApi";
import {
  User,
  Shield,
  Mail,
  Calendar,
  Edit3,
  Camera,
  CheckCircle,
  AlertCircle,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { getCloudinaryUrl } from "@/app/utils/cloudinaryUtils";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { addToast } from "@/app/store/slices/ToastSlice";
import VendorRequestForm from "./components/VendorRequestForm";
import UserAvatar from "@/app/components/atoms/UserAvatar";

const UserProfile = () => {
  const { data, isLoading, error } = useGetMeQuery(undefined);
  const [updateAvatar, { isLoading: isUpdatingAvatar }] = useUpdateAvatarMutation();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await updateAvatar(file).unwrap();
      dispatch(addToast({ message: "Avatar updated successfully", type: "success" }));
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || "Failed to update avatar", type: "error" }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 sm:py-8 px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="animate-pulse">
                <div className="h-32 sm:h-40 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                  <div className="absolute -bottom-8 sm:-bottom-12 left-4 sm:left-8">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-300 rounded-full border-4 border-white"></div>
                  </div>
                </div>
                <div className="pt-12 sm:pt-16 p-4 sm:p-8">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-48"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !data?.user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 sm:py-8 px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100 p-6 sm:p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Profile Error</h3>
                <p className="text-red-600 text-sm sm:text-base">Unable to fetch your profile. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { user } = data;

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatRole = (role: string) => role.charAt(0) + role.slice(1).toLowerCase();

  const getRoleColor = (role: string) => {
    const colors = {
      USER: "bg-blue-100 text-blue-800 border-blue-200",
      ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
      SUPERADMIN: "bg-red-100 text-red-800 border-red-200",
      VENDOR: "bg-amber-100 text-amber-800 border-amber-200",
    };
    return colors[role as keyof typeof colors] || colors.USER;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="absolute inset-0 bg-black/10"></div>

              <div className="absolute -bottom-8 sm:-bottom-12 left-4 sm:left-8">
                <div className="relative group">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <UserAvatar 
                    user={user} 
                    size={96} 
                    className="w-16 h-16 sm:w-24 sm:h-24 border-4 border-white shadow-xl" 
                  />

                  <button
                    onClick={triggerFileInput}
                    disabled={isUpdatingAvatar}
                    className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
                  >
                    {isUpdatingAvatar ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 animate-spin" />
                    ) : (
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    )}
                  </button>

                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors duration-200">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors duration-200">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-12 sm:pt-16 p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                    {user.name || "User Profile"}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Manage your account information and preferences
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200/50"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div><h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Basic Info</h3></div>
                  </div>
                  <div className="space-y-3">
                    <div><p className="text-xs text-gray-500 mb-1">Full Name</p><p className="text-gray-800 font-medium">{user.name || "Not provided"}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">User ID</p><p className="text-gray-600 font-mono text-xs break-all">{user.id}</p></div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-200/50"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div><h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Contact</h3></div>
                  </div>
                  <div className="space-y-3">
                    <div><p className="text-xs text-gray-500 mb-1">Email Address</p><p className="text-gray-800 font-medium break-all">{user.email || "Not provided"}</p></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-xs text-green-600 font-medium">Email verified</span></div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-200/50"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div><h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Role & Status</h3></div>
                  </div>
                  <div className="space-y-3">
                    <div><p className="text-xs text-gray-500 mb-2">Account Role</p><span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>{formatRole(user.role)}</span></div>
                    <div className="flex items-center space-x-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-xs text-green-600 font-medium">Active</span></div>
                  </div>
                </motion.div>
              </div>

              {user.role === "USER" && (
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <div className="max-w-2xl mx-auto">
                    <VendorRequestForm />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default withAuth(UserProfile);
