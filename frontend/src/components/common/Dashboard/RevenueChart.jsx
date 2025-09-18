import React from "react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  BarChart,
} from "recharts";

function RevenueChart() {
  const data = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 38000 },
    { month: "Mar", revenue: 48000, expenses: 35000 },
    { month: "Apr", revenue: 61000, expenses: 42000 },
    { month: "May", revenue: 55000, expenses: 40000 },
    { month: "Jun", revenue: 67000, expenses: 45000 },
    { month: "Jul", revenue: 72000, expenses: 48000 },
    { month: "Sep", revenue: 69000, expenses: 46000 },
    { month: "Oct", revenue: 78000, expenses: 52000 },
    { month: "Nov", revenue: 82000, expenses: 50000 },
    { month: "Dec", revenue: 89000, expenses: 56000 },
  ];

  return (
    <div
      className="bg-slate-50 dark:bg-slate-800 backdrop-blur-xl rounded-b-2xl 
      border border-slate-200/50 dark:border-slate-700/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Revenue Chart
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monthly revenue and expense
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 via-blue-400 to-purple-600 rounded-full"></div>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Revenue
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-400  to-slate-600 rounded-full"></div>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Expenses
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              stroke="currentColor"
              className="text-slate-600 dark:text-slate-400"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="currentColor"
              className="text-slate-600 dark:text-slate-400"
              fontSize={12}
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
