// src/components/product/ProductTabs.jsx
// Tabs style LIGHT – hiện đại

import { useState } from "react";
import ProductSpecsTable from "./ProductSpecsTable";
import ReviewsPanel from "./ReviewsPanel";

export default function ProductTabs({ productId, description, specs }) {
  const [tab, setTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Tổng quan" },
    { key: "specs", label: "Thông số kỹ thuật" },
    { key: "reviews", label: "Nhận xét & Đánh giá" },
  ];

  return (
    <div className="container mx-auto px-4 mt-8 mb-12">
      {/* TAB HEADER */}
      <div className="flex flex-wrap gap-3 mb-4">
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-semibold 
                border transition shadow-sm
                ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
                }
              `}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        {tab === "overview" && (
          <div className="prose text-slate-700">
            <div
              dangerouslySetInnerHTML={{
                __html: description || "<p>Chưa có mô tả.</p>",
              }}
            />
          </div>
        )}

        {tab === "specs" && <ProductSpecsTable specs={specs} />}

        {tab === "reviews" && <ReviewsPanel productId={productId} />}
      </div>
    </div>
  );
}
