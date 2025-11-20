// src/pages/PaymentResultPage.jsx
import { useParams, useSearchParams } from "react-router-dom";

export default function PaymentResultPage() {
  const { id } = useParams();
  const [query] = useSearchParams();

  const status = query.get("status");

  return (
    <div className="container mx-auto p-6 text-white">
      {status === "cod_thanhcong" && (
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-emerald-400">
            🎉 Đặt hàng thành công!
          </h1>
          <p>Mã đơn hàng: {id}</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-emerald-400">
            🎉 Thanh toán PayOS thành công!
          </h1>
          <p>Đơn hàng đã được ghi nhận.</p>
        </div>
      )}

      {status === "cancel" && (
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-red-400">
            ❌ Thanh toán thất bại hoặc bị hủy
          </h1>
        </div>
      )}
    </div>
  );
}
