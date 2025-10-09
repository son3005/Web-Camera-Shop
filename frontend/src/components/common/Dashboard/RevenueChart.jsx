import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart,
} from "recharts";
import { fetchRevenueChartData } from "../../../api/dashboardApi"; // THÊM: Import API

function RevenueChart() {
    // THÊM: Logic gọi API bằng useQuery
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['revenueChartData'],
        queryFn: fetchRevenueChartData,
    });

    // THÊM: Xử lý trạng thái loading và error
    if (isLoading) {
      return (
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl h-[400px] flex justify-center items-center animate-pulse">
              <p className="text-slate-400">Loading Chart...</p>
          </div>
      );
    }

    if (isError) {
      return <div className="text-red-500">Error fetching revenue data: {error.message}</div>;
    }

  return (
    <div
      className="bg-slate-50 dark:bg-slate-800 backdrop-blur-xl rounded-b-2xl
        border border-slate-200/50 dark:border-slate-700/50 p-6"
    >
      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
        Revenue vs Expenses
      </h3>
      <div className="h-[350px]">
        {/* CHỈNH SỬA: Dùng dữ liệu `data` từ API */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3}/>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis
              width={40}
              tick={{ dx: -10 }}
              tickCount={6}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
              }}
              wrapperClassName="dark:!bg-slate-800 dark:!text-slate-100"
              formatter={(value) => [`$${value.toLocaleString()}`, ""]}
            />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF33" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6600" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            <Bar
              dataKey="revenue"
              fill="url(#revenueGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="expenses"
              fill="url(#expensesGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;