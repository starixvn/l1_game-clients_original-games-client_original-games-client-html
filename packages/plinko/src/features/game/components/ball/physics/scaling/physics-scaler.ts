/**
 * Physics Scaler Module
 * Handles coordinated scaling of physics factors based on gravity and other parameters
 */

import { PhysicsFactors, DEFAULT_PHYSICS_FACTORS } from '../factors/core-factors';
import { RowBasedPhysicsScaler } from './row-based-scaling';

/**
 * Scaling type enumeration
 */
export enum ScalingType {
    PROPORTIONAL = 'proportional',
    INVERSE = 'inverse',
    POWER = 'power',
    LOGARITHMIC = 'logarithmic',
    EXPONENTIAL = 'exponential',
}

/**
 * Scaling configuration interface
 */
export interface ScalingConfiguration {
    factor: keyof PhysicsFactors;
    scalingType: ScalingType;
    baseValue: number;
    scalingFactor: number;
    minValue?: number;
    maxValue?: number;
    exponent?: number;
}

/**
 * Physics scaler class
 */
export class PhysicsScaler {
    private configurations: Map<keyof PhysicsFactors, ScalingConfiguration> = new Map();
    private baseGravity: number;
    private currentGravity: number;
    private rowScaler: RowBasedPhysicsScaler;

    constructor(baseGravity: number = 1.0, baseRows: number = 8) {
        this.baseGravity = baseGravity;
        this.currentGravity = baseGravity;
        this.rowScaler = new RowBasedPhysicsScaler(baseRows);
        this.initializeDefaultConfigurations();
    }

    /**
     * Initialize default scaling configurations
     */
    private initializeDefaultConfigurations(): void {
        // Gravity-based scaling configurations
        this.configurations.set('nudgeStrength', {
            factor: 'nudgeStrength',
            scalingType: ScalingType.POWER,
            baseValue: DEFAULT_PHYSICS_FACTORS.nudgeStrength,
            scalingFactor: 1.4,
            exponent: 1.4,
            minValue: 1.0,
            maxValue: 10.0,
        });

        this.configurations.set('velocityY', {
            factor: 'velocityY',
            scalingType: ScalingType.POWER,
            baseValue: DEFAULT_PHYSICS_FACTORS.velocityY,
            scalingFactor: 1.0,
            exponent: 1.1,
            minValue: 0.5,
            maxValue: 8.0,
        });

        this.configurations.set('nudgeStrength', {
            factor: 'nudgeStrength',
            scalingType: ScalingType.POWER,
            baseValue: 2.5,
            scalingFactor: 1.3,
            exponent: 1.3,
            minValue: 1.0,
            maxValue: 10.0,
        });

        this.configurations.set('collisionCooldown', {
            factor: 'collisionCooldown',
            scalingType: ScalingType.INVERSE,
            baseValue: DEFAULT_PHYSICS_FACTORS.collisionCooldown,
            scalingFactor: 1.0,
            minValue: 50,
            maxValue: 200,
        });

        this.configurations.set('airResistanceCoefficient', {
            factor: 'airResistanceCoefficient',
            scalingType: ScalingType.INVERSE,
            baseValue: DEFAULT_PHYSICS_FACTORS.airResistanceCoefficient,
            scalingFactor: 0.8,
            minValue: 0.01,
            maxValue: 0.2,
        });

        this.configurations.set('friction', {
            factor: 'friction',
            scalingType: ScalingType.INVERSE,
            baseValue: DEFAULT_PHYSICS_FACTORS.friction,
            scalingFactor: 0.9,
            minValue: 0.1,
            maxValue: 0.8,
        });
    }

    /**
     * Set current gravity and update all scaled factors
     */
    setGravity(gravity: number): void {
        this.currentGravity = Math.max(0.1, Math.min(5.0, gravity));
    }

    /**
     * Get gravity ratio
     */
    getGravityRatio(): number {
        return this.currentGravity / this.baseGravity;
    }

    /**
     * Scale a single physics factor
     */
    scaleFactor(factor: keyof PhysicsFactors): number {
        const config = this.configurations.get(factor);
        if (!config) {
            return DEFAULT_PHYSICS_FACTORS[factor];
        }

        const gravityRatio = this.getGravityRatio();
        let scaledValue: number;

        switch (config.scalingType) {
            case ScalingType.PROPORTIONAL:
                scaledValue = config.baseValue * gravityRatio;
                break;

            case ScalingType.INVERSE:
                scaledValue = config.baseValue / Math.pow(gravityRatio, config.scalingFactor);
                break;

            case ScalingType.POWER:
                scaledValue = config.baseValue * Math.pow(gravityRatio, config.exponent || config.scalingFactor);
                break;

            case ScalingType.LOGARITHMIC:
                scaledValue = config.baseValue * Math.log(gravityRatio + 1) * config.scalingFactor;
                break;

            case ScalingType.EXPONENTIAL:
                scaledValue = config.baseValue * Math.exp((gravityRatio - 1) * config.scalingFactor);
                break;

            default:
                scaledValue = config.baseValue;
        }

        // Apply bounds
        if (config.minValue !== undefined) {
            scaledValue = Math.max(config.minValue, scaledValue);
        }
        if (config.maxValue !== undefined) {
            scaledValue = Math.min(config.maxValue, scaledValue);
        }

        return scaledValue;
    }

    /**
     * Get all scaled physics factors (combines gravity and row scaling)
     */
    getScaledFactors(): PhysicsFactors {
        // Start with row-based scaling as the base
        const rowScaledFactors = this.rowScaler.getScaledFactors();
        const finalFactors = { ...rowScaledFactors };

        // Apply gravity-based scaling on top of row scaling
        Object.keys(DEFAULT_PHYSICS_FACTORS).forEach(key => {
            const factorKey = key as keyof PhysicsFactors;

            // Only apply gravity scaling if there's a configuration for this factor
            const config = this.configurations.get(factorKey);
            if (config) {
                // Get the gravity scaling multiplier
                const gravityMultiplier = this.getGravityScaleMultiplier(factorKey);

                // Apply gravity scaling to the row-scaled base value
                finalFactors[factorKey] = rowScaledFactors[factorKey] * gravityMultiplier;
            }
            // If no gravity configuration exists, just use the row-scaled value
        });

        return finalFactors;
    }

    /**
     * Get gravity scale multiplier for a factor
     */
    private getGravityScaleMultiplier(factor: keyof PhysicsFactors): number {
        const config = this.configurations.get(factor);
        if (!config) {
            return 1.0; // No gravity scaling for this factor
        }

        const gravityRatio = this.getGravityRatio();
        let multiplier: number;

        switch (config.scalingType) {
            case ScalingType.PROPORTIONAL:
                multiplier = gravityRatio;
                break;

            case ScalingType.INVERSE:
                multiplier = 1 / Math.pow(gravityRatio, config.scalingFactor);
                break;

            case ScalingType.POWER:
                multiplier = Math.pow(gravityRatio, config.exponent || config.scalingFactor);
                break;

            case ScalingType.LOGARITHMIC:
                multiplier = Math.log(gravityRatio + 1) * config.scalingFactor;
                break;

            case ScalingType.EXPONENTIAL:
                multiplier = Math.exp((gravityRatio - 1) * config.scalingFactor);
                break;

            default:
                multiplier = 1.0;
        }

        // Apply bounds
        if (config.minValue !== undefined && config.maxValue !== undefined) {
            const baseValue = DEFAULT_PHYSICS_FACTORS[factor];
            const scaledValue = baseValue * multiplier;
            const boundedValue = Math.max(config.minValue, Math.min(config.maxValue, scaledValue));
            multiplier = boundedValue / baseValue;
        }

        return multiplier;
    }

    /**
     * Add or update scaling configuration
     */
    setScalingConfiguration(config: ScalingConfiguration): void {
        this.configurations.set(config.factor, config);
    }

    /**
     * Remove scaling configuration (factor will use default value)
     */
    removeScalingConfiguration(factor: keyof PhysicsFactors): void {
        this.configurations.delete(factor);
    }

    /**
     * Get scaling configuration for a factor
     */
    getScalingConfiguration(factor: keyof PhysicsFactors): ScalingConfiguration | undefined {
        return this.configurations.get(factor);
    }

    /**
     * Set the number of rows for row-based scaling
     */
    setRows(rows: number): void {
        this.rowScaler.setRows(rows);
    }

    /**
     * Get current number of rows
     */
    getCurrentRows(): number {
        return this.rowScaler['currentRows'];
    }

    /**
     * Get row ratio (current / base)
     */
    getRowRatio(): number {
        return this.rowScaler.getRowRatio();
    }

    /**
     * Get row scaling analysis
     */
    getRowScalingAnalysis(): any {
        return this.rowScaler.getRowScalingAnalysis();
    }

    /**
     * Set row scaling mode
     */
    setRowScalingMode(mode: 'proportional' | 'progressive' | 'adaptive'): void {
        this.rowScaler.setScalingMode(mode);
    }

    /**
     * Reset to default configurations
     */
    resetConfigurations(): void {
        this.configurations.clear();
        this.initializeDefaultConfigurations();
    }

    /**
     * Get scaling analysis for debugging
     */
    getScalingAnalysis(): {
        gravityRatio: number;
        currentGravity: number;
        baseGravity: number;
        scaledFactors: Record<string, {
            original: number;
            scaled: number;
            scalingType: ScalingType;
            changePercent: number;
        }>;
    } {
        const scaledFactors = this.getScaledFactors();
        const analysis: Record<string, any> = {};

        Object.entries(DEFAULT_PHYSICS_FACTORS).forEach(([key, originalValue]) => {
            const factorKey = key as keyof PhysicsFactors;
            const scaledValue = scaledFactors[factorKey];
            const config = this.configurations.get(factorKey);

            analysis[key] = {
                original: originalValue,
                scaled: scaledValue,
                scalingType: config?.scalingType || ScalingType.PROPORTIONAL,
                changePercent: ((scaledValue - originalValue) / originalValue) * 100,
            };
        });

        return {
            gravityRatio: this.getGravityRatio(),
            currentGravity: this.currentGravity,
            baseGravity: this.baseGravity,
            scaledFactors: analysis,
        };
    }
}

/**
 * Scale physics factors based on multiple parameters
 */
export function scalePhysicsFactorsMultiParameter(
    baseFactors: PhysicsFactors,
    parameters: {
        gravityRatio?: number;
        ballSizeRatio?: number;
        canvasScaleRatio?: number;
        difficultyRatio?: number;
    }
): PhysicsFactors {
    const scaledFactors = { ...baseFactors };
    const {
        gravityRatio = 1.0,
        ballSizeRatio = 1.0,
        canvasScaleRatio = 1.0,
        difficultyRatio = 1.0,
    } = parameters;

    // Gravity-based scaling
    scaledFactors.nudgeStrength *= Math.pow(gravityRatio, 1.4);
    scaledFactors.velocityY *= Math.pow(gravityRatio, 1.1);
    scaledFactors.nudgeStrength *= Math.pow(gravityRatio, 1.3);
    scaledFactors.collisionCooldown = Math.max(50,
        scaledFactors.collisionCooldown / Math.pow(gravityRatio, 1.0)
    );

    // Ball size-based scaling
    scaledFactors.nudgeStrength *= Math.pow(ballSizeRatio, 0.5);
    scaledFactors.collisionCooldown *= Math.pow(ballSizeRatio, 0.3);
    scaledFactors.airResistanceCoefficient *= Math.pow(ballSizeRatio, 0.2);

    // Canvas scale-based scaling
    scaledFactors.ballSize *= canvasScaleRatio;
    scaledFactors.pegSize *= canvasScaleRatio;
    scaledFactors.pegSpacing *= canvasScaleRatio;

    // Difficulty-based scaling
    if (difficultyRatio > 1) {
        // Harder difficulty
        scaledFactors.airResistanceCoefficient *= 0.8; // Less air resistance = harder control
        scaledFactors.nudgeStrength *= 0.9; // Weaker nudges = harder control
    } else {
        // Easier difficulty
        scaledFactors.airResistanceCoefficient *= 1.2; // More air resistance = easier control
        scaledFactors.nudgeStrength *= 1.1; // Stronger nudges = easier control
    }

    return scaledFactors;
}

/**
 * Create physics scaler with custom configurations
 */
export function createCustomPhysicsScaler(
    baseGravity: number,
    customConfigurations: ScalingConfiguration[]
): PhysicsScaler {
    const scaler = new PhysicsScaler(baseGravity);

    customConfigurations.forEach(config => {
        scaler.setScalingConfiguration(config);
    });

    return scaler;
}

/**
 * Validate scaling configuration
 */
export function validateScalingConfiguration(config: ScalingConfiguration): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!config.factor) {
        errors.push('Factor is required');
    }

    if (!Object.values(ScalingType).includes(config.scalingType)) {
        errors.push('Invalid scaling type');
    }

    if (config.baseValue <= 0) {
        errors.push('Base value must be positive');
    }

    if (config.minValue !== undefined && config.maxValue !== undefined &&
        config.minValue >= config.maxValue) {
        errors.push('Minimum value must be less than maximum value');
    }

    if (config.exponent !== undefined && config.exponent <= 0) {
        errors.push('Exponent must be positive');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
