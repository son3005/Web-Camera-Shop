// src/components/ExportMenu.jsx

import React from "react";
import { FileText, FileSpreadsheet } from "lucide-react";

const ExportMenu = ({ onClose }) => {
  // Logic đóng menu khi click ra ngoài tương tự ActionMenu cũng có thể thêm vào đây
  
  return (
    <div className="absolute right-0 mt-2 w-40 z-20
                  rounded-lg shadow-xl border border-white/10
                  bg-slate-200/60 dark:bg-slate-800/80 
                  backdrop-blur-lg
                  animate-fade-in-up">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-colors"
                onClick={() => { alert("Export PDF clicked"); onClose(); }}>
            <FileText size={16} /> Export PDF
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-colors"
                onClick={() => { alert("Export Excel clicked"); onClose(); }}>
            <FileSpreadsheet size={16} /> Export Excel
        </button>
    </div>
  );
};

export default ExportMenu;