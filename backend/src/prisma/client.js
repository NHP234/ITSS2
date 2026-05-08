const { PrismaClient } = require('@prisma/client');

// Singleton pattern – tránh tạo nhiều connection khi nodemon hot-reload
const prisma = global._prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global._prisma = prisma;
}

module.exports = prisma;
