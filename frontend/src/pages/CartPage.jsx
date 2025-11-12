// src/pages/CartPage.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export default function CartPage() {
  const { useGetCart, useUpdateQuantity, useRemoveItem } = useCart();

  const { data: cart, isLoading } = useGetCart();
  const updateQty = useUpdateQuantity();
  const removeItem = useRemoveItem();
  const navigate = useNavigate();

  if (isLoading)
    return <div className="p-6 text-center">Đang tải giỏ hàng...</div>;

  const items = cart?.items || [];
  const tongSoLuong = cart?.tong_so_luong || 0;
  const tongTien = cart?.tong_gia_tri || 0;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="text-lg mb-4">Giỏ hàng của bạn đang trống.</div>
        <Link className="btn-emerald rounded-xl px-4 py-2" to="/products">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
        Giỏ hàng
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* === Danh sách sản phẩm === */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="surface-panel p-3 flex gap-3 items-center"
            >
              <img
                src={it.hinh_anh}
                alt={it.ten_san_pham}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div className="flex-1">
                <div className="font-semibold">{it.ten_san_pham}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {it.ten_bien_the}
                </div>
                <div className="mt-1 font-semibold">{vnd(it.don_gia)}</div>
              </div>

              <div className="flex items-center border rounded-xl overflow-hidden">
                <button
                  className="px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10"
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
                  className="px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10"
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

              <button
                className="ml-3 text-red-600 hover:underline"
                disabled={removeItem.isPending}
                onClick={() => removeItem.mutate(it.id)}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        {/* === Tổng kết === */}
        <div className="surface-panel p-4 h-max">
          <div className="flex justify-between">
            <span>Tổng số lượng</span>
            <span className="font-semibold">{tongSoLuong}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Tạm tính</span>
            <span className="font-semibold">{vnd(tongTien)}</span>
          </div>

          <button
            className="btn-emerald w-full rounded-xl mt-4 py-2"
            onClick={() => navigate("/checkout")}
          >
            Tiến hành thanh toán
          </button>

          <Link
            to="/products"
            className="btn w-full rounded-xl mt-2 py-2 text-center"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
