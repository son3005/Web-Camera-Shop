// src/components/common/Inventory/ExportMenu.jsx

import React from "react";
import { FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "../../../hooks/useToast";

const ExportMenu = ({ onClose }) => {
  const toastHook = useToast();
  const showSuccess =
    toastHook?.success || toastHook?.toast?.success || (() => {});
  const showInfo =
    toastHook?.info ||
    toastHook?.toast?.info ||
    toastHook?.success ||
    (() => {});

  const handleExportPdf = () => {
    showInfo("Chức năng xuất PDF đang được phát triển.");
    onClose();
  };

  const handleExportExcel = () => {
    showInfo("Chức năng xuất Excel đang được phát triển.");
    onClose();
  };

  return (
    <div
      className="absolute right-0 mt-2 w-44 z-20
                  rounded-lg shadow-xl border border-slate-200/60 dark:border-slate-700/60
                  bg-white/90 dark:bg-slate-900/95 
                  backdrop-blur-lg animate-fade-in-up"
    >
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
        onClick={handleExportPdf}
      >
        <FileText size={16} /> Xuất PDF
      </button>
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
        onClick={handleExportExcel}
      >
        <FileSpreadsheet size={16} /> Xuất Excel
      </button>
    </div>
  );
};

export default ExportMenu;
