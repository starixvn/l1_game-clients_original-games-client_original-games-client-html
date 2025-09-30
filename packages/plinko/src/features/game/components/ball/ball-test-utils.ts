import { logger } from '../../../../services/logger';
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
    logger.info('🔧 [BALL_TEST_UTILS] Generating test spawn details', {
        rows: config.rows,
        multipliersCount: config.multipliers.length,
        betAmount: config.betAmount
    });

    // Calculate expected ball size
    const ballRadius = calculateBallSize(config.rows);
    const ballDiameter = ballRadius * 2;

    // Use the user-specified collision path
    const testPath = [...USER_SPECIFIED_COLLISION_PATH];
    const finalSlot = 4; // Center multiplier slot
    const multiplier = 2; // 2x multiplier
    const betValue = config.betAmount;

    logger.debug('🔧 [BALL_TEST_UTILS] Ball size calculations completed', {
        ballRadius,
        ballDiameter,
        rows: config.rows
    });

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

    logger.info('✅ [BALL_TEST_UTILS] Test spawn details generated', {
        details,
        collisionCount: details.expectedCollisions,
        totalSteps: details.pathLength
    });

    return details;
}

/**
 * Executes a test ball spawn with the user-specified collision pattern
 */
export function executeTestBallSpawn(
    ballLayoutRef: any,
    config: TestSpawnConfig
): boolean {
    logger.info('🎯 [BALL_TEST_UTILS] Executing test ball spawn', {
        hasBallLayoutRef: !!ballLayoutRef,
        hasSpawnBallWithPath: !!ballLayoutRef?.spawnBallWithPath,
        config
    });

    if (!ballLayoutRef) {
        logger.error('❌ [BALL_TEST_UTILS] ballLayoutRef is null - Cannot spawn ball');
        return false;
    }

    if (!ballLayoutRef.spawnBallWithPath) {
        logger.error('❌ [BALL_TEST_UTILS] spawnBallWithPath method not available');
        return false;
    }

    // Generate test details
    const details = generateTestSpawnDetails(config);

    // Log board layout information for debugging alignment
    logger.debug('📐 [BALL_TEST_UTILS] Board layout analysis', {
        canvasWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown',
        canvasHeight: typeof window !== 'undefined' ? window.innerHeight : 'unknown',
        expectedBoardCenter: 'Canvas center horizontally',
        expectedSpawnY: '30px from top',
        triangularArea: 'Defined by pin positions and ball clipping',
        physicsBodies: 'Pins at calculated positions, ball with gravity'
    });

    // Execute the spawn
    try {
        logger.info('🚀 [BALL_TEST_UTILS] Calling spawnBallWithPath', {
            betValue: details.betValue,
            path: details.testPath,
            finalSlot: details.finalSlot,
            multiplier: details.expectedMultiplier
        });

        ballLayoutRef.spawnBallWithPath(
            details.betValue,
            details.testPath,
            details.finalSlot,
            details.expectedMultiplier
        );

        logger.info('✅ [BALL_TEST_UTILS] Test ball spawn completed successfully');
        return true;
    } catch (error) {
        logger.error('❌ [BALL_TEST_UTILS] Error during test ball spawn', { error });
        return false;
    }
}

/**
 * Comprehensive test function that handles both logging and execution
 */
export function performDirectSpawnTest(ballLayoutRef: any, config: TestSpawnConfig) {
    logger.info('🎯 [BALL_TEST_UTILS] DIRECT SPAWN TEST initiated');

    // Log game configuration
    logger.debug('📊 [BALL_TEST_UTILS] Game Configuration:', {
        rows: config.rows,
        betAmount: config.betAmount,
        multipliers: config.multipliers,
        payoutProbabilities: config.payoutProbabilities
    });

    // Check ball layout reference
    const refStatus = {
        exists: !!ballLayoutRef,
        hasSpawnBallWithPath: !!ballLayoutRef?.spawnBallWithPath
    };

    logger.info('🔍 [BALL_TEST_UTILS] Ball layout reference check:', refStatus);

    if (refStatus.exists && refStatus.hasSpawnBallWithPath) {
        logger.info('✅ [BALL_TEST_UTILS] ballLayoutRef exists, proceeding with spawn');

        const success = executeTestBallSpawn(ballLayoutRef, config);

        if (success) {
            logger.info('✅ [BALL_TEST_UTILS] Direct spawn test completed successfully');
        } else {
            logger.error('❌ [BALL_TEST_UTILS] Direct spawn test failed');
        }

        return success;
    } else {
        logger.error('❌ [BALL_TEST_UTILS] ballLayoutRef not ready - Cannot spawn ball', refStatus);
        return false;
    }
}
