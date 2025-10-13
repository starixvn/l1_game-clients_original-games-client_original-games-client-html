/**
 * Adaptive Scaling Module
 * Dynamically adjusts physics scaling based on gameplay metrics and player behavior
 */

import { PhysicsFactors } from '../factors/core-factors';
import { PhysicsScaler, ScalingConfiguration, ScalingType } from './physics-scaler';

/**
 * Adaptation metrics interface
 */
export interface AdaptationMetrics {
    averageAccuracy: number;          // 0-1 scale
    averageReactionTime: number;      // seconds
    collisionFrequency: number;       // collisions per second
    pathPredictability: number;       // 0-1 scale
    playerFrustration: number;        // 0-1 scale (estimated)
    sessionDuration: number;          // minutes
}

/**
 * Adaptation strategy interface
 */
export interface AdaptationStrategy {
    name: string;
    description: string;
    condition: (metrics: AdaptationMetrics) => boolean;
    adjustments: ScalingConfiguration[];
    priority: number; // Higher priority strategies are checked first
}

/**
 * Adaptive scaling system
 */
export class AdaptiveScalingSystem {
    private readonly scaler: PhysicsScaler;
    private strategies: AdaptationStrategy[] = [];
    private adaptationHistory: Array<{
        timestamp: number;
        metrics: AdaptationMetrics;
        appliedStrategy: string;
        scalingChanges: Record<string, { before: number; after: number }>;
    }> = [];
    private lastAdaptation = 0;
    private adaptationCooldown = 30000; // 30 seconds between adaptations

    constructor(baseGravity = 1.0) {
        this.scaler = new PhysicsScaler(baseGravity);
        this.initializeDefaultStrategies();
    }

    /**
     * Initialize default adaptation strategies
     */
    private initializeDefaultStrategies(): void {
        this.strategies = [
            {
                name: 'Difficulty Too High',
                description: 'Player is struggling - make game easier',
                priority: 10,
                condition: (metrics) => metrics.averageAccuracy < 0.3 && metrics.playerFrustration > 0.7,
                adjustments: [
                    {
                        factor: 'nudgeStrength',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 1.3, // 30% increase
                        scalingFactor: 1.0,
                    },
                    {
                        factor: 'airResistanceCoefficient',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 1.4, // 40% increase
                        scalingFactor: 1.0,
                    },
                    {
                        factor: 'randomFactor',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 0.7, // 30% decrease
                        scalingFactor: 1.0,
                    },
                ],
            },
            {
                name: 'Difficulty Too Low',
                description: 'Player is too accurate - increase challenge',
                priority: 9,
                condition: (metrics) => metrics.averageAccuracy > 0.85 && metrics.sessionDuration > 5,
                adjustments: [
                    {
                        factor: 'nudgeStrength',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 0.85, // 15% decrease
                        scalingFactor: 1.0,
                    },
                    {
                        factor: 'airResistanceCoefficient',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 0.8, // 20% decrease
                        scalingFactor: 1.0,
                    },
                    {
                        factor: 'randomFactor',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 1.2, // 20% increase
                        scalingFactor: 1.0,
                    },
                ],
            },
            {
                name: 'Slow Reaction Times',
                description: 'Player needs more time to react',
                priority: 8,
                condition: (metrics) => metrics.averageReactionTime > 1.5 && metrics.collisionFrequency < 2,
                adjustments: [
                    {
                        factor: 'velocityY',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 0.8, // 20% decrease
                        scalingFactor: 1.0,
                    },
                    {
                        factor: 'collisionCooldown',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 1.3, // 30% increase
                        scalingFactor: 1.0,
                    },
                ],
            },
            {
                name: 'Fast Paced Preference',
                description: 'Player performs well with faster gameplay',
                priority: 7,
                condition: (metrics) => metrics.averageAccuracy > 0.6 && metrics.collisionFrequency > 4,
                adjustments: [
                    {
                        factor: 'velocityY',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 1.2, // 20% increase
                        scalingFactor: 1.0,
                    },
                    {
                        factor: 'collisionCooldown',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 0.8, // 20% decrease
                        scalingFactor: 1.0,
                    },
                ],
            },
            {
                name: 'High Collision Rate',
                description: 'Too many collisions - reduce sensitivity',
                priority: 6,
                condition: (metrics) => metrics.collisionFrequency > 8,
                adjustments: [
                    {
                        factor: 'collisionCooldown',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 1.5, // 50% increase
                        scalingFactor: 1.0,
                    },
                    {
                        factor: 'randomFactor',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 0.8, // 20% decrease
                        scalingFactor: 1.0,
                    },
                ],
            },
            {
                name: 'Low Predictability',
                description: 'Paths are too unpredictable - stabilize physics',
                priority: 5,
                condition: (metrics) => metrics.pathPredictability < 0.4,
                adjustments: [
                    {
                        factor: 'randomFactor',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 0.7, // 30% decrease
                        scalingFactor: 1.0,
                    },
                    {
                        factor: 'momentumFactor',
                        scalingType: ScalingType.PROPORTIONAL,
                        baseValue: 1.1, // 10% increase
                        scalingFactor: 1.0,
                    },
                ],
            },
        ];
    }

    /**
     * Evaluate and apply adaptations based on current metrics
     */
    adapt(metrics: AdaptationMetrics): {
        adapted: boolean;
        strategyApplied: string | null;
        scalingChanges: Record<string, { before: number; after: number }>;
    } {
        const now = Date.now();

        // Check adaptation cooldown
        if (now - this.lastAdaptation < this.adaptationCooldown) {
            return {
                adapted: false,
                strategyApplied: null,
                scalingChanges: {},
            };
        }

        // Sort strategies by priority
        const sortedStrategies = [...this.strategies].sort((a, b) => b.priority - a.priority);

        // Find first applicable strategy
        for (const strategy of sortedStrategies) {
            if (strategy.condition(metrics)) {
                const scalingChanges = this.applyStrategy(strategy);
                this.lastAdaptation = now;

                // Record adaptation
                this.adaptationHistory.push({
                    timestamp: now,
                    metrics: { ...metrics },
                    appliedStrategy: strategy.name,
                    scalingChanges,
                });

                return {
                    adapted: true,
                    strategyApplied: strategy.name,
                    scalingChanges,
                };
            }
        }

        return {
            adapted: false,
            strategyApplied: null,
            scalingChanges: {},
        };
    }

    /**
     * Apply an adaptation strategy
     */
    private applyStrategy(strategy: AdaptationStrategy): Record<string, { before: number; after: number }> {
        const changes: Record<string, { before: number; after: number }> = {};

        for (const adjustment of strategy.adjustments) {
            const beforeValue = this.scaler.scaleFactor(adjustment.factor);

            // Apply adjustment by modifying the scaling configuration
            const currentConfig = this.scaler.getScalingConfiguration(adjustment.factor);
            if (currentConfig) {
                const newConfig = { ...currentConfig };

                // Modify base value according to adjustment
                newConfig.baseValue *= adjustment.baseValue;

                this.scaler.setScalingConfiguration(newConfig);

                const afterValue = this.scaler.scaleFactor(adjustment.factor);
                changes[adjustment.factor] = { before: beforeValue, after: afterValue };
            }
        }

        return changes;
    }

    /**
     * Add custom adaptation strategy
     */
    addStrategy(strategy: AdaptationStrategy): void {
        this.strategies.push(strategy);
        this.strategies.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Remove adaptation strategy
     */
    removeStrategy(strategyName: string): void {
        this.strategies = this.strategies.filter(s => s.name !== strategyName);
    }

    /**
     * Get current scaled factors
     */
    getScaledFactors(): PhysicsFactors {
        return this.scaler.getScaledFactors();
    }

    /**
     * Set base gravity
     */
    setGravity(gravity: number): void {
        this.scaler.setGravity(gravity);
    }

    /**
     * Get adaptation history
     */
    getAdaptationHistory(): Array<{
        timestamp: number;
        metrics: AdaptationMetrics;
        appliedStrategy: string;
        scalingChanges: Record<string, { before: number; after: number }>;
    }> {
        return [...this.adaptationHistory];
    }

    /**
     * Reset adaptation system
     */
    reset(): void {
        this.adaptationHistory = [];
        this.lastAdaptation = 0;
    }

    /**
     * Set adaptation cooldown
     */
    setAdaptationCooldown(cooldownMs: number): void {
        this.adaptationCooldown = cooldownMs;
    }

    /**
     * Get adaptation statistics
     */
    getAdaptationStats(): {
        totalAdaptations: number;
        strategiesUsed: Record<string, number>;
        averageTimeBetweenAdaptations: number;
    } {
        const totalAdaptations = this.adaptationHistory.length;
        const strategiesUsed: Record<string, number> = {};

        this.adaptationHistory.forEach(entry => {
            strategiesUsed[entry.appliedStrategy] = (strategiesUsed[entry.appliedStrategy] || 0) + 1;
        });

        let averageTimeBetweenAdaptations = 0;
        if (this.adaptationHistory.length > 1) {
            const times = this.adaptationHistory.map(entry => entry.timestamp);
            const intervals = [];
            for (let i = 1; i < times.length; i++) {
                intervals.push(times[i] - times[i - 1]);
            }
            averageTimeBetweenAdaptations = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        }

        return {
            totalAdaptations,
            strategiesUsed,
            averageTimeBetweenAdaptations,
        };
    }
}

/**
 * Calculate player frustration level (estimation)
 */
export function estimatePlayerFrustration(metrics: AdaptationMetrics): number {
    let frustration = 0;

    // Low accuracy indicates frustration
    if (metrics.averageAccuracy < 0.4) {
        frustration += 0.4;
    }

    // High reaction time with low accuracy
    if (metrics.averageReactionTime > 1.2 && metrics.averageAccuracy < 0.5) {
        frustration += 0.3;
    }

    // Too many collisions (overwhelming)
    if (metrics.collisionFrequency > 6) {
        frustration += 0.2;
    }

    // Very unpredictable paths
    if (metrics.pathPredictability < 0.3) {
        frustration += 0.2;
    }

    return Math.min(1, frustration);
}

/**
 * Generate adaptation metrics from gameplay data
 */
export function generateAdaptationMetrics(
    accuracyHistory: number[],
    reactionTimeHistory: number[],
    collisionTimestamps: number[],
    pathPredictabilityHistory: number[],
    sessionStartTime: number
): AdaptationMetrics {
    const now = Date.now();
    const sessionDuration = (now - sessionStartTime) / (1000 * 60); // minutes

    const averageAccuracy = accuracyHistory.length > 0
        ? accuracyHistory.reduce((sum, acc) => sum + acc, 0) / accuracyHistory.length
        : 0.5;

    const averageReactionTime = reactionTimeHistory.length > 0
        ? reactionTimeHistory.reduce((sum, time) => sum + time, 0) / reactionTimeHistory.length
        : 1.0;

    // Calculate collision frequency
    const recentCollisions = collisionTimestamps.filter(
        timestamp => now - timestamp < 10000 // Last 10 seconds
    );
    const collisionFrequency = recentCollisions.length / 10; // per second

    const pathPredictability = pathPredictabilityHistory.length > 0
        ? pathPredictabilityHistory.reduce((sum, pred) => sum + pred, 0) / pathPredictabilityHistory.length
        : 0.5;

    const playerFrustration = estimatePlayerFrustration({
        averageAccuracy,
        averageReactionTime,
        collisionFrequency,
        pathPredictability,
        sessionDuration,
    } as AdaptationMetrics);

    return {
        averageAccuracy,
        averageReactionTime,
        collisionFrequency,
        pathPredictability,
        playerFrustration,
        sessionDuration,
    };
}

/**
 * Create adaptive scaling system with custom strategies
 */
export function createAdaptiveScalingSystem(
    baseGravity: number,
    customStrategies: AdaptationStrategy[]
): AdaptiveScalingSystem {
    const system = new AdaptiveScalingSystem(baseGravity);

    customStrategies.forEach(strategy => {
        system.addStrategy(strategy);
    });

    return system;
}
