// frontend/src/pages/Admin/Inventory.jsx
// Trang quản lý sản phẩm – đồng bộ backend mới (tồn kho = nhập - bán)

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Inbox,
  AlertCircle,
  Filter,
  Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import TableRow from "../../components/common/Inventory/TableRow";
import AddProductModal from "../../components/common/Inventory/AddProductModal";
import ProductDetailModal from "../../components/common/Inventory/ProductDetailModal";
import FilterPopup from "../../components/common/Inventory/FilterPopup";

import { useProducts } from "../../hooks/useProducts";
import { useCatalogs } from "../../hooks/useCatalogs";

// debounce đơn giản cho input search
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// pagination component
const Pagination = ({ page, pages, setPage, isLoading, showing, total }) => {
  const [inputPage, setInputPage] = useState(page);
  useEffect(() => setInputPage(page), [page]);

  if (!pages || pages <= 1) {
    return (
      <div className="flex justify-between items-center mt-6 text-sm text-slate-600 dark:text-slate-400">
        <span>
          {isLoading
            ? "Đang tải..."
            : `Hiển thị ${showing} trên ${total} kết quả`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {isLoading
          ? "Đang tải..."
          : `Hiển thị ${showing} trên ${total} kết quả`}
      </span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="p-2 rounded-md bg-black/5 dark:bg-white/5 disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium">
            Trang {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages || isLoading}
            className="p-2 rounded-md bg-black/5 dark:bg-white/5 disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(inputPage);
            if (!isNaN(n) && n >= 1 && n <= pages) {
              setPage(n);
            } else {
              setInputPage(page);
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="number"
            value={inputPage}
            min={1}
            max={pages}
            onChange={(e) => setInputPage(e.target.value)}
            className="w-16 px-2 py-1 rounded bg-white/70 dark:bg-slate-700/40 text-center"
          />
          <button
            type="submit"
            className="px-3 py-1 text-sm rounded bg-slate-900/5 dark:bg-white/5"
          >
            Đến
          </button>
        </form>
      </div>
    </div>
  );
};

// ===========================
// Helper chuẩn backend
// ===========================
const getBusinessStatus = (item) => {
  const variants = item?.cac_bien_the || [];

  let raw =
    item.trang_thai_kich_hoat !== undefined &&
    item.trang_thai_kich_hoat !== null
      ? item.trang_thai_kich_hoat
      : item.trang_thai;

  if (typeof raw === "string") {
    const v = raw.toUpperCase();
    if (v === "DANG_BAN") return "dang_ban";
    if (v === "SAP_BAN") return "sap_ban";
    return "ngung_ban";
  }

  let hasActive = false;
  let hasComing = false;

  variants.forEach((v) => {
    const s = (v.trang_thai_kich_hoat || "").toUpperCase();
    if (s === "DANG_BAN") hasActive = true;
    if (s === "SAP_BAN") hasComing = true;
  });

  if (hasActive) return "dang_ban";
  if (hasComing) return "sap_ban";
  return "ngung_ban";
};

const Inventory = () => {
  const queryClient = useQueryClient();
  const filterRef = useRef(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [page, setPage] = useState(1);
  const perPage = 10;

  const [modalType, setModalType] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // FILT ER STATE
  const [appliedFilters, setAppliedFilters] = useState({
    sortBy: { name: null, price: null },
    danh_muc_ids: [],
    thuong_hieu_ids: [],
    priceRange: { min: "", max: "" },
    status: [],
    stockStatus: [],
  });

  const [localFilters, setLocalFilters] = useState(appliedFilters);

  // Lấy danh mục + thương hiệu
  const { useGetAllDanhMuc, useGetAllThuongHieu } = useCatalogs();
  const { data: danhMucData } = useGetAllDanhMuc({ page: 1, per_page: 100 });
  const { data: thuongHieuData } = useGetAllThuongHieu({
    page: 1,
    per_page: 100,
  });

  // API sản phẩm
  const { useGetAllSanPham, useDeleteSanPham } = useProducts();

  const apiParams = {
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    min_price: appliedFilters.priceRange.min || undefined,
    max_price: appliedFilters.priceRange.max || undefined,
    sort_by_price: appliedFilters.sortBy.price || undefined,
    sort_by_name: appliedFilters.sortBy.name || undefined,
    thuong_hieu_ids: appliedFilters.thuong_hieu_ids,
    danh_muc_ids: appliedFilters.danh_muc_ids,
  };

  const {
    data: productsData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetAllSanPham(apiParams);

  const deleteMutation = useDeleteSanPham();

  const productsFromApi = productsData?.data || [];
  const pagination = productsData?.pagination || {};
  const totalPages = pagination.pages || 0;
  const totalItems = pagination.total || 0;

  // ===========================
  // Tính tồn kho = nhập - bán
  // ===========================
  const getTotalStock = (item) => {
    const variants = item?.cac_bien_the || [];

    return (
      variants.reduce((total, v) => {
        const nhap = Number(v.so_luong_nhap || 0);
        const ban = Number(v.so_luong_ban || 0);
        return total + (nhap - ban);
      }, 0) || 0
    );
  };

  // ===========================
  // FILTER FE
  // ===========================
  const feFilteredProducts = useMemo(() => {
    return productsFromApi.filter((item) => {
      const totalStock = getTotalStock(item);

      // lọc theo trạng thái kinh doanh
      if (appliedFilters.status.length > 0) {
        const s = getBusinessStatus(item);
        if (!appliedFilters.status.includes(s)) return false;
      }

      // lọc theo tồn kho
      if (appliedFilters.stockStatus.length > 0) {
        const wantIn = appliedFilters.stockStatus.includes("in_stock");
        const wantLow = appliedFilters.stockStatus.includes("low_stock");
        const wantOut = appliedFilters.stockStatus.includes("out_of_stock");

        let match = false;
        if (wantIn && totalStock > 10) match = true;
        if (wantLow && totalStock > 0 && totalStock <= 10) match = true;
        if (wantOut && totalStock === 0) match = true;

        if (!match) return false;
      }

      return true;
    });
  }, [productsFromApi, appliedFilters]);

  // MODALS
  const openModal = (type, id = null) => {
    setModalType(type);
    setActiveId(id);
  };

  const closeModal = () => {
    setModalType(null);
    setActiveId(null);
  };

  // FILTER popup
  const toggleFilter = () => {
    if (!isFilterOpen) setLocalFilters(appliedFilters);
    setIsFilterOpen((p) => !p);
  };

  const applyFilters = () => {
    setAppliedFilters(localFilters);
    setPage(1);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    const empty = {
      sortBy: { name: null, price: null },
      danh_muc_ids: [],
      thuong_hieu_ids: [],
      priceRange: { min: "", max: "" },
      status: [],
      stockStatus: [],
    };
    setLocalFilters(empty);
    setAppliedFilters(empty);
    setPage(1);
    setIsFilterOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, appliedFilters]);

  // delete SP
  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["san-pham"] });
      },
    });
  };

  // ===========================
  // Render bảng
  // ===========================
  const renderBody = () => {
    if (isLoading) {
      return (
        <tbody>
          {Array.from({ length: perPage }).map((_, i) => (
            <tr key={i} className="h-[61px] animate-pulse border-b">
              {Array.from({ length: 8 }).map((__, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 bg-slate-300/60 dark:bg-slate-600/40 rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    }

    if (isError) {
      return (
        <tbody>
          <tr>
            <td colSpan={8} className="h-[504px]">
              <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
                <AlertCircle size={46} className="mb-4" />
                <p className="font-semibold mb-1">Không thể tải dữ liệu</p>
                <p className="text-sm mb-4">
                  {error?.message || "Đã xảy ra lỗi"}
                </p>
                <button
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["san-pham"] })
                  }
                  className="px-4 py-2 rounded bg-red-500 text-white"
                >
                  Thử lại
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (feFilteredProducts.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={8} className="h-[504px]">
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <Inbox size={50} className="mb-3" />
                <p className="font-semibold">Không tìm thấy sản phẩm nào</p>
                <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc từ khóa.</p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    const emptyRows = perPage - feFilteredProducts.length;

    return (
      <tbody>
        {feFilteredProducts.map((item) => (
          <TableRow
            key={item.id}
            item={item}
            onView={() => openModal("view", item.id)}
            onEdit={() => openModal("edit", item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        ))}

        {emptyRows > 0 &&
          Array.from({ length: emptyRows }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-[61px]">
              <td colSpan={8} />
            </tr>
          ))}
      </tbody>
    );
  };

  return (
    <div className="p-6 min-h-screen text-slate-800 dark:text-slate-200">
      {/* MODALS */}
      {(modalType === "add" || modalType === "edit") && (
        <AddProductModal
          mode={modalType}
          productId={activeId}
          onClose={closeModal}
        />
      )}

      {modalType === "view" && (
        <ProductDetailModal productId={activeId} onClose={closeModal} />
      )}

      {/* CARD */}
      <div className="w-full max-w-7xl mx-auto rounded-2xl shadow-xl bg-slate-200/80 dark:bg-slate-800/70 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>
          {isFetching && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang đồng bộ...</span>
            </div>
          )}
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* search */}
          <div className="relative flex-1 min-w-[280px]">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/40 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={toggleFilter}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/5 dark:bg-white/10"
              >
                <Filter size={18} /> Lọc & sắp xếp
              </button>

              {isFilterOpen && (
                <FilterPopup
                  onClose={() => setIsFilterOpen(false)}
                  localFilters={localFilters}
                  handleSortChange={(groupKey, direction) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      sortBy: {
                        ...prev.sortBy,
                        [groupKey]:
                          prev.sortBy[groupKey] === direction
                            ? null
                            : direction,
                      },
                    }))
                  }
                  handleMultiSelectChange={(key, value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      [key]: Array.isArray(prev[key])
                        ? prev[key].includes(value)
                          ? prev[key].filter((v) => v !== value)
                          : [...prev[key], value]
                        : [value],
                    }))
                  }
                  handleRangeChange={(filterKey, rangeKey, value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      [filterKey]: {
                        ...prev[filterKey],
                        [rangeKey]: value,
                      },
                    }))
                  }
                  onApply={applyFilters}
                  onReset={resetFilters}
                  danhMucList={danhMucData?.data || []}
                  thuongHieuList={thuongHieuData?.data || []}
                />
              )}
            </div>

            {/* add */}
            <button
              onClick={() => openModal("add")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-slate-600"
            >
              <Plus size={18} /> Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg border border-black/5 dark:border-white/10">
          <table className="w-full">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase w-[8%]">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase w-[28%]">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase w-[12%]">
                  Thương hiệu
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[10%]">
                  Giá
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[8%]">
                  SL
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[12%]">
                  Trạng thái Sản phẩm
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[13%]">
                  Trạng thái Kinh doanh
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[9%]">
                  Hành động
                </th>
              </tr>
            </thead>

            {renderBody()}
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          page={page}
          pages={totalPages}
          setPage={setPage}
          isLoading={isLoading}
          showing={feFilteredProducts.length}
          total={totalItems}
        />
      </div>
    </div>
  );
};

export default Inventory;
