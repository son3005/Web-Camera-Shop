// src/components/common/Ecomerce/Customers/CustomerRow.jsx
import React, { useState } from "react";
import { Eye, Ban, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCustomerStatus } from "../../../../api/customerApi";

// Helper: format VND an toàn (kể cả khi giá trị undefined / null)
const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

/**
 * Một dòng khách hàng trong bảng
 * - Hiển thị thông tin cơ bản
 * - Nút "Xem chi tiết"
 * - Nút "Khóa/Mở khóa"
 */
export default function CustomerRow({ item, onOpenDetail }) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const mutation = useMutation({
    mutationFn: updateCustomerStatus,
    onSuccess: () => {
      // Refresh list & detail nếu đang mở
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", item.id] });
    },
  });

  const toggleStatus = async () => {
    const newStatus = item.status === "Blocked" ? "Active" : "Blocked";
    setPending(true);
    try {
      await mutation.mutateAsync({ customerId: item.id, status: newStatus });
    } catch (e) {
      alert(e.message || "Cập nhật trạng thái thất bại");
    } finally {
      setPending(false);
    }
  };

  const statusBadge =
    {
      Active:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      Blocked: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
      New: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
      Returning:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    }[item.status] ||
    "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300";

  return (
    <tr className="border-b border-black/5 dark:border-white/5 hover:bg-slate-200/40 dark:hover:bg-white/5">
      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">
        #{item?.id}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={item?.avatar}
            alt={item?.name}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {item?.name || "-"}
            </div>
            <div className="text-xs text-slate-500">
              {item?.createdAt || "-"}
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-slate-800 dark:text-slate-200">
          {item?.email || "-"}
        </div>
        <div className="text-xs text-slate-500">{item?.phone || "-"}</div>
      </td>

      <td className="px-4 py-3 text-center">{Number(item?.orderCount || 0)}</td>
      {/* >>> Sửa tại đây: dùng helper vnd() để tránh lỗi toLocaleString khi undefined */}
      <td className="px-4 py-3 text-center">{vnd(item?.totalSpend)}</td>

      <td className="px-4 py-3 text-center">
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge}`}
        >
          {item?.status || "-"}
        </span>
      </td>

      <td className="px-4 py-3 text-center">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={onOpenDetail}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <div className="flex items-center gap-1">
              <Eye size={14} /> Xem
            </div>
          </button>

          <button
            disabled={pending}
            onClick={toggleStatus}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              item?.status === "Blocked"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            <div className="flex items-center gap-1">
              {item?.status === "Blocked" ? (
                <CheckCircle size={14} />
              ) : (
                <Ban size={14} />
              )}
              {item?.status === "Blocked" ? "Mở khóa" : "Khóa"}
            </div>
          </button>
        </div>
      </td>
    </tr>
  );
}
