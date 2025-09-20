# --- STAGE 1: Build ---
# Stage này chịu trách nhiệm build code React ra các file tĩnh (HTML, CSS, JS).
FROM node:22-alpine AS build
WORKDIR /app

# Copy package.json và package-lock.json (hoặc yarn.lock)
COPY package*.json ./

# Dùng `npm ci` cho production. Nó nhanh hơn và đảm bảo cài đặt chính xác
# các phiên bản trong package-lock.json. `--omit=dev` để bỏ qua devDependencies.
RUN npm ci --omit=dev

# Copy toàn bộ source code của project
COPY . .

# Build ứng dụng, kết quả sẽ nằm trong thư mục /app/dist
RUN npm run build

# --- STAGE 2: Serve ---
# Stage này sử dụng một image Nginx siêu nhẹ để phục vụ các file tĩnh
# đã được tạo ra ở Stage 1.
FROM nginx:stable-alpine

# Sao chép các file đã build từ stage 'build' vào thư mục web root của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Sao chép file cấu hình Nginx tùy chỉnh vào container.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80 cho Nginx
EXPOSE 80

# Lệnh để khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]
