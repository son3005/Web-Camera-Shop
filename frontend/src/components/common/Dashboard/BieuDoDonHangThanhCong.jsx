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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 h-[260px] shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Đơn hàng thành công
      </h3>
      <p className="text-xs text-slate-500">{filterLabel}</p>
      <p className="text-xs text-slate-500 mb-4">
        Số đơn ở trạng thái{" "}
        <span className="font-semibold text-slate-700">
          DA_GIAO (đơn đã giao thành công)
        </span>
        .
      </p>

      {isLoading ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-slate-500 text-sm animate-pulse">Đang tải...</p>
        </div>
      ) : isError ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-red-600 text-sm">
            Lỗi khi tải thống kê: {error?.message}
          </p>
        </div>
      ) : !hasData ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">
            Chưa có đơn hàng thành công trong khoảng thời gian này.
          </p>
        </div>
      ) : (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 0, bottom: 30 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
                opacity={0.9}
              />
              <XAxis
                dataKey="nhan"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickMargin={8}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />

              {/* Tooltip nền sáng, KHÔNG dùng formatter nữa */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 12px 30px rgba(15,23,42,0.16)",
                  color: "#0f172a",
                }}
                labelStyle={{ color: "#64748b", fontSize: 12 }}
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
