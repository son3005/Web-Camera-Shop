// DescriptionEditor.jsx
import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const DescriptionEditor = ({ value, onChange, readOnly = false }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-200/70 mb-2">
        Product Description
      </label>
      {readOnly ? (
        <div
          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg min-h-[100px]"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          className="bg-white rounded-lg shadow"
          placeholder="Enter product description..."
        />
      )}
    </div>
  );
};

export default DescriptionEditor;
