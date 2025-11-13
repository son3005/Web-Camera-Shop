import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { taoDonHangAo } from "../api/thanhToanApi";
import { useCart } from "../hooks/useCart";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems = [], totalPrice = 0 } = useCart();

  // --- State form ---
  const [tenNguoiNhan, setTenNguoiNhan] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [phuongThuc, setPhuongThuc] = useState("payos_qr");
  const [loading, setLoading] = useState(false);

  // --- Tính tổng tiền ---
  const phiVanChuyen = 2000;
  const tongTienHang = useMemo(() => {
    return (cartItems || []).reduce(
      (sum, i) => sum + (Number(i.gia_ban) || 0) * (Number(i.so_luong) || 0),
      0
    );
  }, [cartItems]);
  const tongCong = tongTienHang + phiVanChuyen;

  // --- Gửi đơn hàng ---
  const handleSubmit = async () => {
    if (!tenNguoiNhan || !soDienThoai || !diaChi) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống!");
      return;
    }

    const items = cartItems.map((i) => ({
      id_bien_the: i.bien_the_id || i.id, // đảm bảo đúng key backend yêu cầu
      so_luong: i.so_luong || 1,
    }));

    const payload = {
      ten_nguoi_nhan: tenNguoiNhan,
      so_dien_thoai_nguoi_nhan: soDienThoai,
      dia_chi_giao: diaChi,
      phuong_thuc_thanh_toan: phuongThuc,
      phi_van_chuyen: phiVanChuyen,
      ghi_chu: ghiChu || "",
      items,
    };

    try {
      setLoading(true);
      const res = await taoDonHangAo(payload);

      // Backend trả về { data: { payment_url, ... } }
      const data = res?.data?.data;
      if (!data) throw new Error("Không nhận được phản hồi từ máy chủ!");

      if (data.payment_url) {
        // ✅ Thanh toán PayOS
        window.location.href = data.payment_url;
      } else {
        // ✅ COD (đơn thật đã tạo)
        toast.success("Đặt hàng thành công!");
        navigate("/orders");
      }
    } catch (err) {
      console.error("❌ Lỗi tạo đơn hàng:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể tạo đơn hàng!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-2xl font-semibold mb-6">Thanh toán</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ==================== CỘT TRÁI ==================== */}
        <div className="md:col-span-2 bg-slate-800/40 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-3">Thông tin giao hàng</h2>

          <div className="space-y-3">
            <input
              placeholder="Tên người nhận"
              className="w-full p-3 rounded-md bg-slate-700 text-white"
              value={tenNguoiNhan}
              onChange={(e) => setTenNguoiNhan(e.target.value)}
            />
            <input
              placeholder="Số điện thoại"
              className="w-full p-3 rounded-md bg-slate-700 text-white"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
            />
            <textarea
              placeholder="Địa chỉ giao hàng"
              rows={2}
              className="w-full p-3 rounded-md bg-slate-700 text-white"
              value={diaChi}
              onChange={(e) => setDiaChi(e.target.value)}
            />
            <textarea
              placeholder="Ghi chú (nếu có)"
              rows={2}
              className="w-full p-3 rounded-md bg-slate-700 text-white"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </div>

          {/* === Phương thức thanh toán === */}
          <h2 className="text-lg font-semibold mt-6 mb-3">
            Phương thức thanh toán
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { id: "payos_qr", label: "QR PayOS" },
              { id: "cod", label: "Thanh toán khi nhận hàng (COD)" },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3 border rounded-md cursor-pointer ${
                  phuongThuc === opt.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-600 hover:border-slate-400"
                }`}
              >
                <input
                  type="radio"
                  value={opt.id}
                  checked={phuongThuc === opt.id}
                  onChange={(e) => setPhuongThuc(e.target.value)}
                  className="mr-2 accent-emerald-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* ==================== CỘT PHẢI ==================== */}
        <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 h-fit">
          <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

          <div className="space-y-2 text-sm">
            {(cartItems || []).length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.ten_san_pham} x {item.so_luong}
                  </span>
                  <span>
                    {Number(item.gia_ban).toLocaleString("vi-VN")}₫
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 italic text-sm">
                Giỏ hàng trống
              </div>
            )}

            <div className="flex justify-between mt-3 text-slate-300">
              <span>Phí vận chuyển</span>
              <span>{phiVanChuyen.toLocaleString("vi-VN")}₫</span>
            </div>

            <div className="flex justify-between font-bold mt-2 text-lg border-t border-slate-700 pt-2">
              <span>Tổng cộng</span>
              <span>{tongCong.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold"
          >
            {loading ? "Đang xử lý..." : "Đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
