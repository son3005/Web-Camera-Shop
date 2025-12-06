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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 h-[260px] shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Người dùng mới
      </h3>
      <p className="text-xs text-slate-500">{filterLabel}</p>
      <p className="text-xs text-slate-500 mb-4">
        Đếm theo trường{" "}
        <span className="font-semibold text-slate-700">ngay_tao</span> của tài
        khoản.
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
            Chưa có người dùng mới trong khoảng thời gian này.
          </p>
        </div>
      ) : (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 0, bottom: 30 }} // ⬅ tạo không gian cho label X
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
                tickMargin={8} // ⬅ đẩy label lên 1 chút
              />
              <YAxis
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />
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
                formatter={(value) => [`${value} người`, "Người dùng mới"]}
              />
              <Line
                type="monotone"
                dataKey="soNguoiDungMoi"
                stroke="#0ea5e9" // xanh dương brand
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
