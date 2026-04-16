const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { requireJwt, rotateApiKey } = require('../middleware/auth');
const AdminUser = require('../models/AdminUser');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: Number(process.env.ADMIN_LOGIN_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.ADMIN_LOGIN_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' }
});

router.post('/login', loginLimiter, async (req, res) => {
  const username = String(req.body.username || '').toLowerCase();
  const password = String(req.body.password || '');
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ error: 'Auth is not configured' });
  }

  const admin = await AdminUser.findOne({ username });
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const now = new Date();
  if (admin.lockUntil && admin.lockUntil > now) {
    return res.status(423).json({ error: 'Account locked. Try later.' });
  }

  const isValid = await admin.comparePassword(password);
  if (!isValid) {
    const nextFails = (admin.failedLoginCount || 0) + 1;
    const maxFails = Number(process.env.ADMIN_LOCKOUT_MAX || 5);
    const lockMinutes = Number(process.env.ADMIN_LOCKOUT_MINUTES || 15);

    admin.failedLoginCount = nextFails;
    if (nextFails >= maxFails) {
      admin.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      admin.failedLoginCount = 0;
    }
    await admin.save();
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  admin.failedLoginCount = 0;
  admin.lockUntil = null;
  admin.lastLoginAt = now;
  await admin.save();

  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  const token = jwt.sign({ sub: admin.username, role: admin.role }, jwtSecret, { expiresIn });

  return res.json({
    token,
    tokenType: 'Bearer',
    expiresIn
  });
});

router.post('/api-keys/rotate', requireJwt, async (req, res) => {
  try {
    const apiKey = await rotateApiKey();
    const graceMinutes = Number(process.env.API_KEY_GRACE_MINUTES || 0);
    res.json({
      apiKey,
      graceMinutes,
      note: graceMinutes > 0
        ? 'Previous keys remain valid during grace period.'
        : 'Previous keys were revoked.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
