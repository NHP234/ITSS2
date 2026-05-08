import app from './app';
import { prisma } from './prisma/client';

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    // Test kết nối database
    await prisma.$connect();
    console.log('✅ Đã kết nối PostgreSQL');
  } catch (err) {
    console.warn('⚠️  Chưa kết nối được DB (chưa chạy Docker?). Server vẫn khởi động...');
    console.warn('   Chạy: docker-compose up -d  rồi  npx prisma migrate dev --name init');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
    console.log(`📡 API:    http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  });
}

main().catch(console.error);
