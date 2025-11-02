// src/pages/CartPage.jsx
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  capNhatSoLuong,
  xoaKhoiGio,
  xoaTatCa,
} from "../redux/slices/gioHangSlice";

const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export default function CartPage() {
  const { items, tongSoLuong, tongTien } = useSelector((s) => s.gioHang);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        {/* list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((it) => (
            <div
              key={`${it.productId}-${it.color}`}
              className="surface-panel p-3 flex gap-3 items-center"
            >
              <img
                src={it.image}
                alt={it.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Biến thể: {it.color}
                </div>
                <div className="mt-1 font-semibold">{vnd(it.price)}</div>
              </div>

              <div className="flex items-center border rounded-xl overflow-hidden dark:border-white/15">
                <button
                  className="px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() =>
                    dispatch(
                      capNhatSoLuong({
                        productId: it.productId,
                        color: it.color,
                        quantity: it.quantity - 1,
                      })
                    )
                  }
                >
                  –
                </button>
                <div className="px-4 select-none">{it.quantity}</div>
                <button
                  className="px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() =>
                    dispatch(
                      capNhatSoLuong({
                        productId: it.productId,
                        color: it.color,
                        quantity: it.quantity + 1,
                      })
                    )
                  }
                >
                  +
                </button>
              </div>

              <button
                className="ml-3 text-red-600 hover:underline"
                onClick={() =>
                  dispatch(
                    xoaKhoiGio({ productId: it.productId, color: it.color })
                  )
                }
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        {/* summary */}
        <div className="surface-panel p-4 h-max">
          <div className="flex justify-between">
            <span>Tổng số lượng</span>
            <span className="font-semibold">{tongSoLuong}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Tạm tính</span>
            <span className="font-semibold">{vnd(tongTien)}</span>
          </div>

          {/* ====== chuyển sang checkout ====== */}
          <button
            className="btn-emerald w-full rounded-xl mt-4 py-2"
            onClick={() => navigate("/checkout")}
          >
            Tiến hành thanh toán
          </button>

          <button
            className="btn-ghost w-full rounded-xl mt-2 py-2"
            onClick={() => dispatch(xoaTatCa())}
          >
            Xoá tất cả
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
