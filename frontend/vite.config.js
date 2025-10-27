import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Cho phép truy cập từ ngoài container
    historyApiFallback: true, // 🧩 FIX lỗi 404 khi refresh route SPA

    // Cấu hình proxy để tránh lỗi CORS khi gọi API
    proxy: {
      "/api": {
        target: "http://backend:5000", // tên service backend trong docker-compose
        changeOrigin: true,
      },
    },

    // Bật hot-reload khi chạy trong Docker
    watch: {
      usePolling: true,
    },
  },
});
