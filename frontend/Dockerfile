# Stage 1: Build React app
FROM node:22-alpine AS build
WORKDIR /app

# Copy package.json và package-lock.json trước để cache
COPY package*.json ./

# Cài dependencies (chỉ prod deps, nhanh và gọn nhẹ)
RUN npm ci --omit=dev

# Copy toàn bộ source code
COPY . .

# Build app ra thư mục dist
RUN npm run build

# Stage 2: Serve bằng nginx
FROM nginx:alpine

# Copy build output sang nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Nếu bạn có custom config cho React Router, copy vào container
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose cổng 80
EXPOSE 80

# Chạy nginx foreground
CMD ["nginx", "-g", "daemon off;"]
