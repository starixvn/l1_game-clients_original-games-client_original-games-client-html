/** @format */

module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.{js,jsx,ts,tsx}"],
  collectCoverageFrom: [
    "pages/api/**/*.{js,ts}",
    "components/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
  ],
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: ["node_modules/(?!(supertest)/)"],
};
