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

  // Filters được áp dụng (giống Orders)
  const [activeFilters, setActiveFilters] = useState({
    statuses: [],
    priceSort: "default",
    dateSort: "default",
    priceRange: { min: "", max: "" },
    dateRange: { start: "", end: "" },
  });

  // ===== Lấy danh sách khách + stats =====
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
    <div className="p-6 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-800">
      {/* Overview cards */}
      <div className="max-w-7xl mx-auto mb-4">
        <CustomerOverview stats={stats} />
      </div>

      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-emerald-50 overflow-hidden">
        {/* Header: tiêu đề + search + filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-b border-slate-200/80">
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý Khách hàng
          </h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Ô tìm kiếm */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên, email, SĐT, mã KH…"
                className="w-full sm:w-72 bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              />
            </div>

            {/* Nút mở filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-semibold rounded-lg transition"
              >
                <Filter size={16} /> Lọc & Sắp xếp
              </button>
              {isFilterOpen && (
                <FilterMenu
                  initialFilters={activeFilters}
                  onApply={handleApplyFilters}
                  onClose={() => setIsFilterOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bảng khách hàng */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
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
                    className={`px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-xs ${
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
              {/* Các trạng thái dữ liệu */}
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-500">
                    Đang tải dữ liệu…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-red-500">
                    Lỗi: {error?.message}
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

              {/* Hàng trống để bảng đều */}
              {!isLoading &&
                items.length < PAGE_SIZE &&
                Array.from({ length: PAGE_SIZE - items.length }).map((_, i) => (
                  <tr
                    key={`empty-${i}`}
                    className="border-b border-slate-100 h-[69px]"
                  >
                    <td colSpan="7" />
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-slate-700 font-medium">
            Hiển thị {items.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} -{" "}
            {(page - 1) * PAGE_SIZE + items.length} trên tổng {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-emerald-300 disabled:opacity-50 transition"
            >
              Trước
            </button>
            <span className="text-sm font-bold text-slate-800">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-emerald-300 disabled:opacity-50 transition"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal chi tiết khách hàng */}
      {detailId && (
        <CustomerDetailsModal
          customerId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
