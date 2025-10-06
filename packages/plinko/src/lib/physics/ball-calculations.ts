import { ballSizingConfig } from './physics-config';
import { PHYSICS_CONSTANTS } from './constants/physics-constants';
import { BALL_CONSTANTS } from './constants/ball-constants';

/**
 * Ball Calculations Module
 * Handles all ball sizing and physics calculations following SRP
 */

export interface BallPhysicsTweaks {
    restitution: number;
    frictionAir: number;
    density: number;
}

/**
 * Calculate dynamic ball size based on number of rows
 * Formula: ballDiameter = baseDiameter / (rows / baseRows)
 * With clamping between minDiameter and maxDiameter
 *
 * @param rows - Number of rows in the pegboard
 * @param canvasScaleFactor - Canvas responsive scaling factor (width/480 or height/400)
 * @returns Calculated ball radius for Matter.js physics
 */
export function calculateBallSize(rows: number, canvasScaleFactor: number = 1): number {
    // Validate input
    if (!rows || rows < BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_ROWS) {
        rows = BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_ROWS;
    }

    if (rows > BALL_CONSTANTS.SIZE_CONSTRAINTS.MAX_ROWS) {
        rows = BALL_CONSTANTS.SIZE_CONSTRAINTS.MAX_ROWS;
    }

    // Core size calculation: inversely proportional to rows
    const rawDiameter = ballSizingConfig.baseDiameter / (rows / ballSizingConfig.baseRows);

    // Apply peg gap consideration (ball should be ~80% of typical peg gap)
    const pegGapBasedSize = ballSizingConfig.sizeScaleFactor * rawDiameter;

    // Clamp between min and max diameters
    const clampedDiameter = Math.max(
        ballSizingConfig.minDiameter,
        Math.min(ballSizingConfig.maxDiameter, pegGapBasedSize)
    );

    // Apply canvas responsive scaling
    const finalDiameter = clampedDiameter * canvasScaleFactor;

    // Convert diameter to radius for Matter.js (and ensure minimum size)
    const radius = Math.max(BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_RADIUS, finalDiameter / 2);

    return radius;
}

/**
 * Get visual feedback parameters based on ball size
 * Larger balls: slower fall speed, stronger bounce
 * Smaller balls: faster, more frantic movement
 */
export function getBallPhysicsTweaks(ballRadius: number): BallPhysicsTweaks {
    const sizeRatio = ballRadius / BALL_CONSTANTS.PHYSICS_TWEAKS.SIZE_RATIO_BASE_DIAMETER;

    const physicsTweaks = {
        restitution: PHYSICS_CONSTANTS.BALL.RESTITUTION_MIN + (sizeRatio * PHYSICS_CONSTANTS.BALL.RESTITUTION_RATIO_MULTIPLIER), // Larger balls bounce more (0.8-1.0)
        frictionAir: PHYSICS_CONSTANTS.BALL.FRICTION_AIR_MIN + (sizeRatio * PHYSICS_CONSTANTS.BALL.FRICTION_AIR_RATIO_MULTIPLIER), // Larger balls fall slower (0.02-0.05)
        density: PHYSICS_CONSTANTS.BALL.DENSITY_BASE * (PHYSICS_CONSTANTS.BALL.DENSITY_RATIO_MULTIPLIER - sizeRatio) // Larger balls have more mass relative to size
    };

    return physicsTweaks;
}
