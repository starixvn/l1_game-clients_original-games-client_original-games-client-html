/** @format */

module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testMatch: ["**/__tests__/**/*.test.{js,jsx,ts,tsx}"],
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts",
        "!src/**/*.stories.{js,jsx,ts,tsx}",
        "!src/**/index.{js,jsx,ts,tsx}",
        "!src/**/types/**/*.{js,jsx,ts,tsx}",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    // coverageThreshold: {
    //     global: {
    //         branches: 70,
    //         functions: 70,
    //         lines: 70,
    //         statements: 70,
    //     },
    // },
    preset: "ts-jest",
    transform: {
        "^.+\\.(ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: {
                    jsx: "react-jsx",
                },
            },
        ],
        "^.+\\.(js|jsx)$": "babel-jest",
    },
    moduleNameMapper: {
        "\\.(css|scss|sass)$": "identity-obj-proxy",
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@shared$": "<rootDir>/../shared/src/index",
        "^@shared/(.*)$": "<rootDir>/../shared/src/$1",
        "^@plinko/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    transformIgnorePatterns: ["node_modules/(?!(matter-js|@testing-library)/)"],
    testTimeout: 10000,
    verbose: false, // Reduce noise, only show test results
};
