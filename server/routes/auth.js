const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { requireAdminJwt, requireUserJwt, rotateApiKey } = require('../middleware/auth');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');

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
});

router.post('/register', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  const jwtSecret = process.env.JWT_SECRET;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!jwtSecret) {
    return res.status(500).json({ error: 'Auth is not configured' });
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verifyTokenRaw = crypto.randomBytes(32).toString('hex');
  const verifyTokenHash = crypto.createHash('sha256').update(verifyTokenRaw).digest('hex');
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    email,
    passwordHash,
    isEmailVerified: false,
    emailVerificationToken: verifyTokenHash,
    emailVerificationExpires: verifyExpires
  });

  const apiKey = await rotateApiKey(user._id, 'user');
  const appBase = process.env.DASHBOARD_URL || 'http://localhost:5173';
  const verifyUrl = `${appBase.replace(/\/$/, '')}/verify-email?token=${verifyTokenRaw}`;
  try {
    const sent = await sendVerificationEmail(email, verifyUrl);
    if (!sent) {
      // eslint-disable-next-line no-console
      console.log(`[Email verification] ${verifyUrl}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to send verification email:', err.message);
    // eslint-disable-next-line no-console
    console.log(`[Email verification] ${verifyUrl}`);
  }

  return res.status(201).json({
    message: 'Registered. Verify your email to login.',
    apiKey
  });
});

router.get('/verify-email', async (req, res) => {
  const token = String(req.query.token || '');
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date();

  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: now }
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  return res.json({ message: 'Email verified' });
});

router.post('/login', userLoginLimiter, async (req, res) => {
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

  if (!user.isEmailVerified) {
    return res.status(403).json({ error: 'Verify your email first' });
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
