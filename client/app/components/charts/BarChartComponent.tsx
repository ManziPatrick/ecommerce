"use client";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import Chart from "react-apexcharts";

type Props = {
  title: string;
  data: number[];
  categories: string[];
  color?: string;
  percentageChange?: number;
};

const BarChartComponent: React.FC<Props> = ({
  title,
  data,
  categories,
  color = "#6366f1",
  percentageChange,
}) => {
  const options: any = {
    chart: {
      id: "bar-chart",
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    colors: [color],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '45%',
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#94a3b8", fontWeight: 600, fontSize: '10px' },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8", fontWeight: 600, fontSize: '10px' },
      },
    },
    tooltip: {
      theme: "light",
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
    },
  };

  const series = [{ name: title, data }];

  return (
    <div className="p-6 rounded-2xl shadow-sm w-full bg-white border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-900 text-sm font-bold uppercase tracking-widest">{title}</h2>
        {percentageChange !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
              percentageChange >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            {percentageChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(percentageChange)}%
          </div>
        )}
      </div>
      <div className="min-h-[220px]">
        <Chart options={options} series={series} type="bar" height="100%" width="100%" />
      </div>
    </div>
  );
};

export default BarChartComponent;
