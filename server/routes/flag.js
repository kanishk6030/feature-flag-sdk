const express = require('express');
const router = express.Router();
const Flag = require('../models/Flag');
const { getIo } = require('../socket');
const { requireApiKeyOrJwt } = require('../middleware/auth');

const ALLOWED_TYPES = new Set(['boolean', 'percentage', 'segment']);

function normalizeRules(rules) {
  if (!Array.isArray(rules)) {
    return null;
  }

  return rules.map((rule) => ({
    attribute: String(rule.attribute || '').trim(),
    value: String(rule.value || '').trim()
  })).filter((rule) => rule.attribute && rule.value);
}

// Create a new flag
router.post('/', requireApiKeyOrJwt, async (req, res) => {
   try {
    if (!req.ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const flag = new Flag({
      ...req.body,
      ownerId: req.ownerId
    });
    await flag.save();
    getIo().to(`owner:${req.ownerId}`).emit('flags:update', { action: 'create', flag });
    res.status(201).json(flag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  } 
});

// Get all flags
router.get('/', requireApiKeyOrJwt, async (req, res) => {
  try {
    if (!req.ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const flags = await Flag.find({ ownerId: req.ownerId });
    res.json(flags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific flag by ID
router.get('/:id', requireApiKeyOrJwt, async (req, res) => {
  try { 
    if (!req.ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const flag = await Flag.findOne({ _id: req.params.id, ownerId: req.ownerId });
    if (!flag) return res.status(404).json({ message: 'Flag not found' });
    res.json(flag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } 
});

// PATCH toggle flag on/off
router.patch('/:name/toggle', requireApiKeyOrJwt, async (req, res) => {
  try {
    if (!req.ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const flag = await Flag.findOne({ name: req.params.name, ownerId: req.ownerId });
    if (!flag) return res.status(404).json({ error: 'Flag not found' });

    flag.enabled = !flag.enabled;
    await flag.save();
    getIo().to(`owner:${req.ownerId}`).emit('flags:update', { action: 'toggle', flag });
    res.json(flag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PATCH update rollout percentage
router.patch('/:name/rollout', requireApiKeyOrJwt, async (req, res) => {
  try {
    if (!req.ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const flag = await Flag.findOne({ name: req.params.name, ownerId: req.ownerId });
    if (!flag) return res.status(404).json({ error: 'Flag not found' });

    flag.rolloutPercentage = req.body.percentage;
    await flag.save();
    getIo().to(`owner:${req.ownerId}`).emit('flags:update', { action: 'rollout', flag });
    res.json(flag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update any flag fields
router.patch('/:name', requireApiKeyOrJwt, async (req, res) => {
  try {
    if (!req.ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const flag = await Flag.findOne({ name: req.params.name, ownerId: req.ownerId });
    if (!flag) return res.status(404).json({ error: 'Flag not found' });

    if (req.body.name) {
      flag.name = String(req.body.name).trim();
    }

    if (req.body.type) {
      const type = String(req.body.type).trim();
      if (!ALLOWED_TYPES.has(type)) {
        return res.status(400).json({ error: 'Invalid flag type' });
      }
      flag.type = type;
    }

    if (typeof req.body.enabled === 'boolean') {
      flag.enabled = req.body.enabled;
    }

    if (req.body.rolloutPercentage !== undefined) {
      const percentage = Number(req.body.rolloutPercentage);
      if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
        return res.status(400).json({ error: 'Invalid rollout percentage' });
      }
      flag.rolloutPercentage = percentage;
    }

    if (req.body.rules !== undefined) {
      const normalizedRules = normalizeRules(req.body.rules);
      if (normalizedRules === null) {
        return res.status(400).json({ error: 'Rules must be an array' });
      }
      flag.rules = normalizedRules;
    }

    await flag.save();
    getIo().to(`owner:${req.ownerId}`).emit('flags:update', { action: 'update', flag });
    res.json(flag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE a flag
router.delete('/:name', requireApiKeyOrJwt, async (req, res) => {
  try {
    if (!req.ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Flag.findOneAndDelete({ name: req.params.name, ownerId: req.ownerId });
    getIo().to(`owner:${req.ownerId}`).emit('flags:update', { action: 'delete', name: req.params.name });
    res.json({ message: 'Flag deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;