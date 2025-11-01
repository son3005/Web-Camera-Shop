// src/pages/Admin/Inventory.jsx
// Đây là file trang chính, kết hợp logic từ Inventory.jsx và SanPhamListPage.jsx
import React, { useState, useMemo } from "react";
import { useSanPhams, useXoaSanPham } from "../../hooks/useSanPham"; //
import { useDebounce } from "../../hooks/useDebounce"; //
import {
  tinhTongTonKho,
  tinhKhoangGia, // Cần cho export
  formatCurrency, // Cần cho export
} from "../../utils/productUtils"; // Giả sử bạn đã tạo file này

// Import các component con
import { SanPhamTable } from "./SanPhamTable"; //
import { ChiTietSanPhamModal } from "./ChiTietSanPhamModal"; //
import { SanPhamFormModal } from "./SanPhamFormModal"; //

// Import thư viện
import { LucideSearch, Plus, FileDown } from "lucide-react";
import Swal from "sweetalert2";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Đổi tên component thành Inventory
export const Inventory = () => {
  // --- State Quản lý ---
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSanPhamId, setSelectedSanPhamId] = useState(null);

  // --- State Bộ lọc & Tìm kiếm ---
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 });
  const debouncedSearchTerm = useDebounce(searchTerm, 500); //

  // --- Data Fetching ---
  const queryParams = useMemo(() => {
    const params = {
      ...pagination,
    };
    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }
    return params;
  }, [pagination, debouncedSearchTerm]);

  const {
    data: sanPhamsData,
    isLoading,
    isError,
    error,
  } = useSanPhams(queryParams); //

  // --- Mutations ---
  const xoaSanPhamMutation = useXoaSanPham(); //

  // --- Handlers (Modal) ---
  const handleViewDetails = (id) => {
    setSelectedSanPhamId(id);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    setSelectedSanPhamId(id);
    setShowAddEditModal(true);
  };

  const handleAddNew = () => {
    setSelectedSanPhamId(null); // Đặt ID là null để Form biết là "Thêm mới"
    setShowAddEditModal(true);
  };

  const handleDelete = (id, tenSanPham) => {
    Swal.fire({
      title: `Bạn có chắc chắn muốn xóa "${tenSanPham}"?`,
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý, xóa!",
      cancelButtonText: "Hủy bỏ",
    }).then((result) => {
      if (result.isConfirmed) {
        // Gọi mutation khi người dùng xác nhận
        xoaSanPhamMutation.mutate(id);
      }
    });
  };

  // Hàm đóng tất cả modal
  const closeModal = () => {
    setShowViewModal(false);
    setShowAddEditModal(false);
    setSelectedSanPhamId(null);
  };

  // --- Handlers (Export) ---
  const handleExportExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sản Phẩm");

    sheet.columns = [
      { header: "Mã SP", key: "ma_san_pham", width: 10 },
      { header: "Tên Sản Phẩm", key: "ten_san_pham", width: 30 },
      { header: "Danh Mục", key: "danh_muc", width: 20 },
      { header: "Thương Hiệu", key: "thuong_hieu", width: 20 },
      { header: "Giá Min", key: "gia_min", width: 15 },
      { header: "Giá Max", key: "gia_max", width: 15 },
      { header: "Tổng Tồn", key: "tong_ton", width: 10 },
    ];

    const products = sanPhamsData?.data || [];
    products.forEach((sp) => {
      const khoangGia = tinhKhoangGia(sp.cac_bien_the);
      sheet.addRow({
        ma_san_pham: sp.ma_san_pham,
        ten_san_pham: sp.ten_san_pham,
        danh_muc: sp.danh_muc.ten_danh_muc,
        thuong_hieu: sp.thuong_hieu.ten_thuong_hieu,
        gia_min: khoangGia.min,
        gia_max: khoangGia.max,
        tong_ton: tinhTongTonKho(sp.cac_bien_the),
      });
    });
    
    // Style cho hàng header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDDDDD" },
    };

    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), "DanhSachSanPham.xlsx");
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const products = sanPhamsData?.data || [];
    
    // Cần font hỗ trợ tiếng Việt (ví dụ: Arimo)
    // doc.addFont("Arimo-Regular.ttf", "Arimo", "normal");
    // doc.setFont("Arimo");
    doc.text("Danh Sách Sản Phẩm", 14, 10);

    const tableData = products.map((sp) => {
      const khoangGia = tinhKhoangGia(sp.cac_bien_the);
      const gia =
        khoangGia.min === khoangGia.max
          ? formatCurrency(khoangGia.min)
          : `${formatCurrency(khoangGia.min)} - ${formatCurrency(khoangGia.max)}`;

      return [
        sp.ma_san_pham,
        sp.ten_san_pham,
        sp.danh_muc.ten_danh_muc,
        gia,
        tinhTongTonKho(sp.cac_bien_the),
      ];
    });

    doc.autoTable({
      head: [["Mã SP", "Tên Sản Phẩm", "Danh Mục", "Khoảng Giá", "Tổng Tồn"]],
      body: tableData,
      // styles: { font: "Arimo" }, // Áp dụng font
    });

    doc.save("DanhSachSanPham.pdf");
  };

  // --- Render ---
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Sản phẩm</h1>

      {/* Thanh công cụ: Search, Thêm mới, Export */}
      <div className="flex justify-between items-center mb-4 gap-4">
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã sản phẩm..."
            className="border p-2 rounded w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <LucideSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2"
          >
            <FileDown size={18} /> <span className="hidden md:inline">Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-2"
          >
            <FileDown size={18} /> <span className="hidden md:inline">PDF</span>
          </button>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2"
          >
            <Plus size={18} /> <span className="hidden md:inline">Thêm mới</span>
          </button>
        </div>
      </div>
      
      {/* Bảng dữ liệu */}
      {isLoading && <div>Đang tải dữ liệu...</div>}
      {isError && <div>Lỗi: {error?.message}</div>}
      {sanPhamsData && (
        <SanPhamTable
          sanPhams={sanPhamsData.data}
          onView={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      
      {/* TODO: Thêm component Phân Trang (Pagination) ở đây nếu API hỗ trợ */}

      {/* Modals (Render có điều kiện) */}
      {showViewModal && (
        <ChiTietSanPhamModal
          sanPhamId={selectedSanPhamId}
          onClose={closeModal}
        />
      )}
      
      {showAddEditModal && (
        <SanPhamFormModal
          sanPhamId={selectedSanPhamId}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

// Thêm export default để lazy load trong AdminRoutes hoạt động
export default Inventory;