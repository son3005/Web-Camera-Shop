import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { fetchPaginatedOrders, fetchTopProducts } from "../../../api/dashboardApi";

function RecentOrdersTable() {
  const [viewAll, setViewAll] = useState(false);
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const perPage = 10;

  const {
    data,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["recentOrders", page],
    queryFn: () => fetchPaginatedOrders({ page, limit: perPage }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const ordersData = data?.orders || [];
  const totalPages = data?.totalPages || 1;
  const shownData = viewAll ? ordersData : ordersData.slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const goToPage = () => {
    const target = parseInt(inputPage, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setPage(target);
      setInputPage("");
    }
  };
  
  if (isLoading) {
      return <div className="p-6 text-center dark:text-white rounded-2xl bg-white/80 dark:bg-slate-900">Loading Orders...</div>
  }
  
  if (isError) {
      return <div className="p-6 text-center text-red-500 rounded-2xl bg-red-100">Error loading orders.</div>
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Orders</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Latest customer orders</p>
        </div>
        <button
          onClick={() => {
            setViewAll(!viewAll);
            setPage(1);
          }}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {viewAll ? "Collapse" : "View All"}
        </button>
      </div>

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
            {shownData.map((order, index) => (
              <tr key={index} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="p-4 text-sm font-medium text-blue-600">{order.id}</td>
                <td className="p-4 text-sm text-slate-800 dark:text-white">{order.customer}</td>
                <td className="p-4 text-sm text-slate-800 dark:text-white">{order.product}</td>
                <td className="p-4 text-sm text-slate-800 dark:text-white">{order.amount}</td>
                <td className="p-4">
                  <span className={`font-medium text-xs px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4"><MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" /></td>
              </tr>
            ))}
            {viewAll && shownData.length < perPage &&
              Array.from({ length: perPage - shownData.length }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="border-b border-slate-200/50 dark:border-slate-700/50">
                  <td colSpan={6} className="p-4">&nbsp;</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {viewAll && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <button disabled={page === 1 || isFetching} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-md disabled:opacity-50">
              Previous
            </button>
            <button disabled={page === totalPages || isFetching} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-md disabled:opacity-50">
              Next
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Page {page} of {totalPages}</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToPage()}
              className="w-16 px-2 py-1 text-sm border rounded-md dark:bg-slate-800 dark:text-white"
              placeholder="Go"
            />
            <button onClick={goToPage} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Go</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TopProductsTable({ data }) {
  const [viewAll, setViewAll] = useState(false);
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const perPage = 7;

  const totalPages = Math.ceil(data.length / perPage);
  const shownData = viewAll ? data.slice((page - 1) * perPage, page * perPage) : data.slice(0, 5);

  const goToPage = () => {
    const target = parseInt(inputPage, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setPage(target);
      setInputPage("");
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Top Products</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Best performing products</p>
        </div>
        <button
          onClick={() => {
            setViewAll(!viewAll);
            setPage(1);
          }}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {viewAll ? "Collapse" : "View All"}
        </button>
      </div>

      <div className="p-6 space-y-4">
        {shownData.map((product, index) => (
          <div key={index} className="flex justify-between items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{product.name}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">{product.sale} sales</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{product.revenue}</p>
              <div className="flex items-center space-x-1 justify-end">
                {product.trend === "up" ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                <span className={`text-xs font-medium ${product.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>{product.change}</span>
              </div>
            </div>
          </div>
        ))}
        {viewAll &&
          Array.from({ length: perPage - shownData.length }).map((_, idx) => (
            <div key={`empty-${idx}`} className="p-4 rounded-xl">&nbsp;</div>
          ))}
      </div>

      {viewAll && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-md disabled:opacity-50">
              Previous
            </button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-md disabled:opacity-50">
              Next
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Page {page} of {totalPages}</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToPage()}
              className="w-16 px-2 py-1 text-sm border rounded-md dark:bg-slate-800 dark:text-white"
              placeholder="Go"
            />
            <button onClick={goToPage} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Go</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TableSection() {
    const { 
        data: topProducts, 
        isLoading: isLoadingProducts, 
        isError: isErrorProducts 
    } = useQuery({
        queryKey: ['topProducts'],
        queryFn: fetchTopProducts,
        staleTime: 5 * 60 * 1000,
    });
    
    if (isLoadingProducts) {
        return (
            <div className="space-y-6">
                <div className="p-6 text-center dark:text-white rounded-2xl bg-white/80 dark:bg-slate-900">Loading Orders...</div>
                <div className="p-6 text-center dark:text-white rounded-2xl bg-white/80 dark:bg-slate-900">Loading Top Products...</div>
            </div>
        );
    }

    if (isErrorProducts) {
        return <div className="p-6 text-center text-red-500 rounded-2xl bg-red-100">Error loading data.</div>;
    }

  return (
    <div className="space-y-6">
      <RecentOrdersTable />
      <TopProductsTable data={topProducts || []} />
    </div>
  );
}