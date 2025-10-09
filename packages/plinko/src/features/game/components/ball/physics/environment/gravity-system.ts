/**
 * Gravity System Module
 * Manages gravity-related physics calculations and relationships
 */

import { PhysicsFactors } from '../factors/core-factors';
import { calculateTerminalVelocity, calculateBounceHeight, calculateFallingSpeed } from '../factors/factor-relationships';
import { physicsLogger } from '../performance/physics-logger';

/**
 * Gravity configuration interface
 */
export interface GravityConfig {
    baseGravity: number;
    gravityMultiplier: number;
    gravityVariation: number;
    adaptiveGravity: boolean;
}

/**
 * Default gravity configuration
 */
export const DEFAULT_GRAVITY_CONFIG: GravityConfig = {
    baseGravity: 1.0,
    gravityMultiplier: 1.0,
    gravityVariation: 0.0,
    adaptiveGravity: false,
};

/**
 * Calculate effective gravity for physics engine
 */
export function calculateEffectiveGravity(
    baseGravity: number,
    scaleFactor: number,
    multiplier: number,
    config: Partial<GravityConfig> = {}
): number {
    const fullConfig = { ...DEFAULT_GRAVITY_CONFIG, ...config };
    const effectiveGravity = baseGravity * scaleFactor * multiplier * fullConfig.gravityMultiplier;

    physicsLogger.debug('Calculated effective gravity', {
        component: 'GravitySystem',
        function: 'calculateEffectiveGravity',
        metadata: {
            baseGravity,
            scaleFactor,
            multiplier,
            gravityMultiplier: fullConfig.gravityMultiplier,
            effectiveGravity: effectiveGravity.toFixed(2)
        }
    });

    return effectiveGravity;
}

/**
 * Calculate gravity's effect on ball trajectory
 */
export function calculateGravityTrajectoryEffect(
    initialVelocityY: number,
    gravity: number,
    time: number
): {
    displacement: number;
    finalVelocity: number;
    acceleration: number;
} {
    // s = ut + (1/2)at²
    const displacement = initialVelocityY * time + 0.5 * gravity * time * time;

    // v = u + at
    const finalVelocity = initialVelocityY + gravity * time;

    return {
        displacement,
        finalVelocity,
        acceleration: gravity,
    };
}

/**
 * Calculate optimal gravity for game balance
 */
export function calculateOptimalGravity(
    ballMass: number,
    airResistance: number,
    targetFallTime: number,
    dropHeight: number
): number {
    // From kinematic equation: s = (1/2)gt²
    // t² = 2s/g, so g = 2s/t²
    const optimalGravity = (2 * dropHeight) / (targetFallTime * targetFallTime);

    // Adjust for air resistance (terminal velocity consideration)
    const terminalVelocity = calculateTerminalVelocity(ballMass, optimalGravity, airResistance);
    const averageVelocity = terminalVelocity * 0.8; // Assume 80% of terminal velocity

    // Recalculate gravity for more accurate timing
    const adjustedGravity = (2 * dropHeight) / (targetFallTime * averageVelocity);

    return Math.max(0.1, Math.min(3.0, adjustedGravity));
}

/**
 * Calculate gravity balance metrics
 */
export function calculateGravityBalanceMetrics(
    gravity: number,
    physicsFactors: PhysicsFactors
): {
    fallTimeRatio: number;
    bounceEfficiency: number;
    controlTime: number;
    stability: number;
} {
    const terminalVelocity = calculateTerminalVelocity(
        physicsFactors.ballMass,
        gravity,
        physicsFactors.airResistanceCoefficient
    );

    // Fall time ratio (how quickly balls reach terminal velocity)
    const fallTimeRatio = terminalVelocity / physicsFactors.velocityY;

    // Bounce efficiency (how high balls bounce)
    const bounceHeight = calculateBounceHeight(
        physicsFactors.velocityY,
        physicsFactors.restitution,
        gravity
    );
    const bounceEfficiency = Math.min(1, bounceHeight / 50); // Normalized to 50px reference

    // Control time (how long player has to react)
    const controlTime = physicsFactors.pegSpacing / physicsFactors.velocityY;

    // Stability (avoid extreme gravity values)
    const stability = gravity >= 0.5 && gravity <= 2.0 ? 1 : 0.5;

    return {
        fallTimeRatio,
        bounceEfficiency,
        controlTime,
        stability,
    };
}

/**
 * Adaptive gravity system
 */
export class AdaptiveGravitySystem {
    private currentGravity: number;
    private targetGravity: number;
    private adaptationRate: number;
    private lastAdjustment: number;

    constructor(initialGravity: number, adaptationRate: number = 0.1) {
        this.currentGravity = initialGravity;
        this.targetGravity = initialGravity;
        this.adaptationRate = adaptationRate;
        this.lastAdjustment = Date.now();
    }

    /**
     * Set target gravity
     */
    setTargetGravity(gravity: number): void {
        this.targetGravity = Math.max(0.1, Math.min(3.0, gravity));
    }

    /**
     * Update gravity towards target
     */
    update(): number {
        const now = Date.now();
        const deltaTime = (now - this.lastAdjustment) / 1000;
        this.lastAdjustment = now;

        // Smooth interpolation towards target
        const difference = this.targetGravity - this.currentGravity;
        this.currentGravity += difference * this.adaptationRate * deltaTime;

        return this.currentGravity;
    }

    /**
     * Get current gravity
     */
    getCurrentGravity(): number {
        return this.currentGravity;
    }

    /**
     * Instantly set gravity
     */
    setGravity(gravity: number): void {
        this.currentGravity = Math.max(0.1, Math.min(3.0, gravity));
        this.targetGravity = this.currentGravity;
    }

    /**
     * Check if gravity has reached target
     */
    hasReachedTarget(tolerance: number = 0.01): boolean {
        return Math.abs(this.currentGravity - this.targetGravity) < tolerance;
    }
}

/**
 * Calculate gravity field variations
 */
export function calculateGravityFieldVariations(
    baseGravity: number,
    canvasHeight: number,
    variationType: 'uniform' | 'gradient' | 'zones'
): Array<{ y: number; gravity: number }> {
    const variations: Array<{ y: number; gravity: number }> = [];

    switch (variationType) {
        case 'uniform':
            variations.push({ y: canvasHeight / 2, gravity: baseGravity });
            break;

        case 'gradient':
            // Gravity increases towards bottom
            for (let i = 0; i <= 10; i++) {
                const y = (canvasHeight * i) / 10;
                const gravityMultiplier = 1 + (i / 10) * 0.5; // Up to 50% increase
                variations.push({
                    y,
                    gravity: baseGravity * gravityMultiplier
                });
            }
            break;

        case 'zones':
            // Different gravity zones
            variations.push({ y: canvasHeight * 0.3, gravity: baseGravity * 0.8 }); // Low gravity zone
            variations.push({ y: canvasHeight * 0.7, gravity: baseGravity * 1.2 }); // High gravity zone
            break;
    }

    return variations;
}

/**
 * Calculate gravity's impact on game difficulty
 */
export function calculateGravityDifficultyImpact(
    gravity: number,
    physicsFactors: PhysicsFactors
): {
    difficulty: number; // 0-1 scale
    playerReactionTime: number;
    ballPathPredictability: number;
    scoringVariability: number;
} {
    const terminalVelocity = calculateTerminalVelocity(
        physicsFactors.ballMass,
        gravity,
        physicsFactors.airResistanceCoefficient
    );

    // Higher gravity = higher difficulty
    const difficulty = Math.min(1, gravity / 2.0);

    // Player reaction time decreases with higher gravity
    const playerReactionTime = Math.max(0.1, 1 - difficulty);

    // Path predictability decreases with higher gravity (more chaotic bounces)
    const ballPathPredictability = Math.max(0.1, 1 - difficulty * 0.8);

    // Scoring variability increases with gravity (wider score distribution)
    const scoringVariability = Math.min(1, difficulty * 1.5);

    return {
        difficulty,
        playerReactionTime,
        ballPathPredictability,
        scoringVariability,
    };
}

/**
 * Gravity compensation for different screen sizes
 */
export function calculateGravityCompensation(
    baseGravity: number,
    canvasHeight: number,
    referenceHeight: number = 400
): number {
    // Adjust gravity so fall time remains consistent across different canvas sizes
    const heightRatio = canvasHeight / referenceHeight;
    const compensatedGravity = baseGravity * heightRatio;

    return Math.max(0.1, Math.min(3.0, compensatedGravity));
}

/**
 * Analyze gravity physics stability
 */
export function analyzeGravityStability(
    gravity: number,
    physicsFactors: PhysicsFactors,
    timeStep: number = 0.016
): {
    isStable: boolean;
    oscillations: number;
    energyConservation: number;
    numericalStability: number;
} {
    // Simulate a simple falling object to check for stability
    let position = 0;
    let velocity = 0;
    let totalEnergy = 0;
    let oscillationCount = 0;
    let lastDirection = 0;

    const simulationSteps = 1000;

    for (let i = 0; i < simulationSteps; i++) {
        // Apply gravity
        velocity += gravity * timeStep;
        position += velocity * timeStep;

        // Simple ground collision (for oscillation test)
        if (position > 100) {
            position = 100;
            velocity *= -physicsFactors.restitution;

            // Count oscillations
            const currentDirection = Math.sign(velocity);
            if (currentDirection !== lastDirection && lastDirection !== 0) {
                oscillationCount++;
            }
            lastDirection = currentDirection;
        }

        // Track energy
        const kineticEnergy = 0.5 * physicsFactors.ballMass * velocity * velocity;
        const potentialEnergy = physicsFactors.ballMass * gravity * Math.max(0, 100 - position);
        totalEnergy = kineticEnergy + potentialEnergy;
    }

    const isStable = oscillationCount < simulationSteps * 0.1; // Less than 10% oscillations
    const oscillations = oscillationCount / simulationSteps;
    const energyConservation = Math.abs(totalEnergy) < 1000 ? 1 : 0; // Check for energy explosion
    const numericalStability = velocity < 100 ? 1 : 0; // Check for velocity explosion

    return {
        isStable,
        oscillations,
        energyConservation,
        numericalStability,
    };
}
