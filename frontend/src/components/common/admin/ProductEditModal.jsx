// components/ProductEditModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productApi, variantApi, uploadApi, catalogApi } from '../../../api/productApi';

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uploadingImages, setUploadingImages] = useState({});
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

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

  // Khởi tạo form data khi product thay đổi
  useEffect(() => {
    if (product) {
      reset({
        ten_san_pham: product.ten_san_pham,
        mo_ta: product.mo_ta || '',
        danh_muc_id: product.danh_muc_id,
        thuong_hieu_id: product.thuong_hieu_id,
        thong_so_ky_thuat: product.thong_so_ky_thuat ? JSON.stringify(product.thong_so_ky_thuat, null, 2) : '{}',
        trang_thai: product.trang_thai || 'dang_ban'
      });
      setVariants(product.cac_bien_the?.map(variant => ({
        ...variant,
        isExisting: true // Đánh dấu biến thể đã tồn tại
      })) || []);
    }
  }, [product, reset]);

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Cập nhật sản phẩm thành công');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Lỗi khi cập nhật sản phẩm');
    }
  });

  // Upload image handler
  const handleImageUpload = async (variantIndex, file) => {
    if (!file) return;

    const variantId = `variant-${variantIndex}`;
    setUploadingImages(prev => ({ ...prev, [variantId]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadApi.uploadImage(formData);
      
      // Add image to variant
      const updatedVariants = [...variants];
      const newImage = {
        url: result.url,
        public_id: result.public_id,
        alt_text: file.name,
        la_anh_dai_dien: updatedVariants[variantIndex].hinh_anhs.length === 0 // First image is main
      };
      
      updatedVariants[variantIndex].hinh_anhs.push(newImage);
      setVariants(updatedVariants);
      
      toast.success('Upload ảnh thành công');
    } catch (error) {
      toast.error('Lỗi khi upload ảnh');
    } finally {
      setUploadingImages(prev => ({ ...prev, [variantId]: false }));
    }
  };

  const removeImageFromVariant = (variantIndex, imageIndex) => {
    const updatedVariants = [...variants];
    const imageToRemove = updatedVariants[variantIndex].hinh_anhs[imageIndex];
    
    // If we're removing the main image and there are other images, set the first one as main
    if (imageToRemove.la_anh_dai_dien && updatedVariants[variantIndex].hinh_anhs.length > 1) {
      const newMainIndex = imageIndex === 0 ? 1 : 0;
      updatedVariants[variantIndex].hinh_anhs[newMainIndex].la_anh_dai_dien = true;
    }
    
    updatedVariants[variantIndex].hinh_anhs.splice(imageIndex, 1);
    setVariants(updatedVariants);
  };

  const setMainImage = (variantIndex, imageIndex) => {
    const updatedVariants = [...variants];
    
    // Reset all images in this variant to not main
    updatedVariants[variantIndex].hinh_anhs.forEach(img => {
      img.la_anh_dai_dien = false;
    });
    
    // Set the selected image as main
    updatedVariants[variantIndex].hinh_anhs[imageIndex].la_anh_dai_dien = true;
    
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([...variants, {
      id: `temp-${Date.now()}`,
      ten_bien_the: '',
      gia_ban: 0,
      gia_khuyen_mai: null,
      ngay_bat_dau_khuyen_mai: null,
      ngay_ket_thuc_khuyen_mai: null,
      so_luong_ton: 0,
      trang_thai_kich_hoat: 'dang_ban',
      hinh_anhs: [],
      isNew: true
    }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    
    // Xử lý đặc biệt cho các trường datetime
    if (field === 'ngay_bat_dau_khuyen_mai' || field === 'ngay_ket_thuc_khuyen_mai') {
      updated[index][field] = value ? new Date(value).toISOString() : null;
    } else {
      updated[index][field] = value;
    }
    
    setVariants(updated);
  };

  const onSubmit = async (formData) => {
    try {
      // Prepare product data
      const productData = {
        ten_san_pham: formData.ten_san_pham,
        mo_ta: formData.mo_ta,
        danh_muc_id: parseInt(formData.danh_muc_id),
        thuong_hieu_id: parseInt(formData.thuong_hieu_id),
        thong_so_ky_thuat: JSON.parse(formData.thong_so_ky_thuat || '{}'),
        trang_thai: formData.trang_thai,
        cac_bien_the: variants.map(variant => {
          const variantData = {
            ten_bien_the: variant.ten_bien_the,
            gia_ban: parseFloat(variant.gia_ban),
            gia_khuyen_mai: variant.gia_khuyen_mai ? parseFloat(variant.gia_khuyen_mai) : null,
            ngay_bat_dau_khuyen_mai: variant.ngay_bat_dau_khuyen_mai,
            ngay_ket_thuc_khuyen_mai: variant.ngay_ket_thuc_khuyen_mai,
            so_luong_ton: parseInt(variant.so_luong_ton),
            trang_thai_kich_hoat: variant.trang_thai_kich_hoat,
            new_hinh_anhs: variant.hinh_anhs.filter(img => !img.id), // Only new images (without id)
            deleted_hinh_anh_ids: [] // You can implement deletion logic here
          };

          // For existing variants, include the id
          if (variant.isExisting && !variant.isNew) {
            variantData.id = variant.id;
          }

          return variantData;
        })
      };

      await updateProductMutation.mutateAsync({
        id: product.id,
        data: productData
      });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa Sản phẩm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  {...register('ten_san_pham', { 
                    required: 'Tên sản phẩm là bắt buộc',
                    minLength: {
                      value: 2,
                      message: 'Tên sản phẩm phải có ít nhất 2 ký tự'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.ten_san_pham && (
                  <p className="text-red-500 text-sm mt-1">{errors.ten_san_pham.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái *
                </label>
                <select
                  {...register('trang_thai', { required: 'Trạng thái là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dang_ban">Đang bán</option>
                  <option value="ngung_ban">Ngừng bán</option>
                  <option value="het_hang">Hết hàng</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sản phẩm
              </label>
              <textarea
                {...register('mo_ta')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  {...register('danh_muc_id', { required: 'Danh mục là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.ten_danh_muc}
                    </option>
                  ))}
                </select>
                {errors.danh_muc_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.danh_muc_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thương hiệu *
                </label>
                <select
                  {...register('thuong_hieu_id', { required: 'Thương hiệu là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.ten_thuong_hieu}
                    </option>
                  ))}
                </select>
                {errors.thuong_hieu_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.thuong_hieu_id.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Thông số kỹ thuật</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông số kỹ thuật (JSON format)
              </label>
              <textarea
                {...register('thong_so_ky_thuat')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder='{"sensor": "24MP", "video": "4K30", "iso": "100-25600"}'
              />
            </div>
          </div>

          {/* Product Variants */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Biến thể sản phẩm</h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm biến thể
              </button>
            </div>

            <div className="space-y-6">
              {variants.map((variant, variantIndex) => (
                <div key={variant.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">
                      Biến thể {variantIndex + 1} {variant.isNew && '(Mới)'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Variant Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên biến thể *
                      </label>
                      <input
                        value={variant.ten_bien_the}
                        onChange={(e) => updateVariant(variantIndex, 'ten_bien_the', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: Body Only, Kit 18-55mm"
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
                        onChange={(e) => updateVariant(variantIndex, 'gia_ban', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="1000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá khuyến mãi
                      </label>
                      <input
                        type="number"
                        value={variant.gia_khuyen_mai || ''}
                        onChange={(e) => updateVariant(variantIndex, 'gia_khuyen_mai', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="1000"
                        placeholder="Không bắt buộc"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày bắt đầu KM
                      </label>
                      <input
                        type="datetime-local"
                        value={formatDateForInput(variant.ngay_bat_dau_khuyen_mai)}
                        onChange={(e) => updateVariant(variantIndex, 'ngay_bat_dau_khuyen_mai', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày kết thúc KM
                      </label>
                      <input
                        type="datetime-local"
                        value={formatDateForInput(variant.ngay_ket_thuc_khuyen_mai)}
                        onChange={(e) => updateVariant(variantIndex, 'ngay_ket_thuc_khuyen_mai', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số lượng tồn *
                      </label>
                      <input
                        type="number"
                        value={variant.so_luong_ton}
                        onChange={(e) => updateVariant(variantIndex, 'so_luong_ton', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Variant Status */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái biến thể
                    </label>
                    <select
                      value={variant.trang_thai_kich_hoat}
                      onChange={(e) => updateVariant(variantIndex, 'trang_thai_kich_hoat', e.target.value)}
                      className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="dang_ban">Đang bán</option>
                      <option value="ngung_ban">Ngừng bán</option>
                      <option value="het_hang">Hết hàng</option>
                    </select>
                  </div>

                  {/* Variant Images */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh biến thể
                    </label>
                    
                    {/* Image Upload */}
                    <div className="mb-3">
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Tải lên ảnh</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(variantIndex, e.target.files[0])}
                          disabled={uploadingImages[`variant-${variantIndex}`]}
                        />
                      </label>
                      {uploadingImages[`variant-${variantIndex}`] && (
                        <p className="text-sm text-blue-600 mt-1">Đang tải lên...</p>
                      )}
                    </div>

                    {/* Image Gallery */}
                    {variant.hinh_anhs && variant.hinh_anhs.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {variant.hinh_anhs.map((image, imageIndex) => (
                          <div key={image.id || imageIndex} className="relative group">
                            <img
                              src={image.url}
                              alt={image.alt_text}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                            />
                            
                            {/* Main Image Badge */}
                            {image.la_anh_dai_dien && (
                              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Chính
                              </div>
                            )}
                            
                            {/* Image Actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              {!image.la_anh_dai_dien && (
                                <button
                                  type="button"
                                  onClick={() => setMainImage(variantIndex, imageIndex)}
                                  className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                                  title="Đặt làm ảnh chính"
                                >
                                  <ImageIcon className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImageFromVariant(variantIndex, imageIndex)}
                                className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                                title="Xóa ảnh"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {variants.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p>Chưa có biến thể nào</p>
                <p className="text-sm">Nhấn "Thêm biến thể" để bắt đầu</p>
              </div>
            )}
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
              disabled={updateProductMutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {updateProductMutation.isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </span>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;