const app    = require('./app');
const prisma = require('./prisma/client');
const bcrypt = require('bcryptjs');
const { startDeadlineChecks } = require('./services/deadlineCheck.service');

const PORT = process.env.PORT || 3001;

async function autoSeed() {
  const count = await prisma.user.count();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash('password123', 10);
  const usersData = [
    { name: 'Bình', email: 'binh@example.com' },
    { name: 'An', email: 'an@example.com' },
    { name: 'Chí', email: 'chi@example.com' },
    { name: 'Dũng', email: 'dung@example.com' },
    { name: 'Giang', email: 'giang@example.com' },
    { name: 'Hà', email: 'ha@example.com' },
    { name: 'Khanh', email: 'khanh@example.com' },
    { name: 'Lan', email: 'lan@example.com' },
    { name: 'Minh', email: 'minh@example.com' },
    { name: 'Nga', email: 'nga@example.com' },
  ];
  for (const u of usersData) {
    await prisma.user.create({ data: { name: u.name, email: u.email, password: passwordHash } });
  }
  console.log(`🌱 Auto-seed: ${usersData.length} users created`);
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
