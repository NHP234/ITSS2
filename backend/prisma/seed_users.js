const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding 10 random users...');

  const userData = [
    { name: 'Anh Tuấn', email: 'tuan@example.com' },
    { name: 'Minh Hoàng', email: 'hoang@example.com' },
    { name: 'Thị Lan', email: 'lan@example.com' },
    { name: 'Văn Hùng', email: 'hung@example.com' },
    { name: 'Ngọc Mai', email: 'mai@example.com' },
    { name: 'Bảo Long', email: 'long@example.com' },
    { name: 'Thanh Hà', email: 'ha@example.com' },
    { name: 'Quốc Anh', email: 'anh@example.com' },
    { name: 'Diệu Linh', email: 'linh@example.com' },
    { name: 'Đức Thành', email: 'thanh@example.com' },
  ];

  for (const u of userData) {
    try {
      // Mỗi lần gọi hash sẽ tạo ra một salt ngẫu nhiên khác nhau
      const passwordHash = await bcrypt.hash('password123', 10);
      
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          password: passwordHash // Cập nhật lại password để thấy chuỗi hash khác nhau
        },
        create: {
          name: u.name,
          email: u.email,
          password: passwordHash,
        },
      });
      console.log(`✅ Created/Updated user: ${u.name} (${u.email})`);
    } catch (err) {
      console.error(`❌ Failed to process user ${u.email}:`, err.message);
    }
  }

  console.log('✅ Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
