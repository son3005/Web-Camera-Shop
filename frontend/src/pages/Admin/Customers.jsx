// src/pages/Admin/Customers.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { getCustomers } from "../../api/customerApi";
import CustomerOverview from "../../components/common/Ecomerce/Customers/CustomerOverview";
import CustomerRow from "../../components/common/Ecomerce/Customers/CustomerRow";
import CustomerDetailsModal from "../../components/common/Ecomerce/Customers/CustomerDetailsModal";
import FilterMenu from "../../components/common/Ecomerce/Customers/CustomerFilterMenu";

const PAGE_SIZE = 10;

export default function Customers() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // giống Orders: activeFilters chỉ lưu khi bấm "Áp dụng"
  const [activeFilters, setActiveFilters] = useState({
    statuses: [],
    priceSort: "default",
    dateSort: "default",
    priceRange: { min: "", max: "" },
    dateRange: { start: "", end: "" },
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customers", page, q, activeFilters],
    queryFn: () =>
      getCustomers({
        page,
        limit: PAGE_SIZE,
        q: q.trim(),
        ...activeFilters,
      }),
    keepPreviousData: true,
  });

  const items = data?.data ?? [];
  const total = data?.totalCount ?? 0;
  const stats = data?.stats ?? {};
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleApplyFilters = (f) => {
    setActiveFilters(f);
    setPage(1);
  };

  return (
    <div className="w-full">
      <CustomerOverview stats={stats} />

      <div className="w-full mx-auto bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-b border-black/10 dark:border-white/10">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quản lý Khách hàng
          </h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên, email, SĐT, mã KH…"
                className="w-full sm:w-72 bg-black/5 dark:bg-white/10 border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-slate-800 dark:text-slate-200 bg-slate-500/10 hover:bg-slate-500/20 text-sm font-semibold rounded-lg"
              >
                <Filter size={16} /> Lọc & Sắp xếp
              </button>
              {isFilterOpen && (
                <FilterMenu
                  initialFilters={activeFilters}
                  onApplyFilters={handleApplyFilters}
                  onClose={() => setIsFilterOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                {[
                  "Mã KH",
                  "Khách hàng",
                  "Liên hệ",
                  "Tổng đơn",
                  "Tổng chi",
                  "Trạng thái",
                  "Hành động",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-xs ${
                      h === "Khách hàng" || h === "Liên hệ"
                        ? "text-left"
                        : "text-center"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-500">
                    Đang tải dữ liệu…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-red-500">
                    Lỗi: {error.message}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-500">
                    Không có khách hàng.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <CustomerRow
                    key={it.id}
                    item={{
                      id: it.id,
                      avatar: it.avatar,
                      name: it.name,
                      email: it.email,
                      phone: it.phone,
                      createdAt: it.joinedDate,
                      orderCount: it.orderCount,
                      totalSpend: it.totalSpend,
                      status: it.status,
                    }}
                    onOpenDetail={() => setDetailId(it.id)}
                  />
                ))
              )}
              {!isLoading &&
                items.length < PAGE_SIZE &&
                Array.from({ length: PAGE_SIZE - items.length }).map((_, i) => (
                  <tr
                    key={`empty-${i}`}
                    className="border-b border-black/5 dark:border-white/5 h-[69px]"
                  >
                    <td colSpan="7"></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-slate-800 dark:text-slate-400 font-medium">
            Hiển thị {items.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} -{" "}
            {(page - 1) * PAGE_SIZE + items.length} trên tổng {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {detailId && (
        <CustomerDetailsModal
          customerId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
