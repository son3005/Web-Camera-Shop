// src/components/common/Inventory/DescriptionEditor.jsx
import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const DescriptionEditor = ({ value, onChange, readOnly = false }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Mô tả sản phẩm
      </label>

      {readOnly ? (
        // Khung hiển thị HTML mô tả (chỉ đọc)
        <div
          className="bg-white/95 border border-slate-200 p-3 rounded-xl min-h-[100px] text-slate-900"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        // Editor ReactQuill
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white/95">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            className={`
              bg-white text-slate-900
              [&_.ql-toolbar]:bg-slate-50
              [&_.ql-toolbar]:border-b
              [&_.ql-toolbar]:border-slate-200
              [&_.ql-toolbar_button]:cursor-pointer
              [&_.ql-toolbar_button:hover]:bg-slate-100
              [&_.ql-toolbar_button:hover]:text-slate-900
              [&_.ql-container]:bg-white
              [&_.ql-container]:border-none
              [&_.ql-editor]:text-slate-900
              [&_.ql-editor]:min-h-[120px]
              [&_.ql-editor]:cursor-text
            `}
            placeholder="Nhập mô tả sản phẩm..."
          />
        </div>
      )}
    </div>
  );
};

export default DescriptionEditor;
