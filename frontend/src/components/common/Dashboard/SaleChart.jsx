import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Sony", value: 45, color: "#3b82f6" },
  { name: "Canon", value: 30, color: "#8b5cf6" },
  { name: "Fujifilm", value: 15, color: "#10b981" },
  { name: "Other", value: 10, color: "#f59e0b" },
];

// Custom Tooltip để hỗ trợ dark mode
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="px-3 py-2 rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {item.name}: {item.value}%
        </p>
      </div>
    );
  }
  return null;
};

function SaleChart() {
  return (
    <div
      className="bg-slate-50 dark:bg-slate-800 backdrop-blur-xl rounded-b-2xl
        border border-slate-200/50 dark:border-slate-700/50 p-6"
    >
      {/* Title */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Sales by Category
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Production Distribution
        </p>
      </div>

      {/* Pie Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-3 mt-6">
        {data.map((item, index) => (
          <div className="flex items-center justify-between" key={index}>
            {/* Bên trái: chấm + tên */}
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {item.name}
              </span>
            </div>
            {/* Bên phải: giá trị % */}
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SaleChart;
