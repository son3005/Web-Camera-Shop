import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Rất quan trọng: Để server có thể được truy cập từ bên ngoài Docker

    // Cấu hình proxy để tránh lỗi CORS khi gọi API
    proxy: {
      // Bất kỳ request nào bắt đầu bằng /api sẽ được chuyển tiếp đến backend
      "/api": {
        // QUAN TRỌNG: Dùng tên service 'backend' của docker-compose, không dùng 'localhost'
        target: "http://backend:5000",
        changeOrigin: true,
      },
    },

    // Cấu hình watch để bật hot-reload trong Docker
    watch: {
      usePolling: true,
    },
  },
});
