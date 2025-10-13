/**
 * Environmental Balancing Module
 * Balances gravity and air resistance for optimal gameplay
 */

import { PhysicsFactors } from '../factors/core-factors';
import { calculateOptimalGravity } from './gravity-system';

/**
 * Environmental balance configuration
 */
type BalancePriority = 'speed' | 'control' | 'predictability' | 'balanced';
export interface EnvironmentalBalanceConfig {
    targetFallTime: number;      // Target time for ball to fall through board
    targetControlTime: number;   // Target time player has to control ball
    targetBounceHeight: number;  // Target maximum bounce height
    balancePriority: BalancePriority;
}

/**
 * Default environmental balance configuration
 */
export const DEFAULT_ENVIRONMENTAL_BALANCE_CONFIG: EnvironmentalBalanceConfig = {
    targetFallTime: 3.0,         // 3 seconds to fall through board
    targetControlTime: 0.5,      // 0.5 seconds control window
    targetBounceHeight: 30,      // 30px maximum bounce
    balancePriority: 'balanced',
};

/**
 * Calculate optimal gravity-air resistance balance
 */
export function calculateOptimalEnvironmentalBalance(
    physicsFactors: PhysicsFactors,
    boardHeight: number,
    config: Partial<EnvironmentalBalanceConfig> = {}
): {
    optimalGravity: number;
    optimalAirResistance: number;
    balanceMetrics: {
        fallTime: number;
        controlTime: number;
        bounceHeight: number;
        predictability: number;
    };
} {
    const fullConfig = { ...DEFAULT_ENVIRONMENTAL_BALANCE_CONFIG, ...config };

    // Calculate optimal gravity first
    const optimalGravity = calculateOptimalGravity(
        physicsFactors.ballMass,
        physicsFactors.airResistanceCoefficient,
        fullConfig.targetFallTime,
        boardHeight
    );

    // Adjust air resistance based on balance priority
    let optimalAirResistance;

    switch (fullConfig.balancePriority) {
        case 'speed':
            // Reduce air resistance for faster gameplay
            optimalAirResistance = physicsFactors.airResistanceCoefficient * 0.7;
            break;
        case 'control':
            // Increase air resistance for more control
            optimalAirResistance = physicsFactors.airResistanceCoefficient * 1.3;
            break;
        case 'predictability':
            // Moderate air resistance for predictable paths
            optimalAirResistance = physicsFactors.airResistanceCoefficient * 1.0;
            break;
        case 'balanced':
        default:
            // Keep air resistance balanced
            optimalAirResistance = physicsFactors.airResistanceCoefficient;
            break;
    }

    // Clamp to reasonable ranges
    optimalAirResistance = Math.max(0.01, Math.min(0.2, optimalAirResistance));

    // Calculate balance metrics with optimal values
    const balanceMetrics = calculateBalanceMetrics(
        optimalGravity,
        optimalAirResistance,
        physicsFactors,
        boardHeight
    );

    return {
        optimalGravity,
        optimalAirResistance,
        balanceMetrics,
    };
}

/**
 * Calculate environmental balance metrics
 */
export function calculateBalanceMetrics(
    gravity: number,
    airResistance: number,
    physicsFactors: PhysicsFactors,
    boardHeight: number
): {
    fallTime: number;
    controlTime: number;
    bounceHeight: number;
    predictability: number;
} {
    // Approximate fall time (simplified calculation)
    const averageVelocity = Math.min(
        physicsFactors.velocityY,
        Math.sqrt((physicsFactors.ballMass * gravity) / airResistance) * 0.8
    );
    const fallTime = boardHeight / averageVelocity;

    // Control time (time between peg collisions)
    const controlTime = physicsFactors.pegSpacing / physicsFactors.velocityY;

    // Bounce height
    const bounceHeight = (Math.pow(physicsFactors.velocityY, 2) *
        Math.pow(physicsFactors.restitution, 2)) / (2 * gravity);

    // Predictability (inverse of chaos factor)
    const chaosFactor = (airResistance / gravity) + physicsFactors.randomFactor;
    const predictability = Math.max(0, 1 - chaosFactor);

    return {
        fallTime,
        controlTime,
        bounceHeight,
        predictability,
    };
}

/**
 * Environmental balance optimizer
 */
export class EnvironmentalBalanceOptimizer {
    private readonly config: EnvironmentalBalanceConfig;
    private currentGravity: number;
    private currentAirResistance: number;
    private optimizationHistory: Array<{
        gravity: number;
        airResistance: number;
        score: number;
        timestamp: number;
    }> = [];

    constructor(
        initialGravity: number,
        initialAirResistance: number,
        config: Partial<EnvironmentalBalanceConfig> = {}
    ) {
        this.config = { ...DEFAULT_ENVIRONMENTAL_BALANCE_CONFIG, ...config };
        this.currentGravity = initialGravity;
        this.currentAirResistance = initialAirResistance;
    }

    /**
     * Optimize environmental factors for target metrics
     */
    optimizeForMetrics(
        physicsFactors: PhysicsFactors,
        boardHeight: number,
        iterations = 10
    ): {
        optimalGravity: number;
        optimalAirResistance: number;
        finalScore: number;
        improvement: number;
    } {
        let bestGravity = this.currentGravity;
        let bestAirResistance = this.currentAirResistance;
        let bestScore = this.evaluateBalance(bestGravity, bestAirResistance, physicsFactors, boardHeight);

        const initialScore = bestScore;

        for (let i = 0; i < iterations; i++) {
            // Generate candidate solutions
            const candidates = this.generateCandidates(bestGravity, bestAirResistance);

            for (const candidate of candidates) {
                const score = this.evaluateBalance(
                    candidate.gravity,
                    candidate.airResistance,
                    physicsFactors,
                    boardHeight
                );

                if (score > bestScore) {
                    bestScore = score;
                    bestGravity = candidate.gravity;
                    bestAirResistance = candidate.airResistance;
                }

                // Record in history
                this.optimizationHistory.push({
                    gravity: candidate.gravity,
                    airResistance: candidate.airResistance,
                    score,
                    timestamp: Date.now(),
                });
            }
        }

        this.currentGravity = bestGravity;
        this.currentAirResistance = bestAirResistance;

        return {
            optimalGravity: bestGravity,
            optimalAirResistance: bestAirResistance,
            finalScore: bestScore,
            improvement: bestScore - initialScore,
        };
    }

    /**
     * Evaluate balance quality
     */
    private evaluateBalance(
        gravity: number,
        airResistance: number,
        physicsFactors: PhysicsFactors,
        boardHeight: number
    ): number {
        const metrics = calculateBalanceMetrics(gravity, airResistance, physicsFactors, boardHeight);

        let score = 0;
        let totalWeight = 0;

        // Fall time scoring
        const fallTimeError = Math.abs(metrics.fallTime - this.config.targetFallTime);
        const fallTimeWeight = 30;
        score += (1 - Math.min(fallTimeError / this.config.targetFallTime, 1)) * fallTimeWeight;
        totalWeight += fallTimeWeight;

        // Control time scoring
        const controlTimeError = Math.abs(metrics.controlTime - this.config.targetControlTime);
        const controlTimeWeight = 25;
        score += (1 - Math.min(controlTimeError / this.config.targetControlTime, 1)) * controlTimeWeight;
        totalWeight += controlTimeWeight;

        // Bounce height scoring
        const bounceHeightError = Math.abs(metrics.bounceHeight - this.config.targetBounceHeight);
        const bounceHeightWeight = 20;
        score += (1 - Math.min(bounceHeightError / this.config.targetBounceHeight, 1)) * bounceHeightWeight;
        totalWeight += bounceHeightWeight;

        // Predictability scoring
        const predictabilityWeight = 25;
        score += metrics.predictability * predictabilityWeight;
        totalWeight += predictabilityWeight;

        // Penalty for extreme values
        if (gravity < 0.3 || gravity > 2.5) { score *= 0.8; }
        if (airResistance < 0.005 || airResistance > 0.3) { score *= 0.8; }

        return totalWeight > 0 ? score / totalWeight : 0;
    }

    /**
     * Generate candidate solutions
     */
    private generateCandidates(currentGravity: number, currentAirResistance: number): Array<{
        gravity: number;
        airResistance: number;
    }> {
        const candidates = [];
        const variations = [-0.2, -0.1, 0.1, 0.2];

        for (const gravityVar of variations) {
            for (const airVar of variations) {
                const gravity = Math.max(0.1, Math.min(3.0, currentGravity * (1 + gravityVar)));
                const airResistance = Math.max(0.001, Math.min(0.5, currentAirResistance * (1 + airVar)));

                candidates.push({ gravity, airResistance });
            }
        }

        return candidates;
    }

    /**
     * Get optimization history
     */
    getOptimizationHistory(): Array<{
        gravity: number;
        airResistance: number;
        score: number;
        timestamp: number;
    }> {
        return [...this.optimizationHistory];
    }

    /**
     * Reset optimizer
     */
    reset(gravity: number, airResistance: number): void {
        this.currentGravity = gravity;
        this.currentAirResistance = airResistance;
        this.optimizationHistory = [];
    }
}

/**
 * Calculate environmental harmony score
 */
export function calculateEnvironmentalHarmony(
    gravity: number,
    airResistance: number,
    physicsFactors: PhysicsFactors
): {
    harmonyScore: number; // 0-1 scale
    gravityAirResistanceRatio: number;
    stabilityIndex: number;
    gameplayFlow: number;
} {
    // Gravity to air resistance ratio (optimal around 10-50)
    const ratio = gravity / airResistance;
    const optimalRatio = 20;
    const ratioScore = Math.max(0, 1 - Math.abs(ratio - optimalRatio) / optimalRatio);

    // Stability index (avoid extreme values)
    const gravityStability = gravity >= 0.5 && gravity <= 2.0 ? 1 : 0.5;
    const airResistanceStability = airResistance >= 0.01 && airResistance <= 0.2 ? 1 : 0.5;
    const stabilityIndex = (gravityStability + airResistanceStability) / 2;

    // Gameplay flow (balance between speed and control)
    const terminalVelocity = Math.sqrt((physicsFactors.ballMass * gravity) / airResistance);
    const flowScore = Math.max(0, 1 - Math.abs(terminalVelocity - physicsFactors.velocityY * 2) / (physicsFactors.velocityY * 2));

    // Overall harmony score
    const harmonyScore = (ratioScore + stabilityIndex + flowScore) / 3;

    return {
        harmonyScore,
        gravityAirResistanceRatio: ratio,
        stabilityIndex,
        gameplayFlow: flowScore,
    };
}

/**
 * Generate environmental presets for different game modes
 */
export function generateEnvironmentalPresets(): {
    classic: { gravity: number; airResistance: number };
    fast: { gravity: number; airResistance: number };
    precise: { gravity: number; airResistance: number };
    chaotic: { gravity: number; airResistance: number };
} {
    return {
        classic: { gravity: 1.0, airResistance: 0.05 },
        fast: { gravity: 1.5, airResistance: 0.03 },
        precise: { gravity: 0.8, airResistance: 0.08 },
        chaotic: { gravity: 1.2, airResistance: 0.02 },
    };
}

/**
 * Adapt environmental factors based on player performance
 */
export function adaptEnvironmentalFactors(
    currentGravity: number,
    currentAirResistance: number,
    playerAccuracy: number, // 0-1 scale
    targetAccuracy = 0.7
): {
    newGravity: number;
    newAirResistance: number;
    adaptationReason: string;
} {
    const accuracyDifference = targetAccuracy - playerAccuracy;
    let newGravity = currentGravity;
    let newAirResistance = currentAirResistance;
    let adaptationReason = 'No adaptation needed';

    if (Math.abs(accuracyDifference) > 0.1) {
        if (accuracyDifference > 0) {
            // Player is too inaccurate, increase air resistance for more control
            newAirResistance = Math.min(0.2, currentAirResistance * 1.1);
            adaptationReason = 'Increased air resistance for better control';
        } else {
            // Player is too accurate, reduce air resistance for more challenge
            newAirResistance = Math.max(0.01, currentAirResistance * 0.9);
            adaptationReason = 'Reduced air resistance for more challenge';
        }
    }

    // Secondary adjustment for gravity based on air resistance change
    if (newAirResistance !== currentAirResistance) {
        const resistanceRatio = newAirResistance / currentAirResistance;
        newGravity = currentGravity * Math.pow(resistanceRatio, 0.3);
        newGravity = Math.max(0.3, Math.min(2.5, newGravity));
    }

    return {
        newGravity,
        newAirResistance,
        adaptationReason,
    };
}
