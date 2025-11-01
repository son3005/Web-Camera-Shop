// src/components/admin/ThongSoKyThuatView.jsx
import React, { useMemo } from "react";
import { propertyGroups } from "../../../constants/productProperties"; 

/**
 * Hiển thị thông số kỹ thuật
 * @param {{thong_so_ky_thuat: Object<string, any>}} props
 */
export const ThongSoKyThuatView = ({ thong_so_ky_thuat }) => {
  // Tạo một map (dictionary) từ { key: label } để tra cứu nhanh
  const labelMap = useMemo(() => {
    const map = {};
    // Object.values(propertyGroups) là [ [...], [...], ... ]
    // .flat() sẽ biến nó thành một mảng [ {key, label}, {key, label}, ... ]
    Object.values(propertyGroups)
      .flat()
      .forEach((prop) => {
        map[prop.key] = prop.label;
      });
    return map;
  }, []);

  if (!thong_so_ky_thuat || Object.keys(thong_so_ky_thuat).length === 0) {
    return <p className="text-gray-500 italic">Chưa cập nhật thông số.</p>;
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {Object.entries(thong_so_ky_thuat).map(([key, value]) => (
        <li key={key} className="border-b border-gray-100 py-1">
          {/* Tra cứu label, nếu không thấy thì dùng key (viết hoa chữ cái đầu) */}
          <span className="font-semibold">
            {labelMap[key] ||
              key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
            :
          </span>{" "}
          <span className="text-gray-700">
            {typeof value === "boolean" ? (value ? "Có" : "Không") : value}
          </span>
        </li>
      ))}
    </ul>
  );
};