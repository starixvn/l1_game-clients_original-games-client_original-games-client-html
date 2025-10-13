/**
 * Service Integration for Ball Game Calculations
 * Utilities to parse service results and create comprehensive ball calculations
 */

import {
    calculateBallGame,
    createDefaultBoardConfig,
    DEFAULT_CALCULATION_FACTORS,
    BallGameCalculation,
    ServiceResult,
    BoardConfiguration,
    PhysicsFactors
} from './ball-game-calculation';

/**
 * Parse service response and extract ball game data
 */
export interface ParsedServiceResponse {
    serviceResult: ServiceResult;
    gameMode: number;
    numberOfRows: number;
    physicsFactors?: Partial<PhysicsFactors>;
}

/**
 * Parse raw service response into structured data
 */
export function parseServiceResponse(serviceData: any): ParsedServiceResponse {
    // Extract path from service data (assuming it's in binary format or array)
    let path: number[] = [];
    if (Array.isArray(serviceData.path)) {
        path = serviceData.path;
    } else if (typeof serviceData.path === 'string') {
        // Convert binary string to path array
        path = serviceData.path.split('').map((bit: string) => parseInt(bit));
    } else if (serviceData.randomResult !== undefined) {
        // Generate path from random result (provably fair)
        path = generatePathFromRandomResult(serviceData.randomResult, serviceData.numberOfRows || 8);
    }

    const serviceResult: ServiceResult = {
        path,
        finalSlot: serviceData.finalSlot || calculateFinalSlotFromPath(path),
        multiplier: serviceData.multiplier || 1,
        betValue: serviceData.betValue || 100,
        serverSeed: serviceData.serverSeed || '',
        clientSeed: serviceData.clientSeed || '',
        roundId: serviceData.roundId || `round_${Date.now()}`
    };

    return {
        serviceResult,
        gameMode: serviceData.gameMode || 0,
        numberOfRows: serviceData.numberOfRows || 8,
        physicsFactors: extractPhysicsFactors(serviceData)
    };
}

/**
 * Generate path from provably fair random result
 */
function generatePathFromRandomResult(randomResult: number, numberOfRows: number): number[] {
    const path: number[] = [];

    // Use random result to generate deterministic path
    let currentValue = randomResult;

    for (let i = 0; i < numberOfRows; i++) {
        // Simple LCG-like progression for deterministic path generation
        currentValue = (currentValue * 1103515245 + 12345) % 2147483648;
        const decision = (currentValue % 2); // 0 or 1
        path.push(decision);
    }

    return path;
}

/**
 * Calculate final slot from path decisions
 */
function calculateFinalSlotFromPath(path: number[]): number {
    let position = 4; // Start in middle (for 9 slots: 0-8)

    for (const decision of path) {
        if (decision === 1) {
            position = Math.min(8, position + 1); // Move right
        } else {
            position = Math.max(0, position - 1); // Move left
        }
    }

    return position;
}

/**
 * Extract physics factors from service data
 */
function extractPhysicsFactors(serviceData: any): Partial<PhysicsFactors> | undefined {
    if (!serviceData.physicsFactors) {
        return undefined;
    }

    return {
        gravity: serviceData.physicsFactors.gravity,
        airResistanceCoefficient: serviceData.physicsFactors.airResistance,
        ballMass: serviceData.physicsFactors.ballMass,
        restitution: serviceData.physicsFactors.restitution,
        friction: serviceData.physicsFactors.friction,
        nudgeStrength: serviceData.physicsFactors.nudgeStrength,
        velocityX: serviceData.physicsFactors.velocityX,
        velocityY: serviceData.physicsFactors.velocityY
    };
}

/**
 * Create ball game calculation from service response
 */
export function createCalculationFromServiceResponse(
    serviceData: any,
    customBoardConfig?: BoardConfiguration,
    customPhysicsFactors?: Partial<PhysicsFactors>
): BallGameCalculation {
    const parsed = parseServiceResponse(serviceData);

    // Create or use custom board configuration
    const boardConfig = customBoardConfig || createDefaultBoardConfig(9, parsed.numberOfRows);

    // Merge physics factors
    const physicsFactors: PhysicsFactors = {
        ...DEFAULT_CALCULATION_FACTORS,
        ...(parsed.physicsFactors || {}),
        ...(customPhysicsFactors || {})
    };

    // Adjust physics factors based on game mode and row count
    const adjustedFactors = adjustPhysicsForGameMode(physicsFactors, parsed.gameMode, parsed.numberOfRows);

    // Create the comprehensive calculation
    return calculateBallGame(parsed.serviceResult, boardConfig, adjustedFactors);
}

/**
 * Adjust physics factors based on game mode and row count
 */
function adjustPhysicsForGameMode(
    baseFactors: PhysicsFactors,
    gameMode: number,
    numberOfRows: number
): PhysicsFactors {
    const factors = { ...baseFactors };

    // Adjust based on game mode (0=low, 1=medium, 2=high risk)
    switch (gameMode) {
        case 0: // Low risk - more predictable
            factors.randomFactor = Math.max(0.05, factors.randomFactor * 0.7);
            factors.airResistanceCoefficient *= 0.8;
            break;
        case 1: // Medium risk - balanced
            // Keep default values
            break;
        case 2: // High risk - more chaotic
            factors.randomFactor = Math.min(0.2, factors.randomFactor * 1.3);
            factors.airResistanceCoefficient *= 1.2;
            factors.nudgeStrength *= 1.1;
            break;
    }

    // Adjust based on row count for scalability
    const rowRatio = numberOfRows / 8; // Base is 8 rows

    factors.ballMass *= rowRatio;
    factors.gravity *= rowRatio;
    factors.velocityY *= rowRatio;
    factors.nudgeStrength *= rowRatio;

    // Ensure values stay within bounds
    factors.ballMass = Math.max(0.0005, Math.min(0.05, factors.ballMass));
    factors.gravity = Math.max(0.5, Math.min(2.0, factors.gravity));
    factors.velocityY = Math.max(0.5, Math.min(5.0, factors.velocityY));
    factors.nudgeStrength = Math.max(1.0, Math.min(5.0, factors.nudgeStrength));

    return factors;
}

/**
 * Create calculation from log file data (for debugging/testing)
 */
export function createCalculationFromLogData(
    logData: string,
    boardConfig?: BoardConfiguration,
    physicsFactors?: Partial<PhysicsFactors>
): BallGameCalculation | null {
    try {
        // Parse log data to extract service result
        const serviceData = parseLogData(logData);
        if (!serviceData) {
            return null;
        }

        return createCalculationFromServiceResponse(serviceData, boardConfig, physicsFactors);
    } catch (error) {
        console.error('Failed to create calculation from log data:', error);
        return null;
    }
}

/**
 * Parse log data to extract service result information
 */
function parseLogData(logData: string): any | null {
    // Look for service result patterns in log
    const pathMatch = logData.match(/path[^\d]*(\[[^\]]*\]|\d+(?:\.\d+)*(?:,\s*\d+(?:\.\d+)*)*)/i);
    const slotMatch = logData.match(/finalSlot[^\d]*(\d+)/i);
    const multiplierMatch = logData.match(/multiplier[^\d]*([\d.]+)/i);
    const betMatch = logData.match(/betValue[^\d]*(\d+)/i);

    if (!pathMatch || !slotMatch) {
        return null;
    }

    // Parse path array
    let path: number[] = [];
    try {
        const pathStr = pathMatch[1];
        if (pathStr.startsWith('[')) {
            path = JSON.parse(pathStr);
        } else {
            path = pathStr.split(',').map(s => parseInt(s.trim()));
        }
    } catch {
        // Generate path from slot if parsing fails
        const finalSlot = parseInt(slotMatch[1]);
        path = generatePathForSlot(finalSlot, 8);
    }

    return {
        path,
        finalSlot: parseInt(slotMatch[1]),
        multiplier: multiplierMatch ? parseFloat(multiplierMatch[1]) : 1,
        betValue: betMatch ? parseInt(betMatch[1]) : 100,
        serverSeed: 'from_log',
        clientSeed: 'from_log',
        roundId: `log_${Date.now()}`,
        gameMode: 0,
        numberOfRows: 8
    };
}

/**
 * Generate a plausible path that leads to a specific slot
 */
function generatePathForSlot(targetSlot: number, pathLength: number): number[] {
    const path: number[] = [];
    let position = 4; // Start in middle

    for (let i = 0; i < pathLength; i++) {
        if (position < targetSlot) {
            path.push(1); // Move right
            position++;
        } else if (position > targetSlot) {
            path.push(0); // Move left
            position--;
        } else {
            // At target, make random but biased movements
            const decision = Math.random() > 0.6 ? 1 : 0; // NOSONAR
            path.push(decision);
            position += decision === 1 ? 1 : -1;
        }

        // Keep within bounds
        position = Math.max(0, Math.min(8, position));
    }

    return path;
}

/**
 * Validate calculation object for consistency
 */
export function validateCalculation(calculation: BallGameCalculation): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!calculation.id || !calculation.roundId) {
        errors.push('Missing calculation ID or round ID');
    }

    // Service result validation
    if (!calculation.serviceResult.path || calculation.serviceResult.path.length === 0) {
        errors.push('Invalid or empty service path');
    }

    if (calculation.serviceResult.finalSlot < 0 || calculation.serviceResult.finalSlot > 8) {
        errors.push('Invalid final slot index');
    }

    // Trajectory validation
    if (!calculation.trajectory.positions || calculation.trajectory.positions.length === 0) {
        errors.push('No trajectory positions calculated');
    }

    // Physics validation
    if (calculation.physicsFactors.gravity <= 0) {
        errors.push('Invalid gravity value');
    }

    if (calculation.physicsFactors.ballMass <= 0) {
        errors.push('Invalid ball mass');
    }

    // Prediction confidence validation
    if (calculation.predictionConfidence < 0 || calculation.predictionConfidence > 1) {
        warnings.push('Prediction confidence outside expected range [0,1]');
    }

    // Path confidence validation
    calculation.pathConfidence.forEach((confidence, index) => {
        if (confidence < 0 || confidence > 1) {
            warnings.push(`Path confidence at step ${index} outside expected range [0,1]`);
        }
    });

    // Performance validation
    if (calculation.performance.calculationTime > 1000) {
        warnings.push('Calculation took unusually long (>1s)');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Export calculation data for debugging or logging
 */
export function exportCalculationData(calculation: BallGameCalculation): string {
    const summary = {
        id: calculation.id,
        roundId: calculation.roundId,
        path: calculation.serviceResult.path.join(''),
        finalSlot: calculation.expectedFinalSlot,
        multiplier: calculation.serviceResult.multiplier,
        winAmount: calculation.winAmount,
        predictionConfidence: calculation.predictionConfidence.toFixed(3),
        totalCollisions: calculation.collisionStats.totalCollisions,
        totalTime: calculation.trajectory.totalTime.toFixed(2),
        totalDistance: calculation.trajectory.totalDistance.toFixed(2),
        calculationTime: calculation.performance.calculationTime.toFixed(2),
        memoryUsage: `${(calculation.performance.memoryUsage / 1024).toFixed(1)}KB`,
        physicsStability: {
            terminalVelocityRatio: calculation.stabilityMetrics.terminalVelocityRatio.toFixed(3),
            bounceStability: calculation.stabilityMetrics.bounceStability.toFixed(3),
            controlResponsiveness: calculation.stabilityMetrics.controlResponsiveness.toFixed(3)
        }
    };

    return JSON.stringify(summary, null, 2);
}
