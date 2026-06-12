const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seed(prisma) {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. TẠO 10 USERS
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

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: { name: u.name, email: u.email, password: passwordHash }
    });
    createdUsers.push(user);
  }
  const mainUser = createdUsers[0];

  // 2. TẠO 10 PROJECTS
  const projectsData = [
    { name: 'Bài tập cá nhân Nguyên lí HĐH', status: 'Planning', priority: 'High', dates: '17 tháng 9, 2025 → 19 tháng 11, 2025', icon: '📝' },
    { name: 'Bài tập nhóm Công nghệ Web', status: 'In Progress', priority: 'High', dates: '17 tháng 9, 2025 → 22 tháng 11, 2025', icon: '🌐' },
    { name: 'Đồ án Chuyên ngành', status: 'In Progress', priority: 'High', dates: '01 tháng 1, 2026 → 15 tháng 5, 2026', icon: '🎓' },
    { name: 'Phát triển Ứng dụng Di động', status: 'Planning', priority: 'Medium', dates: '10 tháng 10, 2025 → 30 tháng 12, 2025', icon: '📱' },
    { name: 'Thiết kế UI/UX', status: 'Done', priority: 'Low', dates: '01 tháng 8, 2025 → 01 tháng 9, 2025', icon: '🎨' },
    { name: 'Phân tích Dữ liệu Lớn', status: 'Backlog', priority: 'High', dates: '15 tháng 11, 2025 → 20 tháng 12, 2025', icon: '📊' },
    { name: 'Khóa luận Tốt nghiệp', status: 'Planning', priority: 'High', dates: '01 tháng 2, 2026 → 30 tháng 6, 2026', icon: '📜' },
    { name: 'Học Máy ứng dụng', status: 'In Progress', priority: 'Medium', dates: '05 tháng 9, 2025 → 05 tháng 11, 2025', icon: '🤖' },
    { name: 'Nghiên cứu Khoa học', status: 'In Progress', priority: 'High', dates: '01 tháng 7, 2025 → 30 tháng 11, 2025', icon: '🔬' },
    { name: 'Thực tập Doanh nghiệp', status: 'Done', priority: 'High', dates: '01 tháng 6, 2025 → 31 tháng 8, 2025', icon: '🏢' },
  ];

  const createdProjects = [];
  for (let i = 0; i < projectsData.length; i++) {
    const pData = projectsData[i];
    const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random());
    const memberCount = Math.floor(Math.random() * 3) + 3;
    const members = [mainUser, ...shuffledUsers.slice(0, memberCount)].filter(
      (v, i, a) => a.findIndex(t => t.id === v.id) === i
    );

    const project = await prisma.project.create({
      data: {
        name: pData.name,
        description: `Mô tả cho dự án ${pData.name}`,
        status: pData.status,
        owner: members[0].name,
        dates: pData.dates,
        priority: pData.priority,
        completion: 0,
        icon: pData.icon,
        members: { connect: members.map(m => ({ id: m.id })) }
      }
    });
    createdProjects.push({ ...project, _members: members });

    await prisma.projectLink.createMany({
      data: [
        { title: 'Tài liệu hướng dẫn', url: 'https://docs.google.com', projectId: project.id },
        { title: 'Figma Design', url: 'https://figma.com', projectId: project.id }
      ]
    });
  }

  // 3. TẠO TASKS CHO TỪNG PROJECT
  const taskTemplates = [
    { title: 'Lên kế hoạch', status: 'Done', icon: '📅', priority: 'High' },
    { title: 'Thu thập yêu cầu', status: 'Done', icon: '📝', priority: 'High' },
    { title: 'Thiết kế Database', status: 'In Progress', icon: '🗄️', priority: 'High' },
    { title: 'Thiết kế API', status: 'In Progress', icon: '🔌', priority: 'Medium' },
    { title: 'Code Frontend', status: 'Not Started', icon: '💻', priority: 'High' },
    { title: 'Code Backend', status: 'Not Started', icon: '⚙️', priority: 'High' },
    { title: 'Kiểm thử (Testing)', status: 'Not Started', icon: '🐛', priority: 'Medium' },
    { title: 'Triển khai (Deploy)', status: 'Not Started', icon: '🚀', priority: 'Low' },
    { title: 'Viết báo cáo', status: 'Not Started', icon: '📄', priority: 'Medium' },
    { title: 'Chuẩn bị slide', status: 'Not Started', icon: '📊', priority: 'Low' },
  ];

  for (const p of createdProjects) {
    const numTasks = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < numTasks; i++) {
      const template = taskTemplates[i];
      const assignees = [...p._members].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
      let taskStatus = template.status;
      if (p.status === 'Planning' || p.status === 'Backlog') taskStatus = 'Not Started';
      if (p.status === 'Done') taskStatus = 'Done';
      await prisma.task.create({
        data: {
          title: template.title,
          status: taskStatus,
          projectId: p.id,
          due: '20 tháng 10, 2025',
          priority: template.priority,
          icon: template.icon,
          weight: Math.floor(Math.random() * 3) + 1,
          assignee: assignees.map(a => a.name).join(', '),
          assignees: { connect: assignees.map(a => ({ id: a.id })) }
        }
      });
    }
    const tasks = await prisma.task.findMany({ where: { projectId: p.id } });
    if (tasks.length > 0) {
      const totalWeight = tasks.reduce((sum, t) => sum + (t.weight || 1), 0);
      const doneWeight = tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.weight || 1), 0);
      await prisma.project.update({ where: { id: p.id }, data: { completion: Math.round((doneWeight / totalWeight) * 10000) / 100 } });
    }
  }

  const userCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  const taskCount = await prisma.task.count();
  console.log(`✅ Seed hoàn thành! ${userCount} users, ${projectCount} projects, ${taskCount} tasks`);
}

module.exports = { seed };

if (require.main === module) {
  const prisma = new PrismaClient();
  (async () => {
    console.log('🌱 Seeding database...');
    await prisma.notification.deleteMany();
    await prisma.projectLink.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await seed(prisma);
  })()
    .catch(err => { console.error('❌ Seed thất bại:', err); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
