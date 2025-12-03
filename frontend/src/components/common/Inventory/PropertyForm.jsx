// src/components/common/Inventory/PropertyForm.jsx
import React from "react";
import { useController, useFormContext } from "react-hook-form";
import { propertyGroups } from "./productProperties";

const PropertyInput = ({
  control,
  name,
  label,
  readOnly,
  value,
  propertyKey,
}) => {
  if (readOnly) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <label className="w-full sm:w-1/3 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-0 flex-shrink-0">
          {label}
        </label>
        <p className="flex-1 text-sm text-slate-800 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          {value || value === 0 ? value : "Chưa có thông tin"}
        </p>
      </div>
    );
  }

  const { field } = useController({
    control,
    name: `thong_so_ky_thuat.${propertyKey}`,
    defaultValue: value || "",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
      <label className="w-full sm:w-1/3 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-0 flex-shrink-0">
        {label}
      </label>
      <input
        type="text"
        {...field}
        value={field.value || ""}
        className="flex-1 px-3 py-1.5 border rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:ring-2 bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 focus:ring-emerald-500 dark:focus:ring-emerald-400 placeholder:text-slate-500 dark:placeholder:text-slate-400"
        placeholder={`Nhập ${label.toLowerCase()}...`}
      />
    </div>
  );
};

const PropertyForm = ({ control, properties = {}, readOnly = false }) => {
  // Sử dụng useFormContext chỉ khi không ở chế độ readOnly
  const formContext = useFormContext();
  const formProperties = formContext?.watch?.("thong_so_ky_thuat");

  const displayProperties = readOnly ? properties : formProperties || {};

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
        Thông số kỹ thuật
      </h3>
      <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 max-h-[550px] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-400/50 dark:scrollbar-thumb-gray-500/50 shadow-sm">
        {Object.entries(propertyGroups).map(([groupName, props]) => (
          <div key={groupName} className="space-y-4">
            <h4 className="pb-2 text-lg font-semibold text-slate-700 dark:text-cyan-300 border-b border-slate-200/60 dark:border-slate-700/60">
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

        {Object.keys(displayProperties || {}).length === 0 && readOnly && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>Chưa có thông số kỹ thuật nào được thiết lập</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyForm;
