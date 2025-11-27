// src/components/common/PhieuThu/PhieuThuDetailModal.jsx
// ======================================================
// Modal xem chi tiết 1 phiếu thu – chịu được nhiều format BE
// ======================================================

import { useQuery } from "@tanstack/react-query";
import { getPhieuThu } from "../../../api/phieuThuApi";

export default function PhieuThuDetailModal({ phieuThuId, onClose }) {
  const {
    data: ptRaw,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["phieu-thu-detail", phieuThuId],
    queryFn: () => getPhieuThu(phieuThuId),
  });

  const pt = ptRaw || {};

  const ngayNhap = pt.ngay_thu || pt.ngay_tao || pt.ngay_cap_nhat || null;

  const chiTiet =
    pt.cac_chi_tiet_phieu_thu ||
    pt.phieu_thu_chi_tiets ||
    pt.chi_tiet_phieu_thu ||
    [];

  const tongTien =
    pt.tong_gia_tri ??
    chiTiet.reduce((sum, item) => {
      const sl = Number(item.so_luong || 0);
      const gia = Number(item.gia_nhap_tung_vat || 0);
      return sum + sl * gia;
    }, 0);

  const formatVnd = (n) =>
    Number(n || 0).toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    }) + "₫";

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-200/70 dark:border-emerald-500/40 bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-slate-50 shadow-2xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/90">
          <div>
            <h2 className="text-lg font-semibold">
              Chi tiết phiếu thu {pt.ma_phieu_thu ? `– ${pt.ma_phieu_thu}` : ""}
            </h2>
            {ngayNhap && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ngày nhập: {new Date(ngayNhap).toLocaleString("vi-VN")}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading && (
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Đang tải chi tiết...
            </div>
          )}
          {isError && (
            <div className="text-sm text-red-500 dark:text-red-400">
              Không tải được chi tiết phiếu thu
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {/* info chung */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">Mã phiếu</p>
                  <p className="font-medium">{pt.ma_phieu_thu || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">
                    Nhà cung cấp
                  </p>
                  <p className="font-medium">{pt.ten_nha_cung_cap || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">
                    Ngày nhập
                  </p>
                  <p className="font-medium">
                    {ngayNhap
                      ? new Date(ngayNhap).toLocaleString("vi-VN")
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">
                    Tổng giá trị
                  </p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-300">
                    {formatVnd(tongTien)}
                  </p>
                </div>
              </div>

              {/* bảng chi tiết */}
              <div className="rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Biến thể</th>
                      <th className="p-2 text-right">SL</th>
                      <th className="p-2 text-right">Giá nhập</th>
                      <th className="p-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chiTiet.map((ct, idx) => {
                      const sl = Number(ct.so_luong || 0);
                      const gia = Number(ct.gia_nhap_tung_vat || 0);
                      const thanhTien = sl * gia;

                      const tenBienThe =
                        ct.ten_bien_the ||
                        ct.ten_san_pham?.concat(
                          ct.ten_bien_the ? ` – ${ct.ten_bien_the}` : ""
                        ) ||
                        (ct.ten_san_pham && ct.ten_san_pham) ||
                        `Biến thể #${ct.bien_the_san_pham_id}`;

                      return (
                        <tr
                          key={ct.id || idx}
                          className="border-t border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors"
                        >
                          <td className="p-2">{idx + 1}</td>
                          <td className="p-2">{tenBienThe}</td>
                          <td className="p-2 text-right">{sl}</td>
                          <td className="p-2 text-right">{formatVnd(gia)}</td>
                          <td className="p-2 text-right">
                            {formatVnd(thanhTien)}
                          </td>
                        </tr>
                      );
                    })}

                    {chiTiet.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 text-center text-slate-500 dark:text-slate-400"
                        >
                          Phiếu chưa có dòng chi tiết
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {chiTiet.length > 0 && (
                    <tfoot className="bg-slate-50/90 dark:bg-slate-900/90">
                      <tr>
                        <td
                          colSpan={4}
                          className="p-2 text-right font-semibold"
                        >
                          Tổng
                        </td>
                        <td className="p-2 text-right font-bold text-emerald-600 dark:text-emerald-300">
                          {formatVnd(tongTien)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </>
          )}
        </div>

        {/* footer */}
        <div className="px-6 py-3 border-t border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/90 text-right">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
