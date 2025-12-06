// src/pages/PaymentResultPage.jsx
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ArrowLeft, Home } from "lucide-react";

export default function PaymentResultPage() {
  const { id } = useParams();
  const [query] = useSearchParams();
  const navigate = useNavigate();

  const status = query.get("status");

  // ==========================
  // TEMPLATE UI theo trạng thái
  // ==========================
  const getUI = () => {
    switch (status) {
      case "cod_thanhcong":
        return {
          icon: <CheckCircle className="w-16 h-16 text-emerald-500" />,
          title: "Đặt hàng thành công!",
          desc: `Mã đơn hàng: ${id}`,
        };
      case "success":
        return {
          icon: <CheckCircle className="w-16 h-16 text-emerald-500" />,
          title: "Thanh toán PayOS thành công!",
          desc: "Đơn hàng đã được ghi nhận.",
        };
      case "cancel":
      default:
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: "Thanh toán thất bại hoặc bị hủy!",
          desc: "Giao dịch chưa được xử lý. Vui lòng thử lại.",
        };
    }
  };

  const ui = getUI();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-3xl border border-slate-200 p-8 text-center space-y-6">
        {/* ICON */}
        <div className="flex justify-center">{ui.icon}</div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-slate-900">{ui.title}</h1>

        {/* DESCRIPTION */}
        <p className="text-slate-600 text-sm">{ui.desc}</p>

        {/* LINE */}
        <div className="border-t border-slate-200 my-4" />

        {/* BUTTONS */}
        <div className="space-y-3">
          {/* Tiếp tục mua hàng -> Trang chủ */}
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition"
          >
            <Home className="w-4 h-4" />
            Tiếp tục mua hàng
          </button>

          {/* Xem lịch sử đơn hàng -> AccountPage (tab Đơn hàng) */}
          <button
            onClick={() => navigate("/tai-khoan")} // ✅ dùng đúng trang có tab Đơn hàng
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2 transition border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Xem lịch sử đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
