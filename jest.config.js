export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@plugins/(.*)\\.js$': '<rootDir>/src/plugins/$1',
    '^@plugins/(.*)$': '<rootDir>/src/plugins/$1',
    '^@models/(.*)\\.js$': '<rootDir>/src/models/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@shared/(.*)\\.js$': '<rootDir>/src/shared/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@routes/(.*)\\.js$': '<rootDir>/src/routes/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@repositories/(.*)\\.js$': '<rootDir>/src/repositories/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@services/(.*)\\.js$': '<rootDir>/src/services/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@generated/(.*)$': '<rootDir>/generated/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};