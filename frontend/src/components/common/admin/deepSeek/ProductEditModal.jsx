// components/ProductEditModal.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [variants, setVariants] = useState(product.cac_bien_the || []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      ten_san_pham: product.ten_san_pham,
      mo_ta: product.mo_ta,
      danh_muc_id: product.danh_muc_id,
      thuong_hieu_id: product.thuong_hieu_id,
      thong_so_ky_thuat: JSON.stringify(product.thong_so_ky_thuat, null, 2)
    }
  });

  const addVariant = () => {
    setVariants([...variants, {
      id: Date.now(), // Temporary ID
      ten_bien_the: '',
      gia_ban: 0,
      gia_khuyen_mai: null,
      so_luong_ton: 0,
      trang_thai_kich_hoat: 'dang_ban',
      hinh_anhs: []
    }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const onSubmit = (data) => {
    const updatedProduct = {
      ...data,
      thong_so_ky_thuat: JSON.parse(data.thong_so_ky_thuat),
      cac_bien_the: variants
    };
    onSave(updatedProduct);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa Sản phẩm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm *
              </label>
              <input
                {...register('ten_san_pham', { required: 'Tên sản phẩm là bắt buộc' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.ten_san_pham && (
                <p className="text-red-500 text-sm mt-1">{errors.ten_san_pham.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                {...register('mo_ta')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Technical Specs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thông số kỹ thuật (JSON)
            </label>
            <textarea
              {...register('thong_so_ky_thuat')}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>

          {/* Variants */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Biến thể sản phẩm</h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Thêm biến thể
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={variant.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Biến thể {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên biến thể *
                      </label>
                      <input
                        value={variant.ten_bien_the}
                        onChange={(e) => updateVariant(index, 'ten_bien_the', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá bán *
                      </label>
                      <input
                        type="number"
                        value={variant.gia_ban}
                        onChange={(e) => updateVariant(index, 'gia_ban', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số lượng tồn *
                      </label>
                      <input
                        type="number"
                        value={variant.so_luong_ton}
                        onChange={(e) => updateVariant(index, 'so_luong_ton', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;