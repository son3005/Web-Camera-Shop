# --- STAGE 1: Builder ---
# Mục đích của stage này là cài đặt tất cả dependencies, bao gồm cả các
# công cụ build nặng nề mà chúng ta không cần trong image cuối cùng.
FROM python:3.13-slim AS builder

WORKDIR /app

# Cài đặt các gói build cần thiết
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Tạo một virtual environment để cô lập các thư viện
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Cập nhật pip
RUN pip install --upgrade pip

# Copy và cài đặt các thư viện Python.
# Gợi ý: Bạn nên có file requirements.prod.txt chỉ chứa các thư viện
# cần thiết cho production (không bao gồm pytest, flake8, etc.)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# --- STAGE 2: Final Image ---
# Stage này sẽ tạo ra image cuối cùng. Nó rất nhẹ vì chỉ sao chép
# những thứ cần thiết từ stage "builder".
FROM python:3.13-slim

WORKDIR /app

# Sao chép virtual environment đã được cài đặt từ stage builder
COPY --from=builder /opt/venv /opt/venv

# Tạo một user không phải root để chạy ứng dụng (tăng cường bảo mật)
RUN useradd --create-home appuser
USER appuser

# Kích hoạt virtual environment cho các lệnh tiếp theo
ENV PATH="/opt/venv/bin:$PATH"

# Sao chép source code của ứng dụng
COPY . .

# Mở cổng 5000
EXPOSE 5000

# Lệnh để chạy ứng dụng.
# Gunicorn sẽ chạy bởi user "appuser"
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "app.main:app"]