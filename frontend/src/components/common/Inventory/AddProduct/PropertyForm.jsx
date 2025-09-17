import React from "react";
import { propertyGroups } from "./productProperties";

const PropertyForm = ({ properties, onChange }) => {
  const handleChange = (group, key, value) => {
    onChange({
      ...properties,
      [group]: { ...properties[group], [key]: value },
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Thông số kỹ thuật
      </h3>
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent">
        {Object.entries(propertyGroups).map(([group, fields]) => (
          <div
            key={group}
            className="p-4 rounded-xl bg-white/20 dark:bg-gray-700/30 backdrop-blur-md border border-white/10"
          >
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">
              {group}
            </h4>
            <div className="space-y-3">
              {fields.map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  value={properties[group]?.[field] || ""}
                  onChange={(e) => handleChange(group, field, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyForm;
