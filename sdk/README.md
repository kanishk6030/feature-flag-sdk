# Feature Flag SDK

A lightweight client for evaluating feature flags locally with live updates from your flag server.

## Install

```bash
npm install @kanishkvats/feature-flag-sdk
```

## Quick Start

```js
const { FeatureFlagClient } = require('@kanishkvats/feature-flag-sdk');

async function main() {
  const client = new FeatureFlagClient({
    baseUrl: 'http://localhost:3001',
    apiKey: process.env.FEATURE_FLAG_API_KEY,
    onUpdate: (payload) => {
      console.log('flags:update', payload);
    },
  });

  await client.init();

  const enabled = client.isEnabled('new-checkout', 'user-123', {
    plan: 'premium',
    country: 'US',
  });

  console.log('new-checkout enabled:', enabled);

  process.on('SIGINT', () => {
    client.close();
    process.exit(0);
  });
}

main().catch(console.error);
```

## API

### `new FeatureFlagClient(options)`

Options:

| Option | Type | Required | Description |
|---|---|---|---|
| `baseUrl` | `string` | yes | Base URL of the backend API (example: `http://localhost:3001`) |
| `apiKey` | `string` | no | API key sent as `X-API-Key` while loading flags and socket auth |
| `socketUrl` | `string` | no | Socket server URL. Defaults to `baseUrl` |
| `onUpdate` | `function` | no | Callback invoked when backend emits `flags:update` |

### `await client.init()`

Loads flags from `GET /flags` and connects Socket.IO for realtime updates.

### `client.isEnabled(flagName, userId, attributes = {})`

Evaluates a flag from local cache:

- `boolean` flags: enabled if flag exists and `enabled` is true.
- `percentage` flags: deterministic hash of `userId + flagName` compared to `rolloutPercentage`.
- `segment` flags: true when any rule matches `attributes[rule.attribute] === rule.value`.

### `client.getFlag(flagName)`

Returns full flag object from local cache, or `null`.

### `client.close()`

Disconnects Socket.IO.

## Important Notes

- The SDK does not expose `client.on(...)`.
- Use the constructor option `onUpdate` to receive live update callbacks.
- Call `await client.init()` before first evaluation.

## Local Example

See `examples/sdk-node-app` in the repository for a complete runnable integration demo.

## License

MIT
