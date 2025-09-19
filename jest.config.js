/** @type {import('jest').Config} */
const config = {
    collectCoverageFrom: ["**/*.{js,jsx,ts,tsx}", "!**/*.d.ts", "!**/node_modules/**"],
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
    coveragePathIgnorePatterns: ["node_modules", ".d.ts", ".next", "coverage", "public", ".config.ts", ".config.js"],
    setupFilesAfterEnv: ["jest-extended", "./__mocks__/global.tsx", "@testing-library/jest-dom"],
    coverageReporters: ["json", "lcov", "text", "text-summary"],
    transformIgnorePatterns: ["/node_modules/", "^.+\\.module\\.(css|sass|scss)$"],
    testResultsProcessor: "jest-sonar-reporter",
    resetMocks: false,
    snapshotResolver: "./__mocks__/snapshot.ts",
    testTimeout: 10000,
    // Disable debugger for CI/test runs
    detectOpenHandles: false,
};

module.exports = config;
