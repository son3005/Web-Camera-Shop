// PropertyForm.jsx
import React from "react";
import { propertyGroups } from "./productProperties";

const PropertyForm = ({ properties = {}, onChange, readOnly = false }) => {
  const handleChange = (key, value) => {
    onChange && onChange({ ...properties, [key]: value });
  };

  // --- Tối ưu hóa class cho các input để code gọn hơn ---
  const baseInputStyle = 
    "flex-1 px-3 py-1.5 border rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:ring-2";
  
  const activeInputStyle = 
    "bg-black/5 dark:bg-white/10 border-black/20 dark:border-white/20 text-slate-800 dark:text-slate-100 focus:ring-blue-500 dark:focus:ring-cyan-400";
  
  const readOnlyInputStyle = 
    "bg-gray-500/10 dark:bg-gray-700/20 cursor-not-allowed text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
        Thông số kỹ thuật
      </h3>

      {/* --- CORE: Khung kính mờ (Glassmorphism) --- */}
      <div 
        className="p-5 bg-white/30 dark:bg-black/20 backdrop-blur-lg 
                   border border-black/10 dark:border-white/20 
                   rounded-2xl shadow-lg max-h-[450px] overflow-y-auto space-y-6 
                   scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent 
                   dark:scrollbar-thumb-gray-500/50"
      >
        {Object.entries(propertyGroups).map(([groupName, props]) => (
          <div key={groupName} className="space-y-4">
            {/* Tiêu đề của mỗi nhóm thông số */}
            <h4 className="pb-2 text-lg font-semibold text-slate-700 dark:text-cyan-300 border-b border-black/10 dark:border-white/10">
              {groupName}
            </h4>
            <div className="space-y-3">
              {props.map((prop) => (
                <div key={prop} className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <label className="w-full sm:w-1/3 text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-0 flex-shrink-0">
                    {prop}
                  </label>
                  <input
                    type="text"
                    value={properties[prop] || ""}
                    disabled={readOnly}
                    onChange={(e) => handleChange(prop, e.target.value)}
                    className={`${baseInputStyle} ${readOnly ? readOnlyInputStyle : activeInputStyle}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyForm;