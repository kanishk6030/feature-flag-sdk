const { io } = require('socket.io-client');

let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
}

function stableHash(input) {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash &= 0xffffffff;
  }
  return Math.abs(hash);
}

class FeatureFlagClient {
  constructor(options) {
    if (!options || !options.baseUrl) {
      throw new Error('FeatureFlagClient requires baseUrl');
    }

    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.socketUrl = (options.socketUrl || this.baseUrl).replace(/\/$/, '');
    this.onUpdate = typeof options.onUpdate === 'function' ? options.onUpdate : null;
    this.apiKey = options.apiKey || null;

    this.flagsByName = new Map();
    this.socket = null;
    this.ready = false;
  }

  async init() {
    await this._loadFlags();
    this._connectSocket();
    this.ready = true;
  }

  async _loadFlags() {
    const headers = {};
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    const response = await fetchFn(this.baseUrl + '/flags', { headers });
    if (!response.ok) {
      throw new Error('Failed to load flags: ' + response.status);
    }
    const flags = await response.json();
    this.flagsByName.clear();
    for (const flag of flags) {
      this.flagsByName.set(flag.name, flag);
    }
  }

  _connectSocket() {
    this.socket = io(this.socketUrl, {
      transports: ['websocket'],
      auth: this.apiKey ? { apiKey: this.apiKey } : undefined
    });

    this.socket.on('flags:update', (payload) => {
      if (!payload || !payload.action) {
        return;
      }

      if (payload.action === 'delete') {
        this.flagsByName.delete(payload.name);
      } else if (payload.flag && payload.flag.name) {
        this.flagsByName.set(payload.flag.name, payload.flag);
      }

      if (this.onUpdate) {
        this.onUpdate(payload);
      }
    });
  }

  isEnabled(flagName, userId, attributes = {}) {
    const flag = this.flagsByName.get(flagName);
    if (!flag || !flag.enabled) {
      return false;
    }

    if (flag.type === 'boolean') {
      return true;
    }

    if (flag.type === 'percentage') {
      const key = String(userId || '') + ':' + flagName;
      const bucket = stableHash(key) % 100;
      return bucket < (flag.rolloutPercentage || 0);
    }

    if (flag.type === 'segment') {
      if (!Array.isArray(flag.rules) || flag.rules.length === 0) {
        return false;
      }

      return flag.rules.some((rule) => {
        const attrValue = attributes[rule.attribute];
        return String(attrValue) === String(rule.value);
      });
    }

    return false;
  }

  getFlag(flagName) {
    return this.flagsByName.get(flagName) || null;
  }

  close() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

module.exports = { FeatureFlagClient };
