const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** Jest config: Next's SWC transform, jsdom for localStorage, "@/" path alias. */
module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  coverageReporters: ['json-summary', 'text'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
});
