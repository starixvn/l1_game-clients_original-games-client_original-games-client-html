/**
 * Centralized Physics Scaling System
 * All physics calculations are normalized to 8 rows as baseline, then scaled
 * Ensures consistent and predictable physics across all row configurations
 */

import { PhysicsFactors, DEFAULT_PHYSICS_FACTORS } from '../factors/core-factors';

/**
 * BASELINE PHYSICS CONSTANTS (8 Rows)
 * All physics calculations are normalized to these 8-row baseline values
 */
export const BASELINE_PHYSICS_8_ROWS = {
    // Gravity and motion
    gravity: 0.4, // Base gravity for 8 rows
    velocityY: 1.2, // Initial Y velocity

    // Ball properties
    ballRadius: 12, // Base ball radius for 8 rows
    ballMass: 0.02, // Base mass
    restitution: 0.4, // Base bounciness (0.4 = 40% energy return)
    friction: 0.4, // Base friction
    frictionAir: 0.05, // Base air resistance

    // Collision system
    nudgeStrength: 8.0, // Natural base collision nudge strength
    fallSpeed: 2.0, // Base fall speed for trajectory correction
    horizontalSpeed: 3.0, // Base horizontal speed for trajectory correction

    // Layout constants
    canvasWidth: 600,
    canvasHeight: 550,
    pegSpacing: 40, // Vertical spacing between rows
    slotSpacing: 66.67, // Horizontal spacing between slots (600/9)
} as const;

/**
 * TIERED PHYSICS SCALING SYSTEM
 * Implements different scaling strategies based on how far the row count is from the 8-row baseline
 *
 * Tier 1 (Minimal): 8-10 rows - Very little scaling, almost identical to 8-row behavior
 * Tier 2 (Conservative): 11-14 rows - Moderate scaling for balanced gameplay
 * Tier 3 (Aggressive): 15+ rows - More significant scaling for extreme layouts
 */
export const PHYSICS_SCALING_FORMULAS = {
    // Extreme gravity scaling for maximum Plinko acceleration
    gravity: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return 1.5; // Extreme gravity for maximum falling speed
        if (rowCount <= 14) return 1.5 * Math.pow(rowRatio, 0.1); // Enhanced scaling for extreme acceleration
        return 1.5 * Math.pow(rowRatio, 0.18); // Maximum scaling for extreme cases
    },

    // Ball size - minimal changes for near-baseline
    ballRadius: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return DEFAULT_PHYSICS_FACTORS.ballSize; // No change
        if (rowCount <= 14) return DEFAULT_PHYSICS_FACTORS.ballSize * Math.pow(rowRatio, -0.03); // Minimal change
        return DEFAULT_PHYSICS_FACTORS.ballSize * Math.pow(rowRatio, -0.08); // More significant for extreme
    },

    // Mass scaling - follows ball size
    ballMass: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return DEFAULT_PHYSICS_FACTORS.ballMass; // No change
        if (rowCount <= 14) return DEFAULT_PHYSICS_FACTORS.ballMass * Math.pow(rowRatio, -0.05); // Minimal change
        return DEFAULT_PHYSICS_FACTORS.ballMass * Math.pow(rowRatio, -0.12); // More significant
    },

    // Natural restitution for realistic Plinko bounce behavior
    restitution: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return 0.45; // Natural bounce for standard games
        if (rowCount <= 14) return 0.45 * Math.pow(rowRatio, 0.03); // Slight increase for medium games
        if (rowCount === 16) return 0.42; // Good bounce for 16 rows
        return 0.45 * Math.pow(rowRatio, 0.05); // Natural bounce for extreme cases
    },

    // Friction - minimal changes
    friction: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return DEFAULT_PHYSICS_FACTORS.friction; // No change
        if (rowCount <= 14) return DEFAULT_PHYSICS_FACTORS.friction * Math.pow(rowRatio, 0.05); // Slight increase
        return DEFAULT_PHYSICS_FACTORS.friction * Math.pow(rowRatio, 0.1); // More increase
    },

    // Air resistance - very minimal changes
    frictionAir: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return DEFAULT_PHYSICS_FACTORS.airResistanceCoefficient; // No change
        if (rowCount <= 14) return DEFAULT_PHYSICS_FACTORS.airResistanceCoefficient * Math.pow(rowRatio, -0.03); // Minimal
        return DEFAULT_PHYSICS_FACTORS.airResistanceCoefficient * Math.pow(rowRatio, -0.08); // More significant
    },

    // Collision nudges - reduced for better collision feel
    nudgeStrength: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return 8.0; // Balanced baseline for natural guidance
        if (rowCount <= 14) return 8.0 * Math.pow(rowRatio, 0.12); // Gentle scaling
        return 8.0 * Math.sqrt(rowRatio); // More scaling for extreme
    },

    // Trajectory correction speeds - tiered scaling
    fallSpeed: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return 2.0; // No scaling
        if (rowCount <= 14) return 2.0 * Math.pow(rowRatio, 0.15); // Gentle scaling
        return 2.0 * Math.pow(rowRatio, 0.3); // More scaling
    },

    horizontalSpeed: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return 3.0; // No scaling
        if (rowCount <= 14) return 3.0 * Math.pow(rowRatio, 0.15); // Gentle scaling
        return 3.0 * Math.pow(rowRatio, 0.3); // More scaling
    },

    // Y velocity preservation - allow natural energy loss for better path following
    yVelocityPreservation: (rowRatio: number, rowCount: number) => {
        if (rowCount <= 10) return 0.7; // Allow more energy loss for stable path following
        if (rowCount <= 14) return Math.max(0.5, 0.8 * Math.pow(rowRatio, -0.05)); // Moderate reduction
        return Math.max(0.4, 0.75 * Math.pow(rowRatio, -0.1)); // More reduction for extreme
    },
} as const;

/**
 * Row scaling configuration
 */
export interface RowScalingConfig {
    baseRows: number;
    currentRows: number;
    scalingMode: 'proportional' | 'progressive' | 'adaptive';
}

/**
 * Row-based physics scaler
 */
export class RowBasedPhysicsScaler {
    private baseRows: number = 8;
    private currentRows: number = 8;
    private scalingMode: 'proportional' | 'progressive' | 'adaptive' = 'proportional';

    constructor(baseRows: number = 8) {
        this.baseRows = baseRows;
        this.currentRows = baseRows;
    }

    /**
     * Set the number of rows
     */
    setRows(rows: number): void {
        this.currentRows = Math.max(3, Math.min(20, rows)); // Clamp to reasonable range
    }

    /**
     * Get the row ratio (current / base)
     */
    getRowRatio(): number {
        return this.currentRows / this.baseRows;
    }

    /**
     * Get scaled physics factors for current row count using tiered scaling system
     * Uses different scaling strategies based on distance from 8-row baseline
     */
    getScaledFactors(): PhysicsFactors {
        const rowRatio = this.getRowRatio();
        const rowCount = this.currentRows;
        const scaledFactors = { ...DEFAULT_PHYSICS_FACTORS };

        // Apply tiered scaling formulas - pass both rowRatio and rowCount for tiered logic
        scaledFactors.gravity = PHYSICS_SCALING_FORMULAS.gravity(rowRatio, rowCount);
        scaledFactors.ballSize = PHYSICS_SCALING_FORMULAS.ballRadius(rowRatio, rowCount);
        scaledFactors.ballMass = PHYSICS_SCALING_FORMULAS.ballMass(rowRatio, rowCount);
        scaledFactors.restitution = PHYSICS_SCALING_FORMULAS.restitution(rowRatio, rowCount);

        // Velocity scaling - more conservative for near-baseline with caps for extreme cases
        if (rowCount <= 10) {
            scaledFactors.velocityY = DEFAULT_PHYSICS_FACTORS.velocityY; // No scaling
        } else if (rowCount <= 14) {
            scaledFactors.velocityY = DEFAULT_PHYSICS_FACTORS.velocityY * Math.pow(rowRatio, 0.08); // Gentle scaling
        } else {
            scaledFactors.velocityY = Math.min(2.0, DEFAULT_PHYSICS_FACTORS.velocityY * Math.pow(rowRatio, 0.15)); // Cap at 2.0 for extreme cases
        }

        // Use tiered air resistance and friction scaling
        scaledFactors.airResistanceCoefficient = PHYSICS_SCALING_FORMULAS.frictionAir(rowRatio, rowCount);
        scaledFactors.friction = PHYSICS_SCALING_FORMULAS.friction(rowRatio, rowCount);

        // Scale collision-related factors - more conservative
        if (rowCount <= 10) {
            scaledFactors.collisionCooldown = DEFAULT_PHYSICS_FACTORS.collisionCooldown; // No scaling
            scaledFactors.randomFactor = DEFAULT_PHYSICS_FACTORS.randomFactor; // No scaling
            scaledFactors.momentumFactor = DEFAULT_PHYSICS_FACTORS.momentumFactor; // No scaling
        } else {
            scaledFactors.collisionCooldown = DEFAULT_PHYSICS_FACTORS.collisionCooldown * Math.pow(rowRatio, 0.1);
            scaledFactors.randomFactor = DEFAULT_PHYSICS_FACTORS.randomFactor * Math.pow(rowRatio, -0.05);
            scaledFactors.momentumFactor = DEFAULT_PHYSICS_FACTORS.momentumFactor * Math.pow(rowRatio, 0.03);
        }

        // Apply bounds to ensure values stay within reasonable ranges
        this.applyBounds(scaledFactors);

        return scaledFactors;
    }

    /**
     * Apply bounds to scaled factors to keep them within reasonable ranges
     */
    private applyBounds(factors: PhysicsFactors): void {
        factors.gravity = Math.max(0.3, Math.min(2.0, factors.gravity));
        factors.ballSize = Math.max(8, Math.min(20, factors.ballSize));
        factors.ballMass = Math.max(0.0005, Math.min(0.05, factors.ballMass));
        factors.velocityY = Math.max(0.5, Math.min(3.0, factors.velocityY));
        factors.airResistanceCoefficient = Math.max(0.01, Math.min(0.15, factors.airResistanceCoefficient));
        factors.friction = Math.max(0.1, Math.min(0.9, factors.friction));
        factors.collisionCooldown = Math.max(50, Math.min(250, factors.collisionCooldown));
        factors.randomFactor = Math.max(0.02, Math.min(0.3, factors.randomFactor));
        factors.momentumFactor = Math.max(0.7, Math.min(1.0, factors.momentumFactor));
    }

    /**
     * Get scaling analysis for debugging
     */
    getRowScalingAnalysis(): {
        baseRows: number;
        currentRows: number;
        rowRatio: number;
        scaledFactors: Record<string, {
            default: number;
            scaled: number;
            changePercent: number;
        }>;
    } {
        const rowRatio = this.getRowRatio();
        const scaledFactors = this.getScaledFactors();
        const analysis: Record<string, any> = {};

        Object.entries(DEFAULT_PHYSICS_FACTORS).forEach(([key, defaultValue]) => {
            const factorKey = key as keyof PhysicsFactors;
            const scaledValue = scaledFactors[factorKey];

            analysis[key] = {
                default: defaultValue,
                scaled: scaledValue,
                changePercent: ((scaledValue - defaultValue) / defaultValue) * 100,
            };
        });

        return {
            baseRows: this.baseRows,
            currentRows: this.currentRows,
            rowRatio,
            scaledFactors: analysis,
        };
    }

    /**
     * Set scaling mode for different row scaling behaviors
     */
    setScalingMode(mode: 'proportional' | 'progressive' | 'adaptive'): void {
        this.scalingMode = mode;
        // Could implement different scaling algorithms based on mode
    }

    /**
     * Get current scaling mode
     */
    getScalingMode(): string {
        return this.scalingMode;
    }

    /**
     * Reset to base configuration
     */
    reset(): void {
        this.currentRows = this.baseRows;
    }
}

/**
 * Calculate canvas scaling factors based on rows
 */
export function calculateCanvasScalingForRows(
    rows: number,
    baseRows: number = 8,
    canvasWidth: number = 600,
    canvasHeight: number = 550
): {
    scaleFactor: number;
    adjustedCanvasWidth: number;
    adjustedCanvasHeight: number;
} {
    // Calculate how much vertical space we need
    const basePegGap = 40; // Base spacing between rows
    const baseTopMargin = 40;
    const baseBottomMargin = 80;

    // Estimate height needed: top margin + (rows-1) * gap + bottom margin
    const estimatedHeight = baseTopMargin + (rows - 1) * basePegGap + baseBottomMargin;
    const baseEstimatedHeight = baseTopMargin + (baseRows - 1) * basePegGap + baseBottomMargin;

    // Calculate scale factor to fit the estimated height
    const heightScaleFactor = canvasHeight / estimatedHeight;
    const widthScaleFactor = canvasWidth / 600; // Base width assumption

    // Use the more restrictive scale factor
    const scaleFactor = Math.min(heightScaleFactor, widthScaleFactor, 1.0); // Don't scale up

    return {
        scaleFactor,
        adjustedCanvasWidth: canvasWidth * scaleFactor,
        adjustedCanvasHeight: canvasHeight * scaleFactor,
    };
}

/**
 * Create row-based physics scaler with custom base rows
 */
export function createRowBasedPhysicsScaler(baseRows: number = 8): RowBasedPhysicsScaler {
    return new RowBasedPhysicsScaler(baseRows);
}

/**
 * Apply row-based scaling to existing physics factors
 */
export function applyRowScalingToFactors(
    baseFactors: PhysicsFactors,
    rows: number,
    baseRows: number = 8
): PhysicsFactors {
    const scaler = createRowBasedPhysicsScaler(baseRows);
    scaler.setRows(rows);
    const scaledFactors = scaler.getScaledFactors();

    // Merge with base factors, preserving any custom settings
    return { ...baseFactors, ...scaledFactors };
}

/**
 * Get recommended physics adjustments for row changes
 */
export function getRowScalingRecommendations(
    fromRows: number,
    toRows: number
): {
    factor: string;
    adjustment: string;
    reason: string;
}[] {
    const ratio = toRows / fromRows;

    const recommendations = [];

    if (ratio > 1.5) {
        recommendations.push({
            factor: 'Gravity',
            adjustment: 'Increased by ~10-20%',
            reason: 'More rows mean longer paths - faster gravity maintains reasonable play time',
        });
        recommendations.push({
            factor: 'Ball Velocity',
            adjustment: 'Increased by ~5-15%',
            reason: 'Faster movement maintains engagement in longer layouts',
        });
        recommendations.push({
            factor: 'Air Resistance',
            adjustment: 'Reduced by ~5-10%',
            reason: 'Less air resistance allows balls to maintain speed in longer paths',
        });
    } else if (ratio < 0.7) {
        recommendations.push({
            factor: 'Gravity',
            adjustment: 'Reduced by ~10-20%',
            reason: 'Fewer rows mean shorter paths - slower gravity maintains control',
        });
        recommendations.push({
            factor: 'Ball Velocity',
            adjustment: 'Reduced by ~5-15%',
            reason: 'Slower movement provides better control in shorter layouts',
        });
    }

    if (toRows > 12) {
        recommendations.push({
            factor: 'Collision Cooldown',
            adjustment: 'Increased by ~10-20%',
            reason: 'Higher row counts have more pegs - longer cooldowns prevent collision spam',
        });
        recommendations.push({
            factor: 'Random Factor',
            adjustment: 'Reduced by ~5-10%',
            reason: 'More predictable physics in complex layouts improves player confidence',
        });
    }

    return recommendations;
}
