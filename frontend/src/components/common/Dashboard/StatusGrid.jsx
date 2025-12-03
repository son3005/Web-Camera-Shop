// src/components/common/Dashboard/StatusGrid.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { layTongHopThongKe } from "../../../api/thongKeApi";

function StatCard({ label, value, color }) {
  return (
    <div className="bg-[#071824] rounded-2xl border border-slate-700/60 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default function StatusGrid() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["thong-ke", "tong-hop"],
    queryFn: layTongHopThongKe,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-800/60 rounded-2xl border border-slate-700/60"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-[#071824] rounded-2xl border border-red-500/50 p-4 text-sm text-red-300">
        Lỗi khi tải thống kê tổng hợp: {error?.message}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Doanh thu tháng này"
        value={(data.doanh_thu_thang_nay || 0).toLocaleString("vi-VN") + " ₫"}
        color="text-emerald-400"
      />
      <StatCard
        label="Đơn hàng tháng này"
        value={data.don_hang_thang_nay || 0}
        color="text-sky-400"
      />
      <StatCard
        label="Người dùng mới"
        value={data.nguoi_dung_moi_thang_nay || 0}
        color="text-indigo-400"
      />
      <StatCard
        label="Tổng tài khoản"
        value={data.tong_so_tai_khoan || 0}
        color="text-amber-400"
      />
    </div>
  );
}
