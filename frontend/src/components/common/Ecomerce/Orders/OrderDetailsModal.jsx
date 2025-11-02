// src/components/common/Ecomerce/Orders/OrderDetailsModal.jsx (Đã sửa)
import React from "react";
import { X, User, MapPin, Phone, LoaderCircle } from "lucide-react";
import { format } from 'date-fns';

// --- IMPORT HOOKS THẬT ---
import { useDonHangChiTiet, useCapNhatTrangThaiDonHang } from "../../../../hooks/useDonHangs"; // Đường dẫn hook của bạn

// --- (SỬA) Nhận thêm prop `isAdmin` ---
const OrderDetailsModal = ({ orderId, onClose, trangThaiMap, isAdmin = false }) => {

  // --- TỰ GỌI API ĐỂ LẤY DỮ LIỆU (Truyền isAdmin vào hook) ---
  const { data: order, isLoading, isError, error } = useDonHangChiTiet(orderId, isAdmin); // <--- SỬA Ở ĐÂY
  const { mutate: capNhatTrangThai, isLoading: isUpdating } = useCapNhatTrangThaiDonHang();

  // Hiển thị loading/error
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true"></div>
        <LoaderCircle size={48} className="animate-spin text-white" />
      </div>
    );
  }
  if (isError || !order) {
     return (
       <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
         <div className="relative max-w-sm w-full mx-auto bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl text-center">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Lỗi</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Không thể tải chi tiết đơn hàng. Vui lòng thử lại. <br/>
                {error?.response?.data?.error || error?.message}
            </p>
            <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md text-sm font-medium">Đóng</button>
         </div>
       </div>
    );
  }

  // Xác định trạng thái tiếp theo
  const nextStatusEnum = {
    'CHO_XAC_NHAN': 'DA_XAC_NHAN',
    'DA_XAC_NHAN': 'DANG_GIAO_HANG',
    'DANG_GIAO_HANG': 'HOAN_THANH',
  }[order.trang_thai];
  const nextStatusText = nextStatusEnum ? trangThaiMap[nextStatusEnum]?.text : null;

  // Hàm xử lý update
  const handleUpdate = () => {
    if (nextStatusEnum && !isUpdating) {
      capNhatTrangThai({
        donHangId: order.id,
        data: { trang_thai: nextStatusEnum }
      }, {
          onSuccess: () => onClose() // Đóng modal sau khi thành công
      });
    }
  };

  return (
    // Phần JSX container giữ nguyên
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      <div className="relative max-w-2xl w-full mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-slate-700 z-10 max-h-[90vh] flex flex-col">
        {/* Header (Giữ nguyên) */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Chi tiết Đơn hàng #{order.ma_don_hang}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <X size={24} />
          </button>
        </div>

        {/* Body (Hiển thị dữ liệu thật) */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Thông tin khách hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/5 dark:bg-white/10 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">THÔNG TIN GIAO HÀNG</h3>
              <InfoRow icon={User} text={order.ten_nguoi_nhan} />
              <InfoRow icon={Phone} text={order.so_dien_thoai_nhan} />
              <InfoRow icon={MapPin} text={order.dia_chi_giao_hang} />
            </div>
            <div className="bg-black/5 dark:bg-white/10 p-4 rounded-lg space-y-2">
               <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">CHI TIẾT ĐƠN</h3>
               <DetailRow label="Ngày đặt" value={format(new Date(order.ngay_tao), 'dd/MM/yyyy HH:mm')} />
               <DetailRow label="Trạng thái" value={trangThaiMap[order.trang_thai]?.text} />
               {/* Kiểm tra null trước khi truy cập thanh_toan */}
               <DetailRow label="Thanh toán" value={order.thanh_toan?.phuong_thuc?.toUpperCase() || 'N/A'} />
               <DetailRow label="Trạng thái TT" value={order.thanh_toan?.trang_thai || 'N/A'} />
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">SẢN PHẨM ({order.cac_chi_tiet?.length || 0})</h3>
            <div className="space-y-3">
              {(order.cac_chi_tiet || []).map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-3 bg-black/5 dark:bg-white/10 rounded-lg">
                  {/* (Tạm ẩn ảnh) */}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{p.ten_san_pham_luc_mua}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {p.sku_luc_mua}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.ten_bien_the_luc_mua}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-600 dark:text-slate-300">{p.so_luong} x {p.don_gia_luc_mua.toLocaleString()} đ</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{(p.so_luong * p.don_gia_luc_mua).toLocaleString()} đ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions & Total (Giữ nguyên) */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
          <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tạm tính:</p>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{order.tam_tinh?.toLocaleString() || 0} đ</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Tổng cộng:</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{order.tong_tien?.toLocaleString() || 0} đ</p>
          </div>
          {nextStatusText && isAdmin && ( // Chỉ admin mới thấy nút update
            <button
                onClick={handleUpdate}
                disabled={isUpdating} // Disable khi đang update
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-bold bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isUpdating ? <LoaderCircle size={18} className="animate-spin" /> : null}
              Chuyển sang "{nextStatusText}"
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Component phụ InfoRow, DetailRow (Giữ nguyên)
const InfoRow = ({ icon: Icon, text }) => (
  <div className="flex items-start gap-2 mt-1">
    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
    <p className="text-sm text-slate-700 dark:text-slate-200">{text || 'N/A'}</p>
  </div>
);
const DetailRow = ({ label, value }) => (
   <div className="flex justify-between text-sm">
      <p className="text-slate-500 dark:text-slate-400">{label}:</p>
      <p className="font-semibold text-slate-700 dark:text-slate-200">{value || 'N/A'}</p>
   </div>
);


export default OrderDetailsModal;