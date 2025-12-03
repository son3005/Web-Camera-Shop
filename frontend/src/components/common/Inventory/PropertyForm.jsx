// src/components/common/Inventory/PropertyForm.jsx

import React from "react";
import { useController, useFormContext } from "react-hook-form";
import { propertyGroups } from "./productProperties";

/**
 * Input cho từng thuộc tính kỹ thuật
 * - readOnly: hiển thị như text
 * - không readOnly: dùng input text và bind với react-hook-form
 */
const PropertyInput = ({
  control,
  name,
  label,
  readOnly,
  value,
  propertyKey,
}) => {
  // Chế độ chỉ đọc
  if (readOnly) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <label className="w-full sm:w-1/3 text-sm font-medium text-slate-700 mb-1 sm:mb-0 flex-shrink-0">
          {label}
        </label>
        <p className="flex-1 text-sm text-slate-800 bg-slate-50/90 px-3 py-1.5 rounded-lg border border-slate-200">
          {value || value === 0 ? value : "Chưa có thông tin"}
        </p>
      </div>
    );
  }

  // Chế độ edit: dùng useController để liên kết với form
  const { field } = useController({
    control,
    name: `thong_so_ky_thuat.${propertyKey}`,
    defaultValue: value || "",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
      <label className="w-full sm:w-1/3 text-sm font-medium text-slate-700 mb-1 sm:mb-0 flex-shrink-0">
        {label}
      </label>
      <input
        type="text"
        {...field}
        value={field.value || ""}
        className="flex-1 px-3 py-1.5 border rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:ring-2 bg-white/90 border-slate-200 text-slate-800 focus:ring-emerald-500 placeholder:text-slate-500"
        placeholder={`Nhập ${label.toLowerCase()}...`}
      />
    </div>
  );
};

/**
 * Form thông số kỹ thuật
 * - Khi readOnly: hiển thị theo props.properties
 * - Khi edit/add: lấy dữ liệu trực tiếp từ formContext (watch("thong_so_ky_thuat"))
 */
const PropertyForm = ({ control, properties = {}, readOnly = false }) => {
  const formContext = useFormContext();
  const formProperties = formContext?.watch?.("thong_so_ky_thuat");

  const displayProperties = readOnly ? properties : formProperties || {};

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">Thông số kỹ thuật</h3>

      <div className="p-5 rounded-2xl bg-slate-50/90 backdrop-blur-sm border border-slate-200 max-h-[550px] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-300/70 shadow-sm">
        {/* Mỗi group (Ví dụ: Thân máy, Cảm biến, Ống kính, ...) */}
        {Object.entries(propertyGroups).map(([groupName, props]) => (
          <div key={groupName} className="space-y-4">
            <h4 className="pb-2 text-lg font-semibold text-slate-700 border-b border-slate-200">
              {groupName}
            </h4>
            <div className="space-y-3">
              {props.map((prop) => {
                const propKey = prop.key;
                const value = displayProperties?.[propKey];

                return (
                  <PropertyInput
                    key={propKey}
                    control={readOnly ? undefined : control}
                    name={`thong_so_ky_thuat.${propKey}`}
                    label={prop.label}
                    value={value}
                    propertyKey={propKey}
                    readOnly={readOnly}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* TH chỉ đọc mà chưa có thông số nào */}
        {Object.keys(displayProperties || {}).length === 0 && readOnly && (
          <div className="text-center py-8 text-slate-500">
            <p>Chưa có thông số kỹ thuật nào được thiết lập</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyForm;
