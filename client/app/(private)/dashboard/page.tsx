"use client";
import dynamic from "next/dynamic";
import StatsCard from "@/app/components/organisms/StatsCard";
import Dropdown from "@/app/components/molecules/Dropdown";
import { BarChart2, DollarSign, LineChart, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import React from "react";
import useFormatPrice from "@/app/hooks/ui/useFormatPrice";
import { useQuery } from "@apollo/client";
import { GET_ANALYTICS_OVERVIEW } from "@/app/gql/Dashboard";
import CustomLoader from "@/app/components/feedback/CustomLoader";
import ListCard from "@/app/components/organisms/ListCard";
import { withAuth } from "@/app/components/HOC/WithAuth";

const AreaChart = dynamic(
  () => import("@/app/components/charts/AreaChartComponent"),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("@/app/components/charts/BarChartComponent"),
  { ssr: false }
);

interface FormData {
  timePeriod: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  useCustomRange?: boolean;
}

const Dashboard = () => {
  const { control, watch } = useForm<FormData>({
    defaultValues: {
      timePeriod: "allTime",
      useCustomRange: false,
    },
  });
  const formatPrice = useFormatPrice();

  const timePeriodOptions = [
    { label: "Last 7 Days", value: "last7days" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Last Year", value: "lastYear" },
    { label: "All Time", value: "allTime" },
  ];

  const { timePeriod } = watch();

  const queryParams = {
    timePeriod: timePeriod || "allTime",
  };

  const { data, loading, error } = useQuery(GET_ANALYTICS_OVERVIEW, {
    variables: { params: queryParams },
  });

  const topItems =
    data?.productPerformance?.slice(0, 10).map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      revenue: formatPrice(p.revenue),
    })) || [];

  const salesByProduct = {
    categories: data?.productPerformance?.map((p) => p.name) || [],
    data: data?.productPerformance?.map((p) => p.revenue) || [],
  };

  if (loading) {
    return <CustomLoader />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading dashboard data
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 font-medium tracking-tight">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Controller
            name="timePeriod"
            control={control}
            render={({ field }) => (
              <Dropdown
                onChange={field.onChange}
                options={timePeriodOptions}
                value={field.value}
                label="Filter"
                className="w-full sm:min-w-[170px] bg-white shadow-sm border-gray-100"
              />
            )}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Revenue"
          value={formatPrice(data?.revenueAnalytics?.totalRevenue || 0)}
          percentage={data?.revenueAnalytics?.changes?.revenue || 0}
          caption="Gross revenue"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatsCard
          title="Sales"
          value={data?.orderAnalytics?.totalSales || 0}
          percentage={data?.orderAnalytics?.changes?.sales || 0}
          caption="Total orders"
          icon={<BarChart2 className="w-5 h-5" />}
        />
        <StatsCard
          title="Traffic"
          value={data?.interactionAnalytics?.totalInteractions || 0}
          percentage={0}
          caption="Total views"
          icon={<LineChart className="w-5 h-5" />}
        />
        <StatsCard
          title="Customers"
          value={data?.userAnalytics?.totalUsers || 0}
          percentage={data?.userAnalytics?.changes?.users || 0}
          caption="New signups"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Primary Chart Area */}
      <div className="grid grid-cols-1 gap-8">
        <AreaChart
          title="Revenue Performance"
          data={data?.revenueAnalytics?.monthlyTrends?.revenue || []}
          categories={data?.revenueAnalytics?.monthlyTrends?.labels || []}
          color="#6366f1"
          percentageChange={data?.revenueAnalytics?.changes?.revenue}
        />
      </div>

      {/* Secondary Grids */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Best Sellers</h3>
          </div>
          <ListCard
            title="Top Products"
            viewAllLink="/shop"
            items={topItems}
            itemType="product"
          />
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Inventory Split</h3>
          </div>
          <BarChart
            title="Sales Distribution"
            data={salesByProduct.data}
            categories={salesByProduct.categories}
            color="#ec4899"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default withAuth(Dashboard);
