"use client";
import React from "react";
import Image from "next/image";
import { getCloudinaryUrl } from "@/app/utils/cloudinaryUtils";

interface UserAvatarProps {
  user: {
    name: string;
    avatar?: string | null;
  } | null | undefined;
  size?: number;
  className?: string;
}

const UserAvatar = ({ user, size = 35, className = "" }: UserAvatarProps) => {
  if (!user) {
    return (
      <div 
        className={`rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 font-bold" style={{ fontSize: size * 0.4 }}>
          ?
        </span>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Predefined pleasant background colors for letter avatars
  const bgColors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-fuchsia-500",
  ];

  // Pick a color based on the user's name to keep it consistent
  const colorIndex = user.name
    ? user.name.length % bgColors.length
    : 0;
  const bgColor = bgColors[colorIndex];

  if (user.avatar) {
    return (
      <div 
        className={`rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 relative ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={getCloudinaryUrl(user.avatar, `w_${size*2},h_${size*2},c_fill,f_auto,q_auto`)}
          alt={user.name || "User Profile"}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0 ${bgColor} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
