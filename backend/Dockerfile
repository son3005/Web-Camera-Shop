FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential pkg-config default-libmysqlclient-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# Gunicorn để chạy production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app.main:app"]