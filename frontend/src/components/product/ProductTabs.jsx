// frontend/src/components/product/ProductTabs.jsx
// 3 tab chính: Tổng quan, Thông số kỹ thuật, Nhận xét & Đánh giá

import { useState } from "react";
import ProductSpecsTable from "./ProductSpecsTable";
import ReviewSection from "./ReviewSection";

export default function ProductTabs({ description, specs, reviews = [] }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Tổng quan" },
    { key: "specs", label: "Thông số kỹ thuật" },
    { key: "reviews", label: "Nhận xét & Đánh giá" },
  ];

  return (
    <section className="mt-12">
      {/* ======= Nút chọn tab ======= */}
      <div className="flex justify-center gap-4 border-b border-gray-200 dark:border-slate-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-300
              ${
                activeTab === tab.key
                  ? "bg-emerald-600 text-white dark:bg-emerald-500"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======= Nội dung tab ======= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-b-xl shadow-lg border border-gray-200 dark:border-slate-700 mt-2">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Tổng quan sản phẩm
            </h2>
            {description ? (
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-gray-500 dark:text-slate-400 italic">
                Chưa có mô tả chi tiết cho sản phẩm này.
              </p>
            )}
          </div>
        )}

        {activeTab === "specs" && <ProductSpecsTable specs={specs} />}

        {activeTab === "reviews" && <ReviewSection reviews={reviews} />}
      </div>
    </section>
  );
}
