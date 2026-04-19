# Feature Flag System 🚀

A complete, production-ready feature flag management system with real-time updates, multi-tenant support, and a modern dashboard. Built with Node.js, React, MongoDB, and Socket.IO.

**Live NPM Package:** [@kanishkvats/feature-flag-sdk](https://www.npmjs.com/package/@kanishkvats/feature-flag-sdk)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [SDK API Reference](#sdk-api-reference)
- [Backend API Reference](#backend-api-reference)
- [Dashboard](#dashboard)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This feature flag system provides:

- **Feature Flags Management**: Create, update, and manage feature flags for your applications
- **Real-time Updates**: Live flag changes via Socket.IO without requiring application restarts
- **Multi-tenant Support**: Isolated user workspaces with granular API key management
- **Client SDK**: Universal Node.js SDK with CommonJS and ESM support
- **Dashboard UI**: Modern React-based web application for flag management
- **Type Safety**: Full TypeScript definitions and type support
- **Security**: JWT authentication, API key management, bcrypt password hashing, rate limiting

---

## Features

### 🎯 Core Features

✅ **Boolean Flags** - Simple on/off toggles  
✅ **Percentage-based Rollouts** - Gradual user rollout (0-100%)  
✅ **Segment-based Targeting** - Target specific user segments or groups  
✅ **Real-time Updates** - Socket.IO for instant flag propagation  
✅ **Client-side Evaluation** - Evaluate flags locally with zero latency  
✅ **Server-side Evaluation** - Evaluate flags on backend for sensitive cases  

### 🔐 Security & Auth

✅ **JWT Authentication** - Secure user authentication  
✅ **API Keys** - Per-user API keys with rotation and grace period support  
✅ **Password Hashing** - bcryptjs for secure password storage  
✅ **Rate Limiting** - Protect APIs from abuse  
✅ **Multi-tenant Isolation** - Complete data isolation between users  
✅ **Admin Controls** - Account lockout and security management  

### 💼 Developer Experience

✅ **TypeScript Support** - Full type definitions included  
✅ **ESM & CommonJS** - Works with both module systems  
✅ **Comprehensive Docs** - API reference and examples  
✅ **Event Emitter** - Listen to flag update events  
✅ **Zero Config** - Works out of the box with sensible defaults  

---

## Architecture

```
feature-flag/
├── sdk/                          # Node.js SDK package
│   ├── index.js                  # SDK entry point
│   ├── build.js                  # Build script (esbuild)
│   ├── dist/                     # Compiled outputs
│   │   ├── index.js              # CommonJS build
│   │   ├── index.esm.js          # ESM build
│   │   └── index.d.ts            # TypeScript definitions
│   ├── package.json              # NPM package config
│   └── README.md                 # SDK documentation
│
├── server/                       # Express.js backend
│   ├── index.js                  # Server entry point
│   ├── socket.js                 # Socket.IO configuration
│   ├── routes/
│   │   ├── auth.js               # Auth endpoints (register, login, verify)
│   │   └── flag.js               # Flag CRUD endpoints
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── AdminUser.js          # Admin user schema
│   │   ├── Flag.js               # Flag schema
│   │   └── ApiKey.js             # API key schema
│   ├── middleware/
│   │   ├── auth.js               # JWT & API key validation
│   │   └── rateLimit.js          # Rate limiting
│   ├── package.json              # Dependencies
│   └── README.md                 # Server documentation
│
└── dashboard/                    # React Vite frontend
    ├── src/
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # Entry point
    │   ├── index.css             # Tailwind styles
    │   └── components/           # React components
    ├── package.json              # Frontend dependencies
    ├── vite.config.js            # Vite configuration
    └── tailwind.config.js        # Tailwind CSS config
```

### Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend** | Node.js + Express | 18+ |
| **Real-time** | Socket.IO | 4.x |
| **Database** | MongoDB + Mongoose | Latest |
| **Authentication** | JWT + bcryptjs | - |
| **Frontend** | React + Vite | 19 + 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Build** | esbuild | Latest |
| **Package** | NPM | 10+ |

---

## Quick Start

### 1. Install the SDK

```bash
npm install @kanishkvats/feature-flag-sdk
```

### 2. Initialize and Use

**CommonJS:**
```javascript
const { FeatureFlagClient } = require('@kanishkvats/feature-flag-sdk');

const client = new FeatureFlagClient({
  serverUrl: 'http://localhost:3000',
  userId: 'user-123',
  apiKey: 'your-api-key'
});

await client.init();

if (await client.isEnabled('new-feature')) {
  console.log('Feature is enabled!');
}
```

**ES Modules:**
```javascript
import { FeatureFlagClient } from '@kanishkvats/feature-flag-sdk';

const client = new FeatureFlagClient({
  serverUrl: 'http://localhost:3000',
  userId: 'user-123',
  apiKey: 'your-api-key'
});

await client.init();

if (await client.isEnabled('new-feature')) {
  console.log('Feature is enabled!');
}
```

### 3. Listen to Updates

```javascript
client.on('flag-updated', (flagName, enabled) => {
  console.log(`Flag ${flagName} is now ${enabled}`);
});

client.on('flags-refreshed', (flags) => {
  console.log('All flags refreshed:', flags);
});
```

---

## Installation

### Prerequisites

- **Node.js** 18+
- **npm** 10+
- **MongoDB** (local or cloud, e.g., MongoDB Atlas)

### Backend Setup

```bash
cd server
npm install
```

**Create `.env` file:**
```env
MONGO_URI=mongodb://localhost:27017/feature-flags
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Start server:**
```bash
npm start
# Or for development:
npm run dev
```

### Frontend Setup

```bash
cd dashboard
npm install
npm run dev
```

Runs on `http://localhost:5175`

### SDK Installation

```bash
npm install @kanishkvats/feature-flag-sdk
```

---

## Configuration

### SDK Options

```javascript
new FeatureFlagClient({
  serverUrl: 'http://localhost:3000',      // Backend server URL
  userId: 'user-123',                       // Current user ID
  apiKey: 'your-api-key',                   // API key from dashboard
  cacheDuration: 5 * 60 * 1000,             // Cache duration (5 minutes)
  enableSocketIO: true,                     // Enable real-time updates
  onError: (error) => console.error(error)  // Error handler
});
```

### Environment Variables (Server)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost/feature-flags` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `NODE_ENV` | Environment mode | `development`, `production` |
| `PORT` | Server port | `3000` |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | Email sender address | `your-email@gmail.com` |
| `SMTP_PASS` | Email app password | `app-specific-password` |

---

## SDK API Reference

### Constructor

```javascript
new FeatureFlagClient(options)
```

**Parameters:**
- `serverUrl` (string, required): Backend server URL
- `userId` (string, required): Current user ID
- `apiKey` (string, required): API key for authentication
- `cacheDuration` (number, optional): Cache duration in milliseconds (default: 5 min)
- `enableSocketIO` (boolean, optional): Enable real-time updates (default: true)
- `onError` (function, optional): Error callback function

**Returns:** `FeatureFlagClient` instance

---

### Methods

#### `init()`

Initialize the client and load flags from server.

```javascript
await client.init();
```

**Returns:** `Promise<void>`

**Throws:** Error if connection fails

---

#### `isEnabled(flagName)`

Check if a flag is enabled for the current user.

```javascript
const enabled = await client.isEnabled('new-checkout');
if (enabled) {
  // Show new feature
}
```

**Parameters:**
- `flagName` (string): Name of the flag to check

**Returns:** `Promise<boolean>`

---

#### `getFlag(flagName)`

Get complete flag details including type and configuration.

```javascript
const flag = await client.getFlag('pricing-experiment');
console.log(flag);
// {
//   name: 'pricing-experiment',
//   type: 'percentage',
//   enabled: true,
//   percentage: 50,
//   segments: []
// }
```

**Parameters:**
- `flagName` (string): Name of the flag

**Returns:** `Promise<Flag | null>`

**Flag object structure:**
```javascript
{
  name: string,
  type: 'boolean' | 'percentage' | 'segment',
  enabled: boolean,
  percentage?: number,           // 0-100 (for percentage type)
  segments?: string[],           // User segments (for segment type)
  description?: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

#### `on(event, callback)`

Listen to flag-related events.

```javascript
client.on('flag-updated', (flagName, enabled) => {
  console.log(`${flagName} is now ${enabled}`);
});

client.on('connection', () => {
  console.log('Connected to server');
});

client.on('error', (error) => {
  console.error('Error:', error);
});
```

**Supported events:**
- `'flag-updated'` - Single flag updated (params: flagName, enabled)
- `'flags-refreshed'` - All flags refreshed (params: flags object)
- `'connection'` - Connected to server
- `'disconnect'` - Connection lost
- `'error'` - Error occurred (params: error)

**Returns:** void

---

#### `close()`

Close the connection to the server.

```javascript
await client.close();
```

**Returns:** `Promise<void>`

---

## Backend API Reference

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User registered. Verification email sent.",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

---

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

---

#### Verify Email

```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

---

### Flag Management Endpoints

#### Create Flag

```http
POST /api/flags
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "new-checkout",
  "type": "boolean",
  "enabled": true,
  "description": "New checkout design"
}
```

**Flag types:**
- `boolean` - Simple on/off toggle
- `percentage` - Percentage-based rollout (requires `percentage` field: 0-100)
- `segment` - Segment-based targeting (requires `segments` array)

**Response:**
```json
{
  "_id": "flag-id",
  "name": "new-checkout",
  "type": "boolean",
  "enabled": true,
  "userId": "user-id",
  "createdAt": "2026-04-19T12:00:00Z",
  "updatedAt": "2026-04-19T12:00:00Z"
}
```

---

#### Get All Flags

```http
GET /api/flags
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "flags": [
    {
      "_id": "flag-id-1",
      "name": "new-checkout",
      "type": "boolean",
      "enabled": true
    },
    {
      "_id": "flag-id-2",
      "name": "beta-features",
      "type": "percentage",
      "enabled": true,
      "percentage": 50
    }
  ]
}
```

---

#### Get Flag by ID

```http
GET /api/flags/{flagId}
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "_id": "flag-id",
  "name": "new-checkout",
  "type": "boolean",
  "enabled": true,
  "description": "New checkout design",
  "createdAt": "2026-04-19T12:00:00Z",
  "updatedAt": "2026-04-19T12:00:00Z"
}
```

---

#### Update Flag

```http
PATCH /api/flags/{flagId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "enabled": false,
  "description": "Disabled temporarily"
}
```

**Response:**
```json
{
  "_id": "flag-id",
  "name": "new-checkout",
  "type": "boolean",
  "enabled": false,
  "description": "Disabled temporarily",
  "updatedAt": "2026-04-19T13:00:00Z"
}
```

---

#### Delete Flag

```http
DELETE /api/flags/{flagId}
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "message": "Flag deleted successfully"
}
```

---

### API Key Management Endpoints

#### Create API Key

```http
POST /api/auth/api-key
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "apiKey": "sk_live_1234567890abcdef",
  "message": "API key created. Keep it safe!"
}
```

---

#### Get API Keys

```http
GET /api/auth/api-keys
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "apiKeys": [
    {
      "_id": "key-id",
      "keyHash": "hashed-key",
      "createdAt": "2026-04-01T00:00:00Z",
      "gracePeriodExpires": "2026-04-08T00:00:00Z"
    }
  ]
}
```

---

#### Rotate API Key

```http
POST /api/auth/api-key/{keyId}/rotate
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "newApiKey": "sk_live_newkey123",
  "gracePeriod": 7,
  "message": "Old key still works for 7 days"
}
```

---

#### Revoke API Key

```http
DELETE /api/auth/api-key/{keyId}
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "message": "API key revoked successfully"
}
```

---

## Dashboard

The dashboard UI provides a user-friendly interface to manage feature flags.

### Features

- **Create Flags** - Add new feature flags with different types
- **Manage Flags** - Enable/disable and edit existing flags
- **API Keys** - Generate, rotate, and revoke API keys
- **Real-time Preview** - See flag changes instantly
- **User Management** - Account settings and security

### Access Dashboard

```
http://localhost:5175
```

### Login

Use the credentials you registered with:
- **Email:** your-email@example.com
- **Password:** your-password

### Screenshots

**Create Flag:**
```
[Create Flag Form]
- Name: new-checkout
- Type: Boolean / Percentage / Segment
- Enabled: Toggle
- Description: Optional
```

**Flag List:**
```
[Flags Table]
- Flag Name | Type | Status | Created | Actions
- new-checkout | Boolean | Enabled | Apr 19 | Edit Delete
```

**API Keys Manager:**
```
[API Keys]
- Generate New Key
- Rotate Key
- Revoke Key
- Grace Period Countdown
```

---

## Examples

### Example 1: Basic Feature Toggle

**Backend code:**
```javascript
const { FeatureFlagClient } = require('@kanishkvats/feature-flag-sdk');

const flagClient = new FeatureFlagClient({
  serverUrl: 'http://localhost:3000',
  userId: 'user-123',
  apiKey: 'sk_live_xxxxx'
});

await flagClient.init();

// Check if new feature is enabled
if (await flagClient.isEnabled('new-dashboard')) {
  console.log('Show new dashboard');
} else {
  console.log('Show old dashboard');
}
```

---

### Example 2: Percentage Rollout

**Create flag:**
```javascript
// Dashboard: Create flag with type "percentage" and value 25%
// This will enable the feature for 25% of random users
```

**Use in code:**
```javascript
const enabled = await flagClient.isEnabled('beta-search');
if (enabled) {
  // Show beta search to 25% of users
  console.log('New search algorithm active');
}
```

---

### Example 3: Segment-based Targeting

**Create flag with segments:**
```javascript
// Dashboard: 
// Name: "premium-features"
// Type: "segment"
// Segments: ["premium-users", "beta-testers"]
```

**Evaluate on backend:**
```javascript
const flag = await flagClient.getFlag('premium-features');

function isUserInSegment(userId, segments) {
  const userSegments = getUserSegments(userId);
  return segments.some(seg => userSegments.includes(seg));
}

if (flag.enabled && isUserInSegment(userId, flag.segments)) {
  console.log('Enable premium features');
}
```

---

### Example 4: Real-time Updates with Socket.IO

```javascript
const flagClient = new FeatureFlagClient({
  serverUrl: 'http://localhost:3000',
  userId: 'user-123',
  apiKey: 'sk_live_xxxxx',
  enableSocketIO: true
});

await flagClient.init();

// Listen for flag updates
flagClient.on('flag-updated', (flagName, enabled) => {
  console.log(`Flag "${flagName}" changed to ${enabled}`);
  
  // Update UI without page reload
  if (flagName === 'new-checkout') {
    updateCheckoutUI(enabled);
  }
});

// Listen for connection events
flagClient.on('connection', () => {
  console.log('Connected to flag server');
});

flagClient.on('disconnect', () => {
  console.log('Disconnected from flag server');
});

flagClient.on('error', (error) => {
  console.error('Flag client error:', error);
});
```

---

### Example 5: Express Middleware

```javascript
const express = require('express');
const { FeatureFlagClient } = require('@kanishkvats/feature-flag-sdk');

const app = express();

// Initialize flag client
const flagClient = new FeatureFlagClient({
  serverUrl: 'http://localhost:3000',
  userId: 'service-account',
  apiKey: 'sk_live_xxxxx'
});

await flagClient.init();

// Middleware to add flag context
app.use(async (req, res, next) => {
  const flags = {
    newCheckout: await flagClient.isEnabled('new-checkout'),
    betaFeatures: await flagClient.isEnabled('beta-features'),
    maintenanceMode: await flagClient.isEnabled('maintenance-mode')
  };
  
  req.flags = flags;
  res.locals.flags = flags;
  next();
});

// Use in routes
app.get('/checkout', (req, res) => {
  if (req.flags.maintenanceMode) {
    return res.status(503).send('Under maintenance');
  }
  
  if (req.flags.newCheckout) {
    return res.render('checkout-v2');
  }
  
  res.render('checkout-v1');
});
```

---

### Example 6: React Component

```javascript
import { FeatureFlagClient } from '@kanishkvats/feature-flag-sdk';
import { useEffect, useState } from 'react';

function FeatureToggle({ flagName, children }) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const flagClient = new FeatureFlagClient({
      serverUrl: 'http://localhost:3000',
      userId: 'user-123',
      apiKey: 'sk_live_xxxxx'
    });

    (async () => {
      await flagClient.init();
      setEnabled(await flagClient.isEnabled(flagName));
      setLoading(false);

      // Listen for updates
      flagClient.on('flag-updated', (name, enabled) => {
        if (name === flagName) {
          setEnabled(enabled);
        }
      });
    })();
  }, [flagName]);

  if (loading) return <div>Loading...</div>;
  if (!enabled) return null;

  return <>{children}</>;
}

// Usage
export default function App() {
  return (
    <div>
      <FeatureToggle flagName="new-ui">
        <div>This is the new UI (only shown if flag is enabled)</div>
      </FeatureToggle>
    </div>
  );
}
```

---

## File Structure Explained

```
project-root/
├── sdk/
│   ├── index.js              # Main SDK class with init, isEnabled, getFlag, close methods
│   ├── build.js              # esbuild configuration for compiling CommonJS & ESM
│   ├── package.json          # NPM package metadata, scripts, exports
│   ├── dist/                 # Compiled outputs (created by build.js)
│   │   ├── index.js          # CommonJS: require('@kanishkvats/feature-flag-sdk')
│   │   ├── index.esm.js      # ESM: import from '@kanishkvats/feature-flag-sdk'
│   │   └── index.d.ts        # TypeScript type definitions
│   └── jest.config.js        # Jest testing configuration
│
├── server/
│   ├── index.js              # Express app setup, server initialization
│   ├── socket.js             # Socket.IO real-time event handlers
│   ├── routes/
│   │   ├── auth.js           # Register, login, verify, API key management
│   │   └── flag.js           # CRUD operations for flags
│   ├── models/
│   │   ├── User.js           # User schema with email, password, verified status
│   │   ├── AdminUser.js      # Admin user for system management
│   │   ├── Flag.js           # Flag schema with name, type, enabled, percentage, segments
│   │   └── ApiKey.js         # API key schema with hash, grace period
│   └── middleware/
│       ├── auth.js           # JWT & API key validation middleware
│       └── rateLimit.js      # Rate limiting per user/IP
│
└── dashboard/
    ├── src/
    │   ├── App.jsx           # Main app with sidebar navigation
    │   ├── main.jsx          # React app entry point
    │   ├── index.css         # Tailwind CSS imports and globals
    │   └── components/       # React components (flags, keys, forms)
    ├── package.json          # React dependencies, Vite config
    ├── vite.config.js        # Vite server configuration
    └── tailwind.config.js    # Tailwind CSS customization
```

---

## Development Workflow

### 1. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in server/.env
```

### 2. Start Backend Server

```bash
cd server
npm install
npm start
# Runs on http://localhost:3000
```

### 3. Start Dashboard

```bash
cd dashboard
npm install
npm run dev
# Runs on http://localhost:5175
```

### 4. Test SDK Locally

```bash
# In a Node.js script
const { FeatureFlagClient } = require('./sdk/dist/index.js');

const client = new FeatureFlagClient({
  serverUrl: 'http://localhost:3000',
  userId: 'test-user',
  apiKey: 'your-api-key'
});

await client.init();
console.log(await client.isEnabled('test-flag'));
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/kanishkvats/feature-flag-sdk.git
   cd feature-flag-sdk
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Update code
   - Update tests
   - Update documentation

4. **Test your changes**
   ```bash
   npm test
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   git push origin feature/amazing-feature
   ```

6. **Open a pull request**

---

## Testing

### SDK Tests

```bash
cd sdk
npm test
```

### Backend Tests

```bash
cd server
npm test
```

### Dashboard Tests

```bash
cd dashboard
npm test
```

---

## Deployment

### Deploy Server to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Connect GitHub repository
4. Create new Web Service
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables from `.env`

### Deploy Dashboard to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project
4. Framework: Vite
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy

### Publish SDK to NPM

```bash
cd sdk
npm version patch  # or minor, major
npm publish --access public
```

---

## Troubleshooting

### "Cannot find module 'socket.io-client'"

**Solution:** Install dependencies
```bash
npm install
```

### "MongoD error: connect ECONNREFUSED"

**Solution:** Start MongoDB or update `MONGO_URI`
```bash
mongod
# Or use MongoDB Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/feature-flags
```

### "JWT Secret not configured"

**Solution:** Add `JWT_SECRET` to `.env`
```env
JWT_SECRET=your-random-secret-key
```

### "SMTP credentials not working"

**Solution:** Use Gmail app-specific password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2FA
3. Generate App Password
4. Use that in `SMTP_PASS`

---

## Support

- 📖 **Documentation:** [Full API Reference](#sdk-api-reference)
- 🐛 **Report Issues:** [GitHub Issues](https://github.com/kanishkvats/feature-flag-sdk/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/kanishkvats/feature-flag-sdk/discussions)
- 📧 **Email:** kanishk@example.com

---

## License

MIT License - see [LICENSE](LICENSE) for details

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### Latest Version: 1.0.0

✅ Initial release with full feature flag management system
✅ Real-time Socket.IO support
✅ Multi-tenant architecture
✅ Modern React dashboard
✅ Comprehensive SDK with TypeScript support

---

## Roadmap

- [ ] Webhooks for flag change events
- [ ] Advanced analytics and usage tracking
- [ ] Flag targeting with complex rules engine
- [ ] Team collaboration features
- [ ] Audit logs
- [ ] Feature flag experiments/A-B testing
- [ ] Integration with major frameworks (Next.js, SvelteKit, etc.)
- [ ] Official SDKs for Python, Go, Java

---

**Built with ❤️ by Kanishka Vats**

**[Star on NPM](https://www.npmjs.com/package/@kanishkvats/feature-flag-sdk) • [Star on GitHub](https://github.com/kanishkvats/feature-flag-sdk)**
