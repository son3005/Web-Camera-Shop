// src/components/admin/inventory/ExportButtons.jsx
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ExportButtons({ data }) {
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableData = data.map((p) => {
      const prices = p.cac_bien_the.map(bt =>
        bt.gia_khuyen_mai && bt.gia_khuyen_mai < bt.gia_ban ? bt.gia_khuyen_mai : bt.gia_ban
      );
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const ton = p.cac_bien_the.reduce((s, bt) => s + bt.so_luong_ton, 0);
      return [p.ma_san_pham, p.ten_san_pham, p.danh_muc.ten_danh_muc, p.thuong_hieu.ten_thuong_hieu, `${min} - ${max}`, ton];
    });

    autoTable(doc, {
      head: [['Mã SP', 'Tên', 'Danh mục', 'Thương hiệu', 'Giá (min-max)', 'Tồn kho']],
      body: tableData,
    });
    doc.save('san_pham.pdf');
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sản phẩm');

    sheet.addRow(['Mã SP', 'Tên', 'Danh mục', 'Thương hiệu', 'Giá (min-max)', 'Tồn kho']);
    data.forEach((p) => {
      const prices = p.cac_bien_the.map(bt =>
        bt.gia_khuyen_mai && bt.gia_khuyen_mai < bt.gia_ban ? bt.gia_khuyen_mai : bt.gia_ban
      );
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const ton = p.cac_bien_the.reduce((s, bt) => s + bt.so_luong_ton, 0);
      sheet.addRow([p.ma_san_pham, p.ten_san_pham, p.danh_muc.ten_danh_muc, p.thuong_hieu.ten_thuong_hieu, `${min} - ${max}`, ton]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'san_pham.xlsx');
  };

  return (
    <>
      <button className="px-2 py-1 border border-gray-300 rounded text-sm" onClick={exportPDF}>
        PDF
      </button>
      <button className="px-2 py-1 border border-gray-300 rounded text-sm" onClick={exportExcel}>
        Excel
      </button>
    </>
  );
}