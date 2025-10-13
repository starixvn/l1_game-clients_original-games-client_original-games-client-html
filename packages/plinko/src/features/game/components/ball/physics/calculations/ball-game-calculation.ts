/**
 * Ball Game Calculation System
 * Pre-calculates complete ball trajectory, physics, and outcomes before ball starts falling
 */

import { PhysicsFactors } from '../factors/core-factors';
import { calculateBallSize } from '../ball/ball-scaling';

// Re-export types and main functions
export type {
    BallGameCalculation,
    ServiceResult,
    BoardConfiguration,
    BallTrajectory,
    CollisionEvent,
    EnvironmentalFactors,
    BallProperties,
    PegConfiguration
} from './types/calculation-types';

export type { PhysicsFactors } from '../factors/core-factors';

export { createDefaultBoardConfig } from './utils/calculation-utils';
export { DEFAULT_CALCULATION_FACTORS } from './config/calculation-config';

// Import types and calculation modules
import {
    ServiceResult,
    BoardConfiguration,
    BallGameCalculation,
    EnvironmentalFactors,
    BallProperties
} from './types/calculation-types';
import { calculateCompleteTrajectory } from './trajectory-calculator';
import { analyzeTrajectoryCollisions, calculateCollisionStats } from './collision-analyzer';
import { analyzePathAlternatives, calculatePathConfidence } from './path-analyzer';
import { generatePegConfiguration } from './peg-configuration';
import {
    calculateStabilityMetrics,
    calculateMemoryUsage
} from './utils/calculation-utils';
import { DEFAULT_CALCULATION_FACTORS } from './config/calculation-config';


/**
 * Calculate complete ball game trajectory and physics
 */
export function calculateBallGame(
    serviceResult: ServiceResult,
    boardConfig: BoardConfiguration,
    physicsFactors: PhysicsFactors = DEFAULT_CALCULATION_FACTORS
): BallGameCalculation {
    const startTime = performance.now();

    // Create calculation ID
    const id = `calc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`; // NOSONAR

    // Initialize environmental factors
    const environmentalFactors: EnvironmentalFactors = {
        gravity: physicsFactors.gravity,
        airDensity: 1.225, // Standard air density at sea level
        temperature: 20, // Celsius
        humidity: 50, // Percentage
        wind: { speed: 0, direction: 0 } // No wind
    };

    // Calculate dynamic ball size based on rows (like the original system)
    const dynamicBallDiameter = calculateBallSize(boardConfig.rows, 1); // canvasScaleFactor = 1 for calculation
    const ballRadius = dynamicBallDiameter;

    // Initialize ball properties with dynamic sizing
    const ballProperties: BallProperties = {
        mass: physicsFactors.ballMass,
        radius: ballRadius,
        density: physicsFactors.ballMass / (Math.PI * Math.pow(ballRadius, 2)),
        surfaceRoughness: 0.8,
        color: physicsFactors.ballMass > 0 ? "#FFD700" : "#FF6B6B"
    };

    // Update physics factors to use the dynamic ball size
    const adjustedPhysicsFactors: PhysicsFactors = {
        ...physicsFactors,
        ballSize: dynamicBallDiameter * 2 // Convert radius back to diameter for consistency
    };

    // Generate peg configuration
    const pegConfiguration = generatePegConfiguration(boardConfig);

    // Calculate complete trajectory with adjusted physics factors
    const trajectory = calculateCompleteTrajectory(
        serviceResult,
        pegConfiguration,
        boardConfig,
        adjustedPhysicsFactors,
        environmentalFactors,
        ballProperties
    );

    // Analyze collisions
    const collisions = analyzeTrajectoryCollisions(trajectory);

    // Calculate collision statistics
    const collisionStats = calculateCollisionStats(collisions, adjustedPhysicsFactors);

    // Calculate path confidence and alternatives
    const pathAnalysis = analyzePathAlternatives(serviceResult, boardConfig, adjustedPhysicsFactors);

    // Calculate physics stability metrics
    const stabilityMetrics = calculateStabilityMetrics(adjustedPhysicsFactors);

    // Calculate performance metrics
    const calculationTime = performance.now() - startTime;

    // Create final calculation object
    const calculation: BallGameCalculation = {
        id,
        roundId: serviceResult.roundId,
        createdAt: Date.now(),
        serviceResult,
        physicsFactors: adjustedPhysicsFactors, // Use adjusted physics factors with dynamic ball size
        environmentalFactors,
        ballProperties,
        pegConfiguration,
        boardConfiguration: boardConfig,
        trajectory,
        collisions,
        collisionStats,
        pathDecisions: serviceResult.path,
        pathConfidence: calculatePathConfidence(serviceResult.path, adjustedPhysicsFactors),
        alternativePaths: pathAnalysis.alternatives,
        expectedFinalSlot: serviceResult.finalSlot,
        predictedLandingPosition: trajectory.finalPosition,
        predictionConfidence: pathAnalysis.confidence,
        winAmount: serviceResult.betValue * serviceResult.multiplier,
        stabilityMetrics,
        performance: {
            calculationTime,
            memoryUsage: calculateMemoryUsage(trajectory, collisions),
            predictionAccuracy: pathAnalysis.confidence
        }
    };

    return calculation;
}
