// src/hooks/useToast.js
// Hook dùng để gọi toast từ bất cứ đâu (client, admin, trang đăng nhập...)
// Tất cả đều dùng react-hot-toast

import { toast } from "react-toastify";

export const useToast = () => {
  const showToast = (message, type = "default", options = {}) => {
    const config = {
      duration: 3500,
      position: "bottom-right",
      autoClose: 4000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        padding: "12px 16px",
        borderRadius: "10px",
        background: "#fff",
        color: "#0f172a",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
      },
      ...options,
    };

    switch (type) {
      case "success":
        return toast.success(message, {
          ...config,
          iconTheme: { primary: "#10b981", secondary: "#fff" },
        });
      case "error":
        return toast.error(message, {
          ...config,
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        });
      case "loading":
        return toast.loading(message, config);
      case "info":
        return toast.info(message, config);
      case "custom":
        return toast.custom(message, config);
      default:
        return toast(message, config);
    }
  };

  // Trả ra các hàm tiện dụng
  return {
    toast: showToast, // gọi trực tiếp
    success: (msg, opt) => showToast(msg, "success", opt),
    error: (msg, opt) => showToast(msg, "error", opt),
    info: (msg, opt) => showToast(msg, "info", opt),
    warn: (msg, opt) => showToast(msg, "warn", opt),
    dismiss: toast.dismiss, // đóng tất cả toast đang hiển thị
  };
};
