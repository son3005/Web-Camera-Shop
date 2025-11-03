import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productApi, catalogApi, uploadApi } from '../../../api/productApi';
import { productSchema } from '../../../validation/productSchemas';

const ProductAddModal = ({ onClose, onSave }) => {
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uploadingImages, setUploadingImages] = useState({});

  const queryClient = useQueryClient();

  // Sử dụng react-hook-form với Yup validation
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch 
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      trang_thai: 'dang_ban',
      thong_so_ky_thuat: '{}',
      bien_the_san_phams: []
    }
  });

  // Theo dõi changes của variants để cập nhật form
  useEffect(() => {
    setValue('bien_the_san_phams', variants, { shouldValidate: true });
  }, [variants, setValue]);

  // Fetch danh mục và thương hiệu
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getBrands()
        ]);
        setCategories(categoriesData.data || []);
        setBrands(brandsData.data || []);
      } catch (error) {
        toast.error('Lỗi khi tải danh mục và thương hiệu');
      }
    };
    fetchCatalogs();
  }, []);

  // Tạo sản phẩm mutation - ĐÃ SỬA
  const createProductMutation = useMutation({
    mutationFn: (productData) => {
      // Chuyển đổi dữ liệu trước khi gửi
      const formattedData = {
        ...productData,
        thong_so_ky_thuat: productData.thong_so_ky_thuat 
          ? JSON.parse(productData.thong_so_ky_thuat)
          : {},
        bien_the_san_phams: productData.bien_the_san_phams.map(variant => ({
          ...variant,
          gia_ban: Number(variant.gia_ban),
          gia_khuyen_mai: variant.gia_khuyen_mai ? Number(variant.gia_khuyen_mai) : null,
          so_luong_ton: Number(variant.so_luong_ton),
          // Đảm bảo hinh_anhs luôn là mảng
          hinh_anhs: variant.hinh_anhs || []
        }))
      };
      
      return productApi.createProduct(formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Tạo sản phẩm thành công');
      onClose();
    },
    onError: (error) => {
      console.error('Create product error:', error);
      toast.error(error.response?.data?.error || 'Lỗi khi tạo sản phẩm');
    }
  });

  // Upload image handler - ĐÃ SỬA
  const handleImageUpload = async (variantIndex, file) => {
    if (!file) return;

    const variantId = `variant-${variantIndex}`;
    setUploadingImages(prev => ({ ...prev, [variantId]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadApi.uploadImage(formData);
      
      // Thêm ảnh vào biến thể
      const updatedVariants = [...variants];
      const newImage = {
        url: result.url,
        public_id: result.public_id,
        alt_text: file.name,
        la_anh_dai_dien: updatedVariants[variantIndex].hinh_anhs.length === 0
      };
      
      updatedVariants[variantIndex].hinh_anhs = [
        ...updatedVariants[variantIndex].hinh_anhs,
        newImage
      ];
      setVariants(updatedVariants);
      
      toast.success('Upload ảnh thành công');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Lỗi khi upload ảnh');
    } finally {
      setUploadingImages(prev => ({ ...prev, [variantId]: false }));
    }
  };

  // Remove image từ biến thể - ĐÃ SỬA
  const removeImageFromVariant = (variantIndex, imageIndex) => {
    const updatedVariants = [...variants];
    const imageToRemove = updatedVariants[variantIndex].hinh_anhs[imageIndex];
    
    // Nếu xóa ảnh đại diện và còn ảnh khác, set ảnh đầu tiên làm đại diện
    if (imageToRemove.la_anh_dai_dien && updatedVariants[variantIndex].hinh_anhs.length > 1) {
      const remainingImages = updatedVariants[variantIndex].hinh_anhs.filter((_, idx) => idx !== imageIndex);
      if (remainingImages.length > 0) {
        remainingImages[0].la_anh_dai_dien = true;
      }
    }
    
    updatedVariants[variantIndex].hinh_anhs = updatedVariants[variantIndex].hinh_anhs.filter(
      (_, idx) => idx !== imageIndex
    );
    setVariants(updatedVariants);
  };

  // Set ảnh chính - ĐÃ SỬA
  const setMainImage = (variantIndex, imageIndex) => {
    const updatedVariants = [...variants];
    
    // Reset tất cả ảnh trong biến thể này
    updatedVariants[variantIndex].hinh_anhs.forEach((img, idx) => {
      img.la_anh_dai_dien = idx === imageIndex;
    });
    
    setVariants(updatedVariants);
  };

  // Thêm biến thể mới - ĐÃ SỬA
  const addVariant = () => {
    const newVariant = {
      ten_bien_the: '',
      gia_ban: 0,
      gia_khuyen_mai: null,
      ngay_bat_dau_khuyen_mai: null,
      ngay_ket_thuc_khuyen_mai: null,
      so_luong_ton: 0,
      trang_thai_kich_hoat: 'dang_ban',
      hinh_anhs: []
    };
    
    setVariants([...variants, newVariant]);
  };

  // Xóa biến thể - ĐÃ SỬA
  const removeVariant = (index) => {
    if (variants.length <= 1) {
      toast.error('Phải có ít nhất một biến thể');
      return;
    }
    
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Cập nhật biến thể - ĐÃ SỬA
  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    
    // Xử lý các trường đặc biệt
    if (field === 'ngay_bat_dau_khuyen_mai' || field === 'ngay_ket_thuc_khuyen_mai') {
      updated[index][field] = value ? new Date(value).toISOString() : null;
    } else if (field === 'gia_ban' || field === 'gia_khuyen_mai' || field === 'so_luong_ton') {
      // Chuyển đổi số
      updated[index][field] = value === '' ? null : Number(value);
    } else {
      updated[index][field] = value;
    }
    
    setVariants(updated);
  };

  // Submit form - ĐÃ SỬA
  const onSubmit = async (formData) => {
    try {
      // Validation đã được xử lý tự động bởi Yup
      await createProductMutation.mutateAsync(formData);
    } catch (error) {
      // Error đã được xử lý trong mutation
      console.error('Submit error:', error);
    }
  };

  // Format date cho input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Thêm Sản Phẩm Mới</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information - ĐÃ CẬP NHẬT VALIDATION */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  {...register('ten_san_pham')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.ten_san_pham ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.ten_san_pham && (
                  <p className="text-red-500 text-sm mt-1">{errors.ten_san_pham.message}</p>
                )}
              </div>

              {/* Các trường khác với validation tương tự... */}
            </div>
          </div>

          {/* Product Variants với validation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Biến thể sản phẩm *</h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm biến thể
              </button>
            </div>

            {errors.bien_the_san_phams && (
              <p className="text-red-500 text-sm mb-4">{errors.bien_the_san_phams.message}</p>
            )}

            <div className="space-y-6">
              {variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="border border-gray-200 rounded-lg p-4 bg-white">
                  {/* Biến thể form... */}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={createProductMutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {createProductMutation.isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </span>
              ) : (
                'Tạo sản phẩm'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductAddModal;