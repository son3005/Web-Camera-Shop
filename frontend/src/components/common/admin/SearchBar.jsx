// src/components/admin/inventory/SearchBar.jsx
import React from 'react';

export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Tìm tên hoặc mã sản phẩm..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 border rounded-lg w-64"
    />
  );
}