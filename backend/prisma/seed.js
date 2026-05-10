const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Xoá dữ liệu cũ
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Tạo user mặc định
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Bình',
      email: 'binh@example.com',
      password: passwordHash,
    },
  });

  // Tạo projects
  const p1 = await prisma.project.create({
    data: {
      name: 'Bài tập cá nhân Nguyên lí Hệ điều hành',
      description: 'Bài tập cuối kì môn HĐHNH',
      status: 'Planning',
      owner: 'Bình',
      dates: '17 tháng 9, 2025 → 19 tháng 11, 2025',
      priority: 'High',
      completion: 0,
      blockedBy: '',
      icon: '📝',
      members: { connect: { id: user.id } },
    },
  });

  const p2 = await prisma.project.create({
    data: {
      name: 'Bài tập nhóm Công nghệ Web',
      description: 'Dự án nhóm môn Web',
      status: 'In Progress',
      owner: 'Bình',
      dates: '17 tháng 9, 2025 → 22 tháng 11, 2025',
      priority: 'High',
      completion: 0,
      blockedBy: '',
      icon: '🌐',
      members: { connect: { id: user.id } },
    },
  });

  const p3 = await prisma.project.create({
    data: {
      name: 'Đồ án Chuyên ngành',
      description: 'Đồ án quan trọng sắp đến hạn',
      status: 'In Progress',
      owner: 'Bình',
      dates: '01 tháng 1, 2026 → 15 tháng 5, 2026',
      priority: 'High',
      completion: 45,
      blockedBy: '',
      icon: '🎓',
      members: { connect: { id: user.id } },
    },
  });

  // Tasks cho p1
  await prisma.task.createMany({
    data: [
      { title: 'Đăng kí chủ đề',  status: 'Done',        projectId: p1.id, assignee: 'Bình', due: '17 tháng 9, 2025',  priority: 'Medium', summary: 'Đăng kí chủ đề trong link', icon: 'calendar' },
      { title: 'Tìm tài liệu',    status: 'In Progress', projectId: p1.id, assignee: 'Bình', due: '21 tháng 9, 2025',  priority: 'High',   icon: 'cloud' },
      { title: 'Đọc tài liệu',    status: 'Not Started', projectId: p1.id, assignee: 'Bình', due: '15 tháng 10, 2025', priority: 'High',   summary: 'Đọc các tài liệu' },
      { title: 'Viết báo cáo',    status: 'Not Started', projectId: p1.id },
      { title: 'Nộp bài',         status: 'Not Started', projectId: p1.id },
    ],
  });

  // Tasks cho p2
  await prisma.task.createMany({
    data: [
      { title: 'Chọn nhóm',               status: 'In Progress', projectId: p2.id },
      { title: 'Chọn chủ đề',             status: 'Not Started', projectId: p2.id },
      { title: 'Phân công công việc',      status: 'Not Started', projectId: p2.id },
    ],
  });

  // Tasks cho p3
  await prisma.task.createMany({
    data: [
      { title: 'Chọn chủ đề', status: 'In Progress', projectId: p3.id },
      { title: 'Đăng kí',     status: 'Not Started', projectId: p3.id },
    ],
  });

  // Tính lại completion
  for (const p of [p1, p2, p3]) {
    const tasks = await prisma.task.findMany({ where: { projectId: p.id } });
    const done = tasks.filter(t => t.status === 'Done').length;
    const completion = tasks.length > 0
      ? Math.round((done / tasks.length) * 10000) / 100
      : p.completion;
    await prisma.project.update({ where: { id: p.id }, data: { completion } });
  }

  const projectCount = await prisma.project.count();
  const taskCount    = await prisma.task.count();

  console.log(`✅ Seed hoàn thành! ${projectCount} projects, ${taskCount} tasks`);
}

main()
  .catch(err => { console.error('❌ Seed thất bại:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
