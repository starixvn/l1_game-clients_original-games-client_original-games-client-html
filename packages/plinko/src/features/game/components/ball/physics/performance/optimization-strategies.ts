/**
 * Optimization Strategies Module
 * Implements performance optimization strategies for physics
 */

import { PhysicsFactors } from '../factors/core-factors';
import { PerformanceMetrics, PerformanceMonitor, PERFORMANCE_THRESHOLDS } from './performance-monitor';

/**
 * Optimization strategy interface
 */
export interface OptimizationStrategy {
    name: string;
    description: string;
    condition: (metrics: PerformanceMetrics, physicsFactors: PhysicsFactors) => boolean;
    apply: (physicsFactors: PhysicsFactors) => PhysicsFactors;
    priority: number;
    reversible: boolean;
}

/**
 * Optimization manager class
 */
export class OptimizationManager {
    private strategies: OptimizationStrategy[] = [];
    private readonly appliedOptimizations: Map<string, {
        appliedAt: number;
        originalFactors: PhysicsFactors;
        optimizedFactors: PhysicsFactors;
    }> = new Map();

    constructor() {
        this.initializeDefaultStrategies();
    }

    /**
     * Initialize default optimization strategies
     */
    private initializeDefaultStrategies(): void {
        this.strategies = [
            {
                name: 'Reduce Collision Frequency',
                description: 'Increase collision cooldown to reduce physics calculations',
                priority: 10,
                reversible: true,
                condition: (metrics, factors) =>
                    metrics.collisionCount > PERFORMANCE_THRESHOLDS.MAX_COLLISIONS_PER_FRAME * 1.5,
                apply: (factors) => ({
                    ...factors,
                    collisionCooldown: Math.min(200, factors.collisionCooldown * 1.5),
                }),
            },
            {
                name: 'Reduce Air Resistance Complexity',
                description: 'Simplify air resistance calculations for better performance',
                priority: 9,
                reversible: true,
                condition: (metrics, factors) =>
                    metrics.physicsTime > PERFORMANCE_THRESHOLDS.MAX_PHYSICS_TIME * 1.5 &&
                    factors.airResistanceCoefficient > 0.01,
                apply: (factors) => ({
                    ...factors,
                    airResistanceCoefficient: Math.max(0.005, factors.airResistanceCoefficient * 0.7),
                }),
            },
            {
                name: 'Reduce Randomness',
                description: 'Decrease randomness to reduce calculation complexity',
                priority: 8,
                reversible: true,
                condition: (metrics, factors) =>
                    metrics.physicsTime > PERFORMANCE_THRESHOLDS.MAX_PHYSICS_TIME * 1.2 &&
                    factors.randomFactor > 0.1,
                apply: (factors) => ({
                    ...factors,
                    randomFactor: Math.max(0.05, factors.randomFactor * 0.8),
                }),
            },
            {
                name: 'Optimize Nudge Strength',
                description: 'Reduce nudge strength to decrease force calculations',
                priority: 7,
                reversible: true,
                condition: (metrics, factors) =>
                    metrics.physicsTime > PERFORMANCE_THRESHOLDS.MAX_PHYSICS_TIME &&
                    factors.nudgeStrength > 2.0,
                apply: (factors) => ({
                    ...factors,
                    nudgeStrength: Math.max(1.0, factors.nudgeStrength * 0.9),
                }),
            },
            {
                name: 'Increase Friction',
                description: 'Increase friction to reduce ball movement calculations',
                priority: 6,
                reversible: true,
                condition: (metrics, factors) =>
                    metrics.activeBodies > 30 && factors.friction < 0.6,
                apply: (factors) => ({
                    ...factors,
                    friction: Math.min(0.8, factors.friction * 1.2),
                }),
            },
            {
                name: 'Critical Performance Mode',
                description: 'Apply aggressive optimizations for critical performance issues',
                priority: 1,
                reversible: true,
                condition: (metrics, factors) =>
                    metrics.fps < 30 || metrics.frameTime > 33,
                apply: (factors) => ({
                    ...factors,
                    collisionCooldown: Math.min(300, factors.collisionCooldown * 2),
                    airResistanceCoefficient: Math.max(0.001, factors.airResistanceCoefficient * 0.3),
                    randomFactor: Math.max(0.01, factors.randomFactor * 0.5),
                    nudgeStrength: Math.max(0.5, factors.nudgeStrength * 0.7),
                    friction: Math.min(1.0, factors.friction * 1.5),
                }),
            },
        ];
    }

    /**
     * Analyze performance and apply optimizations
     */
    optimize(
        monitor: PerformanceMonitor,
        currentFactors: PhysicsFactors
    ): {
        optimized: boolean;
        appliedStrategies: string[];
        newFactors: PhysicsFactors;
        expectedImprovement: string;
    } {
        const currentMetrics = monitor.getCurrentMetrics();
        if (!currentMetrics) {
            return {
                optimized: false,
                appliedStrategies: [],
                newFactors: currentFactors,
                expectedImprovement: 'No metrics available',
            };
        }

        // Check if optimization is needed
        const health = monitor.checkPerformanceHealth();
        if (health.isHealthy) {
            return {
                optimized: false,
                appliedStrategies: [],
                newFactors: currentFactors,
                expectedImprovement: 'Performance is healthy',
            };
        }

        // Sort strategies by priority
        const applicableStrategies = this.strategies
            .filter(strategy => strategy.condition(currentMetrics, currentFactors))
            .sort((a, b) => b.priority - a.priority);

        if (applicableStrategies.length === 0) {
            return {
                optimized: false,
                appliedStrategies: [],
                newFactors: currentFactors,
                expectedImprovement: 'No applicable strategies',
            };
        }

        // Apply the highest priority strategy
        const strategy = applicableStrategies[0];
        const optimizedFactors = strategy.apply(currentFactors);

        // Record the optimization
        this.appliedOptimizations.set(strategy.name, {
            appliedAt: Date.now(),
            originalFactors: { ...currentFactors },
            optimizedFactors: { ...optimizedFactors },
        });

        const expectedImprovement = this.calculateExpectedImprovement(strategy, currentMetrics);

        return {
            optimized: true,
            appliedStrategies: [strategy.name],
            newFactors: optimizedFactors,
            expectedImprovement,
        };
    }

    /**
     * Revert a specific optimization
     */
    revertOptimization(strategyName: string): PhysicsFactors | null {
        const optimization = this.appliedOptimizations.get(strategyName);
        if (!optimization) { return null; }

        this.appliedOptimizations.delete(strategyName);
        return optimization.originalFactors;
    }

    /**
     * Revert all optimizations
     */
    revertAllOptimizations(): PhysicsFactors | null {
        if (this.appliedOptimizations.size === 0) { return null; }

        // Return the most recent original factors
        const optimizations = Array.from(this.appliedOptimizations.values());
        optimizations.sort((a, b) => b.appliedAt - a.appliedAt);
        const mostRecent = optimizations[0];

        this.appliedOptimizations.clear();
        return mostRecent.originalFactors;
    }

    /**
     * Get applied optimizations
     */
    getAppliedOptimizations(): Array<{
        strategyName: string;
        appliedAt: number;
        changes: Record<string, { from: number; to: number }>;
    }> {
        return Array.from(this.appliedOptimizations.entries()).map(([name, data]) => {
            const changes: Record<string, { from: number; to: number }> = {};

            Object.keys(data.originalFactors).forEach(key => {
                const factorKey = key as keyof PhysicsFactors;
                const original = data.originalFactors[factorKey];
                const optimized = data.optimizedFactors[factorKey];

                if (original !== optimized) {
                    changes[key] = { from: original, to: optimized };
                }
            });

            return {
                strategyName: name,
                appliedAt: data.appliedAt,
                changes,
            };
        });
    }

    /**
     * Add custom optimization strategy
     */
    addStrategy(strategy: OptimizationStrategy): void {
        this.strategies.push(strategy);
        this.strategies.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Calculate expected improvement from a strategy
     */
    private calculateExpectedImprovement(strategy: OptimizationStrategy, metrics: PerformanceMetrics): string {
        switch (strategy.name) {
            case 'Reduce Collision Frequency':
                return `Expected ~${Math.round(metrics.collisionCount * 0.3)} fewer collisions per frame`;
            case 'Reduce Air Resistance Complexity':
                return 'Expected ~20-30% reduction in physics calculation time';
            case 'Reduce Randomness':
                return 'Expected ~10-15% reduction in physics calculation time';
            case 'Optimize Nudge Strength':
                return 'Expected ~5-10% reduction in force calculations';
            case 'Increase Friction':
                return 'Expected improved ball settling and reduced movement calculations';
            case 'Critical Performance Mode':
                return 'Expected significant performance improvement through aggressive optimizations';
            default:
                return 'Expected performance improvement';
        }
    }

    /**
     * Get optimization statistics
     */
    getOptimizationStats(): {
        totalOptimizations: number;
        activeOptimizations: number;
        mostUsedStrategy: string | null;
        averageOptimizationDuration: number;
    } {
        const totalOptimizations = this.appliedOptimizations.size;
        const activeOptimizations = totalOptimizations;

        const strategyCounts: Record<string, number> = {};
        this.appliedOptimizations.forEach((_, strategyName) => {
            strategyCounts[strategyName] = (strategyCounts[strategyName] || 0) + 1;
        });

        const mostUsedStrategy = Object.keys(strategyCounts).length > 0
            ? Object.keys(strategyCounts).reduce((a, b) =>
                strategyCounts[a] > strategyCounts[b] ? a : b
            )
            : null;

        // Calculate average duration (simplified)
        const now = Date.now();
        const durations = Array.from(this.appliedOptimizations.values())
            .map(opt => now - opt.appliedAt);
        const averageOptimizationDuration = durations.length > 0
            ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length
            : 0;

        return {
            totalOptimizations,
            activeOptimizations,
            mostUsedStrategy,
            averageOptimizationDuration,
        };
    }
}

/**
 * Automatic optimization system
 */
export class AutomaticOptimizationSystem {
    private readonly manager: OptimizationManager;
    private readonly monitor: PerformanceMonitor;
    private checkInterval: number;
    private lastCheck = 0;
    private enabled = true;

    constructor(manager: OptimizationManager, monitor: PerformanceMonitor, checkInterval = 5000) {
        this.manager = manager;
        this.monitor = monitor;
        this.checkInterval = checkInterval;
    }

    /**
     * Update automatic optimization system
     */
    update(currentFactors: PhysicsFactors): PhysicsFactors {
        if (!this.enabled) { return currentFactors; }

        const now = Date.now();
        if (now - this.lastCheck < this.checkInterval) { return currentFactors; }

        this.lastCheck = now;

        const result = this.manager.optimize(this.monitor, currentFactors);

        if (result.optimized) {
            console.log(`[AUTO-OPTIMIZATION] Applied: ${result.appliedStrategies.join(', ')}`);
            console.log(`[AUTO-OPTIMIZATION] Expected: ${result.expectedImprovement}`);
        }

        return result.newFactors;
    }

    /**
     * Enable or disable automatic optimization
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Set check interval
     */
    setCheckInterval(interval: number): void {
        this.checkInterval = interval;
    }

    /**
     * Force immediate optimization check
     */
    forceOptimizationCheck(currentFactors: PhysicsFactors): PhysicsFactors {
        this.lastCheck = 0; // Reset timer
        return this.update(currentFactors);
    }
}

/**
 * Performance preset configurations
 */
export const PERFORMANCE_PRESETS = {
    highPerformance: {
        name: 'High Performance',
        description: 'Optimized for high-end devices',
        targetFPS: 60,
        maxCollisionsPerFrame: 100,
        maxActiveBodies: 50,
        optimizations: [
            'spatial_partitioning',
            'collision_cooldown',
            'cached_calculations',
        ],
    },

    balanced: {
        name: 'Balanced',
        description: 'Good performance across most devices',
        targetFPS: 45,
        maxCollisionsPerFrame: 50,
        maxActiveBodies: 30,
        optimizations: [
            'collision_cooldown',
            'cached_calculations',
            'adaptive_quality',
        ],
    },

    lowPerformance: {
        name: 'Low Performance',
        description: 'Optimized for low-end devices',
        targetFPS: 30,
        maxCollisionsPerFrame: 20,
        maxActiveBodies: 15,
        optimizations: [
            'collision_cooldown',
            'simplified_physics',
            'object_pooling',
        ],
    },

    minimal: {
        name: 'Minimal',
        description: 'Maximum compatibility, minimum features',
        targetFPS: 20,
        maxCollisionsPerFrame: 10,
        maxActiveBodies: 8,
        optimizations: [
            'simplified_physics',
            'object_pooling',
            'memory_pooling',
        ],
    },
};

/**
 * Apply performance preset
 */
export function applyPerformancePreset(
    presetName: keyof typeof PERFORMANCE_PRESETS,
    currentFactors: PhysicsFactors
): PhysicsFactors {
    const optimizedFactors = { ...currentFactors };

    // Apply preset-specific optimizations
    switch (presetName) {
        case 'highPerformance':
            // Minimal changes for high-end devices
            optimizedFactors.collisionCooldown = Math.max(50, optimizedFactors.collisionCooldown * 0.9);
            break;

        case 'balanced':
            // Moderate optimizations
            optimizedFactors.collisionCooldown = Math.max(70, optimizedFactors.collisionCooldown * 1.2);
            optimizedFactors.airResistanceCoefficient = Math.max(0.01, optimizedFactors.airResistanceCoefficient * 0.8);
            break;

        case 'lowPerformance':
            // Significant optimizations
            optimizedFactors.collisionCooldown = Math.max(100, optimizedFactors.collisionCooldown * 1.5);
            optimizedFactors.airResistanceCoefficient = Math.max(0.005, optimizedFactors.airResistanceCoefficient * 0.6);
            optimizedFactors.randomFactor = Math.max(0.05, optimizedFactors.randomFactor * 0.7);
            break;

        case 'minimal':
            // Aggressive optimizations
            optimizedFactors.collisionCooldown = Math.max(150, optimizedFactors.collisionCooldown * 2);
            optimizedFactors.airResistanceCoefficient = Math.max(0.001, optimizedFactors.airResistanceCoefficient * 0.3);
            optimizedFactors.randomFactor = Math.max(0.01, optimizedFactors.randomFactor * 0.5);
            optimizedFactors.nudgeStrength = Math.max(0.5, optimizedFactors.nudgeStrength * 0.7);
            break;
    }

    return optimizedFactors;
}
