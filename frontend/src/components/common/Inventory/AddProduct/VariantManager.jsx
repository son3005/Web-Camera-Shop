// src/components/common/Inventory/AddProduct/VariantManager.jsx

import React from "react";
import { useFieldArray, Controller } from "react-hook-form";
import VariantImageUpload from "./VariantImageUpload";
import { Trash2, Plus } from "lucide-react";

const FormInput = ({ label, name, register, errors, type = "text", placeholder, value, readOnly }) => (
    <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            readOnly={readOnly}
            {...(register ? register(name) : { value: value || "" })}
            className={`w-full rounded-lg px-3 py-2 text-sm transition-all bg-white/50 dark:bg-slate-700/50 border ${errors ? 'border-red-500 focus:ring-red-500' : 'border-black/10 dark:border-white/10 focus:ring-cyan-500'} focus:outline-none focus:ring-2 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${readOnly ? 'cursor-not-allowed' : ''}`}
        />
        {errors && <p className="text-red-500 text-xs mt-1 h-4">{errors.message}</p>}
    </div>
);

const VariantManager = ({ control, register, errors, defaultVariants, readOnly = false }) => {
    const isFormMode = !!control;
    const { fields, append, remove } = isFormMode ? useFieldArray({ control, name: "variants" }) : { fields: [], append: () => {}, remove: () => {} };
    const variantsToRender = isFormMode ? fields : defaultVariants;

    const handleAddVariant = () => append({ style: "", color: "", costPrice: "", sellingPrice: "", salePrice: "", quantity: "", images: [] });

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý Biến thể</h3>
            <div className="space-y-4">
                {variantsToRender && variantsToRender.map((field, index) => (
                    <div key={isFormMode ? field.id : index} className="p-4 rounded-2xl space-y-4 transition-all bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 shadow-md">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Biến thể #{index + 1}</h4>
                            {isFormMode && !readOnly && fields.length > 1 && (
                                <button type="button" onClick={() => remove(index)} className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <FormInput label="Phân loại" name={`variants.${index}.style`} register={register} errors={errors?.variants?.[index]?.style} value={field.style} readOnly={readOnly} placeholder="VD: Body Only"/>
                            <FormInput label="Màu sắc" name={`variants.${index}.color`} register={register} errors={errors?.variants?.[index]?.color} value={field.color} readOnly={readOnly} placeholder="VD: Đen"/>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <FormInput label="Giá nhập" name={`variants.${index}.costPrice`} type="number" register={register} errors={errors?.variants?.[index]?.costPrice} value={field.costPrice} readOnly={readOnly} placeholder="0"/>
                            <FormInput label="Giá bán" name={`variants.${index}.sellingPrice`} type="number" register={register} errors={errors?.variants?.[index]?.sellingPrice} value={field.sellingPrice} readOnly={readOnly} placeholder="0"/>
                            <FormInput label="Giá KM" name={`variants.${index}.salePrice`} type="number" register={register} errors={errors?.variants?.[index]?.salePrice} value={field.salePrice} readOnly={readOnly} placeholder="0"/>
                        </div>
                        <FormInput label="Số lượng tồn kho" name={`variants.${index}.quantity`} type="number" register={register} errors={errors?.variants?.[index]?.quantity} value={field.quantity} readOnly={readOnly} placeholder="0"/>
                        <div>
                            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Hình ảnh</label>
                            {isFormMode ? (
                                <Controller name={`variants.${index}.images`} control={control} defaultValue={[]} render={({ field: { onChange, value } }) => <VariantImageUpload images={value} onChange={onChange} readOnly={readOnly} />} />
                            ) : (
                                <VariantImageUpload images={field.images} readOnly={true} />
                            )}
                            {errors?.variants?.[index]?.images && <p className="text-red-500 text-xs mt-1 h-4">{errors.variants[index].images.message}</p>}
                        </div>
                    </div>
                ))}
            </div>
            {isFormMode && !readOnly && (
                <button type="button" onClick={handleAddVariant} className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-lg text-white bg-gradient-to-br from-emerald-500 to-cyan-600 hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-emerald-500/30">
                    <Plus size={20} /> Thêm Biến thể
                </button>
            )}
        </div>
    );
};

export default VariantManager;