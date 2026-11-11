module = module || {};
module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '**/tests/unit/**/*.test.js'
  ],
  verbose: true
};
