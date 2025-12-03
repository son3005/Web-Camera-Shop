// src/components/common/Ecomerce/Customers/CustomerTable.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "../../../../api/customerApi";
import CustomerRow from "./CustomerRow";

/**
 * Bảng danh sách khách hàng (dùng riêng)
 * Nhận props:
 * - page, setPage
 * - search, activeFilters
 * - onOpenDetail(customerId)
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
    <div className="w-full bg-white/90 rounded-2xl border border-emerald-50 shadow-lg overflow-hidden">
      {/* Header nhỏ của bảng */}
      <div className="px-5 py-4 border-b border-slate-200/80">
        <h3 className="text-lg font-bold text-slate-900">
          Danh sách khách hàng
        </h3>
      </div>

      {/* Table chính */}
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
                  className={`px-4 py-3 font-bold uppercase tracking-wider text-xs text-slate-700 ${
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
            {/* Các trạng thái tải dữ liệu */}
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-red-500">
                  Lỗi: {error?.message}
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

            {/* Hàng trống để bảng đều chiều cao */}
            {!isLoading &&
              !isError &&
              emptyRows.map((_, i) => (
                <tr
                  key={`empty-${i}`}
                  className="border-b border-slate-100 h-[64px]"
                >
                  <td colSpan={7}></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-sm text-slate-700 font-medium">
          Hiển thị {items.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} -{" "}
          {(page - 1) * ITEMS_PER_PAGE + items.length} trên tổng {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-emerald-300 disabled:opacity-50 transition"
          >
            Trước
          </button>
          <span className="text-sm font-bold text-slate-800">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isFetching}
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-emerald-300 disabled:opacity-50 transition"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
