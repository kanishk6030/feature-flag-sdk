export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'index.js',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js', '**/*.spec.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
