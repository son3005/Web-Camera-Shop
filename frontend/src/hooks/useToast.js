// src/hooks/useToast.js
import { toast } from "react-hot-toast";

export const useToast = () => {
  const showToast = (message, type = "default", options = {}) => {
    const config = {
      duration: 4000,
      position: "top-right",
      ...options,
    };

    switch (type) {
      case "success":
        return toast.success(message, config);
      case "error":
        return toast.error(message, config);
      case "loading":
        return toast.loading(message, config);
      case "custom":
        return toast.custom(message, config);
      default:
        return toast(message, config);
    }
  };

  return {
    toast: showToast,
    success: (message, options) => showToast(message, "success", options),
    error: (message, options) => showToast(message, "error", options),
    loading: (message, options) => showToast(message, "loading", options),
    dismiss: toast.dismiss,
  };
};
