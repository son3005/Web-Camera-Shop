// src/pages/ProductListPage.jsx
// ============================================================
// Trang liệt kê sản phẩm
// - Đọc filter từ URL
// - Gửi đúng tham số mà backend đang nhận
// - Render list + phân trang
// - ĐÃ BỎ ô tìm kiếm ở góc phải phía trên (vì header đã có search)
//   chỉ giữ phần chọn "Sắp xếp"
// ============================================================

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/productApi";
import ProductCard from "../components/common/ProductCard";
import PriceSlider from "../components/filters/PriceSlider";
import CheckboxGroup from "../components/filters/CheckboxGroup";

// Các option tạm (có thể thay bằng API danh mục / thương hiệu sau)
const BRAND_OPTIONS = [
  { value: 1, label: "Canon" },
  { value: 2, label: "Sony" },
  { value: 3, label: "Nikon" },
  { value: 4, label: "Fujifilm" },
  { value: 5, label: "DJI" },
  { value: 6, label: "GoPro" },
];

const LEVEL_OPTIONS = [
  { value: 1, label: "Entry / cơ bản" },
  { value: 2, label: "Enthusiast / bán chuyên" },
  { value: 3, label: "Pro / chuyên nghiệp" },
];

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
  const thuong_hieu_ids = searchParams.getAll("thuong_hieu_ids").map(Number);
  const cap_do_ids = searchParams.getAll("cap_do_ids").map(Number);

  // ------------------------------------------------------------
  // 2. Gom lại thành object filters để truyền xuống API
  // ------------------------------------------------------------
  const filters = useMemo(() => {
    return {
      price: {
        min: min_price ? Number(min_price) : undefined,
        max: max_price ? Number(max_price) : undefined,
      },
      thuong_hieu_ids: thuong_hieu_ids.length ? thuong_hieu_ids : undefined,
      cap_do_ids: cap_do_ids.length ? cap_do_ids : undefined,
    };
  }, [min_price, max_price, thuong_hieu_ids, cap_do_ids]);

  // ------------------------------------------------------------
  // 3. Gọi API thật để lấy danh sách sản phẩm
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
  // 4. Hàm tiện để cập nhật lại URL khi đổi filter / trang
  // ------------------------------------------------------------
  const updateParams = (obj, keepPage = false) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(obj)) {
      // xoá key nếu giá trị rỗng
      if (v === undefined || v === null || v === "" || v?.length === 0) {
        next.delete(k);
      } else if (Array.isArray(v)) {
        next.delete(k);
        v.forEach((val) => next.append(k, String(val)));
      } else {
        next.set(k, String(v));
      }
    }
    // mỗi lần đổi filter thì đưa về trang 1
    if (!keepPage) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  // ------------------------------------------------------------
  // 5. Render
  // ------------------------------------------------------------
  return (
    <div className="container mx-auto px-4 py-5">
      {/* thanh tiêu đề + chỉ giữ dropdown sắp xếp */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <h1 className="text-lg md:text-xl font-semibold text-slate-100">
          Danh sách sản phẩm
        </h1>

        {/* BỎ ô input tìm kiếm ở đây, chỉ còn chọn sắp xếp */}
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

      {/* layout 2 cột: trái filter, phải danh sách */}
      <div className="grid grid-cols-12 gap-5">
        {/* cột trái: filter */}
        <aside className="col-span-12 md:col-span-3 space-y-5">
          {/* khoảng giá */}
          <div className="surface-panel p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h2 className="text-sm font-semibold mb-3">Khoảng giá</h2>
            <PriceSlider
              value={{
                min: Number(min_price) || 0,
                max: Number(max_price) || 70_000_000,
              }}
              onChange={({ min, max }) =>
                updateParams({ min_price: min, max_price: max })
              }
            />
          </div>

          {/* thương hiệu */}
          <div className="surface-panel p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h2 className="text-sm font-semibold mb-3">Thương hiệu</h2>
            <CheckboxGroup
              options={BRAND_OPTIONS}
              values={thuong_hieu_ids}
              onChange={(vals) => updateParams({ thuong_hieu_ids: vals })}
            />
          </div>

          {/* cấp độ */}
          <div className="surface-panel p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h2 className="text-sm font-semibold mb-3">Cấp độ</h2>
            <CheckboxGroup
              options={LEVEL_OPTIONS}
              values={cap_do_ids}
              onChange={(vals) => updateParams({ cap_do_ids: vals })}
            />
          </div>
        </aside>

        {/* cột phải: danh sách sản phẩm */}
        <main className="col-span-12 md:col-span-9">
          {isLoading ? (
            // trạng thái loading → hiển thị skeleton
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-2xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            // không có dữ liệu
            <div className="p-6 text-slate-300 bg-slate-900/30 rounded-2xl">
              Không có sản phẩm phù hợp.
            </div>
          ) : (
            // có dữ liệu → render card
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}

          {/* phân trang */}
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
