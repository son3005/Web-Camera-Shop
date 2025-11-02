// src/components/admin/inventory/BienTheForm.jsx
import React from 'react';
import ImageUploader from './ImageUploader';
import { useThemBienThe, useXoaBienThe} from '../../../hooks/use_bien_the';
import {useXoaHinhAnh} from "../../../hooks/use_hinh_anh"
import { useCapNhatBienThe } from '../../../hooks/use_bien_the';

export default function BienTheForm({ list, setList, san_pham_id }) {
  const { mutate: them } = useThemBienThe(san_pham_id);
  const { mutate: capNhat } = useCapNhatBienThe(san_pham_id);
  const { mutate: xoaHinhAnh } = useXoaHinhAnh(san_pham_id);

  const addBienThe = () => {
    const newBt = {
      ten_bien_the: '',
      gia_ban: 0,
      so_luong_ton: 0,
      hinh_anhs: [],
      isNew: true,
    };
    setList([...list, newBt]);
  };

  const updateBienThe = (index, field, value) => {
    const newList = [...list];
    newList[index][field] = value;
    newList[index].isModified = true;
    setList(newList);
  };

  const handleImageUpload = (index, newImage) => {
    const newList = [...list];
    newList[index].hinh_anhs.push(newImage);
    newList[index].isModified = true;
    setList(newList);
  };

  const handleSetDaiDien = (btIndex, imgIndex) => {
    const newList = [...list];
    newList[btIndex].hinh_anhs = newList[btIndex].hinh_anhs.map((img, idx) => ({
      ...img,
      la_anh_dai_dien: idx === imgIndex,
    }));
    newList[btIndex].isModified = true;
    setList(newList);
  };

  const handleImageDelete = (btIndex, img) => {
    const newList = [...list];
    newList[btIndex].hinh_anhs = newList[btIndex].hinh_anhs.filter(i => i.public_id !== img.public_id);
    newList[btIndex].isModified = true;
    setList(newList);

    if (img.id) {
      const bien_the_id = list[btIndex].id;
      xoaHinhAnh({ bien_the_id, hinh_anh_id: img.id });
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-semibold text-lg">Biến thể sản phẩm</h3>
      {list.map((bt, i) => (
        <div key={i} className="border p-4 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder="Tên biến thể (màu, kích thước...)"
              value={bt.ten_bien_the || ''}
              onChange={e => updateBienThe(i, 'ten_bien_the', e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Giá bán"
              value={bt.gia_ban}
              onChange={e => updateBienThe(i, 'gia_ban', Number(e.target.value))}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Số lượng tồn"
              value={bt.so_luong_ton}
              onChange={e => updateBienThe(i, 'so_luong_ton', Number(e.target.value))}
              className="border p-2 rounded"
            />
          </div>

          <ImageUploader
            existingImages={bt.hinh_anhs}
            onUploadSuccess={(img) => handleImageUpload(i, img)}
            onDelete={(img) => handleImageDelete(i, img)}
            onSetDaiDien={(imgIndex) => handleSetDaiDien(i, imgIndex)}
          />

          <button
            type="button"
            onClick={() => {
              if (bt.id) {
                if (window.confirm('Xóa biến thể này?')) {
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const { mutate: xoa } = useXoaBienThe(san_pham_id, bt.id);
                  xoa();
                }
              }
              setList(list.filter((_, idx) => idx !== i));
            }}
            className="mt-3 text-red-600 text-sm"
          >
            Xóa biến thể
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addBienThe}
        className="text-blue-600 font-medium"
      >
        + Thêm biến thể
      </button>
    </div>
  );
}