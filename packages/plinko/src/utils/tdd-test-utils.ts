// TDD Test Utilities for Plinko Game
// These utilities are used by the TDD test group component for running local test scenarios

/**
 * Creates test service data for simulating ball paths and outcomes
 */
export const createTestServiceData = (path: number[], finalSlot: number, multiplier: number, betValue: number) => ({
    path,
    finalSlot,
    multiplier,
    betValue
});

/**
 * Generates predefined test paths for TDD testing scenarios
 */
export const generateTestPaths = () => ({
    leftPath: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // All left turns
    rightPath: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // All right turns
    centerPath: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // Alternating
    randomPath: [0, 1, 0, 0, 1, 1, 0, 1, 0, 1], // Random pattern
    zigzagPath: [0, 1, 1, 0, 0, 1, 1, 0, 0, 1], // Zigzag pattern
    earlyRight: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Early right turn
    lateLeft: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // Late left turn
    alternating3: [0, 1, 0, 0, 1, 0, 1, 0, 1, 0], // Alternating with pattern break
    leftHeavy: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // Mostly left with some right
    rightHeavy: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1] // Mostly right with some left
});

/**
 * Generates comprehensive TDD test scenarios based on all __tests__ directory test cases
 */
export const generateComprehensiveTddTestCases = () => {
    const paths = generateTestPaths();

    return [
        // Basic Path Tests (from physics-engine.test.ts scenarios)
        {
            id: "left-path-basic",
            name: "Left Path - Physics Engine",
            description: "Tests ball following left path (all left turns) - Basic physics validation",
            category: "Physics Engine",
            data: createTestServiceData(paths.leftPath, 0, 0.5, 100)
        },
        {
            id: "right-path-basic",
            name: "Right Path - Physics Engine",
            description: "Tests ball following right path (all right turns) - Basic physics validation",
            category: "Physics Engine",
            data: createTestServiceData(paths.rightPath, 8, 20, 100)
        },
        {
            id: "center-path-basic",
            name: "Center Path - Physics Engine",
            description: "Tests ball following center path (alternating) - Basic physics validation",
            category: "Physics Engine",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },

        // Collision Handler Tests (from collision-handlers.test.ts)
        {
            id: "collision-single-peg",
            name: "Single Peg Collision",
            description: "Tests collision with single peg - validates collision detection",
            category: "Collision Handlers",
            data: createTestServiceData([0], 0, 1, 50)
        },
        {
            id: "collision-multi-peg",
            name: "Multi-Peg Collision Chain",
            description: "Tests collision chain through multiple pegs - validates physics continuity",
            category: "Collision Handlers",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },

        // Service-Guided Tests (from service-guided-*.test.ts files)
        {
            id: "service-guided-left",
            name: "Service Guided - Left Path",
            description: "Tests service-guided ball following predetermined left path",
            category: "Service Guided",
            data: createTestServiceData(paths.leftPath, 0, 0.5, 200)
        },
        {
            id: "service-guided-right",
            name: "Service Guided - Right Path",
            description: "Tests service-guided ball following predetermined right path",
            category: "Service Guided",
            data: createTestServiceData(paths.rightPath, 8, 20, 200)
        },
        {
            id: "service-guided-zigzag",
            name: "Service Guided - Zigzag Path",
            description: "Tests service-guided ball following complex zigzag pattern",
            category: "Service Guided",
            data: createTestServiceData(paths.zigzagPath, 5, 3, 150)
        },

        // Ball Path Correction Tests (from ball-path-correction.test.ts)
        {
            id: "path-correction-early-right",
            name: "Path Correction - Early Right Turn",
            description: "Tests ball path correction when taking early right turn",
            category: "Path Correction",
            data: createTestServiceData(paths.earlyRight, 1, 1.2, 100)
        },
        {
            id: "path-correction-late-left",
            name: "Path Correction - Late Left Turn",
            description: "Tests ball path correction when taking late left turn",
            category: "Path Correction",
            data: createTestServiceData(paths.lateLeft, 0, 0.5, 100)
        },

        // Ball Calculations Tests (from ball-calculations.test.ts)
        {
            id: "ball-calc-small-bet",
            name: "Ball Calculations - Small Bet",
            description: "Tests ball physics calculations with small bet amount",
            category: "Ball Calculations",
            data: createTestServiceData(paths.centerPath, 4, 2, 10)
        },
        {
            id: "ball-calc-large-bet",
            name: "Ball Calculations - Large Bet",
            description: "Tests ball physics calculations with large bet amount",
            category: "Ball Calculations",
            data: createTestServiceData(paths.centerPath, 4, 2, 1000)
        },

        // Drop Positions Tests (from drop-positions.test.ts)
        {
            id: "drop-position-center",
            name: "Drop Position - Center",
            description: "Tests ball drop from center position",
            category: "Drop Positions",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "drop-position-offset",
            name: "Drop Position - Offset",
            description: "Tests ball drop from offset position",
            category: "Drop Positions",
            data: createTestServiceData(paths.leftHeavy, 2, 1.5, 100)
        },

        // Visual Effects Tests (from visual-effects.test.ts)
        {
            id: "visual-effects-basic",
            name: "Visual Effects - Basic Animation",
            description: "Tests basic ball visual effects and animations",
            category: "Visual Effects",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "visual-effects-high-multiplier",
            name: "Visual Effects - High Multiplier",
            description: "Tests visual effects with high multiplier outcome",
            category: "Visual Effects",
            data: createTestServiceData(paths.rightPath, 8, 20, 500)
        },

        // Physics Config Tests (from physics-config.test.ts)
        {
            id: "physics-config-gravity",
            name: "Physics Config - Gravity Test",
            description: "Tests physics configuration with standard gravity",
            category: "Physics Config",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "physics-config-bounce",
            name: "Physics Config - Bounce Test",
            description: "Tests physics configuration bounce parameters",
            category: "Physics Config",
            data: createTestServiceData(paths.alternating3, 3, 1.5, 100)
        },

        // Hooks Tests (from hooks.test.ts)
        {
            id: "hooks-state-management",
            name: "Hooks - State Management",
            description: "Tests React hooks state management during ball physics",
            category: "Hooks",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },

        // Integration Tests (from integration.test.tsx)
        {
            id: "integration-full-cycle",
            name: "Integration - Full Cycle",
            description: "Tests complete ball lifecycle from spawn to landing",
            category: "Integration",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "integration-edge-cases",
            name: "Integration - Edge Cases",
            description: "Tests integration with edge case scenarios",
            category: "Integration",
            data: createTestServiceData(paths.randomPath, 3, 1.5, 50)
        },

        // Utils Tests (from utils.test.ts)
        {
            id: "utils-number-formatting",
            name: "Utils - Number Formatting",
            description: "Tests utility functions for number formatting during gameplay",
            category: "Utils",
            data: createTestServiceData(paths.centerPath, 4, 2, 123.45)
        },
        {
            id: "utils-color-utilities",
            name: "Utils - Color Utilities",
            description: "Tests color utility functions for visual elements",
            category: "Utils",
            data: createTestServiceData(paths.leftHeavy, 2, 1.5, 100)
        },

        // Performance Tests
        {
            id: "performance-high-frequency",
            name: "Performance - High Frequency",
            description: "Tests performance with rapid ball spawning",
            category: "Performance",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },

        // Error Handling Tests
        {
            id: "error-boundary-test",
            name: "Error Boundary - Recovery",
            description: "Tests error boundary recovery mechanisms",
            category: "Error Handling",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },

        // Special Cases
        {
            id: "boundary-leftmost",
            name: "Boundary - Leftmost Slot",
            description: "Tests ball landing in leftmost boundary slot",
            category: "Boundary Tests",
            data: createTestServiceData(paths.leftPath, 0, 0.5, 100)
        },
        {
            id: "boundary-rightmost",
            name: "Boundary - Rightmost Slot",
            description: "Tests ball landing in rightmost boundary slot",
            category: "Boundary Tests",
            data: createTestServiceData(paths.rightPath, 8, 20, 100)
        },
        {
            id: "high-stakes-test",
            name: "High Stakes - Maximum Bet",
            description: "Tests high-stakes scenario with maximum bet amount",
            category: "High Stakes",
            data: createTestServiceData(paths.centerPath, 4, 2, 10000)
        },

        // Service Integration Tests (from plinko-service/)
        {
            id: "service-bet-placement",
            name: "Service - Bet Placement",
            description: "Tests full bet placement flow through service consumer",
            category: "Service Integration",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "service-bet-validation",
            name: "Service - Bet Validation",
            description: "Tests bet amount and parameter validation in service",
            category: "Service Integration",
            data: createTestServiceData(paths.centerPath, 4, 2, 50)
        },
        {
            id: "service-min-bet-validation",
            name: "Service - Min Bet Validation",
            description: "Tests minimum bet amount validation ($1)",
            category: "Service Integration",
            data: createTestServiceData(paths.leftPath, 0, 0.5, 1)
        },
        {
            id: "service-max-bet-validation",
            name: "Service - Max Bet Validation",
            description: "Tests maximum bet amount validation ($10,000)",
            category: "Service Integration",
            data: createTestServiceData(paths.rightPath, 8, 20, 10000)
        },
        {
            id: "service-game-mode-low",
            name: "Service - Game Mode LOW",
            description: "Tests LOW risk game mode (0) through service",
            category: "Service Integration",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "service-game-mode-medium",
            name: "Service - Game Mode MEDIUM",
            description: "Tests MEDIUM risk game mode (1) through service",
            category: "Service Integration",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "service-game-mode-high",
            name: "Service - Game Mode HIGH",
            description: "Tests HIGH risk game mode (2) through service",
            category: "Service Integration",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "service-rows-minimum",
            name: "Service - Minimum Rows (8)",
            description: "Tests minimum row count (8) validation",
            category: "Service Integration",
            data: createTestServiceData([0, 1, 0, 1, 0, 1, 0, 1], 4, 2, 100)
        },
        {
            id: "service-rows-maximum",
            name: "Service - Maximum Rows (16)",
            description: "Tests maximum row count (16) validation",
            category: "Service Integration",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },

        // Provably Fair Tests (from round-result-consumer.ts)
        {
            id: "provably-fair-seed-generation",
            name: "Provably Fair - Seed Generation",
            description: "Tests client/server seed combination and hash generation",
            category: "Provably Fair",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "provably-fair-result-calculation",
            name: "Provably Fair - Result Calculation",
            description: "Tests deterministic result generation from seeds",
            category: "Provably Fair",
            data: createTestServiceData(paths.leftHeavy, 2, 1.5, 100)
        },
        {
            id: "provably-fair-hash-validation",
            name: "Provably Fair - Hash Validation",
            description: "Tests SHA256/SHA512 hash validation for provably fair",
            category: "Provably Fair",
            data: createTestServiceData(paths.rightHeavy, 7, 15, 500)
        },

        // Settlement Tests (from settle-game-round-consumer.ts)
        {
            id: "settlement-slot-calculation",
            name: "Settlement - Slot Calculation",
            description: "Tests slot index calculation from random result array",
            category: "Settlement",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "settlement-multiplier-lookup",
            name: "Settlement - Multiplier Lookup",
            description: "Tests multiplier lookup from odds configuration",
            category: "Settlement",
            data: createTestServiceData(paths.rightPath, 8, 20, 100)
        },
        {
            id: "settlement-max-win-limit",
            name: "Settlement - Max Win Limit",
            description: "Tests maximum win per round limitation",
            category: "Settlement",
            data: createTestServiceData(paths.rightPath, 8, 20, 10000)
        },

        // Queue Processing Tests (from process-bet-queue.ts)
        {
            id: "queue-processing-automated",
            name: "Queue Processing - Automated Settlement",
            description: "Tests automated bet queue processing and settlement",
            category: "Queue Processing",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "queue-processing-round-id",
            name: "Queue Processing - Round ID Generation",
            description: "Tests sequential round ID generation in queue processing",
            category: "Queue Processing",
            data: createTestServiceData(paths.alternating3, 3, 1.5, 100)
        },

        // Consumer Tests
        {
            id: "consumer-place-bet-validation",
            name: "Consumer - Place Bet Validation",
            description: "Tests place bet consumer parameter validation",
            category: "Consumers",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "consumer-round-result-generation",
            name: "Consumer - Round Result Generation",
            description: "Tests round result consumer deterministic generation",
            category: "Consumers",
            data: createTestServiceData(paths.leftPath, 0, 0.5, 100)
        },
        {
            id: "consumer-settlement-calculation",
            name: "Consumer - Settlement Calculation",
            description: "Tests settlement consumer win/loss calculations",
            category: "Consumers",
            data: createTestServiceData(paths.rightPath, 8, 20, 1000)
        },

        // Error Handling Tests
        {
            id: "error-invalid-game-mode",
            name: "Error - Invalid Game Mode",
            description: "Tests error handling for invalid game mode values",
            category: "Error Handling",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "error-invalid-row-count",
            name: "Error - Invalid Row Count",
            description: "Tests error handling for invalid number of rows",
            category: "Error Handling",
            data: createTestServiceData([0], 0, 1, 100)
        },
        {
            id: "error-bet-amount-out-of-range",
            name: "Error - Bet Amount Out of Range",
            description: "Tests error handling for bet amounts outside min/max range",
            category: "Error Handling",
            data: createTestServiceData(paths.centerPath, 4, 2, 100000)
        },
        {
            id: "error-duplicate-bet",
            name: "Error - Duplicate Bet Prevention",
            description: "Tests prevention of duplicate bets during processing",
            category: "Error Handling",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },

        // Cron Job Tests
        {
            id: "cron-bet-queue-processing",
            name: "Cron - Bet Queue Processing",
            description: "Tests automated cron job for bet queue processing",
            category: "Cron Jobs",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "cron-bot-automation",
            name: "Cron - Bot Automation",
            description: "Tests automated bot betting through cron jobs",
            category: "Cron Jobs",
            data: createTestServiceData(paths.randomPath, 3, 1.5, 50)
        },

        // Socket Router Tests
        {
            id: "socket-router-history-query",
            name: "Socket Router - History Query",
            description: "Tests socket router history query functionality",
            category: "Socket Router",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },

        // Database/Model Tests
        {
            id: "database-round-creation",
            name: "Database - Round Creation",
            description: "Tests database round document creation and storage",
            category: "Database/Models",
            data: createTestServiceData(paths.centerPath, 4, 2, 100)
        },
        {
            id: "database-result-storage",
            name: "Database - Result Storage",
            description: "Tests provably fair result document storage",
            category: "Database/Models",
            data: createTestServiceData(paths.leftPath, 0, 0.5, 100)
        },

        // Run All Tests option
        {
            id: "run-all-tests",
            name: "Run All Tests",
            description: "Runs all TDD test cases sequentially from __tests__ and plinko-service directories",
            category: "Test Suite",
            data: null // Special marker for running all tests
        }
    ];
};
