// src/pages/ProductListPage.jsx
// ============================================================
// Trang liệt kê sản phẩm + Filter theo Thương hiệu / Danh mục / Cấp độ
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

const PAGE_SIZE = 8;

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
  // 3. Gọi API sản phẩm (mỗi trang 8 sp)
  // ------------------------------------------------------------
  const { data, isLoading } = useQuery({
    queryKey: ["products", page, q, sort, filters, PAGE_SIZE],
    queryFn: () =>
      getProducts({
        page,
        limit: PAGE_SIZE,
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
  const { data: brandRes } = useListBrands(1, 100);
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
    if (!keepPage) {
      // đổi filter thì luôn về page 1
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  // ------------------------------------------------------------
  // 6. Render
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Khung kính tổng giống AccountPage */}
        <div className="bg-white/10 border border-white/50 rounded-[32px] shadow-[0_18px_55px_rgba(16,185,129,0.25)] backdrop-blur-2xl px-5 py-6 md:px-8 md:py-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Danh sách sản phẩm
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Khám phá bộ sưu tập máy ảnh và phụ kiện tại{" "}
                <span className="font-semibold text-emerald-700">
                  WebCameraShop
                </span>
                {q && (
                  <>
                    {" "}
                    – kết quả cho từ khóa{" "}
                    <span className="font-semibold text-emerald-700">
                      “{q}”
                    </span>
                  </>
                )}
                .
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="ui-select w-40 bg-white/90 border-slate-200"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Layout 2 cột: trái filter – phải list */}
          <div className="grid grid-cols-12 gap-6 mt-4">
            {/* FILTER PANEL */}
            <aside className="col-span-12 md:col-span-3 space-y-5">
              <div className="bg-white border border-slate-100 rounded-3xl shadow-md p-4 space-y-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  BỘ LỌC TÌM KIẾM
                </p>

                {/* Khoảng giá */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">
                    Khoảng giá
                  </h2>
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

                <div className="h-px bg-slate-100 my-1" />

                {/* Danh mục */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 mb-1.5">
                    Danh mục
                  </h2>
                  <CheckboxGroup
                    options={categoryOptions}
                    values={danh_muc_ids}
                    onChange={(vals) => updateParams({ danh_muc_ids: vals })}
                    collapsible={false}
                  />
                </div>

                {/* Thương hiệu */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 mb-1.5">
                    Thương hiệu
                  </h2>
                  <CheckboxGroup
                    options={brandOptions}
                    values={thuong_hieu_ids}
                    onChange={(vals) => updateParams({ thuong_hieu_ids: vals })}
                    collapsible={false}
                  />
                </div>

                {/* Cấp độ */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 mb-1.5">
                    Cấp độ người dùng
                  </h2>
                  <CheckboxGroup
                    options={levelOptions}
                    values={cap_do_ids}
                    onChange={(vals) => updateParams({ cap_do_ids: vals })}
                    collapsible={false}
                  />
                </div>
              </div>
            </aside>

            {/* PRODUCT LIST */}
            <main className="col-span-12 md:col-span-9">
              <div className="surface-panel bg-white/90 border-white/90 rounded-3xl p-4 md:p-5">
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <div key={i} className="skeleton h-60 rounded-2xl" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-sm text-slate-600">
                      Không có sản phẩm phù hợp với bộ lọc hiện tại.
                    </p>
                    <button
                      className="mt-3 inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-md transition"
                      onClick={() =>
                        updateParams(
                          {
                            min_price: undefined,
                            max_price: undefined,
                            thuong_hieu_ids: [],
                            cap_do_ids: [],
                            danh_muc_ids: [],
                            sort: "",
                          },
                          false
                        )
                      }
                    >
                      Đặt lại tất cả bộ lọc
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {items.map((p) => (
                        <ProductCard key={p.id} p={p} compact />
                      ))}
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6 flex-wrap">
                        {Array.from({ length: totalPages }).map((_, i) => {
                          const current = i + 1;
                          const active = current === page;
                          return (
                            <button
                              key={current}
                              onClick={() =>
                                updateParams(
                                  { page: current },
                                  true // giữ các filter khác
                                )
                              }
                              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition ${
                                active
                                  ? "border-transparent bg-emerald-500 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700"
                              }`}
                            >
                              {current}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
