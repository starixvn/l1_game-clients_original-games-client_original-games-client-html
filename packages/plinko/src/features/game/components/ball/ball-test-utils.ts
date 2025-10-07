import { calculateBallSize } from '../../../../lib/physics/ball-calculations';

/**
 * Ball Test Utilities
 *
 * Contains test functions for ball spawning and collision testing
 * Used by the DIRECT SPAWN button to test specific collision patterns
 */

/**
 * Test collision pattern provided by user: [0, 1, 0, 0, 0, 1, 1, 1, 1]
 * This represents 8 collision opportunities for 9 rows of pins
 */
export const USER_SPECIFIED_COLLISION_PATH = [0, 1, 0, 0, 0, 1, 1, 1, 1];

/**
 * Configuration for the test spawn
 */
export interface TestSpawnConfig {
    rows: number;
    multipliers: number[];
    payoutProbabilities: number[];
    betAmount: number;
}

/**
 * Test spawn details returned for logging
 */
export interface TestSpawnDetails {
    ballRadius: number;
    ballDiameter: number;
    testPath: number[];
    pathLength: number;
    finalSlot: number;
    expectedMultiplier: number;
    betValue: number;
    expectedCollisions: number;
    expectedPath: string;
    pathDescription: string;
}

/**
 * Generates test spawn details for logging and debugging
 */
export function generateTestSpawnDetails(config: TestSpawnConfig): TestSpawnDetails {
    // Calculate expected ball size
    const ballRadius = calculateBallSize(config.rows);
    const ballDiameter = ballRadius * 2;

    // Use the user-specified collision path
    const testPath = [...USER_SPECIFIED_COLLISION_PATH];
    const finalSlot = 4; // Center multiplier slot
    const multiplier = 2; // 2x multiplier
    const betValue = config.betAmount;

    const details: TestSpawnDetails = {
        ballRadius,
        ballDiameter,
        testPath,
        pathLength: testPath.length,
        finalSlot,
        expectedMultiplier: multiplier,
        betValue,
        expectedCollisions: testPath.length, // Now expecting collisions for each step in the narrowed peg layout
        expectedPath: testPath.join(''),
        pathDescription: `User-specified collision pattern: ${testPath.join('-')}`
    };

    return details;
}

/**
 * Executes a test ball spawn with the user-specified collision pattern
 */
export function executeTestBallSpawn(
    ballLayoutRef: any,
    config: TestSpawnConfig
): boolean {
    if (!ballLayoutRef) {
        return false;
    }

    if (!ballLayoutRef.spawnBallWithPath) {
        return false;
    }

    // Generate test details
    const details = generateTestSpawnDetails(config);

    // Execute the spawn
    try {
        ballLayoutRef.spawnBallWithPath(
            details.betValue,
            details.testPath,
            details.finalSlot,
            details.expectedMultiplier
        );

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Comprehensive test function that handles both logging and execution
 */
export function performDirectSpawnTest(ballLayoutRef: any, config: TestSpawnConfig) {
    // Check ball layout reference
    const refStatus = {
        exists: !!ballLayoutRef,
        hasSpawnBallWithPath: !!ballLayoutRef?.spawnBallWithPath
    };

    if (refStatus.exists && refStatus.hasSpawnBallWithPath) {
        return executeTestBallSpawn(ballLayoutRef, config);
    } else {
        return false;
    }
}
