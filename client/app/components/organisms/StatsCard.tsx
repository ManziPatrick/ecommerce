'use client'
import { cn } from "@/app/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

type StatsCardProps = {
  title: string;
  value: string | number;
  percentage: number;
  caption?: string;
  icon?: React.ReactNode;
};

const StatsCard = ({
  title,
  value,
  percentage,
  caption,
  icon,
}: StatsCardProps) => {
  const isPositive = percentage >= 0;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 w-full flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-indigo-600 bg-indigo-50 rounded-xl p-2.5">
              {icon}
            </div>
          )}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-tight">{title}</h3>
        </div>
        
        <div
          className={cn(
            "flex items-center px-2 py-1 rounded-lg text-[10px] font-bold tracking-tighter",
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          )}
        >
          {isPositive ? (
            <TrendingUp size={12} className="mr-1" />
          ) : (
            <TrendingDown size={12} className="mr-1" />
          )}
          {Math.abs(percentage)}%
        </div>
      </div>

      <div className="flex flex-col">
        <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{value}</div>
        {caption && (
          <p className="text-[11px] text-gray-400 font-medium mt-1">
            {caption}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
