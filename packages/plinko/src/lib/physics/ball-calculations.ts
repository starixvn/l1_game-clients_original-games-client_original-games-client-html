import { ballSizingConfig } from './physics-config';
import { logger } from '../../services/logger';

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
    if (!rows || rows < 1) {
        logger.warn('🔢 [BALL_CALCULATIONS] Invalid rows count, using minimum rows', {
            originalRows: rows,
            correctedRows: 1
        });
        rows = 1;
    }

    if (rows > 50) {
        logger.warn('🔢 [BALL_CALCULATIONS] Very high row count detected, clamping to 50', {
            originalRows: rows,
            correctedRows: 50
        });
        rows = 50;
    }

    // Core size calculation: inversely proportional to rows
    const rawDiameter = ballSizingConfig.baseDiameter / (rows / ballSizingConfig.baseRows);

    logger.debug('🔢 [BALL_CALCULATIONS] Core size calculation completed', {
        rows,
        baseRows: ballSizingConfig.baseRows,
        baseDiameter: ballSizingConfig.baseDiameter,
        rawDiameter: rawDiameter.toFixed(1),
        calculation: `${ballSizingConfig.baseDiameter} / (${rows} / ${ballSizingConfig.baseRows}) = ${rawDiameter.toFixed(1)}`
    });

    // Apply peg gap consideration (ball should be ~80% of typical peg gap)
    const pegGapBasedSize = ballSizingConfig.sizeScaleFactor * rawDiameter;

    logger.debug('🔢 [BALL_CALCULATIONS] Peg gap scaling applied', {
        sizeScaleFactor: ballSizingConfig.sizeScaleFactor,
        pegGapBasedSize: pegGapBasedSize.toFixed(1),
        calculation: `${ballSizingConfig.sizeScaleFactor} * ${rawDiameter.toFixed(1)} = ${pegGapBasedSize.toFixed(1)}`
    });

    // Clamp between min and max diameters
    const clampedDiameter = Math.max(
        ballSizingConfig.minDiameter,
        Math.min(ballSizingConfig.maxDiameter, pegGapBasedSize)
    );

    logger.debug('🔢 [BALL_CALCULATIONS] Diameter clamping applied', {
        minDiameter: ballSizingConfig.minDiameter,
        maxDiameter: ballSizingConfig.maxDiameter,
        pegGapBasedSize: pegGapBasedSize.toFixed(1),
        clampedDiameter: clampedDiameter.toFixed(1),
        wasClamped: clampedDiameter !== pegGapBasedSize
    });

    // Apply canvas responsive scaling
    const finalDiameter = clampedDiameter * canvasScaleFactor;

    logger.debug('🔢 [BALL_CALCULATIONS] Canvas scaling applied', {
        canvasScaleFactor: canvasScaleFactor.toFixed(2),
        clampedDiameter: clampedDiameter.toFixed(1),
        finalDiameter: finalDiameter.toFixed(1),
        calculation: `${clampedDiameter.toFixed(1)} * ${canvasScaleFactor.toFixed(2)} = ${finalDiameter.toFixed(1)}`
    });

    // Convert diameter to radius for Matter.js (and ensure minimum size)
    const radius = Math.max(2, finalDiameter / 2);

    logger.info('🔢 [BALL_CALCULATIONS] Ball size calculation completed', {
        rows,
        rawDiameter: rawDiameter.toFixed(1),
        pegGapBasedSize: pegGapBasedSize.toFixed(1),
        clampedDiameter: clampedDiameter.toFixed(1),
        canvasScaleFactor: canvasScaleFactor.toFixed(2),
        finalDiameter: finalDiameter.toFixed(1),
        finalRadius: radius.toFixed(1),
        wasClamped: clampedDiameter !== pegGapBasedSize,
        wasMinimumEnforced: radius === 2
    });

    return radius;
}

/**
 * Get visual feedback parameters based on ball size
 * Larger balls: slower fall speed, stronger bounce
 * Smaller balls: faster, more frantic movement
 */
export function getBallPhysicsTweaks(ballRadius: number): BallPhysicsTweaks {
    logger.debug('🔢 [BALL_CALCULATIONS] Calculating ball physics tweaks', {
        ballRadius: ballRadius.toFixed(1),
        baseRadius: (ballSizingConfig.baseDiameter / 2).toFixed(1)
    });

    const sizeRatio = ballRadius / (ballSizingConfig.baseDiameter / 2);

    const physicsTweaks = {
        restitution: 0.8 + (sizeRatio * 0.2), // Larger balls bounce more (0.8-1.0)
        frictionAir: 0.02 + (sizeRatio * 0.03), // Larger balls fall slower (0.02-0.05)
        density: 0.001 * (2 - sizeRatio) // Larger balls have more mass relative to size
    };

    logger.info('🔢 [BALL_CALCULATIONS] Ball physics tweaks calculated', {
        ballRadius: ballRadius.toFixed(1),
        sizeRatio: sizeRatio.toFixed(2),
        restitution: physicsTweaks.restitution.toFixed(3),
        frictionAir: physicsTweaks.frictionAir.toFixed(4),
        density: physicsTweaks.density.toFixed(5),
        calculations: {
            restitution: `0.8 + (${sizeRatio.toFixed(2)} * 0.2) = ${physicsTweaks.restitution.toFixed(3)}`,
            frictionAir: `0.02 + (${sizeRatio.toFixed(2)} * 0.03) = ${physicsTweaks.frictionAir.toFixed(4)}`,
            density: `0.001 * (2 - ${sizeRatio.toFixed(2)}) = ${physicsTweaks.density.toFixed(5)}`
        }
    });

    return physicsTweaks;
}

/**
 * Demo function to test ball sizing calculations across different row configurations
 * Useful for development and tuning the dynamic sizing system
 */
export function demoBallSizing(): void {
    
    

    const testCases = [
        { rows: 1, description: 'Minimum rows (max ball size)' },
        { rows: 5, description: 'Low risk setting' },
        { rows: 8, description: 'Low-medium risk' },
        { rows: 10, description: 'Base reference (normal size)' },
        { rows: 12, description: 'Medium-high risk' },
        { rows: 16, description: 'High risk setting' },
        { rows: 20, description: 'Very high risk (min ball size)' },
        { rows: 25, description: 'Extreme volatility' }
    ];

    testCases.forEach(({ rows, description }) => {
        const radius = calculateBallSize(rows);
        const diameter = radius * 2;
        const physics = getBallPhysicsTweaks(radius);

        
        
        
        
    });

    
    
    
    
}
