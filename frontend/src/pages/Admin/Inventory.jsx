// frontend/src/pages/Admin/Inventory.jsx
// Trang quản lý Kho hàng (Inventory) – lấy dữ liệu từ backend /api/san-pham
// và sử dụng các hook đã chuẩn hóa: useProducts, useCatalogs

import React, { useState, useEffect, useRef } from "react"; // import React và các hook cơ bản
import {
  Search, // icon ô tìm kiếm
  Plus, // icon nút "Thêm sản phẩm"
  ChevronLeft, // icon chuyển trang trái
  ChevronRight, // icon chuyển trang phải
  Inbox, // icon khi không có dữ liệu
  AlertCircle, // icon khi lỗi
  Filter, // icon nút lọc
  Loader2, // icon loading quay
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query"; // để refetch / invalidate khi lỗi hoặc sau khi xóa

// các component con dùng chung
import TableRow from "../../components/common/Inventory/TableRow"; // mỗi dòng trong bảng
import AddProductModal from "../../components/common/Inventory/AddProductModal"; // modal thêm / sửa
import ProductDetailModal from "../../components/common/Inventory/ProductDetailModal"; // modal xem chi tiết
import FilterPopup from "../../components/common/Inventory/FilterPopup"; // popup lọc

// các hook gọi API
import { useProducts } from "../../hooks/useProducts"; // hook sản phẩm
import { useCatalogs } from "../../hooks/useCatalogs"; // hook danh mục / thương hiệu

// ---------------------------------------------------------
// hook debounce nhỏ để giảm số lần gọi API khi gõ tìm kiếm
// ---------------------------------------------------------
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value); // state lưu giá trị sau debounce

  useEffect(() => {
    // tạo timer chờ "delay" ms
    const handler = setTimeout(() => {
      setDebouncedValue(value); // hết thời gian thì cập nhật
    }, delay);

    // clear timer nếu value thay đổi trước khi hết thời gian
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue; // trả về giá trị đã debounce
};

// ---------------------------------------------------------
// hook gom toàn bộ state UI của trang Inventory
// để component chính bớt dài
// ---------------------------------------------------------
const useInventoryUI = () => {
  const [searchTerm, setSearchTerm] = useState(""); // từ khóa đang gõ
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // từ khóa sau khi debounce 300ms

  const [activeProductId, setActiveProductId] = useState(null); // id sản phẩm đang thao tác (xem / sửa)
  const [modalType, setModalType] = useState(null); // kiểu modal: 'add' | 'edit' | 'view' | null

  const [currentPage, setCurrentPage] = useState(1); // trang hiện tại
  const itemsPerPage = 10; // số bản ghi mỗi trang

  const [isFilterOpen, setIsFilterOpen] = useState(false); // popup filter có đang mở không

  // bộ filter mặc định
  const initialFilters = {
    sortBy: { name: null, price: null, stock: null }, // sắp xếp theo tên / giá
    brands: [], // không dùng nữa nhưng giữ lại để dễ mở rộng
    status: [], // trạng thái kinh doanh
    stockStatus: [], // trạng thái tồn kho
    priceRange: { min: "", max: "" }, // khoảng giá
    danh_muc_ids: [], // danh mục được chọn
    thuong_hieu_ids: [], // thương hiệu được chọn
  };

  const [localFilters, setLocalFilters] = useState(initialFilters); // filter hiển thị trong popup
  const [appliedFilters, setAppliedFilters] = useState(initialFilters); // filter thực sự áp vào API

  // mở modal với type và id tương ứng
  const openModal = (type, productId = null) => {
    setModalType(type);
    setActiveProductId(productId);
  };

  // đóng modal
  const closeModal = () => {
    setModalType(null);
    setActiveProductId(null);
  };

  // đổi kiểu sắp xếp trong popup
  const handleSortChange = (groupKey, direction) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: {
        ...prev.sortBy,
        // nếu click lại cùng 1 hướng thì bỏ sắp xếp
        [groupKey]: prev.sortBy[groupKey] === direction ? null : direction,
      },
    }));
  };

  // bật / tắt 1 giá trị thuộc kiểu mảng (danh mục, thương hiệu, trạng thái...)
  const handleMultiSelectChange = (filterKey, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filterKey]: prev[filterKey].includes(value)
        ? prev[filterKey].filter((v) => v !== value) // nếu đã có thì bỏ
        : [...prev[filterKey], value], // nếu chưa có thì thêm
    }));
  };

  // đổi khoảng giá
  const handleRangeChange = (filterKey, rangeKey, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filterKey]: { ...prev[filterKey], [rangeKey]: value },
    }));
  };

  // khi bấm "Áp dụng" trong popup
  const applyFilters = () => {
    setCurrentPage(1); // về trang 1
    setAppliedFilters(localFilters); // gán filter chính = filter trong popup
    setIsFilterOpen(false); // đóng popup
  };

  // khi bấm "Xóa lọc"
  const resetFilters = () => {
    setLocalFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  // bật / tắt popup lọc
  const toggleFilterPopup = () => {
    if (!isFilterOpen) {
      // nếu chuẩn bị mở popup thì copy filter đang dùng ra để chỉnh
      setLocalFilters(appliedFilters);
    }
    setIsFilterOpen((prev) => !prev);
  };

  // khi từ khóa tìm kiếm hoặc filter thực tế thay đổi → quay về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, appliedFilters]);

  // trả về toàn bộ state và handler để component chính dùng
  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    activeProductId,
    modalType,
    openModal,
    closeModal,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    isFilterOpen,
    toggleFilterPopup,
    setIsFilterOpen,
    localFilters,
    appliedFilters,
    handleSortChange,
    handleMultiSelectChange,
    handleRangeChange,
    applyFilters,
    resetFilters,
  };
};

// ---------------------------------------------------------
// Component phân trang riêng
// ---------------------------------------------------------
const Pagination = ({
  currentPage, // trang hiện tại
  totalPages, // tổng số trang
  setCurrentPage, // hàm đổi trang
  dataLength, // số bản ghi đang hiển thị
  totalLength, // tổng bản ghi từ server
  isLoading, // có đang tải không
}) => {
  const [goToPage, setGoToPage] = useState(currentPage); // ô "đến trang"

  // khi submit ô "đến trang"
  const handleGoToPage = (e) => {
    e.preventDefault();
    let pageNum = parseInt(goToPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setGoToPage(currentPage);
    }
  };

  // đồng bộ lại khi currentPage thay đổi từ bên ngoài
  useEffect(() => {
    setGoToPage(currentPage);
  }, [currentPage]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
      {/* đoạn thống kê số bản ghi – tách hẳn ra span để khỏi lỗi <div> trong <p> */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang tải...</span>
          </div>
        ) : (
          <span>
            Hiển thị {dataLength} trên {totalLength} kết quả
          </span>
        )}
      </div>

      {/* chỉ hiển thị nút phân trang nếu có hơn 1 trang */}
      {totalPages > 1 && (
        <div className="flex items-center gap-4">
          {/* cụm nút qua lại */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-50 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-semibold">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="p-2 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-50 transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* ô nhập đến trang */}
          <form onSubmit={handleGoToPage} className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              disabled={isLoading}
              className="w-16 px-2 py-1.5 text-center rounded-md bg-white/40 dark:bg-slate-700/50 border border-transparent focus:border-cyan-500 focus:ring-cyan-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 text-sm font-semibold rounded-md bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 transition disabled:opacity-50"
            >
              Đến
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------
// Component chính: Inventory
// ---------------------------------------------------------
const Inventory = () => {
  const queryClient = useQueryClient(); // để refetch khi cần
  const filterContainerRef = useRef(null); // ref để click ra ngoài đóng popup

  // lấy toàn bộ state UI từ custom hook
  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    activeProductId,
    modalType,
    openModal,
    closeModal,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    isFilterOpen,
    toggleFilterPopup,
    setIsFilterOpen,
    localFilters,
    appliedFilters,
    handleSortChange,
    handleMultiSelectChange,
    handleRangeChange,
    applyFilters,
    resetFilters,
  } = useInventoryUI();

  // lấy các hook API đã chuẩn hóa
  const { useGetAllSanPham, useDeleteSanPham } = useProducts();
  const { useGetAllDanhMuc, useGetAllThuongHieu } = useCatalogs();

  // gọi API lấy danh mục (để hiện trong filter)
  const { data: danhMucData } = useGetAllDanhMuc({ page: 1, per_page: 100 });
  // gọi API lấy thương hiệu (để hiện trong filter)
  const { data: thuongHieuData } = useGetAllThuongHieu({
    page: 1,
    per_page: 100,
  });

  // chuẩn bị params để gọi API sản phẩm
  const apiFilters = {
    page: currentPage,
    per_page: itemsPerPage,
    search: debouncedSearchTerm || undefined,
    min_price: appliedFilters.priceRange.min || undefined,
    max_price: appliedFilters.priceRange.max || undefined,
    sort_by_price: appliedFilters.sortBy.price || undefined,
    sort_by_name: appliedFilters.sortBy.name || undefined,
    thuong_hieu_ids: appliedFilters.thuong_hieu_ids,
    danh_muc_ids: appliedFilters.danh_muc_ids,
  };

  // gọi API lấy sản phẩm với filter
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetAllSanPham(apiFilters);

  // data bảng
  const products = productsData?.data || []; // danh sách sản phẩm
  const totalPages = productsData?.pagination?.pages || 0; // tổng số trang từ backend
  const totalItems = productsData?.pagination?.total || 0; // tổng số bản ghi từ backend

  // mutation xóa sản phẩm
  const deleteMutation = useDeleteSanPham();

  // hàm xóa sản phẩm
  const handleDeleteProduct = (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      deleteMutation.mutate(productId, {
        onSuccess: () => {
          // xóa xong thì invalidate đúng query có filter hiện tại
          queryClient.invalidateQueries({
            queryKey: ["san-pham", apiFilters],
          });
        },
      });
    }
  };

  // đóng popup lọc khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterContainerRef, setIsFilterOpen]);

  // tính số dòng trống để bảng không co lại
  const emptyRows = products.length > 0 ? itemsPerPage - products.length : 0;

  // render skeleton khi đang loading
  const renderLoadingSkeleton = () => (
    <tbody>
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <tr
          key={index}
          className="border-b border-black/5 dark:border-white/5 h-[61px] animate-pulse"
        >
          <td className="px-4 py-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-6 w-20 mx-auto bg-slate-300 dark:bg-slate-700 rounded-full" />
          </td>
          <td className="px-4 py-3">
            <div className="h-6 w-20 mx-auto bg-slate-300 dark:bg-slate-700 rounded-full" />
          </td>
          <td className="px-4 py-3">
            <div className="w-8 h-8 mx-auto bg-slate-300 dark:bg-slate-700 rounded-full" />
          </td>
        </tr>
      ))}
    </tbody>
  );

  // render khi lỗi mạng / backend
  const renderError = () => (
    <tbody>
      <tr>
        <td colSpan="8" className="h-[504px]">
          <div className="flex flex-col items-center justify-center text-center h-full text-red-500">
            <AlertCircle size={48} className="mb-4" />
            <h3 className="text-xl font-semibold">Không thể tải dữ liệu!</h3>
            <p className="mt-1 text-sm">
              {error?.message || "Đã có lỗi xảy ra"}
            </p>
            <button
              onClick={() =>
                // refetch đúng query hiện tại
                queryClient.invalidateQueries({
                  queryKey: ["san-pham", apiFilters],
                })
              }
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Thử lại
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  );

  return (
    <div className="p-6 min-h-screen text-slate-800 dark:text-slate-200">
      {/* modal thêm / sửa */}
      {(modalType === "add" || modalType === "edit") && (
        <AddProductModal
          mode={modalType}
          productId={activeProductId}
          onClose={closeModal}
        />
      )}

      {/* modal xem chi tiết */}
      {modalType === "view" && (
        <ProductDetailModal productId={activeProductId} onClose={closeModal} />
      )}

      {/* khung chính */}
      <div className="w-full max-w-7xl mx-auto rounded-2xl shadow-xl bg-slate-200/80 dark:bg-slate-800/70 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Quản lý Kho hàng</h1>
          {isFetching && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tải dữ liệu...</span>
            </div>
          )}
        </div>

        {/* thanh hành động: tìm kiếm + lọc + thêm */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* ô tìm kiếm */}
          <div className="relative flex-1 min-w-[300px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/40 dark:bg-slate-700/50 border border-transparent focus:border-cyan-500 focus:ring-cyan-500 transition disabled:opacity-50"
            />
          </div>

          {/* 2 nút bên phải */}
          <div className="flex items-center gap-3">
            {/* nút lọc */}
            <div className="relative" ref={filterContainerRef}>
              <button
                onClick={toggleFilterPopup}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 transition disabled:opacity-50"
              >
                <Filter size={20} /> Lọc & Sắp xếp
              </button>
              {/* popup lọc */}
              {isFilterOpen && (
                <FilterPopup
                  onClose={() => setIsFilterOpen(false)}
                  localFilters={localFilters}
                  handleSortChange={handleSortChange}
                  handleMultiSelectChange={handleMultiSelectChange}
                  handleRangeChange={handleRangeChange}
                  onApply={applyFilters}
                  onReset={resetFilters}
                  danhMucList={danhMucData?.data || []}
                  thuongHieuList={thuongHieuData?.data || []}
                />
              )}
            </div>

            {/* nút thêm sản phẩm */}
            <button
              onClick={() => openModal("add")}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-emerald-500 to-slate-600 shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-transform duration-300 disabled:opacity-50"
            >
              <Plus size={20} /> Thêm Sản phẩm
            </button>
          </div>
        </div>

        {/* bảng sản phẩm */}
        <div className="overflow-x-auto rounded-lg border border-black/5 dark:border-white/10">
          <table className="w-full">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase w-[8%]">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase w-[27%]">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase w-[12%]">
                  Thương hiệu
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[10%]">
                  Giá
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[8%]">
                  Số lượng
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[12%]">
                  Tồn kho
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[13%]">
                  Kinh doanh
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold uppercase w-[10%]">
                  Hành động
                </th>
              </tr>
            </thead>

            {/* thân bảng: 3 trạng thái – loading / error / có dữ liệu */}
            {isLoading ? (
              renderLoadingSkeleton()
            ) : isError ? (
              renderError()
            ) : (
              <tbody>
                {/* lặp sản phẩm */}
                {products.map((item) => (
                  <TableRow
                    key={item.id}
                    item={item}
                    onView={() => openModal("view", item.id)}
                    onEdit={() => openModal("edit", item.id)}
                    onDelete={() => handleDeleteProduct(item.id)}
                  />
                ))}

                {/* thêm dòng trống nếu trang này ít hơn itemsPerPage */}
                {emptyRows > 0 &&
                  Array.from({ length: emptyRows }).map((_, index) => (
                    <tr key={`empty-${index}`} className="h-[61px]">
                      <td colSpan="8">&nbsp;</td>
                    </tr>
                  ))}

                {/* khi không có sản phẩm */}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="8" className="h-[504px]">
                      <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 dark:text-slate-400">
                        <Inbox size={48} className="mb-4" />
                        <h3 className="text-xl font-semibold">
                          Không tìm thấy sản phẩm nào
                        </h3>
                        <p className="mt-1 text-sm">
                          Hãy thử thay đổi từ khóa tìm kiếm hoặc các bộ lọc.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* phân trang */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          dataLength={products.length}
          totalLength={totalItems}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Inventory;
