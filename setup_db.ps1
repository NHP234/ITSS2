Write-Host "🚀 Đang khởi động Docker container cho Database..." -ForegroundColor Cyan
docker-compose up -d db

# Di chuyển vào thư mục backend
Set-Location backend


Write-Host "⏳ Đang đợi Database sẵn sàng..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "📦 Đang tạo Prisma Client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "🔄 Đang đồng bộ Schema với Database..." -ForegroundColor Cyan
npx prisma db push

Write-Host "🌱 Đang nạp dữ liệu mẫu (Seeding)..." -ForegroundColor Cyan
npm run db:seed

Write-Host "✅ Hoàn tất thiết lập Database!" -ForegroundColor Green
Write-Host "🔗 Bạn có thể xem DB bằng lệnh: npm run db:studio" -ForegroundColor Magenta
