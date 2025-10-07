// src/components/common/Inventory/AddProduct/PropertyForm.jsx

import React from "react";
import { useController } from "react-hook-form";
import { propertyGroups } from "./productProperties";

const PropertyInput = ({ control, name, label, readOnly }) => {
    const { field } = useController({ control, name, defaultValue: "" });

    const baseInputStyle = "flex-1 px-3 py-1.5 border rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:ring-2";
    const activeInputStyle = "bg-white/50 dark:bg-slate-700/50 border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder:text-slate-500 dark:placeholder:text-slate-400";
    const readOnlyInputStyle = "bg-gray-500/10 dark:bg-gray-700/20 cursor-not-allowed text-slate-500 dark:text-slate-400";
  
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label className="w-full sm:w-1/3 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-0 flex-shrink-0">
                {label}
            </label>
            <input
                type="text"
                readOnly={readOnly}
                {...field}
                className={`${baseInputStyle} ${readOnly ? readOnlyInputStyle : activeInputStyle}`}
            />
        </div>
    );
};

const PropertyForm = ({ control, properties, readOnly = false }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
        Thông số kỹ thuật
      </h3>
      <div className="p-5 rounded-2xl shadow-lg bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 max-h-[550px] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-400/50 dark:scrollbar-thumb-gray-500/50">
        {Object.entries(propertyGroups).map(([groupName, props]) => (
          <div key={groupName} className="space-y-4">
            <h4 className="pb-2 text-lg font-semibold text-slate-700 dark:text-cyan-300 border-b border-black/10 dark:border-white/10">
              {groupName}
            </h4>
            <div className="space-y-3">
              {/* --- SỬA LẠI VÒNG LẶP Ở ĐÂY --- */}
              {props.map((prop) => {
                  const groupKey = groupName.toLowerCase();
                  // Ở chế độ chỉ đọc, lấy giá trị từ `properties`
                  if (readOnly) {
                      const value = properties?.[groupKey]?.[prop.key] || 'N/A';
                      return (
                          <div key={prop.key} className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                              <label className="w-full sm:w-1/3 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-0 flex-shrink-0">{prop.label}</label>
                              <p className="flex-1 text-sm text-slate-800 dark:text-slate-100">{value}</p>
                          </div>
                      );
                  }
                  // Ở chế độ form, dùng `PropertyInput`
                  return (
                      <PropertyInput
                          key={prop.key}
                          control={control}
                          // Đăng ký đúng tên trường, ví dụ: properties.lighting.shutter_speed
                          name={`properties.${groupKey}.${prop.key}`}
                          label={prop.label}
                      />
                  );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyForm;