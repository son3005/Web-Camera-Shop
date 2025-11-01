// src/pages/admin/SanPhamFormModal.jsx
import React from "react";
import { SanPhamForm } from "./SanPhamForm";
import { X } from "lucide-react";

export const SanPhamFormModal = ({ sanPhamId, onClose }) => {
  const isEdit = !!sanPhamId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Chỉnh sửa Sản phẩm" : "Thêm mới Sản phẩm"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Render Form chính */}
        <SanPhamForm sanPhamId={sanPhamId} onClose={onClose} />
      </div>
    </div>
  );
};