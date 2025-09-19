// src/components/common/Inventory/AddProduct/PropertyForm.jsx

import React from "react";
import { propertyGroups } from "./productProperties";

const PropertyForm = ({ register, readOnly = false }) => {
  const baseInputStyle = "flex-1 px-3 py-1.5 border rounded-lg text-sm transition-colors duration-300 focus:outline-none focus:ring-2";
  const activeInputStyle = "bg-white/30 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder:text-slate-500 dark:placeholder:text-slate-400";
  // ...

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Thông số kỹ thuật</h3>

      {/* --- Áp dụng hiệu ứng kính cho khung chứa --- */}
      <div className="p-5 rounded-2xl shadow-lg
                    bg-white/20 dark:bg-black/10 
                    backdrop-blur-sm 
                    border border-white/20 dark:border-slate-800/50
                    max-h-[550px] overflow-y-auto space-y-6 
                    scrollbar-thin scrollbar-thumb-gray-400/50 dark:scrollbar-thumb-gray-500/50">
        
        {Object.entries(propertyGroups).map(([groupName, props]) => (
          <div key={groupName} className="space-y-4">
            <h4 className="pb-2 text-lg font-semibold text-slate-700 dark:text-cyan-300 border-b border-black/10 dark:border-white/10">
              {groupName}
            </h4>
            <div className="space-y-3">
              {props.map((prop) => (
                <div key={prop} className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <label className="w-full sm:w-1/3 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-0 flex-shrink-0">
                    {prop}
                  </label>
                  <input
                    type="text"
                    disabled={readOnly}
                    {...register(`properties.${prop}`)}
                    className={`${baseInputStyle} ${activeInputStyle}`} // Dùng style đã định nghĩa
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