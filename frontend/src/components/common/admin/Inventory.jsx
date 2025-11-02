// src/components/admin/inventory/Inventory.jsx
import React, { useState } from 'react';
import ProductTable from './ProductTable';
import ProductDetailModal from './ProductDetailModal';
import ProductEditModal from './ProductEditModal';
import AddProductModal from './AddProductModal';
import { Toaster } from 'react-hot-toast';

export default function Inventory() {
  const [detailId, setDetailId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const openDetail = (id) => setDetailId(id);
  const closeDetail = () => setDetailId(null);
  const openEdit = (id) => setEditId(id);
  const closeEdit = () => setEditId(null);
  const openAdd = () => setIsAddOpen(true);
  const closeAdd = () => setIsAddOpen(false);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6">Quản lý tồn kho</h1>

      <ProductTable
        onView={openDetail}
        onEdit={openEdit}
        onAdd={openAdd}
      />

      {detailId && <ProductDetailModal id={detailId} onClose={closeDetail} />}
      {editId && <ProductEditModal id={editId} onClose={closeEdit} />}
      {isAddOpen && <AddProductModal onClose={closeAdd} />}
    </div>
  );
}