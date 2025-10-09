/**
 * Collision Cooldown Module
 * Manages collision cooldown to prevent physics instability
 * as described in the Plinko Physics Factors Relationship Documentation
 */

import { physicsLogger } from '../performance/physics-logger';

/**
 * Collision cooldown state interface
 */
export interface CollisionCooldownState {
    lastCollisionTime: number;
    cooldownPeriod: number;
    isOnCooldown: boolean;
    remainingTime: number;
}

/**
 * Collision cooldown manager class
 */
export class CollisionCooldownManager {
    private cooldowns: Map<string, CollisionCooldownState> = new Map();

    /**
     * Check if collision is allowed for given bodies
     */
    canCollide(bodyAId: string, bodyBId: string, cooldownPeriod: number): boolean {
        const key = this.getCollisionKey(bodyAId, bodyBId);
        const state = this.cooldowns.get(key);

        physicsLogger.debug('Checking collision cooldown', {
            component: 'CollisionCooldown',
            function: 'canCollide',
            metadata: {
                bodyAId,
                bodyBId,
                key,
                hasExistingState: !!state,
                cooldownPeriod
            }
        });

        if (!state) {
            physicsLogger.debug('No existing cooldown state, allowing collision', {
                component: 'CollisionCooldown',
                function: 'canCollide',
                metadata: { key }
            });
            return true; // No previous collision, allow
        }

        const now = Date.now();
        const timeSinceLastCollision = now - state.lastCollisionTime;

        if (timeSinceLastCollision >= state.cooldownPeriod) {
            physicsLogger.debug('Cooldown expired, allowing collision', {
                component: 'CollisionCooldown',
                function: 'canCollide',
                metadata: {
                    key,
                    timeSinceLastCollision: timeSinceLastCollision.toFixed(2) + 'ms',
                    cooldownPeriod: state.cooldownPeriod + 'ms'
                }
            });
            return true; // Cooldown expired, allow
        }

        physicsLogger.debug('Collision denied - still on cooldown', {
            component: 'CollisionCooldown',
            function: 'canCollide',
            metadata: {
                key,
                timeSinceLastCollision: timeSinceLastCollision.toFixed(2) + 'ms',
                cooldownPeriod: state.cooldownPeriod + 'ms',
                remainingTime: (state.cooldownPeriod - timeSinceLastCollision).toFixed(2) + 'ms'
            }
        });

        return false; // Still on cooldown, deny
    }

    /**
     * Register a collision and start cooldown
     */
    registerCollision(bodyAId: string, bodyBId: string, cooldownPeriod: number): void {
        const key = this.getCollisionKey(bodyAId, bodyBId);
        const now = Date.now();

        physicsLogger.debug('Registering collision cooldown', {
            component: 'CollisionCooldown',
            function: 'registerCollision',
            metadata: {
                bodyAId,
                bodyBId,
                key,
                cooldownPeriod: cooldownPeriod + 'ms'
            }
        });

        this.cooldowns.set(key, {
            lastCollisionTime: now,
            cooldownPeriod,
            isOnCooldown: true,
            remainingTime: cooldownPeriod,
        });
    }

    /**
     * Update cooldown states (should be called regularly)
     */
    update(): void {
        const now = Date.now();
        let expiredCount = 0;

        for (const [key, state] of Array.from(this.cooldowns.entries())) {
            const timeSinceLastCollision = now - state.lastCollisionTime;
            state.remainingTime = Math.max(0, state.cooldownPeriod - timeSinceLastCollision);
            state.isOnCooldown = state.remainingTime > 0;

            // Clean up expired cooldowns
            if (!state.isOnCooldown) {
                this.cooldowns.delete(key);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            physicsLogger.debug('Cleaned up expired cooldowns', {
                component: 'CollisionCooldown',
                function: 'update',
                metadata: {
                    expiredCount,
                    remainingActive: this.cooldowns.size
                }
            });
        }
    }

    /**
     * Get remaining cooldown time for collision pair
     */
    getRemainingCooldown(bodyAId: string, bodyBId: string): number {
        const key = this.getCollisionKey(bodyAId, bodyBId);
        const state = this.cooldowns.get(key);
        return state?.remainingTime || 0;
    }

    /**
     * Clear all cooldowns
     */
    clear(): void {
        this.cooldowns.clear();
    }

    /**
     * Get collision key for body pair
     */
    private getCollisionKey(bodyAId: string, bodyBId: string): string {
        // Ensure consistent ordering regardless of parameter order
        const [id1, id2] = [bodyAId, bodyBId].sort();
        return `${id1}-${id2}`;
    }

    /**
     * Get statistics about cooldown system
     */
    getStats(): {
        activeCooldowns: number;
        totalCollisionsTracked: number;
        averageCooldownTime: number;
    } {
        const activeCooldowns = this.cooldowns.size;
        const totalCollisionsTracked = Array.from(this.cooldowns.values())
            .reduce((sum, state) => sum + (state.remainingTime > 0 ? 1 : 0), 0);

        const cooldownTimes = Array.from(this.cooldowns.values())
            .map(state => state.cooldownPeriod);
        const averageCooldownTime = cooldownTimes.length > 0
            ? cooldownTimes.reduce((sum, time) => sum + time, 0) / cooldownTimes.length
            : 0;

        const stats = {
            activeCooldowns,
            totalCollisionsTracked,
            averageCooldownTime,
        };

        physicsLogger.debug('Retrieved cooldown statistics', {
            component: 'CollisionCooldown',
            function: 'getStats',
            metadata: stats
        });

        return stats;
    }
}

/**
 * Calculate optimal cooldown period based on physics factors
 */
export function calculateOptimalCooldownPeriod(
    ballVelocity: number,
    pegSpacing: number,
    collisionCooldown: number,
    safetyFactor: number = 1.2
): number {
    // Time for ball to move past peg
    const timeToPassPeg = pegSpacing / ballVelocity;

    // Cooldown should be slightly longer than time to pass
    const optimalCooldown = timeToPassPeg * safetyFactor;

    // Clamp to reasonable bounds
    const clampedCooldown = Math.max(50, Math.min(200, optimalCooldown));

    physicsLogger.debug('Calculated optimal cooldown period', {
        component: 'CollisionCooldown',
        function: 'calculateOptimalCooldownPeriod',
        metadata: {
            ballVelocity: ballVelocity.toFixed(2),
            pegSpacing: pegSpacing.toFixed(2),
            collisionCooldown,
            safetyFactor,
            timeToPassPeg: timeToPassPeg.toFixed(2) + 'ms',
            optimalCooldown: optimalCooldown.toFixed(2) + 'ms',
            clampedCooldown: clampedCooldown + 'ms'
        }
    });

    return clampedCooldown;
}

/**
 * Adaptive cooldown system that adjusts based on collision frequency
 */
export class AdaptiveCooldownSystem {
    private collisionHistory: number[] = [];
    private historySize = 100;
    private baseCooldownPeriod: number;
    private adaptationRate = 0.1;

    constructor(baseCooldownPeriod: number) {
        this.baseCooldownPeriod = baseCooldownPeriod;
    }

    /**
     * Record a collision event
     */
    recordCollision(): void {
        const now = Date.now();
        this.collisionHistory.push(now);

        // Keep only recent history
        if (this.collisionHistory.length > this.historySize) {
            this.collisionHistory = this.collisionHistory.slice(-this.historySize);
        }
    }

    /**
     * Get adaptive cooldown period
     */
    getAdaptiveCooldownPeriod(): number {
        if (this.collisionHistory.length < 10) {
            return this.baseCooldownPeriod; // Not enough data, use base
        }

        const now = Date.now();
        const recentCollisions = this.collisionHistory.filter(
            time => now - time < 1000 // Last second
        );

        const collisionRate = recentCollisions.length;

        // Adjust cooldown based on collision rate
        let adaptiveCooldown = this.baseCooldownPeriod;

        if (collisionRate > 50) {
            // Too many collisions, increase cooldown
            adaptiveCooldown *= (1 + this.adaptationRate);
        } else if (collisionRate < 10) {
            // Too few collisions, decrease cooldown
            adaptiveCooldown *= (1 - this.adaptationRate * 0.5);
        }

        // Clamp to reasonable bounds
        return Math.max(30, Math.min(300, adaptiveCooldown));
    }

    /**
     * Get collision statistics
     */
    getCollisionStats(): {
        totalCollisions: number;
        collisionsPerSecond: number;
        currentCooldownPeriod: number;
    } {
        const now = Date.now();
        const recentCollisions = this.collisionHistory.filter(
            time => now - time < 1000
        );

        return {
            totalCollisions: this.collisionHistory.length,
            collisionsPerSecond: recentCollisions.length,
            currentCooldownPeriod: this.getAdaptiveCooldownPeriod(),
        };
    }
}

/**
 * Cooldown configuration for different collision types
 */
export interface CooldownConfig {
    ballPeg: number;
    ballWall: number;
    ballMultiplier: number;
    pegPeg: number;
}

/**
 * Default cooldown configuration
 */
export const DEFAULT_COOLDOWN_CONFIG: CooldownConfig = {
    ballPeg: 80,
    ballWall: 50,
    ballMultiplier: 100,
    pegPeg: 0, // Pegs don't collide with each other
};

/**
 * Validate cooldown configuration
 */
export function validateCooldownConfig(config: CooldownConfig): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (config.ballPeg < 30 || config.ballPeg > 200) {
        errors.push('ballPeg cooldown must be between 30-200ms');
    }

    if (config.ballWall < 20 || config.ballWall > 100) {
        errors.push('ballWall cooldown must be between 20-100ms');
    }

    if (config.ballMultiplier < 50 || config.ballMultiplier > 300) {
        errors.push('ballMultiplier cooldown must be between 50-300ms');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Optimize cooldown configuration for performance
 */
export function optimizeCooldownConfigForPerformance(
    config: CooldownConfig,
    targetFrameRate: number = 60,
    maxCollisionsPerFrame: number = 100
): CooldownConfig {
    const frameTime = 1000 / targetFrameRate;

    // Increase cooldowns if too many collisions per frame
    const optimizationFactor = Math.max(1, maxCollisionsPerFrame / 50);

    return {
        ballPeg: Math.min(200, config.ballPeg * optimizationFactor),
        ballWall: Math.min(100, config.ballWall * optimizationFactor),
        ballMultiplier: Math.min(300, config.ballMultiplier * optimizationFactor),
        pegPeg: config.pegPeg,
    };
}
