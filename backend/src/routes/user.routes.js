const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const prisma = require('../prisma/client');

const router = Router();

// GET /api/users/search?q=...
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: { id: true, email: true, name: true },
      take: 10
    });
    
    res.json(users);
  } catch (err) {
    console.error('[User] search:', err.message);
    res.status(500).json({ error: 'Lỗi tìm kiếm người dùng' });
  }
});

module.exports = router;
