// src/components/common/Ecomerce/Customers/CustomerTable.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "../../../../api/customerApi";
import CustomerRow from "./CustomerRow";

/**
 * Bảng danh sách khách hàng
 * Nhận props từ trang Pages/Admin/Customers.jsx:
 * - page, setPage
 * - search, activeFilters
 * - onOpenDetail(customer)
 */
const ITEMS_PER_PAGE = 10;

export default function CustomerTable({
  page,
  setPage,
  search,
  activeFilters,
  onOpenDetail,
}) {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["customers", page, search, activeFilters],
    queryFn: () =>
      fetchCustomers({
        page,
        limit: ITEMS_PER_PAGE,
        q: search,
        ...activeFilters,
      }),
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const emptyRows = Array.from({
    length: Math.max(0, ITEMS_PER_PAGE - items.length),
  });

  return (
    <div className="w-full bg-white/80 dark:bg-slate-800/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
      {/* Table header */}
      <div className="px-5 py-4 border-b border-black/10 dark:border-white/10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Danh sách khách hàng
        </h3>
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
                  className={`px-4 py-3 font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-slate-300 ${
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
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-red-500">
                  Lỗi: {error.message}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Không tìm thấy khách hàng phù hợp.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <CustomerRow
                  key={c.id}
                  item={c}
                  onOpenDetail={() => onOpenDetail(c.id)}
                />
              ))
            )}
            {!isLoading &&
              !isError &&
              emptyRows.map((_, i) => (
                <tr
                  key={`empty-${i}`}
                  className="border-b border-black/5 dark:border-white/5 h-[64px]"
                >
                  <td colSpan={7}></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-sm text-slate-800 dark:text-slate-400 font-medium">
          Hiển thị {items.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} -{" "}
          {(page - 1) * ITEMS_PER_PAGE + items.length} trên tổng {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isFetching}
            className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
