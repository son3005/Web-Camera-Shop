// src/pages/admin/SanPhamTable.jsx
import React from "react";
import {
  tinhTongTonKho,
  tinhKhoangGia,
  formatCurrency,
} from "../../utils/productUtils";
import { Eye, Edit, Trash2 } from "lucide-react";

export const SanPhamTable = ({ sanPhams = [], onEdit, onView, onDelete }) => {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {[
              "Mã SP",
              "Tên Sản Phẩm",
              "Danh Mục",
              "Thương Hiệu",
              "Khoảng Giá",
              "Tổng Tồn Kho",
              "Hành Động",
            ].map((header) => (
              <th key={header} scope="col" className="px-6 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sanPhams.map((sp) => {
            const khoangGia = tinhKhoangGia(sp.cac_bien_the);
            const tongTon = tinhTongTonKho(sp.cac_bien_the);

            return (
              <tr key={sp.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{sp.ma_san_pham}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {sp.ten_san_pham}
                </td>
                <td className="px-6 py-4">{sp.danh_muc.ten_danh_muc}</td>
                <td className="px-6 py-4">{sp.thuong_hieu.ten_thuong_hieu}</td>
                <td className="px-6 py-4">
                  {khoangGia.min === khoangGia.max
                    ? formatCurrency(khoangGia.min)
                    : `${formatCurrency(khoangGia.min)} - ${formatCurrency(
                        khoangGia.max,
                      )}`}
                </td>
                <td className="px-6 py-4">{tongTon}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => onView(sp.id)}
                    className="font-medium text-blue-600 hover:text-blue-800"
                    title="Xem chi tiết"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(sp.id)}
                    className="font-medium text-yellow-600 hover:text-yellow-800"
                    title="Chỉnh sửa"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(sp.id, sp.ten_san_pham)}
                    className="font-medium text-red-600 hover:text-red-800"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};