// src/components/common/Dashboard/BieuDoDonHangThanhCong.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { layThongKeDonHangThanhCong } from "../../../api/thongKeApi";

function BieuDoDonHangThanhCong({ nam, thang }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "thong-ke-don-hang-thanh-cong",
      { nam: nam ?? null, thang: thang ?? null },
    ],
    queryFn: () => layThongKeDonHangThanhCong({ nam, thang }),
  });

  const chartData =
    data?.map((item) => ({
      nhan: item.thang ? `${item.thang}/${item.nam}` : `${item.nam}`,
      soDonThanhCong: item.soDonThanhCong,
    })) || [];

  const hasData = chartData.some((x) => x.soDonThanhCong > 0);

  const filterLabel =
    nam && thang
      ? `Thời gian: Tháng ${thang}/${nam}`
      : nam
      ? `Thời gian: Năm ${nam}`
      : thang
      ? `Thời gian: Tháng ${thang} (tất cả năm)`
      : "Thời gian: Tất cả dữ liệu";

  return (
    <div className="bg-[#071824] rounded-2xl border border-slate-700/60 p-6 h-[260px]">
      <h3 className="text-base font-semibold text-slate-50 mb-1">
        Đơn hàng thành công
      </h3>
      <p className="text-xs text-slate-400">{filterLabel}</p>
      <p className="text-xs text-slate-400 mb-4">
        Số đơn ở trạng thái{" "}
        <span className="font-semibold">DA_GIAO (đơn đã giao thành công)</span>.
      </p>

      {isLoading ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-slate-400 text-sm animate-pulse">Đang tải...</p>
        </div>
      ) : isError ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-red-300 text-sm">
            Lỗi khi tải thống kê: {error?.message}
          </p>
        </div>
      ) : !hasData ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-slate-400 text-sm">
            Chưa có đơn hàng thành công trong khoảng thời gian này.
          </p>
        </div>
      ) : (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#1e293b"
                opacity={0.4}
              />
              <XAxis
                dataKey="nhan"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,.35)",
                  fontSize: 12,
                }}
                formatter={(value) => [`${value} đơn`, "Đơn thành công"]}
              />
              <Bar
                dataKey="soDonThanhCong"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default BieuDoDonHangThanhCong;
