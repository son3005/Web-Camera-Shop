// src/components/admin/inventory/ProductEditModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { san_pham_update_schema } from '../../../validation/san_pham';
import { useChiTietSanPham, useCapNhatSanPham } from '../../../hooks/use_san_pham';
import { Dialog } from '@headlessui/react';
import BienTheForm from './BienTheForm';

export default function ProductEditModal({ id, onClose }) {
  const { data: originalData } = useChiTietSanPham(id);
  const { mutate } = useCapNhatSanPham();
  const [bienTheList, setBienTheList] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: yupResolver(san_pham_update_schema),
  });

  useEffect(() => {
    if (originalData) {
      reset(originalData);
      setBienTheList(originalData.cac_bien_the.map(bt => ({ ...bt, isModified: false })));
    }
  }, [originalData, reset]);

  const onSubmit = (formData) => {
    const changes = {};
    Object.keys(formData).forEach(key => {
      if (JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])) {
        changes[key] = formData[key];
      }
    });

    const bienTheChanges = bienTheList.filter(bt => bt.isNew || bt.isModified).map(bt => {
      const changeBt = { ...bt };
      delete changeBt.isNew;
      delete changeBt.isModified;
      return changeBt;
    });

    if (bienTheChanges.length > 0) {
      changes.cac_bien_the = bienTheChanges;
    }

    if (Object.keys(changes).length > 0) {
      mutate({ id, payload: changes });
    }
    onClose();
  };

  return (
    <Dialog open={!!id} onClose={onClose} className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Chỉnh sửa sản phẩm</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('ten_san_pham')} placeholder="Tên sản phẩm" className="border p-2 w-full mb-2" />
            {errors.ten_san_pham && <p className="text-red-500">{errors.ten_san_pham.message}</p>}

            <BienTheForm list={bienTheList} setList={setBienTheList} san_pham_id={id} />

            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}