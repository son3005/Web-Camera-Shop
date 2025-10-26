import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from 'react-toastify';
import { X, LoaderCircle } from "lucide-react";

import { useSanPhamChiTiet } from "../../../../hooks/useSanPham";
import { useTaoSanPham, useCapNhatSanPham } from "../../../../hooks/useSanphamBienDoi";
import { useTaiLen } from "../../../../hooks/useTaiLen";

import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";

const BRANDS = [
  { value: 1, label: "Sony" }, 
  { value: 2, label: "Canon" },
  { value: 3, label: "Nikon" }, 
  { value: 4, label: "Fujifilm" },
  { value: 5, label: "Panasonic" }, 
  { value: 6, label: "Leica" },
];

const CATEGORIES = [
  { value: 1, label: "Máy ảnh Mirrorless" }, 
  { value: 2, label: "Ống kính" },
  { value: 3, label: "Máy ảnh DSLR" },
  { value: 4, label: "Phụ kiện" },
];

const StatusToggle = ({ label, enabled, onChange, readOnly }) => (
    <div>
        <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">{label}</label>
        <div className="flex items-center gap-4">
            <button type="button" onClick={() => !readOnly && onChange(!enabled)} disabled={readOnly} className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${enabled ? 'bg-cyan-600' : 'bg-slate-400 dark:bg-slate-600'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-medium ${enabled ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {enabled ? 'Đang bán' : 'Ẩn'}
            </span>
        </div>
    </div>
);

const FormInput = ({ label, name, register, errors, type = "text" }) => (
    <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</label>
        <input
            type={type}
            {...register(name)}
            className={`w-full rounded-lg px-3 py-2 text-sm transition-all bg-white/50 dark:bg-slate-700/50 border ${errors ? 'border-red-500 focus:ring-red-500' : 'border-black/10 dark:border-white/10 focus:ring-cyan-500'} focus:outline-none focus:ring-2 placeholder:text-slate-500 dark:placeholder:text-slate-400`}
        />
        {errors && <p className="text-red-500 text-xs mt-1 h-4">{errors.message}</p>}
    </div>
);

const FormSelect = ({ label, name, control, options, errors }) => (
     <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</label>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <select {...field} className={`w-full rounded-lg px-3 py-2 text-sm transition-all bg-white/50 dark:bg-slate-700/50 border ${errors ? 'border-red-500 focus:ring-red-500' : 'border-black/10 dark:border-white/10 focus:ring-cyan-500'} focus:outline-none focus:ring-2`}>
                    <option value="">--- Chọn ---</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            )}
        />
        {errors && <p className="text-red-500 text-xs mt-1 h-4">{errors.message}</p>}
    </div>
);

const productSchema = yup.object().shape({
    name: yup.string().required("Tên sản phẩm là bắt buộc"),
    brand: yup.number().required("Thương hiệu là bắt buộc").typeError("Vui lòng chọn thương hiệu"),
    category: yup.number().required("Danh mục là bắt buộc").typeError("Vui lòng chọn danh mục"),
    description: yup.string().optional(),
    status: yup.bool(),
    variants: yup.array().of(
        yup.object().shape({
            sku: yup.string().required("SKU là bắt buộc"),
            color: yup.string().optional(),
            selling_price: yup.number().min(0, "Giá phải lớn hơn 0").required("Giá bán là bắt buộc").typeError("Giá bán phải là số"),
            sale_price: yup.number().min(0, "Giá phải lớn hơn 0").nullable().optional().typeError("Giá KM phải là số"),
            stock: yup.number().min(0, "Tồn kho không âm").required("Tồn kho là bắt buộc").typeError("Tồn kho phải là số"),
            images: yup.array().min(1, "Cần ít nhất 1 ảnh cho mỗi biến thể"),
        })
    ).min(1, "Cần ít nhất 1 biến thể"),
    properties: yup.object().optional(),
});


const AddProductModal = ({ mode = 'add', productId, onClose }) => {
    
    const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(productSchema),
        defaultValues: {
            name: "",
            brand: "",
            category: "",
            status: true,
            description: "",
            variants: [],
            properties: {}
        }
    });

    const { data: productData, isLoading: isLoadingDetail } = useSanPhamChiTiet(productId);
    const { taiAnhLen, dangTaiLen } = useTaiLen();
    const { mutate: taoSanPham, isLoading: isCreating } = useTaoSanPham(onClose);
    const { mutate: capNhatSanPham, isLoading: isUpdating } = useCapNhatSanPham(onClose);

    const isSubmitting = isCreating || isUpdating || dangTaiLen;

    useEffect(() => {
        if (mode === 'edit' && productData) {
            const formData = {
                name: productData.ten_san_pham,
                brand: productData.thuong_hieu_id,
                category: productData.danh_muc_id,
                status: productData.trang_thai === 'DANG_BAN',
                description: productData.mo_ta,
                properties: productData.thong_so_ky_thuat,
                variants: productData.cac_bien_the.map(v => ({
                    id: v.id,
                    sku: v.ma_sku,
                    color: v.ten_bien_the,
                    images: v.hinh_anhs,
                    cost_price: v.gia,
                    selling_price: v.gia,
                    sale_price: v.gia_khuyen_mai,
                    stock: v.so_luong_ton,
                }))
            };
            reset(formData);
        }
    }, [productData, mode, reset]);


    const onSubmit = async (formData) => {
        try {
            const processedVariants = [];

            for (const variant of formData.variants) {
                const processedImages = [];
                for (const image of variant.images) {
                    if (image instanceof File) {
                        const uploadResult = await taiAnhLen(image);
                        if (uploadResult) {
                            processedImages.push(uploadResult);
                        }
                    } 
                    else if (typeof image === 'object' && image.public_id) {
                        processedImages.push(image);
                    }
                }
                
                if (processedImages.length > 0 && !processedImages.some(img => img.la_anh_dai_dien)) {
                    processedImages[0].la_anh_dai_dien = true;
                }
                
                processedVariants.push({
                    id: variant.id,
                    ma_sku: variant.sku,
                    ten_bien_the: variant.color,
                    gia: variant.selling_price,
                    gia_khuyen_mai: variant.sale_price || null,
                    so_luong_ton: variant.stock,
                    hinh_anhs: processedImages
                });
            }

            const finalProductData = {
                ten_san_pham: formData.name,
                thuong_hieu_id: parseInt(formData.brand),
                danh_muc_id: parseInt(formData.category),
                trang_thai: formData.status ? 'DANG_BAN' : 'AN',
                mo_ta: formData.description,
                thong_so_ky_thuat: formData.properties,
                cac_bien_the: processedVariants
            };

            if (mode === 'add') {
                taoSanPham(finalProductData);
            } else {
                capNhatSanPham({ sanPhamId: productId, sanPhamData: finalProductData });
            }

        } catch (error) {
            console.error("Lỗi khi submit form:", error);
            toast.error("Đã xảy ra lỗi không mong muốn, vui lòng thử lại.");
        }
    };
    
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50">
                <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold dark:text-white">
                        {mode === 'add' ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
                    {(isLoadingDetail && mode === 'edit') ? (
                         <div className="flex justify-center items-center h-full">
                            <LoaderCircle size={48} className="animate-spin text-cyan-500" />
                         </div>
                    ) : (
                        <> 
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-7 space-y-5 bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                                    <FormInput label="Tên sản phẩm" name="name" register={register} errors={errors.name} />
                                    
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <FormSelect label="Thương hiệu" name="brand" control={control} options={BRANDS} errors={errors.brand} />
                                        <FormSelect label="Danh mục" name="category" control={control} options={CATEGORIES} errors={errors.category} />
                                    </div>

                                    <Controller name="status" control={control} render={({ field }) => (
                                        <StatusToggle label="Trạng thái" enabled={field.value} onChange={field.onChange}/>
                                    )}/>
                                    
                                    <VariantManager control={control} register={register} errors={errors} setValue={setValue} />
                                </div>
                                <div className="lg:col-span-5 bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                                    <PropertyForm control={control} />
                                </div>
                            </div>
                            
                            <div className="p-6 pt-0">
                                <Controller name="description" control={control} defaultValue="" render={({ field }) => <DescriptionEditor value={field.value} onChange={field.onChange} />} />
                                <p className="text-red-500 text-xs mt-1 h-4">{errors.description?.message}</p>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end items-center gap-4 p-5 border-t border-black/10 dark:border-white/10 sticky bottom-0 bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 hover:shadow-md transition-all">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Đang lưu...' : (mode === 'add' ? 'Thêm sản phẩm' : 'Lưu thay đổi')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;