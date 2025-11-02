// src/components/admin/inventory/AddProductModal.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { san_pham_create_schema } from '../../../validation/san_pham';
import { useTaoSanPham } from '../../../hooks/use_san_pham';
import { Dialog } from '@headlessui/react';
import BienTheForm from './BienTheForm';

export default function AddProductModal({ onClose }) {
  const { mutate } = useTaoSanPham();
  const [bienTheList, setBienTheList] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(san_pham_create_schema),
  });

  const onSubmit = (data) => {
    mutate({
      ...data,
      bien_the_san_phams: bienTheList,
    });
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Thêm sản phẩm</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('ten_san_pham')} placeholder="Tên" className="border p-2 w-full mb-2" />
            {errors.ten_san_pham && <p className="text-red-500">{errors.ten_san_pham.message}</p>}
            <input {...register('danh_muc_id')} type="number" placeholder="ID Danh mục" className="border p-2 w-full mb-2" />
            {errors.danh_muc_id && <p className="text-red-500">{errors.danh_muc_id.message}</p>}
            <input {...register('thuong_hieu_id')} type="number" placeholder="ID Thương hiệu" className="border p-2 w-full mb-2" />
            {errors.thuong_hieu_id && <p className="text-red-500">{errors.thuong_hieu_id.message}</p>}

            <BienTheForm list={bienTheList} setList={setBienTheList} san_pham_id={null} />

            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Tạo</button>
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}