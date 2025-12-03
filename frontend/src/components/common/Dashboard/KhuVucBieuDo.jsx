// src/components/common/Dashboard/KhuVucBieuDo.jsx
import React, { useState } from "react";
import BieuDoDoanhThu from "./BieuDoDoanhThu";
import BieuDoThuongHieu from "./BieuDoThuongHieu";
import BieuDoNguoiDungMoi from "./BieuDoNguoiDungMoi";
import BieuDoDonHangThanhCong from "./BieuDoDonHangThanhCong";
import BieuDoDangNhap from "./BieuDoDangNhap";
import BieuDoDanhGia from "./BieuDoDanhGia";

function KhuVucBieuDo() {
  const currentYear = new Date().getFullYear();
  const [nam, setNam] = useState(null);
  const [thang, setThang] = useState(null);

  const years = [];
  for (let y = currentYear; y >= currentYear - 4; y--) {
    years.push(y);
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề + bộ lọc thời gian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Thống kê chi tiết
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Áp dụng cùng bộ lọc thời gian cho tất cả biểu đồ bên dưới để dễ so
            sánh số liệu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Năm:</span>
            <select
              className="text-sm rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 shadow-sm"
              value={nam ?? ""}
              onChange={(e) =>
                setNam(e.target.value === "" ? null : Number(e.target.value))
              }
            >
              <option value="">Tất cả</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Tháng:</span>
            <select
              className="text-sm rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 shadow-sm"
              value={thang ?? ""}
              onChange={(e) =>
                setThang(e.target.value === "" ? null : Number(e.target.value))
              }
            >
              <option value="">Tất cả</option>
              {Array.from({ length: 12 }).map((_, i) => {
                const m = i + 1;
                return (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Hàng 1: Doanh thu + tỉ trọng thương hiệu */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BieuDoDoanhThu nam={nam} thang={thang} />
        </div>
        <BieuDoThuongHieu nam={nam} thang={thang} />
      </div>

      {/* Hàng 2: Người dùng mới + Đơn hàng thành công */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BieuDoNguoiDungMoi nam={nam} thang={thang} />
        <BieuDoDonHangThanhCong nam={nam} thang={thang} />
      </div>

      {/* Hàng 3: Người dùng hoạt động + Đánh giá */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BieuDoDangNhap nam={nam} thang={thang} />
        <BieuDoDanhGia nam={nam} thang={thang} />
      </div>
    </div>
  );
}

export default KhuVucBieuDo;
