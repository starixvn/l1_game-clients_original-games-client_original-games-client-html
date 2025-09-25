/** @type {import('jest').Config} */
const config = {
    collectCoverageFrom: [
        "packages/*/src/**/*.{js,jsx,ts,tsx}",
        "packages/*/src/**/*.test.{js,jsx,ts,tsx}",
        "packages/*/src/**/*.spec.{js,jsx,ts,tsx}",
        "packages/*/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
        "!packages/*/src/**/*.d.ts",
        "!packages/*/src/**/*.config.{js,ts}",
        "!packages/*/src/**/*.mock.{js,ts}",
        "!packages/*/src/**/*.stories.{js,jsx,ts,tsx}",
        "!**/node_modules/**",
    ],
    
    forceCoverageMatch: [
        "**/__tests__/**/*.test.{js,jsx,ts,tsx}",
        "**/__tests__/**/*.spec.{js,jsx,ts,tsx}",
    ],
    moduleNameMapper: {
        "^.+\\.(css|sass|scss)$": "identity-obj-proxy",
        "swiper/css": "identity-obj-proxy",
        "swiper/css/pagination": "identity-obj-proxy",
        "swiper/react": "<rootDir>/node_modules/swiper/swiper.js",
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@shared/(.*)$": "<rootDir>/packages/shared/src/$1",
        "^@sedie-multiplayer/(.*)$": "<rootDir>/packages/sedie-multiplayer/src/$1",
    },
    testPathIgnorePatterns: [
        "<rootDir>/node_modules/",
        "<rootDir>/.next/",
        "<rootDir>/src/components/page-components/lobby/__tests__/games/components/game-board.test.tsx",
    ],
    moduleFileExtensions: ["ts", "tsx", "js"],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.jest.json",
            },
        ],
    },
    testMatch: ["**/__tests__/**/*.test.[jt]s?(x)", "**/*.spec.[jt]s?(x)"],
    testEnvironment: "jsdom",
    coveragePathIgnorePatterns: [
        "node_modules",
        ".d.ts",
        ".next",
        "coverage",
        "public",
        ".config.ts",
        ".config.js",
        "packages/*/configs/",
        "packages/*/scripts/",
        "packages/*/public/",
        ".*\\.config\\..*",
        ".*\\.mock\\..*",
        ".*/custom-server\\.js",
        ".*/server-.*\\.js",
    ],
    setupFilesAfterEnv: ["jest-extended", "./__mocks__/global.tsx", "@testing-library/jest-dom"],
    coverageReporters: ["json", "lcov", "text", "text-summary"],
    transformIgnorePatterns: ["/node_modules/", "^.+\\.module\\.(css|sass|scss)$"],
    testResultsProcessor: "jest-sonar-reporter",
    resetMocks: false,
    snapshotResolver: "./__mocks__/snapshot.ts",
    testTimeout: 30000, // Increased for integration tests
    // Disable debugger for CI/test runs
    detectOpenHandles: false,
    // Limit parallel workers to prevent memory issues
    maxWorkers: "50%", // Use 50% of available cores
    // Bail after first failure in CI
    bail: process.env.CI ? 1 : 0,
    // Optimize memory usage
    cache: true,
    // Clear mocks between tests to prevent memory leaks
    clearMocks: true,
};

module.exports = config;
