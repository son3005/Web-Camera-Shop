// src/components/common/Inventory/AddProduct/VariantManager.jsx

import React from "react";
import { useFieldArray, Controller } from "react-hook-form";
import VariantImageUpload from "./VariantImageUpload";
import { Trash2, Plus } from "lucide-react";

const FormInput = ({ label, name, register, errors, type = "text", placeholder, readOnly, defaultValue }) => (
    <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            readOnly={readOnly}
            defaultValue={readOnly ? defaultValue : undefined}
            {...(register ? register(name) : {})}
            className={`w-full rounded-lg px-3 py-2 text-sm transition-all bg-white/50 dark:bg-slate-700/50 border ${errors ? 'border-red-500 focus:ring-red-500' : 'border-black/10 dark:border-white/10 focus:ring-cyan-500'} focus:outline-none focus:ring-2 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${readOnly ? 'cursor-not-allowed bg-slate-200 dark:bg-slate-700/30' : ''}`}
        />
        {errors && <p className="text-red-500 text-xs mt-1 h-4">{errors.message}</p>}
    </div>
);

const VariantManager = ({ control, register, errors, defaultVariants, readOnly = false }) => {
    // --- SỬA LỖI TẠI ĐÂY ---
    // Nếu ở chế độ readOnly, chúng ta sẽ render một giao diện khác và return sớm
    // để không gọi các hook của react-hook-form một cách sai trái.
    if (readOnly) {
        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    Các biến thể
                </h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 -mr-4 scrollbar-thin">
                    {(defaultVariants || []).map((variant, index) => (
                        <div key={variant.id || index} className="p-4 rounded-2xl bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 space-y-4">
                            <h4 className="font-bold text-slate-700 dark:text-cyan-300">Biến thể #{index + 1}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Màu sắc" readOnly={true} defaultValue={variant.color} />
                                <FormInput label="SKU" readOnly={true} defaultValue={variant.sku} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormInput label="Giá nhập" type="number" readOnly={true} defaultValue={variant.cost_price} />
                                <FormInput label="Giá bán" type="number" readOnly={true} defaultValue={variant.selling_price} />
                                <FormInput label="Giá KM" type="number" readOnly={true} defaultValue={variant.sale_price} />
                            </div>
                            <FormInput label="Tồn kho" type="number" readOnly={true} defaultValue={variant.stock} />
                            <div>
                                <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Hình ảnh</label>
                                <VariantImageUpload images={variant.images || []} readOnly={true} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Nếu không phải readOnly, component sẽ hoạt động như một form bình thường
    // Các hook của react-hook-form giờ đây được gọi một cách an toàn
    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants",
    });

    const handleAddVariant = () => {
        append({
            color: "",
            cost_price: 0,
            selling_price: 0,
            sale_price: 0,
            stock: 0,
            sku: "",
            images: [],
        });
    };
    
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Các biến thể
            </h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 -mr-4 scrollbar-thin">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 rounded-2xl bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-slate-700 dark:text-cyan-300">Biến thể #{index + 1}</h4>
                            {fields.length > 1 && (
                                <button type="button" onClick={() => remove(index)} className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10 transition">
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Màu sắc" name={`variants.${index}.color`} register={register} errors={errors?.variants?.[index]?.color} />
                            <FormInput label="SKU" name={`variants.${index}.sku`} register={register} errors={errors?.variants?.[index]?.sku} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput label="Giá nhập" type="number" name={`variants.${index}.cost_price`} register={register} errors={errors?.variants?.[index]?.cost_price} />
                            <FormInput label="Giá bán" type="number" name={`variants.${index}.selling_price`} register={register} errors={errors?.variants?.[index]?.selling_price} />
                            <FormInput label="Giá KM" type="number" name={`variants.${index}.sale_price`} register={register} errors={errors?.variants?.[index]?.sale_price} />
                        </div>
                         <FormInput label="Tồn kho" type="number" name={`variants.${index}.stock`} register={register} errors={errors?.variants?.[index]?.stock} />
                        <div>
                            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Hình ảnh</label>
                            <Controller name={`variants.${index}.images`} control={control} defaultValue={[]} render={({ field: { onChange, value } }) => <VariantImageUpload images={value} onChange={onChange} />} />
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={handleAddVariant} className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg text-white bg-gradient-to-br from-emerald-500 to-cyan-600 hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-emerald-500/30">
                <Plus size={20} /> Thêm Biến thể
            </button>
        </div>
    );
};

export default VariantManager;