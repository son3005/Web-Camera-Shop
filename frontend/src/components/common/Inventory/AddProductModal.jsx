// src/components/common/Inventory/AddProduct/AddProductModal.jsx
import React, { useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2, Save } from "lucide-react";
import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";
import { useProducts } from '../../../hooks/useProducts';
import { useCatalogs } from "../../../hooks/useCatalogs";
import { useUpload } from "../../../hooks/useUpload";
import { useToast } from "../../../hooks/useToast";
import { sanPhamCreateSchema, sanPhamUpdateSchema } from '../../../validation/products';

const StatusToggle = ({ label, enabled, onChange, readOnly }) => (
    <div>
        <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">{label}</label>
        <div className="flex items-center gap-4">
            <button 
                type="button" 
                onClick={() => !readOnly && onChange(!enabled)} 
                disabled={readOnly}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:ring-offset-slate-900 ${
                    enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                } ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                }`}/>
            </button>
            <span className={`text-sm font-medium ${
                enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            }`}>
                {enabled ? 'Đang bán' : 'Ngừng bán'}
            </span>
        </div>
    </div>
);

const AddProductModal = ({ mode, productId, onClose }) => {
    const { useGetSanPhamById, useCreateSanPham, useUpdateSanPham } = useProducts();
    const { useGetAllDanhMuc, useGetAllThuongHieu } = useCatalogs();
    const { useGetUploadSignature, useUploadDirect } = useUpload();
    const { success, error } = useToast();

    const getSignatureMutation = useGetUploadSignature();
    const uploadDirectMutation = useUploadDirect();

    // Lấy danh sách danh mục và thương hiệu
    const { data: danhMucData, isLoading: isLoadingDanhMuc } = useGetAllDanhMuc({ page: 1, per_page: 100 });
    const { data: thuongHieuData, isLoading: isLoadingThuongHieu } = useGetAllThuongHieu({ page: 1, per_page: 100 });

    const danhMucList = danhMucData?.data || [];
    const thuongHieuList = thuongHieuData?.data || [];

    // Lấy chi tiết sản phẩm nếu là chỉnh sửa
    const { data: productToEdit, isLoading: isLoadingProduct } = useGetSanPhamById(productId, {
        enabled: mode === 'edit' && !!productId,
    });

    // Mutations
    const createMutation = useCreateSanPham();
    const updateMutation = useUpdateSanPham();

    const methods = useForm({
        resolver: yupResolver(mode === 'add' ? sanPhamCreateSchema : sanPhamUpdateSchema),
        defaultValues: {
            ten_san_pham: '',
            danh_muc_id: '',
            thuong_hieu_id: '',
            mo_ta: '',
            trang_thai: 'dang_ban',
            thong_so_ky_thuat: {},
            bien_the_san_phams: []
        }
    });

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting }, watch, setValue } = methods;

    const [isLoading, setIsLoading] = useState(false);

    // 🔄 HÀM UPLOAD ẢNH ĐƠN GIẢN - CHỈ LẤY URL VÀ PUBLIC_ID
    const uploadImageSimple = async (file) => {
        try {
            console.log('Uploading image:', file.name);
            
            // Lấy signature
            const signatureData = await getSignatureMutation.mutateAsync("san_pham");
            
            // Upload trực tiếp lên Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', signatureData.api_key);
            formData.append('timestamp', signatureData.timestamp);
            formData.append('signature', signatureData.signature);
            formData.append('folder', signatureData.folder);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );

            if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
            
            const result = await response.json();
            console.log('Upload successful:', result.public_id);
            
            return {
                url: result.secure_url,
                public_id: result.public_id,
                alt_text: file.name || 'Product image',
                la_anh_dai_dien: false // Mặc định false, sẽ set sau
            };
        } catch (err) {
            console.error('Upload failed, trying fallback:', err);
            // Fallback: upload qua server
            const fallbackResult = await uploadDirectMutation.mutateAsync(file);
            return {
                url: fallbackResult.url,
                public_id: fallbackResult.public_id,
                alt_text: file.name || 'Product image',
                la_anh_dai_dien: false
            };
        }
    };

    // 🔄 XỬ LÝ UPLOAD ẢNH CHO TẤT CẢ BIẾN THỂ
    const processAllVariantImages = async (bienTheSanPhams) => {
        const processedVariants = [];
        
        for (let i = 0; i < bienTheSanPhams.length; i++) {
            const variant = bienTheSanPhams[i];
            const processedImages = [];
            
            // Upload từng ảnh trong biến thể
            if (variant.hinh_anhs && variant.hinh_anhs.length > 0) {
                for (let j = 0; j < variant.hinh_anhs.length; j++) {
                    const image = variant.hinh_anhs[j];
                    
                    // Nếu là file mới (chưa có URL), thực hiện upload
                    if (image.file && image.file instanceof File) {
                        try {
                            const uploadedImage = await uploadImageSimple(image.file);
                            processedImages.push({
                                ...uploadedImage,
                                la_anh_dai_dien: image.la_anh_dai_dien || (j === 0) // Ảnh đầu tiên là đại diện
                            });
                        } catch (uploadError) {
                            console.error(`Lỗi upload ảnh ${j + 1} cho biến thể ${i + 1}:`, uploadError);
                            throw uploadError;
                        }
                    } else if (image.url) {
                        // Ảnh đã có URL (trong trường hợp edit), giữ nguyên
                        processedImages.push(image);
                    }
                }
            }
            
            // Set ảnh đầu tiên làm đại diện nếu chưa có ảnh nào được set
            if (processedImages.length > 0 && !processedImages.some(img => img.la_anh_dai_dien)) {
                processedImages[0].la_anh_dai_dien = true;
            }
            
            processedVariants.push({
                ...variant,
                hinh_anhs: processedImages
            });
        }
        
        return processedVariants;
    };

    // 🚀 HÀM SUBMIT CHÍNH - ĐÃ ĐƯỢC TỐI ƯU
    const onSubmit = async (data) => {
        setIsLoading(true);
        
        try {
            console.log('Form data received:', data);

            let finalData = { ...data };

            // 🔄 Bước 1: Xử lý upload ảnh trước khi gửi lên server
            if (data.bien_the_san_phams && data.bien_the_san_phams.length > 0) {
                console.log('Processing variant images...');
                finalData.bien_the_san_phams = await processAllVariantImages(data.bien_the_san_phams);
                console.log('Images processed successfully');
            }

            // 🔄 Bước 2: Gửi request tạo/cập nhật sản phẩm
            if (mode === 'add') {
                console.log('Creating product with data:', finalData);
                await createMutation.mutateAsync(finalData);
                success('Thêm sản phẩm thành công!');
            } else {
                console.log('Updating product with data:', finalData);
                await updateMutation.mutateAsync({ id: productId, ...finalData });
                success('Cập nhật sản phẩm thành công!');
            }
            
            onClose();
            
        } catch (err) {
            console.error('Error saving product:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Có lỗi xảy ra khi lưu sản phẩm';
            error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form khi có dữ liệu sản phẩm cần chỉnh sửa
    useEffect(() => {
        if (mode === 'edit' && productToEdit) {
            console.log('Editing product data:', productToEdit);
            
            const formData = {
                ten_san_pham: productToEdit.ten_san_pham,
                danh_muc_id: productToEdit.danh_muc_id,
                thuong_hieu_id: productToEdit.thuong_hieu_id,
                mo_ta: productToEdit.mo_ta,
                trang_thai: productToEdit.trang_thai,
                thong_so_ky_thuat: productToEdit.thong_so_ky_thuat || {},
                bien_the_san_phams: productToEdit.cac_bien_the?.map(bienThe => ({
                    id: bienThe.id,
                    ten_bien_the: bienThe.ten_bien_the,
                    gia_ban: bienThe.gia_ban,
                    gia_khuyen_mai: bienThe.gia_khuyen_mai,
                    so_luong_ton: bienThe.so_luong_ton,
                    trang_thai_kich_hoat: bienThe.trang_thai_kich_hoat,
                    hinh_anhs: bienThe.hinh_anhs?.map(img => ({
                        url: img.url,
                        public_id: img.public_id,
                        alt_text: img.alt_text,
                        la_anh_dai_dien: img.la_anh_dai_dien
                    })) || []
                })) || []
            };
            
            console.log('Form data to reset:', formData);
            reset(formData);
        } else if (mode === 'add') {
            reset({
                ten_san_pham: '',
                danh_muc_id: '',
                thuong_hieu_id: '',
                mo_ta: '',
                trang_thai: 'dang_ban',
                thong_so_ky_thuat: {},
                bien_the_san_phams: []
            });
        }
    }, [mode, productToEdit, reset]);

    const isLoadingData = isLoadingProduct || isLoadingDanhMuc || isLoadingThuongHieu;
    const isSaving = isLoading || isSubmitting;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="relative w-full max-w-7xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50">
                    {isLoadingData && (
                        <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-3xl">
                            <Loader2 className="animate-spin text-emerald-500" size={48} />
                            <p className="mt-4 text-lg dark:text-slate-300">Đang tải dữ liệu sản phẩm...</p>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10">
                        <h2 className="text-2xl font-bold dark:text-white">
                            {mode === 'add' ? 'Thêm Sản Phẩm Mới' : 'Cập Nhật Sản Phẩm'}
                        </h2>
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={isSaving}
                            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50 dark:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-grow p-6 overflow-y-auto scrollbar-thin grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">Tên sản phẩm *</label>
                                    <input 
                                        type="text" 
                                        {...register("ten_san_pham")} 
                                        disabled={isSaving}
                                        className={`w-full rounded-lg px-3 py-2.5 text-sm bg-white/50 dark:bg-slate-700/50 border ${
                                            errors.ten_san_pham ? 'border-red-500' : 'border-black/10 dark:border-white/10'
                                        } disabled:opacity-50 dark:text-white`} 
                                    />
                                    <p className="text-red-500 text-xs mt-1 h-4">{errors.ten_san_pham?.message}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">Danh mục *</label>
                                    <select 
                                        {...register("danh_muc_id")} 
                                        disabled={isSaving}
                                        className={`w-full rounded-lg px-3 py-2.5 text-sm bg-white/50 dark:bg-slate-700/50 border ${
                                            errors.danh_muc_id ? 'border-red-500' : 'border-black/10 dark:border-white/10'
                                        } disabled:opacity-50 dark:text-white`}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {danhMucList.map(dm => (
                                            <option key={dm.id} value={dm.id}>{dm.ten_danh_muc}</option>
                                        ))}
                                    </select>
                                    <p className="text-red-500 text-xs mt-1 h-4">{errors.danh_muc_id?.message}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">Thương hiệu *</label>
                                    <select 
                                        {...register("thuong_hieu_id")} 
                                        disabled={isSaving}
                                        className={`w-full rounded-lg px-3 py-2.5 text-sm bg-white/50 dark:bg-slate-700/50 border ${
                                            errors.thuong_hieu_id ? 'border-red-500' : 'border-black/10 dark:border-white/10'
                                        } disabled:opacity-50 dark:text-white`}
                                    >
                                        <option value="">Chọn thương hiệu</option>
                                        {thuongHieuList.map(th => (
                                            <option key={th.id} value={th.id}>{th.ten_thuong_hieu}</option>
                                        ))}
                                    </select>
                                    <p className="text-red-500 text-xs mt-1 h-4">{errors.thuong_hieu_id?.message}</p>
                                </div>
                            </div>
                            
                            <Controller 
                                name="trang_thai" 
                                control={control} 
                                render={({ field }) => (
                                    <StatusToggle 
                                        label="Tình trạng kinh doanh" 
                                        enabled={field.value === 'dang_ban'} 
                                        onChange={(enabled) => field.onChange(enabled ? 'dang_ban' : 'ngung_ban')}
                                        readOnly={isSaving}
                                    />
                                )}
                            />
                            
                            <VariantManager 
                                control={control} 
                                register={register} 
                                errors={errors} 
                                readOnly={isSaving}
                            />
                        </div>
                        
                        <div className="lg:col-span-5">
                            <PropertyForm 
                                control={control} 
                                readOnly={isSaving}
                            />
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <Controller 
                            name="mo_ta" 
                            control={control} 
                            render={({ field }) => (
                                <DescriptionEditor 
                                    value={field.value} 
                                    onChange={field.onChange}
                                    readOnly={isSaving}
                                />
                            )} 
                        />
                        <p className="text-red-500 text-xs mt-1 h-4">{errors.mo_ta?.message}</p>
                    </div>
                    
                    <div className="flex justify-end items-center gap-4 p-5 border-t border-black/10 dark:border-white/10">
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 transition-all disabled:opacity-50 dark:text-white"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {mode === 'add' ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

export default AddProductModal;