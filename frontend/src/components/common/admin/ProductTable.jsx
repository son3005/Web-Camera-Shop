// src/components/admin/inventory/ProductTable.jsx
import React, { useState, useMemo } from 'react';
import { useDanhSachSanPham, useXoaSanPham } from '../../../hooks/use_san_pham';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import SearchBar from './SearchBar';
import ExportButtons from './ExportButtons';

const columnHelper = createColumnHelper();

export default function ProductTable({ onView, onEdit, onAdd }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const perPage = 10;

  const { data: responseData, isLoading } = useDanhSachSanPham({ page, per_page: perPage, search });
  const { mutate: xoa } = useXoaSanPham();

  const columns = useMemo(
    () => [
      columnHelper.accessor('ma_san_pham', { header: 'Mã SP' }),
      columnHelper.accessor('ten_san_pham', { header: 'Tên sản phẩm' }),
      columnHelper.accessor((row) => row.danh_muc.ten_danh_muc, { header: 'Danh mục' }),
      columnHelper.accessor((row) => row.thuong_hieu.ten_thuong_hieu, { header: 'Thương hiệu' }),
      columnHelper.display({
        id: 'gia',
        header: 'Giá (min - max)',
        cell: ({ row }) => {
          const prices = row.original.cac_bien_the.map(bt =>
            bt.gia_khuyen_mai && bt.gia_khuyen_mai < bt.gia_ban ? bt.gia_khuyen_mai : bt.gia_ban
          );
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return `${min.toLocaleString()} - ${max.toLocaleString()} ₫`;
        },
      }),
      columnHelper.display({
        id: 'ton_kho',
        header: 'Tổng tồn',
        cell: ({ row }) =>
          row.original.cac_bien_the.reduce((sum, bt) => sum + bt.so_luong_ton, 0),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => onView(row.original.id)}>Xem</button>
            <button className="px-2 py-1 border border-blue-600 text-blue-600 rounded text-sm" onClick={() => onEdit(row.original.id)}>Sửa</button>
            <button
              className="px-2 py-1 bg-red-600 text-white rounded text-sm"
              onClick={() => {
                if (window.confirm('Xác nhận xóa sản phẩm này?')) {
                  xoa(row.original.id);
                }
              }}
            >
              Xóa
            </button>
          </div>
        ),
      }),
    ],
    [onView, onEdit, xoa]
  );

  const table = useReactTable({
    data: responseData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex gap-2">
          <ExportButtons data={responseData?.data || []} />
          <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={onAdd}>+ Thêm sản phẩm</button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center py-8">Đang tải...</p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="border px-4 py-2 text-left">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="border px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span>
              Trang {page} / {responseData?.pagination?.pages || 1}
            </span>
            <button
              disabled={page === responseData?.pagination?.pages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}