import React from 'react';
import { MoreHorizontal, TrendingUp, TrendingDown} from 'lucide-react'


const recentOrders = [
  {
    id: "#1001",
    customer: "Nguyen Van A",
    product: "Sony A7 IV Camera",
    amount: "$2,499",
    status: "completed",
    date: "2025-09-01",
  },
  {
    id: "#1002",
    customer: "Tran Thi B",
    product: "Canon EOS R6",
    amount: "$1,899",
    status: "pending",
    date: "2025-09-02",
  },
  {
    id: "#1003",
    customer: "Le Van C",
    product: "Fujifilm X-T5",
    amount: "$1,699",
    status: "processing",
    date: "2025-09-03",
  },
  {
    id: "#1004",
    customer: "Pham Thi D",
    product: "Sony ZV-E10",
    amount: "$799",
    status: "cancelled",
    date: "2025-09-03",
  },
  {
    id: "#1005",
    customer: "Hoang Van E",
    product: "Nikon Z6 II",
    amount: "$1,599",
    status: "completed",
    date: "2025-09-04",
  },
  {
    id: "#1006",
    customer: "Do Thi F",
    product: "Canon M50 Mark II",
    amount: "$699",
    status: "pending",
    date: "2025-09-04",
  },
  {
    id: "#1007",
    customer: "Vu Van G",
    product: "GoPro Hero 12",
    amount: "$499",
    status: "completed",
    date: "2025-09-05",
  },
  {
    id: "#1008",
    customer: "Nguyen Thi H",
    product: "DJI Mini 3 Pro Drone",
    amount: "$999",
    status: "processing",
    date: "2025-09-06",
  },
  {
    id: "#1009",
    customer: "Pham Van I",
    product: "Sony FE 24-70mm Lens",
    amount: "$1,199",
    status: "completed",
    date: "2025-09-06",
  },
  {
    id: "#1010",
    customer: "Tran Thi J",
    product: "Canon RF 50mm Lens",
    amount: "$399",
    status: "cancelled",
    date: "2025-09-07",
  },
];

const topProducts = [
  {
    name: "Sony A7 IV Camera",
    sale: 320,
    revenue: "$799,000",
    trend: "up",
    change: "+12.5%",
  },
  {
    name: "Canon EOS R6",
    sale: 280,
    revenue: "$530,000",
    trend: "down",
    change: "-5.2%",
  },
  {
    name: "Fujifilm X-T5",
    sale: 210,
    revenue: "$356,000",
    trend: "up",
    change: "+8.1%",
  },
  {
    name: "DJI Mini 3 Pro Drone",
    sale: 150,
    revenue: "$224,500",
    trend: "up",
    change: "+15.3%",
  },
  {
    name: "GoPro Hero 12",
    sale: 190,
    revenue: "$142,000",
    trend: "down",
    change: "-3.7%",
  },
];


function TableSection() {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Recent Orders */}
      <div className="bg-white/80 dark:bg-slate-900 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Recent Orders
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Latest customer orders
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">Order ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">Customer</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">Product</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">Amount</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4">
                    <span className="text-sm font-medium text-blue-600">{order.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-800 dark:text-white">{order.customer}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-800 dark:text-white">{order.product}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-800 dark:text-white">{order.amount}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-medium text-xs px-3 py-1 rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Top Products</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Best performing products</p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>

        <div className="p-6 space-y-4">
          {topProducts.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {product.name}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{product.sale} sales</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {product.revenue}
                </p>
                <div className="flex items-center space-x-1">
                  {product.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      product.trend === "up" ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {product.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TableSection;