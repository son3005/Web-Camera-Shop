// src/components/common/Inventory/DescriptionEditor.jsx
import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const DescriptionEditor = ({ value, onChange, readOnly = false }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
        Mô tả sản phẩm
      </label>

      {readOnly ? (
        <div
          className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700/70
                     p-3 rounded-xl min-h-[100px] text-slate-900 dark:text-slate-100"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <div className="rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-700/70 bg-white/90 dark:bg-slate-900/90">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            className={`
              bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100

              [&_.ql-toolbar]:bg-slate-50
              [&_.ql-toolbar]:border-b
              [&_.ql-toolbar]:border-slate-200
              dark:[&_.ql-toolbar]:bg-slate-900
              dark:[&_.ql-toolbar]:border-slate-700

              [&_.ql-toolbar button]:text-slate-700
              dark:[&_.ql-toolbar button]:text-slate-200
              [&_.ql-toolbar button]:cursor-pointer
              [&_.ql-toolbar button:hover]:bg-slate-100
              [&_.ql-toolbar button:hover]:text-slate-900
              dark:[&_.ql-toolbar button:hover]:bg-slate-800
              dark:[&_.ql-toolbar button:hover]:text-white

              [&_.ql-toolbar button svg]:fill-current
              dark:[&_.ql-toolbar button svg]:fill-current

              [&_.ql-container]:bg-white
              dark:[&_.ql-container]:bg-slate-900
              [&_.ql-container]:border-none

              [&_.ql-editor]:text-slate-900
              dark:[&_.ql-editor]:text-slate-100
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
