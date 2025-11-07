// src/pages/Admin/Transactions.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Eye } from "lucide-react";

// 🧩 (tạm thời sử dụng mock data cho demo)
// Sau này bạn chỉ cần thay hàm fetchTransactions bằng API thật
const fetchTransactions = async ({ page = 1, perPage = 10 }) => {
  return {
    data: Array.from({ length: perPage }, (_, i) => ({
      id: `GD2025${page}${i}`,
      nguoi_giao_dich: `Nguyễn Văn ${String.fromCharCode(65 + i)}`,
      so_tien: 1500000 + i * 100000,
      phuong_thuc: i % 2 === 0 ? "VNPay" : "Chuyển khoản",
      trang_thai: i % 3 === 0 ? "Hoàn thành" : "Đang xử lý",
      ngay_giao_dich: "2025-11-06T10:30:00",
    })),
    pagination: { page, per_page: perPage, total: 25, pages: 3 },
  };
};

export default function Transactions() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions", page],
    queryFn: () => fetchTransactions({ page, perPage }),
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-600 dark:text-slate-400">
        Đang tải dữ liệu giao dịch...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Lỗi khi tải danh sách giao dịch.
      </div>
    );
  }

  const transactions = data?.data || [];
  const { pagination } = data;

  return (
    <div className="space-y-6">
      {/* --- Tiêu đề trang --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Quản lý Giao dịch
        </h1>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
          + Thêm giao dịch
        </button>
      </div>

      {/* --- Bảng dữ liệu --- */}
      <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800/60">
            <tr>
              <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                Mã Giao dịch
              </th>
              <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                Người giao dịch
              </th>
              <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                Phương thức
              </th>
              <th className="p-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                Số tiền
              </th>
              <th className="p-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                Trạng thái
              </th>
              <th className="p-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                Ngày GD
              </th>
              <th className="p-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="p-3 font-medium text-blue-600">{item.id}</td>
                <td className="p-3">{item.nguoi_giao_dich}</td>
                <td className="p-3">{item.phuong_thuc}</td>
                <td className="p-3 text-right text-slate-800 dark:text-slate-200">
                  {item.so_tien.toLocaleString("vi-VN")}₫
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.trang_thai === "Hoàn thành"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                    }`}
                  >
                    {item.trang_thai}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {new Date(item.ngay_giao_dich).toLocaleDateString()}
                </td>
                <td className="p-3 text-center">
                  <button className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- Pagination --- */}
        <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-md disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Trang {pagination.page} / {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-md disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
