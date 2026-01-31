export default {
    preset: 'ts-jest/presets/default-esm', // Use ts-jest with ESM support
    testEnvironment: 'node', // Use Node.js environment for backend tests
    extensionsToTreatAsEsm: ['.ts'], // Treat TypeScript files as ESM
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          useESM: true, // Enable ESM support in ts-jest
        },
      ],
    },
    moduleNameMapper: {
      // Map module paths if necessary
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/tests/**/*.test.ts'], // Match test files
  };
