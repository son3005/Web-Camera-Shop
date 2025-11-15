// ==========================
// FIXED CheckoutPage.jsx (Only multi-product support)
// ==========================

import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getProduct } from "../api/productApi";
import { taoDonHangAo } from "../api/paymentApi";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // ================================
  // 1) MULTI CHECKOUT
  // ================================
  const itemsFromCart = state?.items || null;
  const isCartCheckout = Array.isArray(itemsFromCart);

  // ================================
  // 2) SINGLE CHECKOUT
  // ================================
  const productId = state?.productId || null;
  const variantId = state?.variantId || null;
  const soLuongInitial = state?.soLuong || 1;

  const { data: product, isLoading } = useQuery({
    queryKey: ["checkout-product", productId],
    queryFn: () => getProduct(productId),
    enabled: !isCartCheckout && !!productId,
  });

  const [soLuong, setSoLuong] = useState(soLuongInitial);

  const [form, setForm] = useState({
    ten_nguoi_nhan: "",
    so_dien_thoai_nguoi_nhan: "",
    dia_chi_giao: "",
    ghi_chu: "",
    phuong_thuc_thanh_toan: "cod",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ================================
  // LẤY VARIANT (SINGLE)
  // ================================
  const variant = useMemo(() => {
    if (!product || isCartCheckout) return null;
    return product.variants.find((v) => v.id === variantId) || null;
  }, [product, variantId, isCartCheckout]);

  // ================================
  // VALIDATION CHO SINGLE
  // ================================
  if (!isCartCheckout && (!productId || !variantId))
    return <div className="p-6">❌ Thiếu dữ liệu sản phẩm.</div>;

  if (!isCartCheckout && isLoading)
    return <div className="p-6">Đang tải sản phẩm...</div>;

  if (!isCartCheckout && (!product || !variant))
    return <div className="p-6">❌ Không tìm thấy sản phẩm.</div>;

  // ================================
  // 3) TÍNH TỔNG
  // ================================
  const phiShip = 2000;

  let tongTien = 0;

  if (isCartCheckout) {
    tongTien =
      itemsFromCart.reduce(
        (total, it) => total + Number(it.don_gia) * it.so_luong,
        0
      ) + phiShip;
  } else {
    tongTien = Number(variant.gia_ban) * soLuong + phiShip;
  }

  // ================================
  // GỌI PAYMENT
  // ================================
  const mutation = useMutation({
    mutationFn: taoDonHangAo,
    onSuccess: (res) => {
      const data = res.data;
      if (form.phuong_thuc_thanh_toan === "payos_qr") {
        window.location.href = data.payment_url;
      } else {
        navigate(`/payment-result/${data.id}?status=cod_thanhcong`);
      }
    },
  });

  // ================================
  // PAYLOAD
  // ================================
  const handleSubmit = () => {
    if (!form.ten_nguoi_nhan || !form.so_dien_thoai_nguoi_nhan || !form.dia_chi_giao) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    let itemsPayload = [];

    if (isCartCheckout) {
      itemsPayload = itemsFromCart.map((it) => ({
        id_bien_the: it.bien_the_id, // FIX — từ giỏ hàng
        so_luong: it.so_luong,
      }));
    } else {
      itemsPayload = [
        {
          id_bien_the: variantId,
          so_luong: soLuong,
        },
      ];
    }

    const payload = {
      ten_nguoi_nhan: form.ten_nguoi_nhan,
      so_dien_thoai_nguoi_nhan: form.so_dien_thoai_nguoi_nhan,
      id_dia_chi: null,
      dia_chi_giao: form.dia_chi_giao,
      phuong_thuc_thanh_toan: form.phuong_thuc_thanh_toan,
      phi_van_chuyen: phiShip,
      ghi_chu: form.ghi_chu,
      url_success: "http://localhost:5173/payment-result/success",
      url_cancel: "http://localhost:5173/payment-result/cancel",
      items: itemsPayload,
    };

    mutation.mutate(payload);
  };

  // ================================
  // UI — GIỮ NGUYÊN 100%
  // ================================

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-10">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* CỘT TRÁI — giữ nguyên UI */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Sản phẩm</h2>

          {/* MULTI UI */}
          {isCartCheckout &&
            itemsFromCart.map((it) => (
              <div key={it.id} className="flex items-center gap-4 border-b pb-4">
                <img src={it.hinh_anh} className="w-20 h-20 rounded-lg object-cover" />

                <div className="flex-1">
                  <div className="font-semibold text-lg">{it.ten_san_pham}</div>
                  <div className="text-sm text-slate-500">Biến thể: {it.ten_bien_the}</div>
                  <div className="mt-2 text-emerald-600 font-bold">
                    {Number(it.don_gia).toLocaleString("vi-VN")}₫ × {it.so_luong}
                  </div>
                </div>
              </div>
            ))}

          {/* SINGLE UI giữ nguyên */}
          {!isCartCheckout && (
            <div className="flex items-center gap-4">
              <img src={product.primaryImage} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="font-semibold text-lg">{product.name}</div>
                <div className="text-sm text-slate-500">Biến thể: {variant.ten_bien_the}</div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => setSoLuong((v) => Math.max(1, v - 1))}
                    className="px-3 py-1 bg-slate-200 rounded-lg font-bold"
                  >
                    -
                  </button>
                  <span className="font-semibold text-lg">{soLuong}</span>
                  <button
                    onClick={() => setSoLuong((v) => v + 1)}
                    className="px-3 py-1 bg-slate-200 rounded-lg font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-emerald-600 font-bold mt-2">
                  {Number(variant.gia_ban).toLocaleString("vi-VN")}₫ × {soLuong}
                </div>
              </div>
            </div>
          )}

          {/* Tổng tiền */}
          <div className="mt-4 text-slate-700 border-t pt-4">
            <div>Phí ship: {phiShip.toLocaleString("vi-VN")}₫</div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">
              Tổng tiền: {tongTien.toLocaleString("vi-VN")}₫
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <h2 className="text-xl font-semibold mt-4">Phương thức thanh toán</h2>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="pm"
              checked={form.phuong_thuc_thanh_toan === "cod"}
              onChange={() => setForm((f) => ({ ...f, phuong_thuc_thanh_toan: "cod" }))}
            />
            COD — Thanh toán khi nhận hàng
          </label>

          <label className="flex items-center gap-3 mt-3">
            <input
              type="radio"
              name="pm"
              checked={form.phuong_thuc_thanh_toan === "payos_qr"}
              onChange={() => setForm((f) => ({ ...f, phuong_thuc_thanh_toan: "payos_qr" }))}
            />
            QR PayOS — Thanh toán online
          </label>
        </div>

        {/* CỘT PHẢI giữ nguyên */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Thông tin giao hàng</h2>

          <input
            className="w-full bg-slate-100 px-4 py-3 rounded-lg border"
            name="ten_nguoi_nhan"
            placeholder="Tên người nhận"
            value={form.ten_nguoi_nhan}
            onChange={handleChange}
          />

          <input
            className="w-full bg-slate-100 px-4 py-3 rounded-lg border"
            name="so_dien_thoai_nguoi_nhan"
            placeholder="Số điện thoại"
            value={form.so_dien_thoai_nguoi_nhan}
            onChange={handleChange}
          />

          <input
            className="w-full bg-slate-100 px-4 py-3 rounded-lg border"
            name="dia_chi_giao"
            placeholder="Địa chỉ giao hàng"
            value={form.dia_chi_giao}
            onChange={handleChange}
          />

          <textarea
            className="w-full bg-slate-100 px-4 py-3 rounded-lg border"
            name="ghi_chu"
            placeholder="Ghi chú (không bắt buộc)"
            value={form.ghi_chu}
            onChange={handleChange}
          ></textarea>

          <button
            onClick={handleSubmit}
            disabled={mutation.isLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg"
          >
            {mutation.isLoading ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
