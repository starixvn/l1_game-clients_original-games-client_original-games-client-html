/**
 * Ball Scaling Module
 * Handles dynamic ball sizing and physics scaling based on game parameters
 */

import { PhysicsFactors } from '../factors/core-factors';
import { BALL_CONSTANTS } from '../constants/ball-constants';
import { ballSizingConfig } from '../physics-config';
import { calculateDynamicBallSize, BallPhysicsTweaks } from './ball-properties';
import { physicsLogger } from '../performance/physics-logger';

/**
 * Ball scaling configuration
 */
export interface BallScalingConfig {
    baseRows: number;
    baseDiameter: number;
    minDiameter: number;
    maxDiameter: number;
    sizeScaleFactor: number;
}

/**
 * Default ball scaling configuration
 */
export const DEFAULT_BALL_SCALING_CONFIG: BallScalingConfig = {
    baseRows: 10,
    baseDiameter: 22,
    minDiameter: 9,
    maxDiameter: 35,
    sizeScaleFactor: 0.95,
};

/**
 * Calculate ball size based on board configuration
 */
export function calculateBallSizeForBoard(
    numberOfRows: number,
    canvasWidth: number,
    canvasHeight: number,
    scalingConfig: Partial<BallScalingConfig> = {}
): number {
    const config = { ...DEFAULT_BALL_SCALING_CONFIG, ...scalingConfig };

    // Calculate canvas scale factor
    const canvasScaleFactor = Math.min(
        canvasWidth / 480,  // Base canvas width
        canvasHeight / 400  // Base canvas height
    );

    return calculateDynamicBallSize(
        numberOfRows,
        config.baseRows,
        config.baseDiameter / 2, // Convert diameter to radius
        canvasScaleFactor
    );
}

/**
 * Scale ball physics properties based on size
 */
export function scaleBallPhysicsForSize(
    baseRadius: number,
    targetRadius: number,
    basePhysics: BallPhysicsTweaks
): BallPhysicsTweaks {
    const sizeRatio = targetRadius / baseRadius;

    return {
        restitution: Math.max(0.1, Math.min(0.9,
            basePhysics.restitution * Math.pow(sizeRatio, 0.1)
        )),
        frictionAir: Math.max(0.01, Math.min(0.1,
            basePhysics.frictionAir * Math.pow(sizeRatio, 0.3)
        )),
        density: basePhysics.density, // Density typically remains constant
        friction: Math.max(0.1, Math.min(0.8,
            basePhysics.friction * Math.pow(sizeRatio, 0.05)
        )),
        frictionStatic: Math.max(0.1, Math.min(1.0,
            basePhysics.frictionStatic * Math.pow(sizeRatio, 0.05)
        )),
    };
}

/**
 * Calculate optimal physics factors for ball size
 */
export function calculateOptimalPhysicsForBallSize(
    ballRadius: number,
    baseFactors: PhysicsFactors
): Partial<PhysicsFactors> {
    const sizeRatio = ballRadius / 12; // Base radius of 12

    return {
        // Larger balls need stronger nudges to redirect
        nudgeStrength: baseFactors.nudgeStrength * Math.pow(sizeRatio, 0.5),

        // Larger balls may need adjusted air resistance
        airResistanceCoefficient: baseFactors.airResistanceCoefficient * Math.pow(sizeRatio, 0.2),

        // Larger balls may have different friction characteristics
        friction: Math.max(0.1, Math.min(0.8,
            baseFactors.friction + (sizeRatio - 1) * 0.05
        )),

        // Adjust collision cooldown based on ball size
        collisionCooldown: Math.max(50, Math.min(200,
            baseFactors.collisionCooldown * Math.pow(sizeRatio, 0.3)
        )),
    };
}

/**
 * Scale physics factors based on canvas size
 */
export function scalePhysicsForCanvas(
    baseFactors: PhysicsFactors,
    canvasWidth: number,
    canvasHeight: number,
    baseCanvasWidth = 480,
    baseCanvasHeight = 400
): PhysicsFactors {
    const widthRatio = canvasWidth / baseCanvasWidth;
    const heightRatio = canvasHeight / baseCanvasHeight;
    const canvasScaleFactor = Math.min(widthRatio, heightRatio);

    const scaledFactors = { ...baseFactors };

    // Scale factors that depend on canvas size
    scaledFactors.ballSize *= canvasScaleFactor;
    scaledFactors.pegSize *= canvasScaleFactor;
    scaledFactors.pegSpacing *= canvasScaleFactor;

    // Adjust physics to maintain gameplay balance
    scaledFactors.nudgeStrength *= Math.pow(canvasScaleFactor, 0.8);
    scaledFactors.velocityY *= Math.pow(canvasScaleFactor, 0.3);
    scaledFactors.collisionCooldown = Math.max(50,
        scaledFactors.collisionCooldown * Math.pow(canvasScaleFactor, 0.5)
    );

    return scaledFactors;
}

/**
 * Calculate ball size based on number of rows (legacy compatibility function)
 * This function replicates the exact logic from the original calculateBallSize
 */
export function calculateBallSize(rows: number, canvasScaleFactor = 1): number {
    physicsLogger.debug('Calculating ball size for rows', {
        component: 'BallScaling',
        function: 'calculateBallSize',
        metadata: { rows, canvasScaleFactor }
    });

    // Validate input
    let validatedRows = rows;
    if (!rows || rows < BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_ROWS) {
        validatedRows = BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_ROWS;
        physicsLogger.warn('Rows value invalid, using minimum', {
            component: 'BallScaling',
            function: 'calculateBallSize',
            metadata: { originalRows: rows, validatedRows }
        });
    }

    if (rows > BALL_CONSTANTS.SIZE_CONSTRAINTS.MAX_ROWS) {
        validatedRows = BALL_CONSTANTS.SIZE_CONSTRAINTS.MAX_ROWS;
        physicsLogger.warn('Rows value exceeds maximum, clamping', {
            component: 'BallScaling',
            function: 'calculateBallSize',
            metadata: { originalRows: rows, validatedRows }
        });
    }

    // Core size calculation: inversely proportional to rows
    const rawDiameter = ballSizingConfig.baseDiameter / (validatedRows / ballSizingConfig.baseRows);

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

    physicsLogger.debug('Ball size calculated', {
        component: 'BallScaling',
        function: 'calculateBallSize',
        metadata: {
            validatedRows,
            rawDiameter: rawDiameter.toFixed(2),
            pegGapBasedSize: pegGapBasedSize.toFixed(2),
            clampedDiameter: clampedDiameter.toFixed(2),
            finalDiameter: finalDiameter.toFixed(2),
            radius: radius.toFixed(2)
        }
    });

    return radius;
}

/**
 * Calculate ball size progression for different row counts
 */
export function calculateBallSizeProgression(
    minRows = 8,
    maxRows = 20,
    steps = 13
): Array<{ rows: number; radius: number; diameter: number }> {
    const progression: Array<{ rows: number; radius: number; diameter: number }> = [];

    for (let i = 0; i < steps; i++) {
        const rows = minRows + (maxRows - minRows) * (i / (steps - 1));
        const radius = calculateDynamicBallSize(Math.round(rows));
        const diameter = radius * 2;

        progression.push({
            rows: Math.round(rows),
            radius: Math.round(radius * 100) / 100,
            diameter: Math.round(diameter * 100) / 100,
        });
    }

    return progression;
}

/**
 * Get physics balance metrics for ball size
 */
export function getPhysicsBalanceMetrics(
    ballRadius: number,
    physicsFactors: PhysicsFactors
): {
    collisionEfficiency: number;
    pathControlDifficulty: number;
    physicsStability: number;
    visualBalance: number;
} {
    const ballDiameter = ballRadius * 2;

    // Collision efficiency: how well the ball interacts with pegs
    const collisionEfficiency = Math.min(1, ballDiameter / physicsFactors.pegSpacing);

    // Path control difficulty: larger balls are easier to control
    const pathControlDifficulty = 1 / collisionEfficiency;

    // Physics stability: avoid extreme size ratios
    const sizeRatio = ballRadius / 12; // Base radius
    const physicsStability = Math.max(0, 1 - Math.abs(sizeRatio - 1) * 0.5);

    // Visual balance: how well the ball looks on the board
    const visualBalance = Math.max(0.1, 1 - Math.abs(sizeRatio - 1) * 0.3);

    return {
        collisionEfficiency,
        pathControlDifficulty,
        physicsStability,
        visualBalance,
    };
}

/**
 * Calculate score for a specific radius against target metrics
 */
function calculateRadiusScore(
    metrics: ReturnType<typeof getPhysicsBalanceMetrics>,
    targetMetrics: Parameters<typeof optimizeBallSizeForGameplay>[0]
): { score: number; totalWeight: number } {
    const metricWeights = [
        { key: 'collisionEfficiency' as const, weight: 25 },
        { key: 'pathControlDifficulty' as const, weight: 25 },
        { key: 'physicsStability' as const, weight: 25 },
        { key: 'visualBalance' as const, weight: 25 },
    ];

    let score = 0;
    let totalWeight = 0;

    for (const { key, weight } of metricWeights) {
        const targetValue = targetMetrics[key];
        if (targetValue !== undefined) {
            const diff = Math.abs(metrics[key] - targetValue);
            score += (1 - diff) * weight;
            totalWeight += weight;
        }
    }

    return { score, totalWeight };
}

/**
 * Optimize ball size for specific gameplay requirements
 */
export function optimizeBallSizeForGameplay(
    targetMetrics: {
        collisionEfficiency?: number;
        pathControlDifficulty?: number;
        physicsStability?: number;
        visualBalance?: number;
    },
    physicsFactors: PhysicsFactors,
    tolerance = 0.1
): number {
    const minRadius = 4.5; // 9px diameter
    const maxRadius = 17.5; // 35px diameter

    // Binary search for optimal radius
    let low = minRadius;
    let high = maxRadius;
    let bestRadius = (low + high) / 2;
    let bestScore = 0;

    for (let i = 0; i < 20; i++) { // Max 20 iterations
        const mid = (low + high) / 2;
        const metrics = getPhysicsBalanceMetrics(mid, physicsFactors);
        const { score, totalWeight } = calculateRadiusScore(metrics, targetMetrics);
        const normalizedScore = totalWeight > 0 ? score / totalWeight : 0;

        if (normalizedScore > bestScore + tolerance) {
            bestScore = normalizedScore;
            bestRadius = mid;
        }

        // Adjust search bounds
        if (normalizedScore > 0.5) {
            low = mid;
        } else {
            high = mid;
        }
    }

    return bestRadius;
}
