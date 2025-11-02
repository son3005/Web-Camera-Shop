import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { xoaTatCa } from "../redux/slices/gioHangSlice"; // ✅ Đúng tên export
import { useNavigate } from "react-router-dom";

const vnd = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + "đ";

export default function CheckoutPage() {
  // ✅ Khớp shape của slice: items = [{ productId, name, image, price, color, quantity }]
  const { items, tongTien } = useSelector((s) => s.gioHang);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    method: "cod",
  });
  const dispatch = useDispatch();
  const nav = useNavigate();

  const placeOrder = async () => {
    if (!items.length) return;
    // (Tuỳ bạn) TODO: gọi API /orders ở backend
    alert("Đặt hàng thành công! 🎉");
    dispatch(xoaTatCa()); // ✅ làm trống giỏ
    nav("/"); // về trang chủ
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form thông tin */}
        <div className="lg:col-span-2 surface-panel p-4 md:p-6">
          <h1 className="text-xl font-bold mb-4">Thông tin thanh toán</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="ui-input"
              placeholder="Họ tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="ui-input"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <textarea
            className="ui-input mt-3"
            placeholder="Địa chỉ giao hàng"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <textarea
            className="ui-input mt-3"
            placeholder="Ghi chú"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />

          <div className="mt-3">
            <div className="font-semibold mb-1">Phương thức thanh toán</div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="method"
                checked={form.method === "cod"}
                onChange={() => setForm({ ...form, method: "cod" })}
              />
              COD
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="method"
                checked={form.method === "bank"}
                onChange={() => setForm({ ...form, method: "bank" })}
              />
              Chuyển khoản
            </label>
          </div>

          <button className="btn-emerald mt-4" onClick={placeOrder}>
            Xác nhận đặt hàng
          </button>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="surface-panel p-4 md:p-6 h-fit">
          <h2 className="font-semibold mb-3">Đơn hàng</h2>

          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={`${it.productId}-${it.color}`}
                className="text-sm flex justify-between"
              >
                <span>
                  {it.name}
                  {it.color ? ` • ${it.color}` : ""} × {it.quantity}
                </span>
                <span>{vnd(it.quantity * it.price)}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between font-semibold">
            <span>Tổng:</span>
            <span>{vnd(tongTien)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
