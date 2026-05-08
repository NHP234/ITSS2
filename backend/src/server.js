const app    = require('./app');
const prisma = require('./prisma/client');

const PORT = process.env.PORT || 3001;

async function main() {
  // Thử kết nối database
  try {
    await prisma.$connect();
    console.log('✅ Đã kết nối PostgreSQL');
  } catch {
    console.warn('⚠️  Chưa kết nối được DB (chưa chạy Docker?)');
    console.warn('   → Chạy: docker-compose up -d');
    console.warn('   → Rồi:  npm run db:migrate');
    console.warn('   Server vẫn khởi động, nhưng API sẽ báo lỗi cho đến khi có DB.\n');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại  http://localhost:${PORT}`);
    console.log(`📡 API base:        http://localhost:${PORT}/api`);
    console.log(`❤️  Health check:    http://localhost:${PORT}/api/health`);
  });
}

main().catch(console.error);
