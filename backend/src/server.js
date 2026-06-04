const app     = require('./app');
const prisma  = require('./prisma/client');
const { seed }   = require('../prisma/seed');
const { startDeadlineChecks } = require('./services/deadlineCheck.service');

const PORT = process.env.PORT || 3001;

async function autoSeed() {
  const existing = await prisma.user.findUnique({ where: { email: 'binh@example.com' } });
  if (existing) return;
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('⚠️ Có user nhưng thiếu binh@example.com — xoá để seed lại...');
    await prisma.notification.deleteMany();
    await prisma.projectLink.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  }
  console.log('🌱 DB trống — tự động seed...');
  await seed(prisma);
}

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Đã kết nối PostgreSQL');

    await autoSeed();

    startDeadlineChecks();
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
