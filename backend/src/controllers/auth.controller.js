const authService = require('../services/auth.service');

// POST /api/auth/register
async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải từ 6 ký tự trở lên' });
    }
    const result = await authService.register({ email: email.toLowerCase().trim(), password, name });
    res.status(201).json(result);
  } catch (err) {
    console.error('[Auth] register:', err.message);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }
    const result = await authService.login({ email: email.toLowerCase().trim(), password });
    res.json(result);
  } catch (err) {
    console.error('[Auth] login:', err.message);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

// GET /api/auth/me  (protected)
async function me(req, res) {
  try {
    const user = await authService.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });
    res.json(user);
  } catch (err) {
    console.error('[Auth] me:', err.message);
    res.status(500).json({ error: 'Không thể lấy thông tin người dùng' });
  }
}

module.exports = { register, login, me };
