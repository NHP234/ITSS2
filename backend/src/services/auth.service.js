const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const prisma  = require('../prisma/client');

const JWT_SECRET  = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

async function register({ email, password, name }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    const err = new Error('Email đã được sử dụng');
    err.statusCode = 409;
    throw err;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user   = await prisma.user.create({
    data: { email, password: hashed, name: name || '' },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return { token: signToken(user.id), user };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Email hoặc mật khẩu không đúng');
    err.statusCode = 401;
    throw err;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Email hoặc mật khẩu không đúng');
    err.statusCode = 401;
    throw err;
  }
  const { password: _pw, ...safeUser } = user;
  return { token: signToken(user.id), user: safeUser };
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { register, login, getUserById, verifyToken };
