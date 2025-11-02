// frontend/src/pages/ProductListPage.jsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../api/publicApi";
import ProductCard from "../components/common/ProductCard";
import PriceSlider from "../components/filters/PriceSlider";
import CheckboxGroup from "../components/filters/CheckboxGroup";

// ======= Options (khớp với publicApi) =======
const BRAND_OPTS = [
  "Sony",
  "Canon",
  "Nikon",
  "Fujifilm",
  "Panasonic",
  "Leica",
].map((x) => ({ value: x.toLowerCase(), label: x }));

const MP_OPTS = [
  { value: "16-22", label: "16 – 22 MP" },
  { value: "22-26", label: "22 – 26 MP" },
  { value: "26-30", label: "26 – 30 MP" },
  { value: "30-40", label: "30 – 40 MP" },
  { value: ">=40", label: "≥ 40 MP" },
];

const MEMORY_OPTS = [
  { value: "SD", label: "SD" },
  { value: "SDHC", label: "SDHC" },
  { value: "SDXC", label: "SDXC" },
  { value: "UHS-II", label: "UHS-II" },
];

const VIDEO_OPTS = [
  { value: "4K", label: "4K UHD" },
  { value: "Full HD", label: "Full HD" },
];

const FOCUS_OPTS = [
  { value: "<200", label: "< 200 điểm" },
  { value: "200-300", label: "200 – 300 điểm" },
  { value: ">=300", label: "≥ 300 điểm" },
];

const LENS_MOUNT_OPTS = [
  { value: "SONY MOUNT", label: "Sony Mount" },
  { value: "CANON MOUNT", label: "Canon Mount" },
  { value: "NIKON MOUNT", label: "Nikon Mount" },
  { value: "FUJIFILM MOUNT", label: "Fujifilm Mount" },
  { value: "PANASONIC MOUNT", label: "Panasonic Mount" },
  { value: "LEICA MOUNT", label: "Leica Mount" },
];

// ======= Helpers đọc/ghi URLSearchParams =======
function useListParams() {
  const [sp, setSp] = useSearchParams();

  const page = Number(sp.get("page") || 1);
  const q = sp.get("q") || "";
  const sort = sp.get("sort") || "default";

  // nhiều giá trị
  const brands = sp.getAll("brand");
  const mp = sp.getAll("mp");
  const mem = sp.getAll("mem");
  const vres = sp.getAll("vres");
  const focus = sp.getAll("focus");
  const mount = sp.getAll("mount");

  // giá
  const priceMin = Number(sp.get("min") || 0);
  const priceMax = Number(sp.get("max") || 66_000_000);

  const options = { replace: true, preventScrollReset: true };

  // set 1 param và reset page = 1 (trừ khi đang chỉnh chính 'page')
  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (v === null || v === undefined || v === "") next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.set("page", "1");
    setSp(next, options);
  };

  // set nhiều giá trị cho 1 key và reset page = 1
  const setMulti = (k, arr) => {
    const next = new URLSearchParams(sp);
    next.delete(k);
    (arr || []).forEach((v) => next.append(k, v));
    next.set("page", "1");
    setSp(next, options);
  };

  // riêng page
  const setPage = (p) => {
    const next = new URLSearchParams(sp);
    next.set("page", String(p));
    setSp(next, options);
  };

  const setPriceRange = ({ min, max }) => {
    const next = new URLSearchParams(sp);
    next.set("min", String(min ?? 0));
    next.set("max", String(max ?? 66_000_000));
    next.set("page", "1");
    setSp(next, options);
  };

  return {
    q,
    page,
    sort,
    brands,
    mp,
    mem,
    vres,
    focus,
    mount,
    priceMin,
    priceMax,
    setParam,
    setMulti,
    setPriceRange,
    setPage,
  };
}

export default function ProductListPage() {
  const {
    q,
    page,
    sort,
    brands,
    mp,
    mem,
    vres,
    focus,
    mount,
    priceMin,
    priceMax,
    setParam,
    setMulti,
    setPriceRange,
    setPage,
  } = useListParams();

  // build filters cho publicApi
  const filters = useMemo(
    () => ({
      brands,
      priceRange: { min: priceMin, max: priceMax },
      mpRanges: mp,
      memoryTypes: mem,
      videoRes: vres,
      focusRanges: focus,
      lensMounts: mount,
    }),
    [brands, priceMin, priceMax, mp, mem, vres, focus, mount]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, sort, q, filters],
    queryFn: () =>
      getProducts({
        page,
        limit: 12,
        searchTerm: q,
        sort: sort === "default" ? undefined : sort,
        filters,
      }),
    keepPreviousData: true,
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  // helper build dãy số trang rút gọn (…)
  const buildPageList = (current, total, delta = 1) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([
      1,
      2,
      total - 1,
      total,
      current,
      current - 1,
      current + 1,
    ]);
    const list = [...pages]
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const prev = list[i - 1];
      const cur = list[i];
      if (prev && cur - prev > 1) out.push("…");
      out.push(cur);
    }
    return out;
  };

  const pageList = buildPageList(page, totalPages);

  return (
    <div className="min-h-dvh">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-800 dark:text-slate-200 mb-4">
          <Link to="/" className="hover:underline">
            Trang chủ
          </Link>{" "}
          / <span>Máy ảnh</span>
        </nav>

        <div className="grid grid-cols-12 gap-6">
          {/* ======= Sidebar Filters ======= */}
          <aside className="col-span-12 md:col-span-3">
            <div className="surface-panel p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100">
                Bộ lọc
              </h3>

              <CheckboxGroup
                title="Thương hiệu"
                options={BRAND_OPTS}
                values={brands}
                onChange={(vals) => setMulti("brand", vals)}
              />

              {/* Giá */}
              <div className="py-3 border-b border-black/5 dark:border-white/10">
                <div className="font-medium text-sm text-gray-800 dark:text-slate-200 mb-2">
                  Giá
                </div>
                <PriceSlider
                  value={{ min: priceMin, max: priceMax }}
                  onChange={setPriceRange}
                />
              </div>

              <CheckboxGroup
                title="Số điểm ảnh (MP)"
                options={MP_OPTS}
                values={mp}
                onChange={(vals) => setMulti("mp", vals)}
              />
              <CheckboxGroup
                title="Loại thẻ nhớ"
                options={MEMORY_OPTS}
                values={mem}
                onChange={(vals) => setMulti("mem", vals)}
              />
              <CheckboxGroup
                title="Độ phân giải video"
                options={VIDEO_OPTS}
                values={vres}
                onChange={(vals) => setMulti("vres", vals)}
              />
              <CheckboxGroup
                title="Số điểm lấy nét"
                options={FOCUS_OPTS}
                values={focus}
                onChange={(vals) => setMulti("focus", vals)}
              />
              <CheckboxGroup
                title="Ngàm ống kính"
                options={LENS_MOUNT_OPTS}
                values={mount}
                onChange={(vals) => setMulti("mount", vals)}
              />
            </div>
          </aside>

          {/* ======= Products & Sort ======= */}
          <section className="col-span-12 md:col-span-9">
            <div className="surface-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  {data ? `Tìm thấy ${data.total} sản phẩm` : "Đang tải…"}
                </div>
                <select
                  className="ui-select dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-100"
                  value={sort}
                  onChange={(e) => setParam("sort", e.target.value || null)}
                >
                  <option value="default">Mặc định</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="name_asc">Tên A–Z</option>
                  <option value="name_desc">Tên Z–A</option>
                  <option value="new">Mới nhất</option>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  {/* Prev */}
                  <button
                    onClick={() => page > 1 && setPage(page - 1)}
                    disabled={page <= 1}
                    className={`min-w-9 h-9 px-3 rounded border
                      ${
                        page <= 1
                          ? "opacity-40 cursor-not-allowed dark:border-slate-700"
                          : "hover:bg-black/5 dark:hover:bg-white/10 dark:border-slate-600"
                      }
                      bg-white dark:bg-slate-700 dark:text-slate-100`}
                    aria-label="Trang trước"
                  >
                    ‹
                  </button>

                  {/* Numbers (có …) */}
                  {pageList.map((p, idx) =>
                    p === "…" ? (
                      <span
                        key={`e${idx}`}
                        className="min-w-9 h-9 grid place-items-center text-gray-500 dark:text-slate-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`min-w-9 h-9 px-3 rounded ${
                          p === page
                            ? "bg-black text-white dark:bg-emerald-600 dark:text-white"
                            : "bg-white dark:bg-slate-700 border dark:border-slate-600 dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                        aria-current={p === page ? "page" : undefined}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => page < totalPages && setPage(page + 1)}
                    disabled={page >= totalPages}
                    className={`min-w-9 h-9 px-3 rounded border
                      ${
                        page >= totalPages
                          ? "opacity-40 cursor-not-allowed dark:border-slate-700"
                          : "hover:bg-black/5 dark:hover:bg白/10 dark:border-slate-600"
                      }
                      bg-white dark:bg-slate-700 dark:text-slate-100`}
                    aria-label="Trang sau"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
