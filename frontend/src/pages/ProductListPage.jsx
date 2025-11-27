// src/pages/ProductListPage.jsx
// ============================================================
// Trang liệt kê sản phẩm + Filter theo Thương hiệu / Danh mục / Cấp độ
// - Đọc filter từ URL
// - Gọi API sản phẩm thật (san-pham)
// - Lọc theo:
//    + khoảng giá (min_price / max_price)
//    + thuong_hieu_ids
//    + danh_muc_ids
//    + cap_do_ids
// ============================================================

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/productApi";
import ProductCard from "../components/common/ProductCard";
import PriceSlider from "../components/filters/PriceSlider";
import CheckboxGroup from "../components/filters/CheckboxGroup";

// lấy list brand / category / level từ backend
import { useBrands } from "../hooks/useBrands";
import { useCategories } from "../hooks/useCategories";
import { useLevelsList } from "../hooks/useLevels";

const SORT_OPTIONS = [
  { value: "", label: "Mặc định" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "name_asc", label: "Tên A → Z" },
  { value: "name_desc", label: "Tên Z → A" },
];

export default function ProductListPage() {
  // ------------------------------------------------------------
  // 1. Đọc query trên URL (page, q, sort, filter…)
  // ------------------------------------------------------------
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";
  const min_price = searchParams.get("min_price");
  const max_price = searchParams.get("max_price");

  // nhiều ID cùng tên param → dùng getAll
  const thuong_hieu_ids = searchParams.getAll("thuong_hieu_ids").map(Number);
  const cap_do_ids = searchParams.getAll("cap_do_ids").map(Number);
  const danh_muc_ids = searchParams.getAll("danh_muc_ids").map(Number);

  // ------------------------------------------------------------
  // 2. Gom filter truyền xuống productApi
  // ------------------------------------------------------------
  const filters = useMemo(
    () => ({
      price: {
        min: min_price ? Number(min_price) : undefined,
        max: max_price ? Number(max_price) : undefined,
      },
      thuong_hieu_ids: thuong_hieu_ids.length ? thuong_hieu_ids : undefined,
      cap_do_ids: cap_do_ids.length ? cap_do_ids : undefined,
      danh_muc_ids: danh_muc_ids.length ? danh_muc_ids : undefined,
    }),
    [min_price, max_price, thuong_hieu_ids, cap_do_ids, danh_muc_ids]
  );

  // ------------------------------------------------------------
  // 3. Gọi API sản phẩm (đã mapping đúng trong productApi.js)
  // ------------------------------------------------------------
  const { data, isLoading } = useQuery({
    queryKey: ["products", page, q, sort, filters],
    queryFn: () =>
      getProducts({
        page,
        limit: 12,
        search: q,
        sort,
        filters,
      }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  // ------------------------------------------------------------
  // 4. Gọi API lấy options filter (brand / category / level)
  // ------------------------------------------------------------

  // Thương hiệu
  const { useListBrands } = useBrands();
  const { data: brandRes } = useListBrands(1, 100); // lấy max 100 brand
  const brandOptions =
    brandRes?.data?.map((b) => ({
      value: b.id,
      label: b.ten_thuong_hieu,
    })) || [];

  // Danh mục
  const { useGetCategories } = useCategories();
  const { data: categoryRes } = useGetCategories({ page: 1, per_page: 100 });
  const categoryOptions =
    categoryRes?.data?.map((c) => ({
      value: c.id,
      label: c.ten_danh_muc,
    })) || [];

  // Cấp độ
  const { data: levelRes } = useLevelsList(1, 100);
  const levelOptions =
    levelRes?.data?.map((l) => ({
      value: l.id,
      label: l.ten_cap_do,
    })) || [];

  // ------------------------------------------------------------
  // 5. Hàm update URL khi đổi filter / trang
  // ------------------------------------------------------------
  const updateParams = (obj, keepPage = false) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null || v === "" || v?.length === 0) {
        next.delete(k);
      } else if (Array.isArray(v)) {
        next.delete(k);
        v.forEach((val) => next.append(k, String(val)));
      } else {
        next.set(k, String(v));
      }
    }
    if (!keepPage) next.set("page", "1");
    setSearchParams(next);
  };

  // ------------------------------------------------------------
  // 6. Render
  // ------------------------------------------------------------
  return (
    <div className="container mx-auto px-4 py-5">
      {/* Header: tiêu đề + sort */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <h1 className="text-lg md:text-xl font-semibold text-slate-100">
          Danh sách sản phẩm
        </h1>

        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="ui-input w-32"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* layout 2 cột: trái filter – phải list */}
      <div className="grid grid-cols-12 gap-5">
        {/* FILTER PANEL */}
        <aside className="col-span-12 md:col-span-3 space-y-5">
          {/* Khoảng giá */}
          <div className="surface-panel p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h2 className="text-sm font-semibold mb-3">Khoảng giá</h2>
            <PriceSlider
              value={{
                min: Number(min_price) || 0,
                max: Number(max_price) || 66_000_000,
              }}
              onChange={({ min, max }) =>
                updateParams({ min_price: min, max_price: max })
              }
            />
          </div>

          {/* Danh mục */}
          <div className="surface-panel p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h2 className="text-sm font-semibold mb-3">Danh mục</h2>
            <CheckboxGroup
              options={categoryOptions}
              values={danh_muc_ids}
              onChange={(vals) => updateParams({ danh_muc_ids: vals })}
              collapsible={false}
            />
          </div>

          {/* Thương hiệu */}
          <div className="surface-panel p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h2 className="text-sm font-semibold mb-3">Thương hiệu</h2>
            <CheckboxGroup
              options={brandOptions}
              values={thuong_hieu_ids}
              onChange={(vals) => updateParams({ thuong_hieu_ids: vals })}
              collapsible={false}
            />
          </div>

          {/* Cấp độ */}
          <div className="surface-panel p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h2 className="text-sm font-semibold mb-3">Cấp độ</h2>
            <CheckboxGroup
              options={levelOptions}
              values={cap_do_ids}
              onChange={(vals) => updateParams({ cap_do_ids: vals })}
              collapsible={false}
            />
          </div>
        </aside>

        {/* PRODUCT LIST */}
        <main className="col-span-12 md:col-span-9">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-2xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-slate-300 bg-slate-900/30 rounded-2xl">
              Không có sản phẩm phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}

          {/* Phân trang */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => {
              const current = i + 1;
              const active = current === page;
              return (
                <button
                  key={current}
                  onClick={() =>
                    updateParams({ page: current }, true /* giữ filter */)
                  }
                  className={`px-3 py-1 rounded-lg text-sm ${
                    active
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                  }`}
                >
                  {current}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
