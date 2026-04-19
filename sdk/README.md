# Feature Flag SDK

[![npm version](https://badge.fury.io/js/feature-flag-sdk.svg)](https://www.npmjs.com/package/feature-flag-sdk)
[![Downloads](https://img.shields.io/npm/dm/feature-flag-sdk.svg)](https://www.npmjs.com/package/feature-flag-sdk)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A powerful, real-time SDK for managing feature flags with live updates, intelligent rollouts, and audience targeting. Perfect for feature releases, A/B testing, and gradual deployments.

## Features

✨ **Real-time Updates** - Socket.IO-powered live flag changes  
🎯 **Smart Targeting** - Boolean, percentage rollout, and segment-based rules  
⚡ **Local Evaluation** - Fast, reliable flag checks with no server round-trips  
🔐 **Secure** - API key authentication and encrypted connections  
📦 **Universal** - Works in Node.js, Browsers (via REST)  
🧪 **TypeScript Support** - Full type definitions included  
📊 **Battle-tested** - Production-ready with proper error handling  

## Installation

```bash
npm install feature-flag-sdk
```

Or with yarn:
```bash
yarn add feature-flag-sdk
```

## Quick Start

### Node.js / CommonJS

```js
const { FeatureFlagClient } = require('feature-flag-sdk');

async function main() {
  const client = new FeatureFlagClient({
    baseUrl: 'http://localhost:3001',
    apiKey: process.env.FEATURE_FLAG_API_KEY
  });

  await client.init();

  // Check if a flag is enabled for a user
  const enabled = client.isEnabled('new-checkout', 'user-123', { 
    plan: 'premium',
    country: 'US'
  });

  if (enabled) {
    console.log('✅ New checkout flow active!');
  }

  // Handle live updates
  client.on('update', (flags) => {
    console.log('Flags updated:', flags);
  });

  // Cleanup
  client.close();
}

main().catch(console.error);
```

### ES Modules

```js
import { FeatureFlagClient } from 'feature-flag-sdk';

const client = new FeatureFlagClient({
  baseUrl: 'http://localhost:3001',
  apiKey: process.env.FEATURE_FLAG_API_KEY
});

await client.init();
```

## API Reference

### Constructor: `new FeatureFlagClient(options)`

**Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `baseUrl` | string | ✓ | Feature flag server base URL |
| `apiKey` | string | ✓ | API key for authentication |
| `socketUrl` | string | ✗ | Socket.IO endpoint (defaults to baseUrl) |
| `onUpdate` | function | ✗ | Callback when flags update |

**Example:**
```js
const client = new FeatureFlagClient({
  baseUrl: 'https://flags.example.com',
  apiKey: 'ff_sk_prod_xxx',
  onUpdate: (flags) => console.log('Flags updated!', flags)
});
```

### Methods

#### `await init()`

Loads flags from the server and establishes a Socket.IO connection for live updates.

```js
await client.init();
console.log('✅ Client initialized');
```

#### `isEnabled(flagName, userId, attributes = {})`

Evaluates a flag locally. Supports three evaluation types:

**Boolean Flags:**
```js
const enabled = client.isEnabled('dark-mode');
```

**Percentage Rollout (Canary/Gradual Rollout):**
```js
// Enables for 25% of users (deterministic hash-based)
const enabled = client.isEnabled('new-ui', 'user-123');
```

**Segment Targeting:**
```js
const enabled = client.isEnabled('premium-feature', 'user-456', {
  plan: 'premium',
  signupDate: '2024-01-01'
});
// Returns true if user matches segment rules
```

#### `getFlag(flagName)`

Returns the raw flag object or `null`.

```js
const flag = client.getFlag('new-checkout');
console.log(flag);
// {
//   name: 'new-checkout',
//   type: 'percentage',
//   enabled: true,
//   rolloutPercentage: 50,
//   rules: []
// }
```

#### `close()`

Closes the Socket.IO connection and cleanup resources.

```js
client.close();
```

#### `on(event, callback)`

Listen for client events.

```js
client.on('update', (flags) => {
  console.log('Flags updated:', flags);
});

client.on('connect', () => {
  console.log('✅ Connected to flag server');
});

client.on('error', (error) => {
  console.error('❌ Connection error:', error);
});
```

## Flag Types

### 1. Boolean Flags
Simple on/off toggles for features.

```js
client.isEnabled('feature-name'); // true or false
```

### 2. Percentage Rollout
Gradual rollout to a percentage of users (deterministic).

```js
// 30% of users based on consistent hashing
client.isEnabled('new-feature', 'user-id', {});
```

### 3. Segment Rules
Target specific user groups based on attributes.

```js
client.isEnabled('premium-tier', 'user-id', {
  subscription: 'premium',
  country: 'US',
  beta: true
});
```

## Examples

### Express Integration

```js
import express from 'express';
import { FeatureFlagClient } from 'feature-flag-sdk';

const app = express();
const flagClient = new FeatureFlagClient({
  baseUrl: process.env.FLAG_SERVER_URL,
  apiKey: process.env.FLAG_API_KEY
});

app.use(async (req, res, next) => {
  req.flags = flagClient;
  next();
});

app.get('/checkout', (req, res) => {
  const useNewCheckout = req.flags.isEnabled(
    'new-checkout-flow',
    req.user.id,
    { tier: req.user.tier }
  );

  res.json({ newCheckout: useNewCheckout });
});

await flagClient.init();
app.listen(3000);
```

### React / Frontend

```js
// Evaluate flags on backend, send to frontend
// Example: Express endpoint
app.get('/api/features', (req, res) => {
  res.json({
    darkMode: flagClient.isEnabled('dark-mode', req.user.id),
    betaUI: flagClient.isEnabled('beta-ui', req.user.id, {
      betaTester: req.user.betaTester
    })
  });
});

// Use in React
function App() {
  const [features, setFeatures] = useState({});

  useEffect(() => {
    fetch('/api/features')
      .then(r => r.json())
      .then(setFeatures);
  }, []);

  return (
    <div>
      {features.darkMode && <button>Dark Mode</button>}
      {features.betaUI && <BetaUIComponent />}
    </div>
  );
}
```

## Error Handling

```js
const client = new FeatureFlagClient({...});

client.on('error', (error) => {
  console.error('Connection error:', error.message);
  // Gracefully handle errors
});

try {
  await client.init();
} catch (error) {
  console.error('Failed to initialize:', error);
  // Fallback to default flag values
}
```

## TypeScript Support

```typescript
import { FeatureFlagClient, FlagOptions } from 'feature-flag-sdk';

const options: FlagOptions = {
  baseUrl: 'http://localhost:3001',
  apiKey: process.env.FLAG_API_KEY,
};

const client = new FeatureFlagClient(options);

const isEnabled: boolean = client.isEnabled(
  'my-feature',
  'user-123',
  { role: 'admin' }
);
```

## Performance & Best Practices

✅ **Do:**
- Cache flag values in your application
- Use deterministic user IDs (not session tokens)
- Evaluate flags locally for instant response
- Listen for `update` events to refresh cache

❌ **Don't:**
- Call `init()` multiple times
- Pass random user IDs (breaks percentage rollout consistency)
- Evaluate flags before `await init()` completes
- Store sensitive data in flag attributes

## Environment Variables

```bash
# .env
FLAG_SERVER_URL=https://flags.example.com
FLAG_API_KEY=ff_sk_prod_xxxxx
```

## Support & Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Check `baseUrl` and flag server status |
| Auth failures | Verify `apiKey` is valid |
| Stale flags | Ensure Socket.IO connection is active |
| Inconsistent rollout | Use consistent user IDs (not random) |

## Contributing

Contributions welcome! Please...
1. Fork the repository
2. Create a feature branch
3. Add tests
4. Submit a PR

## License

MIT - see [LICENSE](LICENSE) for details

---

**Need Help?**
- 📖 [Documentation](https://github.com/kanishk6030/feature-flag-sdk)
- 🐛 [Report Issues](https://github.com/kanishk6030/feature-flag-sdk/issues)
- 💬 [Discussions](https://github.com/kanishk6030/feature-flag-sdk/discussions)
