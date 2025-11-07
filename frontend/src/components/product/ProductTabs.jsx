// src/components/product/ProductTabs.jsx
// Tabs: mô tả | thông số | đánh giá

import { useState } from "react";
import ProductSpecsTable from "./ProductSpecsTable";
import ReviewsPanel from "./ReviewsPanel";

export default function ProductTabs({ productId, description, specs }) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 mt-6 mb-10">
      {/* Tabs header */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { key: "overview", label: "Tổng quan" },
          { key: "specs", label: "Thông số kỹ thuật" },
          { key: "reviews", label: "Nhận xét & Đánh giá" },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition
                ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-900 border-black/15 hover:bg-black/5 dark:bg-slate-800 dark:text-slate-100 dark:border-white/15 dark:hover:bg-white/10"
                }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="surface-panel p-4 md:p-6 text-slate-900 dark:text-slate-100">
        {tab === "overview" && (
          <div className="prose">
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
