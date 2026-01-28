"use client";
import dynamic from "next/dynamic";
import StatsCard from "@/app/components/organisms/StatsCard";
import Dropdown from "@/app/components/molecules/Dropdown";
import DateRangePicker from "@/app/components/molecules/DateRangePicker";
import {
  BarChart2,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Users,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import React, { useState } from "react";
import useFormatPrice from "@/app/hooks/ui/useFormatPrice";
import { useLazyExportAnalyticsQuery } from "@/app/store/apis/AnalyticsApi";
import { useQuery } from "@apollo/client";
import { GET_ALL_ANALYTICS } from "@/app/gql/Dashboard";
import CustomLoader from "@/app/components/feedback/CustomLoader";
import ListCard from "@/app/components/organisms/ListCard";
import { withAuth } from "@/app/components/HOC/WithAuth";

// Dynamically import charting components with SSR disabled
const AreaChart = dynamic(
  () => import("@/app/components/charts/AreaChartComponent"),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("@/app/components/charts/BarChartComponent"),
  { ssr: false }
);
const DonutChart = dynamic(
  () => import("@/app/components/charts/DonutChartComponent"),
  { ssr: false }
);
const RevenueOverTimeChart = dynamic(
  () => import("@/app/components/charts/RevenueOverTimeChart"),
  { ssr: false }
);

interface FormData {
  timePeriod: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  useCustomRange: boolean;
}

const AnalyticsDashboard = () => {
  const { control, watch } = useForm<FormData>({
    defaultValues: {
      timePeriod: "allTime",
      useCustomRange: false,
      year: new Date().getFullYear().toString(),
    },
  });
  const formatPrice = useFormatPrice();

  const timePeriodOptions = [
    { label: "Last 7 Days", value: "last7days" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Last Year", value: "lastYear" },
    { label: "All Time", value: "allTime" },
  ];

  const { timePeriod, year, startDate, endDate, useCustomRange } = watch();

  const queryParams = {
    timePeriod: timePeriod || "allTime",
    year: useCustomRange ? undefined : year ? parseInt(year, 10) : undefined,
    startDate: useCustomRange && startDate ? startDate : undefined,
    endDate: useCustomRange && endDate ? endDate : undefined,
  };

  const { data, loading, error } = useQuery(GET_ALL_ANALYTICS, {
    variables: { params: queryParams },
  });

  const [exportType, setExportType] = useState<string>("all");
  const [exportFormat] = useState<string>("csv");

  console.log("Analytics data => ", data);
  console.log("error loading analytics => ", error);

  const minYear = data?.yearRange?.minYear || 2020;
  const maxYear = data?.yearRange?.maxYear || 2020;

  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    label: (minYear + i).toString(),
    value: (minYear + i).toString(),
  }));

  const [, { isLoading: isExporting, error: exportError }] =
    useLazyExportAnalyticsQuery();

  console.log("export error => ", exportError);

  const handleExport = async () => {};

  if (loading) {
    return <CustomLoader />;
  }

  if (error) {
    console.error("GraphQL Error:", error);
    return <div>Error loading analytics data</div>;
  }

  // Chart and list data
  const mostSoldProducts = {
    labels: data?.productPerformance?.slice(0, 10).map((p) => p.name) || [],
    data: data?.productPerformance?.slice(0, 10).map((p) => p.quantity) || [],
  };

  const salesByProduct = {
    categories: data?.productPerformance?.map((p) => p.name) || [],
    data: data?.productPerformance?.map((p) => p.revenue) || [],
  };

  const interactionByType = {
    labels: ["Views", "Clicks", "Others"],
    data: [
      data?.interactionAnalytics?.byType?.views || 0,
      data?.interactionAnalytics?.byType?.clicks || 0,
      data?.interactionAnalytics?.byType?.others || 0,
    ],
  };

  const topItems =
    data?.productPerformance?.slice(0, 10).map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      revenue: formatPrice(p.revenue),
    })) || [];

  const topUsers =
    data?.userAnalytics?.topUsers?.slice(0, 10).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      orderCount: u.orderCount,
      totalSpent: formatPrice(u.totalSpent),
      engagementScore: u.engagementScore,
    })) || [];

  const mostViewedProducts =
    data?.interactionAnalytics?.mostViewedProducts?.slice(0, 10).map((p) => ({
      id: p.productId,
      name: p.productName,
      viewCount: p.viewCount,
    })) || [];

  const exportTypeOptions = [
    { label: "All Data", value: "all" },
    { label: "Overview", value: "overview" },
    { label: "Products", value: "products" },
    { label: "Users", value: "users" },
  ];

  const exportFormatOptions = [
    { label: "CSV", value: "csv" },
    { label: "PDF", value: "pdf" },
    { label: "XLSX", value: "xlsx" },
  ];

  return (
    <motion.div
      className="min-h-screen space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-gray-400 font-medium tracking-tight">Deep dive into your store's performance metrics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Controller
            name="timePeriod"
            control={control}
            render={({ field }) => (
              <Dropdown
                onChange={field.onChange}
                options={timePeriodOptions}
                value={field.value}
                label="Period"
                className="w-full sm:w-[150px]"
              />
            )}
          />
          <Controller
            name="year"
            control={control}
            render={({ field }) => (
              <Dropdown
                onChange={field.onChange}
                options={yearOptions}
                value={field.value ?? "all"}
                label="Year"
                className="w-full sm:w-[120px]"
                disabled={useCustomRange}
              />
            )}
          />
          <div className="w-full sm:w-auto">
            <DateRangePicker
              label="Custom Range"
              control={control}
              startName="startDate"
              endName="endDate"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <Dropdown
              options={exportFormatOptions}
              value={exportFormat}
              onChange={(value) => setExportType(value ?? "")}
              label="Format"
              className="flex-1 sm:w-[110px]"
            />
            <button
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-all font-bold text-sm shadow-lg shadow-gray-200"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Revenue"
          value={formatPrice(data?.revenueAnalytics?.totalRevenue || 0)}
          percentage={data?.revenueAnalytics?.changes?.revenue}
          caption="Gross earnings"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatsCard
          title="Orders"
          value={data?.orderAnalytics?.totalOrders || 0}
          percentage={data?.orderAnalytics?.changes?.orders}
          caption="Total completed"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatsCard
          title="Conversion"
          value={data?.orderAnalytics?.totalSales || 0}
          percentage={data?.orderAnalytics?.changes?.sales}
          caption="Success rate"
          icon={<BarChart2 className="w-5 h-5" />}
        />
        <StatsCard
          title="Value"
          value={formatPrice(data?.orderAnalytics?.averageOrderValue || 0)}
          percentage={data?.orderAnalytics?.changes?.averageOrderValue}
          caption="Avg. per order"
          icon={<CreditCard className="w-5 h-5" />}
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
         <div className="flex items-center gap-3 px-1">
             <div className="h-4 w-1 bg-indigo-600 rounded-full" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Growth Trends</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AreaChart
              title="Order Volume"
              data={data?.revenueAnalytics?.monthlyTrends?.orders || []}
              categories={data?.revenueAnalytics?.monthlyTrends?.labels || []}
              color="#ec4899"
              percentageChange={data?.orderAnalytics?.changes?.orders}
            />
            <AreaChart
              title="Revenue Flow"
              data={data?.revenueAnalytics?.monthlyTrends?.revenue || []}
              categories={data?.revenueAnalytics?.monthlyTrends?.labels || []}
              color="#10b981"
              percentageChange={data?.revenueAnalytics?.changes?.revenue}
            />
            <AreaChart
              title="Sales Performance"
              data={data?.revenueAnalytics?.monthlyTrends?.sales || []}
              categories={data?.revenueAnalytics?.monthlyTrends?.labels || []}
              color="#3b82f6"
              percentageChange={data?.orderAnalytics?.changes?.sales}
            />
            <AreaChart
              title="User Acquisition"
              data={data?.revenueAnalytics?.monthlyTrends?.users || []}
              categories={data?.revenueAnalytics?.monthlyTrends?.labels || []}
              color="#f59e0b"
              percentageChange={data?.userAnalytics?.changes?.users}
            />
          </div>
      </div>

      {/* Deep Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
             <div className="h-4 w-1 bg-emerald-500 rounded-full" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Demographics</h3>
          </div>
          <ListCard
            title="Top Customers"
            viewAllLink="/dashboard/users"
            items={topUsers}
            itemType="user"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
             <div className="h-4 w-1 bg-rose-500 rounded-full" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Inventory Heatmap</h3>
          </div>
          <ListCard
            title="Most Viewed"
            viewAllLink="/shop"
            items={mostViewedProducts}
            itemType="product"
          />
        </div>

        <div className="space-y-4 lg:col-span-2 xl:col-span-1">
           <div className="flex items-center gap-3 px-1">
             <div className="h-4 w-1 bg-blue-500 rounded-full" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Product Share</h3>
          </div>
          <BarChart
            title="Distribution"
            data={salesByProduct.data}
            categories={salesByProduct.categories}
            color="#ec4899"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default withAuth(AnalyticsDashboard);
