const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');

function getApiKey(req) {
  return req.header('X-API-Key');
}

function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

async function isApiKeyValid(apiKey) {
  if (!apiKey) {
    return false;
  }

  const allowEnvKey = String(process.env.ALLOW_ENV_API_KEY || '').toLowerCase() === 'true';
  const expectedKey = process.env.FLAG_API_KEY;
  if (allowEnvKey && expectedKey && apiKey === expectedKey) {
    return true;
  }

  const keyHash = hashApiKey(apiKey);
  const now = new Date();
  const record = await ApiKey.findOne({
    keyHash,
    revokedAt: null,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
  }).lean();
  return Boolean(record);
}

//only be available to admin user
async function requireApiKey(req, res, next) {
  const apiKey = getApiKey(req);
  const valid = await isApiKeyValid(apiKey);
  if (!valid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

function verifyJwtToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { ok: false, error: 'JWT_SECRET is not configured' };
  }

  try {
    const payload = jwt.verify(token, secret);
    return { ok: true, payload };
  } catch (err) {
    return { ok: false, error: 'Invalid token' };
  }
}

function requireJwt(req, res, next) {
  const authHeader = req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = verifyJwtToken(token);
  if (!result.ok) {
    const status = result.error === 'JWT_SECRET is not configured' ? 500 : 401;
    return res.status(status).json({ error: result.error });
  }

  req.user = result.payload;
  return next();
}

async function requireApiKeyOrJwt(req, res, next) {
  const apiKey = getApiKey(req);
  if (await isApiKeyValid(apiKey)) {
    return next();
  }

  const authHeader = req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = verifyJwtToken(token);
  if (!result.ok) {
    const status = result.error === 'JWT_SECRET is not configured' ? 500 : 401;
    return res.status(status).json({ error: result.error });
  }

  req.user = result.payload;
  return next();
}

async function verifyApiKey(apiKey) {
  return isApiKeyValid(apiKey);
}

async function rotateApiKey() {
  const rawKey = crypto.randomBytes(32).toString('hex');
  const keyHash = hashApiKey(rawKey);
  const graceMinutes = Number(process.env.API_KEY_GRACE_MINUTES || 0);

  if (graceMinutes > 0) {
    const expiresAt = new Date(Date.now() + graceMinutes * 60 * 1000);
    await ApiKey.updateMany(
      { revokedAt: null, expiresAt: null },
      { $set: { expiresAt } }
    );
  } else {
    await ApiKey.updateMany({ revokedAt: null }, { $set: { revokedAt: new Date() } });
  }

  await ApiKey.create({ keyHash });

  return rawKey;
}

module.exports = {
  requireApiKey,
  requireJwt,
  requireApiKeyOrJwt,
  verifyApiKey,
  rotateApiKey
};
