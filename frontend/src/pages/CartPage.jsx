// src/pages/CartPage.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";

const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export default function CartPage() {
  const { useGetCart, useUpdateQuantity, useRemoveItem } = useCart();

  const { data: cart, isLoading } = useGetCart();
  const updateQty = useUpdateQuantity();
  const removeItem = useRemoveItem();
  const navigate = useNavigate();

  // ===============================
  // QUẢN LÝ SẢN PHẨM ĐƯỢC CHỌN
  // ===============================
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (cart?.items) {
      setSelected(cart.items.map((it) => it.id)); // mặc định chọn hết
    }
  }, [cart]);

  const toggleItem = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (!cart?.items) return;
    if (selected.length === cart.items.length) {
      setSelected([]); // bỏ chọn hết
    } else {
      setSelected(cart.items.map((it) => it.id));
    }
  };

  const selectedItems =
    cart?.items?.filter((it) => selected.includes(it.id)) || [];

  const tongSoLuong = selectedItems.reduce((s, it) => s + it.so_luong, 0);
  const tongTien = selectedItems.reduce(
    (s, it) => s + it.so_luong * it.don_gia,
    0
  );

  // ===============================
  // CHUYỂN SANG TRANG THANH TOÁN
  // ===============================
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }

    const checkoutData = selectedItems.map((it) => {
      let ton_kho = null;
      if (typeof it.ton_kho === "number") ton_kho = it.ton_kho;
      else if (typeof it.so_luong_con_lai === "number")
        ton_kho = it.so_luong_con_lai;
      else if (typeof it.so_luong_toi_da === "number")
        ton_kho = it.so_luong_toi_da;
      else if (
        typeof it.so_luong_nhap === "number" &&
        typeof it.so_luong_ban === "number"
      )
        ton_kho = Math.max(0, it.so_luong_nhap - it.so_luong_ban);

      return {
        id: it.id,
        san_pham_id: it.san_pham_id,
        bien_the_san_pham_id: it.bien_the_san_pham_id,
        ten_san_pham: it.ten_san_pham,
        ten_bien_the: it.ten_bien_the,
        hinh_anh: it.hinh_anh,
        don_gia: Number(it.don_gia),
        so_luong: it.so_luong,
        ton_kho,
      };
    });

    navigate("/checkout", {
      state: {
        items: checkoutData,
        gio_hang_id: cart?.id || null,
      },
    });
  };

  // ===============================
  // LOADING
  // ===============================
  if (isLoading)
    return (
      <div className="p-6 text-center text-slate-700">Đang tải giỏ hàng...</div>
    );

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-lg font-medium mb-4 text-slate-700">
          Giỏ hàng của bạn đang trống.
        </div>
        <Link
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
          to="/products"
        >
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9fff5] to-[#d2f5eb] py-10">
      <div className="container mx-auto px-4">
        {/* GLASS HEADER */}
        <div className="mb-8 bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg rounded-3xl px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">
            Giỏ hàng của bạn
          </h1>
        </div>

        {/* Chọn tất cả */}
        <div className="mb-4 flex items-center gap-2 bg-white/30 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/40 w-fit shadow">
          <input
            type="checkbox"
            checked={selected.length === items.length}
            onChange={toggleAll}
            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-slate-700 font-medium">Chọn tất cả</span>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* === Danh sách sản phẩm === */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex gap-4 items-center bg-white/70 backdrop-blur-xl 
                border border-white/60 rounded-3xl shadow-md p-4 hover:shadow-lg transition"
              >
                {/* checkbox */}
                <input
                  type="checkbox"
                  checked={selected.includes(it.id)}
                  onChange={() => toggleItem(it.id)}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />

                {/* Ảnh */}
                <img
                  src={it.hinh_anh}
                  alt={it.ten_san_pham}
                  className="w-24 h-24 object-cover rounded-2xl shadow"
                />

                {/* Thông tin */}
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">
                    {it.ten_san_pham}
                  </div>
                  <div className="text-sm text-slate-600">
                    {it.ten_bien_the}
                  </div>
                  <div className="mt-1 font-semibold text-emerald-700">
                    {vnd(it.don_gia)}
                  </div>
                </div>

                {/* Số lượng */}
                <div className="flex items-center border rounded-xl overflow-hidden bg-white">
                  <button
                    className="px-3 py-1 hover:bg-slate-100"
                    disabled={updateQty.isPending}
                    onClick={() =>
                      updateQty.mutate({
                        chiTietId: it.id,
                        soLuong: Math.max(it.so_luong - 1, 1),
                      })
                    }
                  >
                    –
                  </button>
                  <div className="px-4 select-none">{it.so_luong}</div>
                  <button
                    className="px-3 py-1 hover:bg-slate-100"
                    disabled={updateQty.isPending}
                    onClick={() =>
                      updateQty.mutate({
                        chiTietId: it.id,
                        soLuong: it.so_luong + 1,
                      })
                    }
                  >
                    +
                  </button>
                </div>

                {/* Xóa */}
                <button
                  className="ml-3 text-red-500 hover:text-red-700 text-sm font-medium"
                  disabled={removeItem.isPending}
                  onClick={() => removeItem.mutate(it.id)}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          {/* === Tổng kết === */}
          <div
            className="bg-white/70 border border-white/60 backdrop-blur-xl 
            p-6 h-max rounded-3xl shadow-lg"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Tóm tắt đơn hàng
            </h2>

            <div className="flex justify-between text-slate-700">
              <span>Tổng số lượng</span>
              <span className="font-semibold">{tongSoLuong}</span>
            </div>

            <div className="flex justify-between mt-3 text-slate-700">
              <span>Tạm tính</span>
              <span className="font-semibold text-emerald-700">
                {vnd(tongTien)}
              </span>
            </div>

            <button
              className="w-full mt-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 
              text-white font-medium shadow-md transition"
              onClick={handleCheckout}
            >
              Tiến hành thanh toán
            </button>

            <Link
              to="/products"
              className="block text-center w-full mt-3 py-3 rounded-xl 
              bg-white/80 hover:bg-white text-slate-700 font-medium border border-slate-200 shadow-sm transition"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
