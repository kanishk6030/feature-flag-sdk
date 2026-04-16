# Feature Flag SDK

A minimal Node.js SDK for the Feature Flag Server. It loads flags over HTTP, listens for live updates over Socket.IO, and evaluates flags locally.

## Install

```bash
npm install feature-flag-sdk
```

## Usage

```js
const { FeatureFlagClient } = require('feature-flag-sdk');

async function main() {
  const client = new FeatureFlagClient({
    baseUrl: 'http://localhost:3001',
    apiKey: process.env.FEATURE_FLAG_API_KEY
  });

  await client.init();

  const enabled = client.isEnabled('new-ui-button', 'user-42', { plan: 'pro' });
  console.log('new-ui-button enabled?', enabled);

  client.close();
}

main().catch(console.error);
```

## API

### new FeatureFlagClient(options)

Options:
- `baseUrl` (required): Base URL of the feature flag server.
- `socketUrl` (optional): Socket.IO endpoint. Defaults to `baseUrl`.
- `apiKey` (optional): API key for protected `/flags` and Socket.IO connections.
- `onUpdate` (optional): Callback fired when `flags:update` arrives.

### async init()
Loads flags and starts the socket connection.

### isEnabled(flagName, userId, attributes = {})
Evaluates a flag locally.

- `boolean`: returns true if enabled.
- `percentage`: stable hash of `userId + flagName` vs rollout percentage.
- `segment`: matches rules against `attributes`.

### getFlag(flagName)
Returns the raw flag object or `null`.

### close()
Disconnects Socket.IO.

## Notes

- This SDK is Node-focused (CommonJS + `node-fetch`).
- For frontend apps, evaluate flags on your backend and send booleans to the UI.
- If `/flags` is secured, you must pass `apiKey`.

## License

MIT
