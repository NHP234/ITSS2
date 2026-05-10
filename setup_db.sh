#!/bin/bash

# Di chuyển vào thư mục backend
cd backend

echo "🚀 Đang khởi động Docker container cho Database..."
docker-compose up -d

echo "⏳ Đang đợi Database sẵn sàng..."
# Đợi 5 giây để Postgres khởi động hoàn toàn
sleep 5

echo "📦 Đang tạo Prisma Client..."
npx prisma generate

echo "🔄 Đang đồng bộ Schema với Database..."
npx prisma db push

echo "🌱 Đang nạp dữ liệu mẫu (Seeding)..."
npm run db:seed

echo "✅ Hoàn tất thiết lập Database!"
echo "🔗 Bạn có thể xem DB bằng lệnh: npm run db:studio"
