// src/components/common/Inventory/AddProduct/AddProductModal.jsx

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X } from "lucide-react";

import VariantManager from "./VariantManager";
import PropertyForm from "./PropertyForm";
import DescriptionEditor from "./DescriptionEditor";
import { propertyGroups } from "./productProperties";

const BRANDS = [
  { value: "sony", label: "Sony" }, { value: "canon", label: "Canon" },
  { value: "nikon", label: "Nikon" }, { value: "fujifilm", label: "Fujifilm" },
  { value: "panasonic", label: "Panasonic" }, { value: "leica", label: "Leica" },
];

const StatusToggle = ({ label, enabled, onChange, readOnly }) => (
    <div>
        <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">{label}</label>
        <div className="flex items-center gap-4">
            <button type="button" onClick={() => !readOnly && onChange(!enabled)} disabled={readOnly} className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:ring-offset-slate-800 ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'} ${enabled ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-semibold ${enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                {enabled ? "Còn bán" : "Ngừng bán"}
            </span>
        </div>
    </div>
);

const variantSchema = yup.object({
  style: yup.string(), color: yup.string(),
  costPrice: yup.number().typeError("Giá nhập phải là số").min(0).required("Bắt buộc"),
  sellingPrice: yup.number().typeError("Giá bán phải là số").min(0).required("Bắt buộc"),
  salePrice: yup.number().typeError("Giá KM phải là số").min(0).nullable().transform((v, o) => o === "" ? null : v).lessThan(yup.ref("sellingPrice"), "KM phải nhỏ hơn giá bán"),
  quantity: yup.number().typeError("Số lượng phải là số").integer().min(0).required("Bắt buộc"),
  images: yup.array().min(1, "Cần ít nhất 1 hình ảnh").required(),
});
const propertyKeys = Object.values(propertyGroups).flat().reduce((acc, key) => ({...acc, [key]: yup.string()}), {});
const productSchema = yup.object({
  name: yup.string().trim().required("Tên sản phẩm là bắt buộc"),
  brand: yup.string().required("Vui lòng chọn thương hiệu"),
  isActive: yup.boolean(),
  description: yup.string().trim().test("is-not-empty", "Mô tả sản phẩm là bắt buộc", (v) => v && v !== "<p><br></p>").min(50, "Mô tả cần có ít nhất 50 ký tự").required("Mô tả sản phẩm là bắt buộc"),
  variants: yup.array().of(variantSchema).min(1, "Phải có ít nhất một biến thể"),
  properties: yup.object().shape(propertyKeys),
}).required();
const getDefaultProperties = () => Object.values(propertyGroups).flat().reduce((acc, key) => ({...acc, [key]: ""}), {});


const AddProductModal = ({ onClose, mode = "add", product = null, onSave }) => {
  const modalTitle = mode === "add" ? "Thêm Sản Phẩm Mới" : "Chỉnh Sửa Sản Phẩm";
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(productSchema),
  });

  useEffect(() => {
    if (mode === 'edit' && product) {
      reset(product);
    } else {
      reset({
        name: "", brand: "", isActive: true, description: "",
        variants: [{ style: "", color: "", costPrice: "", sellingPrice: "", salePrice: "", quantity: "", images: [] }],
        properties: getDefaultProperties()
      });
    }
  }, [product, mode, reset]);

  const onSubmit = (data) => {
    onSave(data); 
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-7xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl bg-slate-200/60 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 text-slate-900 dark:text-slate-100`}>
        <div className="flex justify-between items-center p-5 border-b border-black/10 dark:border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-bold">{modalTitle}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><X size={24} /></button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400/50 dark:scrollbar-thumb-slate-600/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">Tên sản phẩm</label>
                  <input {...register("name")} placeholder="VD: Máy ảnh Sony A7 IV" className={`w-full rounded-lg px-3 py-2 text-sm transition-all bg-white/50 dark:bg-slate-700/50 border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-black/10 dark:border-white/10 focus:ring-cyan-500'} focus:outline-none focus:ring-2 placeholder:text-slate-500 dark:placeholder:text-slate-400`} />
                  <p className="text-red-500 text-xs mt-1 h-4">{errors.name?.message}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">Thương hiệu</label>
                  <select {...register("brand")} className={`w-full rounded-lg px-3 py-2 text-sm transition-all bg-white/50 dark:bg-slate-700/50 border ${errors.brand ? 'border-red-500 focus:ring-red-500' : 'border-black/10 dark:border-white/10 focus:ring-cyan-500'} focus:outline-none focus:ring-2`}>
                    <option value="">-- Chọn thương hiệu --</option>
                    {BRANDS.map((brand) => (<option key={brand.value} value={brand.value}>{brand.label}</option>))}
                  </select>
                  <p className="text-red-500 text-xs mt-1 h-4">{errors.brand?.message}</p>
                </div>
                <Controller name="isActive" control={control} render={({ field }) => (<StatusToggle label="Tình trạng kinh doanh" enabled={field.value} onChange={field.onChange}/>)}/>
                <VariantManager control={control} register={register} errors={errors} />
              </div>
              <div className="lg:col-span-5"><PropertyForm register={register} /></div>
            </div>
            <div>
              <Controller name="description" control={control} defaultValue="" render={({ field }) => <DescriptionEditor value={field.value} onChange={field.onChange} />} />
              <p className="text-red-500 text-xs mt-1 h-4">{errors.description?.message}</p>
            </div>
            <div className="flex justify-end items-center gap-4 pt-6 border-t border-black/10 dark:border-white/10">
              <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 hover:shadow-md transition-all">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-slate-600 hover:scale-110 hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Đang lưu...' : (mode === "add" ? "Thêm Sản Phẩm" : "Lưu Thay Đổi")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AddProductModal;