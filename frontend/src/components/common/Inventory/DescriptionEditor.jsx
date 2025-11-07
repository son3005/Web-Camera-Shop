// DescriptionEditor.jsx
import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const DescriptionEditor = ({ value, onChange, readOnly = false }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-200 mb-2">
        Product Description
      </label>
      {readOnly ? (
        <div
          className="bg-slate-800 p-3 rounded-lg min-h-[100px] text-slate-100"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            className="bg-slate-800 text-slate-100 [&_.ql-toolbar]:bg-slate-900 [&_.ql-toolbar]:border-slate-700 [&_.ql-container]:bg-slate-800 [&_.ql-container]:border-slate-700 [&_.ql-editor]:text-slate-100"
            placeholder="Nhập mô tả sản phẩm..."
          />
        </div>
      )}
    </div>
  );
};

export default DescriptionEditor;
