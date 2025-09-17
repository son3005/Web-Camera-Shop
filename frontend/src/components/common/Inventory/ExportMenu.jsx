import React from "react";
import { FileText, FileSpreadsheet } from "lucide-react";

/**
 * ExportMenu
 * - Xuất PDF hoặc Excel
 */
const ExportMenu = ({ onClose }) => {
  return (
    <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 z-10">
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => {
          alert("Export PDF clicked");
          onClose();
        }}
      >
        <FileText size={16} /> Export PDF
      </button>
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => {
          alert("Export Excel clicked");
          onClose();
        }}
      >
        <FileSpreadsheet size={16} /> Export Excel
      </button>
    </div>
  );
};

export default ExportMenu;
