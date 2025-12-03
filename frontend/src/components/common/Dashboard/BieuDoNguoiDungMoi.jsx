// src/components/common/Dashboard/BieuDoNguoiDungMoi.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { layThongKeNguoiDungMoi } from "../../../api/thongKeApi";

function BieuDoNguoiDungMoi({ nam, thang }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "thong-ke-nguoi-dung-moi",
      { nam: nam ?? null, thang: thang ?? null },
    ],
    queryFn: () => layThongKeNguoiDungMoi({ nam, thang }),
  });

  const chartData =
    data?.map((item) => ({
      nhan: item.thang ? `${item.thang}/${item.nam}` : `${item.nam}`,
      soNguoiDungMoi: item.soNguoiDungMoi,
    })) || [];

  const hasData = chartData.some((x) => x.soNguoiDungMoi > 0);

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
        Người dùng mới
      </h3>
      <p className="text-xs text-slate-400">{filterLabel}</p>
      <p className="text-xs text-slate-400 mb-4">
        Đếm theo trường <span className="font-semibold">ngay_tao</span> của tài
        khoản.
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
            Chưa có người dùng mới trong khoảng thời gian này.
          </p>
        </div>
      ) : (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
                formatter={(value) => [`${value} người`, "Người dùng mới"]}
              />
              <Line
                type="monotone"
                dataKey="soNguoiDungMoi"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default BieuDoNguoiDungMoi;
