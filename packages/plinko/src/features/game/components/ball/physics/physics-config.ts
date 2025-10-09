
/**
 * Physics Configuration for Plinko Ball Layout
 * Defines all physics-related constants and configuration
 */

import { PHYSICS_CONSTANTS } from './constants/physics-constants';
import { LAYOUT_CONSTANTS } from './constants/layout-constants';

export interface PhysicsConfig {
    pins: {
        startPins: number;
        pinSize: number;
        pinGap: number;
    };
    ball: {
        ballSize: number;
    };
    engine: {
        engineGravity: number;
    };
    world: {
        width: number;
        height: number;
    };
    colors: {
        background: string;
        ball: string;
        pin: string;
        multiplierHigh: string;
        multiplierMedium: string;
        multiplierLow: string;
        multiplierLoss: string;
    };
}

/**
 * Main physics configuration for the Plinko game
 */
export const physicsConfig: PhysicsConfig = {
    pins: {
        startPins: LAYOUT_CONSTANTS.BOARD.INITIAL_COLUMNS,
        pinSize: 2,
        pinGap: LAYOUT_CONSTANTS.BOARD.PEG_GAP_MULTIPLIER
    },
    ball: {
        ballSize: 12 // Base radius for 10 rows (dynamically scaled for other row counts)
    },
    engine: {
        engineGravity: PHYSICS_CONSTANTS.ENGINE.GRAVITY
    },
    world: {
        width: 480,  // Matches payout display width: 9 slots × 50px min-width + 8 × 2px gaps = 466px, rounded up
        height: 400
    },
    colors: {
        background: '#1a1a2e',
        ball: '#ff6b6b',
        pin: '#F5DCFF',
        multiplierHigh: '#ffd700',
        multiplierMedium: '#ff6b6b',
        multiplierLow: '#4ecdc4',
        multiplierLoss: '#666'
    }
};

/**
 * Physics Scaling Configuration
 * Defines coordinated scaling relationships between all physics factors
 * When gravity changes, all related factors scale proportionally
 */
export const physicsScalingConfig = {
    // Base reference values (at gravity = 1.0) - tuned for deterministic path following
    baseGravity: 1.0,

    // Nudge forces scale with gravity (stronger gravity = stronger nudges)
    baseNudgeStrength: 3.5,        // Strong nudges for precise deterministic path control
    nudgeScalingFactor: 1.5,       // Moderate scaling for consistent path correction

    // Y velocities scale with gravity (stronger gravity = faster Y movement)
    baseYVelocity: 1.6,            // Faster falling for deterministic control
    yVelocityScalingFactor: 1.0,   // Proportional scaling for predictable movement

    // Force-based movement factors (scale with gravity)
    baseForceStrength: 2.5,        // Stronger forces for deterministic control
    forceScalingFactor: 1.3,       // Balanced scaling for path accuracy

    // Collision cooldown scales inversely with gravity (faster gravity = shorter cooldown)
    baseCollisionCooldown: 80,     // Shorter cooldown for precise path following
    cooldownScalingFactor: 1.0,    // Standard inverse scaling

    // Randomness factors (scale with gravity for consistent behavior)
    baseRandomFactor: 0.08,        // Minimal randomness for deterministic paths
    randomScalingFactor: 0.7,      // Conservative scaling for predictability

    // Momentum variation (affects physics consistency)
    baseMomentumVariation: 0.95,   // High momentum preservation for path stability
    momentumScalingFactor: 0.98,   // Minimal variation for consistency

    // Angular velocity (affects realistic bouncing)
    baseAngularVelocity: 0.03,     // Minimal spinning for focused path following
    angularScalingFactor: 0.85,    // Conservative angular behavior
};

/**
 * Calculate scaled physics values based on current gravity
 * @param currentGravity - The current gravity value (e.g., 1.8 * scaleFactor * multiplier)
 * @returns Object with all scaled physics values
 */
export function getScaledPhysicsValues(currentGravity: number) {
    const gravityRatio = currentGravity / physicsScalingConfig.baseGravity;

    return {
        // Nudge forces (scale with gravity)
        nudgeStrength: physicsScalingConfig.baseNudgeStrength * Math.pow(gravityRatio, physicsScalingConfig.nudgeScalingFactor),

        // Y velocities (scale with gravity)
        baseYVelocity: physicsScalingConfig.baseYVelocity * Math.pow(gravityRatio, physicsScalingConfig.yVelocityScalingFactor),

        // Force-based movement (scale with gravity)
        forceStrength: physicsScalingConfig.baseForceStrength * Math.pow(gravityRatio, physicsScalingConfig.forceScalingFactor),

        // Collision cooldown (inverse scaling - faster gravity = shorter cooldown)
        collisionCooldown: Math.max(50, physicsScalingConfig.baseCollisionCooldown / Math.pow(gravityRatio, physicsScalingConfig.cooldownScalingFactor)),

        // Randomness (proportional scaling)
        randomFactor: physicsScalingConfig.baseRandomFactor * Math.pow(gravityRatio, physicsScalingConfig.randomScalingFactor),

        // Momentum variation (proportional scaling)
        momentumVariation: physicsScalingConfig.baseMomentumVariation * Math.pow(gravityRatio, physicsScalingConfig.momentumScalingFactor),

        // Angular velocity (proportional scaling)
        angularVelocity: physicsScalingConfig.baseAngularVelocity * Math.pow(gravityRatio, physicsScalingConfig.angularScalingFactor),

        // Gravity ratio for reference
        gravityRatio,
        currentGravity
    };
}

/**
 * Dynamic Ball Sizing Configuration
 * Adjusts ball size based on number of rows for optimal visual balance and gameplay
 */
export const ballSizingConfig = {
    baseRows: 10,           // Reference row count for base sizing
    baseDiameter: 22,       // INCREASED: Base ball diameter in pixels at baseRows (larger balls for more consistent peg collisions)
    minDiameter: 9,         // INCREASED: Minimum ball diameter to prevent invisibility
    maxDiameter: 35,        // INCREASED: Maximum ball diameter to prevent overcrowding
    sizeScaleFactor: 0.95   // INCREASED: Additional scaling factor for peg gap consideration (better collision)
};
