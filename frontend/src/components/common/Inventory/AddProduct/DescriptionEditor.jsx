import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const DescriptionEditor = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-200/70 mb-2">
        Product Description
      </label>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        className="bg-white rounded-lg shadow"
        placeholder="Enter product description..."
      />
    </div>
  );
};

export default DescriptionEditor;