// src/components/common/Dashboard/BieuDoDoanhThu.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { layDuLieuDoanhThu } from "../../../api/thongKeApi";

/**
 * Biểu đồ MIỀN Doanh thu & Lợi nhuận
 * Dữ liệu: GET /api/thong-ke/doanh-thu
 * Backend: chỉ đơn hàng DA_GIAO + thanh toán DA_THANH_TOAN
 */
function BieuDoDoanhThu({ nam, thang }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "thong-ke-doanh-thu",
      { nam: nam ?? null, thang: thang ?? null },
    ],
    queryFn: () => layDuLieuDoanhThu({ nam, thang }),
  });

  const chartData =
    data?.map((item) => ({
      nhan: item.thang ? `${item.thang}/${item.nam}` : `${item.nam}`,
      tongDoanhThu: item.tongDoanhThu,
      loiNhuan: item.loiNhuan,
    })) || [];

  const hasData = chartData.some((x) => x.tongDoanhThu > 0 || x.loiNhuan > 0);

  const filterLabel =
    nam && thang
      ? `Thời gian: Tháng ${thang}/${nam}`
      : nam
      ? `Thời gian: Năm ${nam}`
      : thang
      ? `Thời gian: Tháng ${thang} (tất cả năm)`
      : "Thời gian: Tất cả dữ liệu";

  if (isLoading) {
    return (
      <div className="bg-[#071824] rounded-2xl border border-slate-700/60 p-6 h-[360px] flex items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse">
          Đang tải dữ liệu doanh thu...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#071824] rounded-2xl border border-red-500/40 p-6 h-[360px] flex items-center justify-center">
        <p className="text-red-300 text-sm">
          Lỗi khi tải thống kê doanh thu: {error?.message}
        </p>
      </div>
    );
  }

  if (!chartData.length || !hasData) {
    return (
      <div className="bg-[#071824] rounded-2xl border border-slate-700/60 p-6 h-[360px] flex flex-col justify-center items-center text-center">
        <h3 className="text-base font-semibold text-slate-50 mb-2">
          Doanh thu &amp; Lợi nhuận
        </h3>
        <p className="text-sm text-slate-400 mb-1">
          {filterLabel}. Không có dữ liệu doanh thu phù hợp với bộ lọc hiện tại.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          (Backend chỉ thống kê các đơn hàng{" "}
          <span className="font-semibold">DA_GIAO</span> và thanh toán{" "}
          <span className="font-semibold">DA_THANH_TOAN</span>.)
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#071824] rounded-2xl border border-slate-700/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-50">
            Doanh thu &amp; Lợi nhuận
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {filterLabel}. Dựa trên các đơn đã giao và đã thanh toán thành công.
          </p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
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
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickFormatter={(value) =>
                value >= 1_000_000
                  ? `${Math.round(value / 1_000_000)}M`
                  : `${Math.round(value / 1_000)}k`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: 12,
                border: "1px solid rgba(148, 163, 184, 0.35)",
              }}
              labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
              formatter={(value, name) => [
                `${Number(value).toLocaleString("vi-VN")} ₫`,
                name === "tongDoanhThu" ? "Doanh thu" : "Lợi nhuận",
              ]}
            />
            <Legend
              verticalAlign="top"
              height={24}
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) =>
                value === "tongDoanhThu" ? "Doanh thu" : "Lợi nhuận"
              }
            />

            <defs>
              <linearGradient id="doanhThuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="loiNhuanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="tongDoanhThu"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#doanhThuGradient)"
            />
            <Area
              type="monotone"
              dataKey="loiNhuan"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#loiNhuanGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default BieuDoDoanhThu;
