// src/components/common/Inventory/AddProduct/VariantManager.jsx

import React from "react";
import { useFieldArray, Controller } from "react-hook-form";
import VariantImageUpload from "./VariantImageUpload";
import { Trash2, Plus } from "lucide-react"; // Import thêm icon

// --- COMPONENT INPUT TÙY CHỈNH VỚI GIAO DIỆN LIQUID GLASS ---
const FormInput = ({ label, name, register, errors, type = "text", placeholder, ...props }) => (
    <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            {...register(name)}
            {...props}
            className={`w-full rounded-lg px-3 py-2 text-sm transition-all
                       bg-white/30 dark:bg-black/20 
                       border ${errors ? 'border-red-500 focus:ring-red-500' : 'border-black/10 dark:border-white/10 focus:ring-cyan-500'} 
                       focus:outline-none focus:ring-2 placeholder:text-slate-500 dark:placeholder:text-slate-400`}
        />
        {errors && <p className="text-red-500 text-xs mt-1 h-4">{errors.message}</p>}
    </div>
);

const VariantManager = ({ control, register, errors, readOnly = false }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants"
    });

    const handleAddVariant = () => {
        // Giá trị mặc định khi thêm biến thể mới
        append({
            style: "", 
            color: "",
            costPrice: "", 
            sellingPrice: "", 
            salePrice: "",
            quantity: "", 
            images: [] 
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý Biến thể</h3>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    // --- ÁP DỤNG HIỆU ỨNG KÍNH CHO MỖI THẺ BIẾN THỂ ---
                    <div key={field.id} className="p-4 rounded-2xl space-y-4 transition-all
                                                  bg-white/20 dark:bg-black/10 
                                                  backdrop-blur-sm 
                                                  border border-white/20 dark:border-slate-800/50
                                                  shadow-md">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Biến thể #{index + 1}</h4>
                            {!readOnly && fields.length > 1 && (
                                <button type="button" onClick={() => remove(index)} className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        
                        {/* Hàng 1: Phân loại & Màu sắc */}
                        <div className="flex flex-wrap gap-4">
                            <FormInput label="Phân loại / Kiểu dáng" name={`variants.${index}.style`} register={register} errors={errors.variants?.[index]?.style} placeholder="VD: Body Only"/>
                            <FormInput label="Màu sắc" name={`variants.${index}.color`} register={register} errors={errors.variants?.[index]?.color} placeholder="VD: Đen, Bạc"/>
                        </div>

                        {/* Hàng 2: Giá */}
                        <div className="flex flex-wrap gap-4">
                            <FormInput label="Giá nhập" name={`variants.${index}.costPrice`} type="number" register={register} errors={errors.variants?.[index]?.costPrice} placeholder="0"/>
                            <FormInput label="Giá bán" name={`variants.${index}.sellingPrice`} type="number" register={register} errors={errors.variants?.[index]?.sellingPrice} placeholder="0"/>
                            <FormInput label="Giá KM" name={`variants.${index}.salePrice`} type="number" register={register} errors={errors.variants?.[index]?.salePrice} placeholder="0"/>
                        </div>

                        {/* Hàng 3: Số lượng */}
                        <FormInput label="Số lượng tồn kho" name={`variants.${index}.quantity`} type="number" register={register} errors={errors.variants?.[index]?.quantity} placeholder="0"/>
                        
                        {/* Hàng 4: Hình ảnh */}
                        <div>
                            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Hình ảnh biến thể</label>
                            <Controller
                                name={`variants.${index}.images`}
                                control={control}
                                defaultValue={[]}
                                render={({ field: { onChange, value } }) => (
                                    <VariantImageUpload
                                        images={value}
                                        onChange={onChange}
                                        readOnly={readOnly}
                                    />
                                )}
                            />
                            {errors.variants?.[index]?.images && (
                                <p className="text-red-500 text-xs mt-1 h-4">
                                    {errors.variants[index].images.message}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {!readOnly && (
                <button 
                    type="button" 
                    onClick={handleAddVariant} 
                    className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg text-white 
                               bg-gradient-to-br from-emerald-500 to-cyan-600 
                               hover:scale-[1.02] transition-transform duration-300 
                               shadow-lg hover:shadow-emerald-500/30">
                    <Plus size={20} />
                    Thêm Biến thể
                </button>
            )}
        </div>
    );
};

export default VariantManager;