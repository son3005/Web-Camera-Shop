// src/components/common/Dashboard/BieuDoThuongHieu.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { layTiTrongThuongHieu } from "../../../api/thongKeApi";

function BieuDoThuongHieu({ nam, thang }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "thong-ke-ti-trong-thuong-hieu",
      { nam: nam ?? null, thang: thang ?? null },
    ],
    queryFn: () => layTiTrongThuongHieu({ nam, thang }),
  });

  const chartData =
    data?.map((item) => ({
      name: item.tenThuongHieu,
      value: item.tiTrongPhanTram,
      color: item.color,
    })) || [];

  const hasData = chartData.some((x) => x.value > 0);

  const filterLabel =
    nam && thang
      ? `Thời gian: Tháng ${thang}/${nam}`
      : nam
      ? `Thời gian: Năm ${nam}`
      : thang
      ? `Thời gian: Tháng ${thang} (tất cả năm)`
      : "Thời gian: Tất cả dữ liệu";

  return (
    <div className="bg-[#071824] rounded-2xl border border-slate-700/60 p-6 h-[360px]">
      <h3 className="text-base font-semibold text-slate-50 mb-1">
        Tỉ trọng doanh thu theo thương hiệu
      </h3>
      <p className="text-xs text-slate-400">{filterLabel}</p>
      <p className="text-xs text-slate-400 mb-4">
        Dựa trên các đơn hàng đã giao (DA_GIAO), tính theo tổng doanh thu.
      </p>

      {isLoading ? (
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-slate-400 text-sm animate-pulse">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : isError ? (
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-red-300 text-sm">
            Lỗi khi tải thống kê: {error?.message}
          </p>
        </div>
      ) : !hasData ? (
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-slate-400 text-sm">
            Chưa có dữ liệu thương hiệu trong khoảng thời gian này.
          </p>
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}%`,
                  name || "Thương hiệu",
                ]}
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,.35)",
                  fontSize: 12,
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={24}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default BieuDoThuongHieu;
