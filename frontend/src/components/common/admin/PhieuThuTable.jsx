import React from "react";
import { Eye } from "lucide-react";

export default function PhieuThuTable({ data, onView }) {
  if (!data || data.length === 0)
    return (
      <div className="text-center text-slate-500 py-10 bg-white/70 dark:bg-slate-900/60 rounded-2xl">
        Chưa có phiếu thu nào.
      </div>
    );

  return (
    <div className="overflow-x-auto bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th className="text-left p-4 font-semibold">Mã Phiếu Thu</th>
            <th className="text-left p-4 font-semibold">Nhà Cung Cấp</th>
            <th className="text-left p-4 font-semibold">Ngày Thu</th>
            <th className="text-right p-4 font-semibold">Tổng SL</th>
            <th className="text-right p-4 font-semibold">Tổng Giá Trị</th>
            <th className="text-center p-4 font-semibold">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {data.map((pt) => (
            <tr
              key={pt.id}
              className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
            >
              <td className="p-4">{pt.ma_phieu_thu}</td>
              <td className="p-4">{pt.ten_nha_cung_cap}</td>
              <td className="p-4">{new Date(pt.ngay_thu).toLocaleDateString()}</td>
              <td className="p-4 text-right">{pt.tong_so_luong}</td>
              <td className="p-4 text-right font-semibold text-emerald-600">
                {Number(pt.tong_gia_tri).toLocaleString("vi-VN")}₫
              </td>
              <td className="p-4 text-center">
                <button
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg"
                  onClick={() => onView(pt.id)}
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
