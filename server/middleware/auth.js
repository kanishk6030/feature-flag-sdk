const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');

function getApiKey(req) {
  return req.header('X-API-Key');
}

function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

async function resolveApiKeyOwner(apiKey) {
  if (!apiKey) {
    return null;
  }

  const allowEnvKey = String(process.env.ALLOW_ENV_API_KEY || '').toLowerCase() === 'true';
  const expectedKey = process.env.FLAG_API_KEY;
  if (allowEnvKey && expectedKey && apiKey === expectedKey) {
    return { ownerId: null, ownerType: 'env' };
  }

  const keyHash = hashApiKey(apiKey);
  const now = new Date();
  const record = await ApiKey.findOne({
    keyHash,
    revokedAt: null,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
  }).lean();
  if (!record) {
    return null;
  }
  return { ownerId: record.ownerId, ownerType: record.ownerType };
}

//only be available to admin user
async function requireApiKey(req, res, next) {
  const apiKey = getApiKey(req);
  const owner = await resolveApiKeyOwner(apiKey);
  if (!owner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.ownerId = owner.ownerId;
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

function requireUserJwt(req, res, next) {
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

  if (result.payload?.type !== 'user') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = result.payload;
  req.ownerId = result.payload.id;
  return next();
}

function requireAdminJwt(req, res, next) {
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

  if (result.payload?.type !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = result.payload;
  return next();
}

async function requireApiKeyOrJwt(req, res, next) {
  const apiKey = getApiKey(req);
  const owner = await resolveApiKeyOwner(apiKey);
  if (owner) {
    req.ownerId = owner.ownerId;
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
  if (result.payload?.type === 'user') {
    req.ownerId = result.payload.id;
  }
  return next();
}

async function verifyApiKey(apiKey) {
  return resolveApiKeyOwner(apiKey);
}

async function rotateApiKey(ownerId, ownerType = 'user') {
  const rawKey = crypto.randomBytes(32).toString('hex');
  const keyHash = hashApiKey(rawKey);
  const graceMinutes = Number(process.env.API_KEY_GRACE_MINUTES || 0);

  if (graceMinutes > 0) {
    const expiresAt = new Date(Date.now() + graceMinutes * 60 * 1000);
    await ApiKey.updateMany(
      { ownerId, ownerType, revokedAt: null, expiresAt: null },
      { $set: { expiresAt } }
    );
  } else {
    await ApiKey.updateMany({ ownerId, ownerType, revokedAt: null }, { $set: { revokedAt: new Date() } });
  }

  await ApiKey.create({ ownerId, ownerType, keyHash });

  return rawKey;
}

module.exports = {
  requireApiKey,
  requireJwt,
  requireUserJwt,
  requireAdminJwt,
  requireApiKeyOrJwt,
  verifyApiKey,
  rotateApiKey
};
