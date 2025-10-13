// frontend/src/pages/ProductListPage.jsx
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../api/publicApi";
import ProductCard from "../components/common/ProductCard";

function useListParams() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get("page") || 1);
  const q = sp.get("q") || "";
  const sort = sp.get("sort") || "";
  const brands = sp.getAll("brand");
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const setParam = (k, v) => {
    !v ? sp.delete(k) : sp.set(k, v);
    sp.set("page", "1");
    setSp(sp, { replace: true });
  };
  return { q, page, sort, brands, minPrice, maxPrice, setParam, setSp };
}

export default function ProductListPage() {
  const { q, page, sort, brands, minPrice, maxPrice, setParam, setSp } =
    useListParams();
  const { data, isLoading } = useQuery({
    queryKey: ["products", { q, page, sort, brands, minPrice, maxPrice }],
    queryFn: () =>
      getProducts({
        page,
        limit: 12,
        searchTerm: q,
        brands,
        minPrice: maxPrice ? minPrice : undefined,
        maxPrice: minPrice ? maxPrice : undefined,
        sort: sort || undefined,
      }),
    keepPreviousData: true,
  });
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-dvh">
      <div className="container mx-auto px-4 py-6">
        <nav className="text-sm text-gray-800 dark:text-slate-200 mb-4">
          <Link to="/" className="hover:underline">
            Trang chủ
          </Link>{" "}
          / <span>Máy ảnh</span>
        </nav>

        <div className="grid grid-cols-12 gap-6">
          {/* Filter */}
          <aside className="col-span-12 md:col-span-3">
            <div className="surface-panel p-4 space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100">
                Bộ lọc
              </h3>

              <div>
                <div className="text-sm font-medium mb-2">Thương hiệu</div>
                {[
                  "Sony",
                  "Canon",
                  "Nikon",
                  "Fujifilm",
                  "Panasonic",
                  "Leica",
                ].map((b) => {
                  const val = b.toLowerCase();
                  const checked = brands.includes(val);
                  return (
                    <label
                      key={val}
                      className="flex items-center gap-2 text-sm mb-1"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const x = new URLSearchParams(location.search);
                          const current = x.getAll("brand").filter(Boolean);
                          const next = e.target.checked
                            ? [...current, val]
                            : current.filter((t) => t !== val);
                          x.delete("brand");
                          next.forEach((t) => x.append("brand", t));
                          x.set("page", "1");
                          setSp(x, { replace: true });
                        }}
                      />{" "}
                      {b}
                    </label>
                  );
                })}
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Mức giá</div>
                <div className="flex items-center gap-2">
                  <input
                    className="ui-input dark:bg-slate-800/80 dark:border-slate-700"
                    placeholder="Từ"
                    defaultValue={minPrice ?? ""}
                    onBlur={(e) => setParam("minPrice", e.target.value || null)}
                  />
                  <span>-</span>
                  <input
                    className="ui-input dark:bg-slate-800/80 dark:border-slate-700"
                    placeholder="Đến"
                    defaultValue={maxPrice ?? ""}
                    onBlur={(e) => setParam("maxPrice", e.target.value || null)}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-slate-400">
                (Có thể bổ sung filter megapixel / thẻ nhớ / zoom / cấp độ tùy
                API)
              </div>
            </div>
          </aside>

          {/* List */}
          <section className="col-span-12 md:col-span-9">
            <div className="surface-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  Tìm thấy {data?.total ?? items.length} sản phẩm
                </div>
                <select
                  className="ui-select dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-100"
                  value={sort}
                  onChange={(e) => setParam("sort", e.target.value || null)}
                >
                  <option value="">Mặc định</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="new">Mới nhất</option>
                  <option value="name_asc">Tên A-Z</option>
                  <option value="name_desc">Tên Z-A</option>
                </select>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton h-64" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                  {items.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 dark:text-slate-400 py-12">
                      Không tìm thấy sản phẩm phù hợp
                    </div>
                  )}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const active = pageNum === page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setParam("page", String(pageNum))}
                        className={`min-w-9 h-9 px-3 rounded ${
                          active
                            ? "bg-black text-white"
                            : "bg-white dark:bg-slate-700 border dark:border-slate-600 dark:text-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
