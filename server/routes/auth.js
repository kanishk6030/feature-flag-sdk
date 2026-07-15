const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const { requireAdminJwt, requireUserJwt, rotateApiKey } = require('../middleware/auth');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: Number(process.env.ADMIN_LOGIN_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.ADMIN_LOGIN_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' }
});

const userLoginLimiter = rateLimit({
  windowMs: Number(process.env.USER_LOGIN_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.USER_LOGIN_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' }
});

router.post('/admin/login', loginLimiter, async (req, res) => {
  try {
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
    const token = jwt.sign({ sub: admin.username, role: admin.role, type: 'admin' }, jwtSecret, { expiresIn });

    return res.json({
      token,
      tokenType: 'Bearer',
      expiresIn
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash
    });
    const apiKey = await rotateApiKey(user._id, 'user');

    return res.status(201).json({
      message: 'Registered successfully.',
      apiKey
    });
  } catch (err) {
    // Log and return the error message for easier debugging
    // eslint-disable-next-line no-console
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

router.post('/login', userLoginLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ error: 'Auth is not configured' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    const token = jwt.sign({ sub: user.email, id: user._id, type: 'user' }, jwtSecret, { expiresIn });

    return res.json({
      token,
      tokenType: 'Bearer',
      expiresIn
    });
  } catch (err) {
    console.error('User login error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

router.post('/api-keys/rotate', requireUserJwt, async (req, res) => {
  try {
    const apiKey = await rotateApiKey(req.user.id, 'user');
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

router.post('/admins', requireAdminJwt, async (req, res) => {
  try {
    const username = String(req.body.username || '').toLowerCase().trim();
    const password = String(req.body.password || '');

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existing = await AdminUser.findOne({ username }).lean();
    if (existing) {
      return res.status(409).json({ error: 'Admin already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await AdminUser.create({
      username,
      passwordHash,
      role: 'admin'
    });

    return res.status(201).json({
      id: admin._id,
      username: admin.username,
      role: admin.role
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
