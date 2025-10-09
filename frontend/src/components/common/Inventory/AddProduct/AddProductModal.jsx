// src/components/common/Inventory/AddProduct/AddProductModal.jsx

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "../../../../api/productApi";
import { X, LoaderCircle } from "lucide-react";
import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";

const BRANDS = [
  { value: "sony", label: "Sony" }, { value: "canon", label: "Canon" },
  { value: "nikon", label: "Nikon" }, { value: "fujifilm", label: "Fujifilm" },
  { value: "panasonic", label: "Panasonic" }, { value: "leica", label: "Leica" },
];

const StatusToggle = ({ label, enabled, onChange, readOnly }) => (
    <div>
        <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">{label}</label>
        <div className="flex items-center gap-4">
            <button type="button" onClick={() => !readOnly && onChange(!enabled)} disabled={readOnly} className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:ring-offset-slate-900 ${enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'} ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
            </button>
            <span className={`text-sm font-medium ${enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>{enabled ? 'Đang bán' : 'Ngừng bán'}</span>
        </div>
    </div>
);

const validationSchema = yup.object().shape({
    name: yup.string().required('Tên sản phẩm là bắt buộc'),
    brand: yup.string().required('Thương hiệu là bắt buộc'),
    description: yup.string(),
    isActive: yup.boolean(),
    variants: yup.array().of(
        yup.object().shape({
            color: yup.string().required("Màu là bắt buộc"),
            selling_price: yup.number().min(0).typeError("Giá bán phải là số").required("Giá bán là bắt buộc"),
            stock: yup.number().integer().min(0).typeError("Tồn kho phải là số nguyên").required("Tồn kho là bắt buộc"),
        })
    ).min(1, "Sản phẩm phải có ít nhất một biến thể"),
});

const AddProductModal = ({ mode, productId, onClose, onSave }) => {
    const { data: productToEdit, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => getProductById(productId),
        enabled: mode === 'edit' && !!productId,
    });

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: '', brand: '', isActive: true, description: '',
            variants: [{ color: '', cost_price: 0, selling_price: 0, sale_price: 0, stock: 0, sku: '', image: '' }],
            properties: {}
        }
    });

    useEffect(() => {
        if (mode === 'edit' && productToEdit) {
            const formData = {
                ...productToEdit,
                properties: productToEdit.specs || {}
            };
            reset(formData);
        } else if (mode === 'add') {
             reset({
                name: '', brand: '', isActive: true, description: '',
                variants: [{ color: '', cost_price: 0, selling_price: 0, sale_price: 0, stock: 0, sku: '', image: '' }],
                properties: {}
            });
        }
    }, [mode, productToEdit, reset]);
    
    const onSubmit = (data) => {
        const dataToSave = {
            ...data,
            specs: data.properties
        };
        delete dataToSave.properties;
        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="relative w-full max-w-7xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50">
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-3xl">
                        <LoaderCircle className="animate-spin text-emerald-500" size={48} />
                        <p className="mt-4 text-lg dark:text-slate-300">Đang tải dữ liệu sản phẩm...</p>
                    </div>
                )}
                <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10">
                    <h2 className="text-2xl font-bold dark:text-white">
                        {mode === 'add' ? 'Thêm Sản Phẩm Mới' : 'Cập Nhật Sản Phẩm'}
                    </h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto scrollbar-thin grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">Tên sản phẩm</label>
                                <input type="text" {...register("name")} className={`w-full rounded-lg px-3 py-2.5 text-sm bg-white/50 dark:bg-slate-700/50 border ${errors.name ? 'border-red-500' : 'border-black/10 dark:border-white/10'}`} />
                                <p className="text-red-500 text-xs mt-1 h-4">{errors.name?.message}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">Thương hiệu</label>
                                <select {...register("brand")} className={`w-full rounded-lg px-3 py-2.5 text-sm bg-white/50 dark:bg-slate-700/50 border ${errors.brand ? 'border-red-500' : 'border-black/10 dark:border-white/10'}`}>
                                    <option value="">Chọn thương hiệu</option>
                                    {BRANDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                </select>
                                <p className="text-red-500 text-xs mt-1 h-4">{errors.brand?.message}</p>
                            </div>
                        </div>
                        <Controller name="isActive" control={control} render={({ field }) => (<StatusToggle label="Tình trạng kinh doanh" enabled={field.value} onChange={field.onChange}/>)}/>
                        <VariantManager control={control} register={register} errors={errors} />
                    </div>
                    <div className="lg:col-span-5"><PropertyForm control={control} /></div>
                </div>
                <div className="p-6">
                    <Controller name="description" control={control} defaultValue="" render={({ field }) => <DescriptionEditor value={field.value} onChange={field.onChange} />} />
                    <p className="text-red-500 text-xs mt-1 h-4">{errors.description?.message}</p>
                </div>
                <div className="flex justify-end items-center gap-4 p-5 border-t border-black/10 dark:border-white/10">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 hover:shadow-md transition-all">Hủy</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Đang lưu...' : (mode === 'add' ? 'Thêm sản phẩm' : 'Lưu thay đổi')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductModal;