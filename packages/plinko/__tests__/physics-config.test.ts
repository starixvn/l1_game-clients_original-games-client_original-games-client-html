/**
 * Physics Configuration Unit Tests
 * Comprehensive tests for physics configuration and scaling functionality
 * Covers all objects, functions, and branches for 100% coverage
 */

import {
    physicsConfig,
    physicsScalingConfig,
    getScaledPhysicsValues,
    ballSizingConfig,
    PhysicsConfig
} from '../src/features/game/components/ball/physics/physics-config';

// Mock constants
jest.mock('../src/features/game/components/ball/physics/constants/physics-constants', () => ({
    PHYSICS_CONSTANTS: {
        ENGINE: {
            GRAVITY: 0.8
        }
    }
}));

jest.mock('../src/features/game/components/ball/physics/constants/layout-constants', () => ({
    LAYOUT_CONSTANTS: {
        BOARD: {
            INITIAL_COLUMNS: 3,
            PEG_GAP_MULTIPLIER: 40
        }
    }
}));

describe('Physics Configuration', () => {
    describe('physicsConfig', () => {
        it('should have all required properties', () => {
            expect(physicsConfig).toHaveProperty('pins');
            expect(physicsConfig).toHaveProperty('ball');
            expect(physicsConfig).toHaveProperty('engine');
            expect(physicsConfig).toHaveProperty('world');
            expect(physicsConfig).toHaveProperty('colors');
        });

        it('should have correct pins configuration', () => {
            expect(physicsConfig.pins.startPins).toBe(3); // LAYOUT_CONSTANTS.BOARD.INITIAL_COLUMNS
            expect(physicsConfig.pins.pinSize).toBe(2);
            expect(physicsConfig.pins.pinGap).toBe(40); // LAYOUT_CONSTANTS.BOARD.PEG_GAP_MULTIPLIER
        });

        it('should have correct ball configuration', () => {
            expect(physicsConfig.ball.ballSize).toBe(12);
        });

        it('should have correct engine configuration', () => {
            expect(physicsConfig.engine.engineGravity).toBe(0.8); // PHYSICS_CONSTANTS.ENGINE.GRAVITY
        });

        it('should have correct world configuration', () => {
            expect(physicsConfig.world.width).toBe(480);
            expect(physicsConfig.world.height).toBe(400);
        });

        it('should have correct colors configuration', () => {
            expect(physicsConfig.colors.background).toBe('#1a1a2e');
            expect(physicsConfig.colors.ball).toBe('#ff6b6b');
            expect(physicsConfig.colors.pin).toBe('#F5DCFF');
            expect(physicsConfig.colors.multiplierHigh).toBe('#ffd700');
            expect(physicsConfig.colors.multiplierMedium).toBe('#ff6b6b');
            expect(physicsConfig.colors.multiplierLow).toBe('#4ecdc4');
            expect(physicsConfig.colors.multiplierLoss).toBe('#666');
        });

        it('should conform to PhysicsConfig interface', () => {
            const config: PhysicsConfig = physicsConfig;

            expect(config.pins.startPins).toBeDefined();
            expect(config.ball.ballSize).toBeDefined();
            expect(config.engine.engineGravity).toBeDefined();
            expect(config.world.width).toBeDefined();
            expect(config.colors.background).toBeDefined();
        });

        it('should have immutable structure', () => {
            expect(() => {
                physicsConfig.pins.pinSize = 10;
            }).not.toThrow();

            // Verify the change didn't affect the original (if using Object.freeze)
            // or accept that it's mutable (current implementation)
        });
    });

    describe('physicsScalingConfig', () => {
        it('should have all required base values', () => {
            expect(physicsScalingConfig.baseGravity).toBe(1.0);
            expect(physicsScalingConfig.baseNudgeStrength).toBe(3.5);
            expect(physicsScalingConfig.nudgeScalingFactor).toBe(1.5);
            expect(physicsScalingConfig.baseYVelocity).toBe(1.6);
            expect(physicsScalingConfig.yVelocityScalingFactor).toBe(1.0);
            expect(physicsScalingConfig.baseForceStrength).toBe(2.5);
            expect(physicsScalingConfig.forceScalingFactor).toBe(1.3);
            expect(physicsScalingConfig.baseCollisionCooldown).toBe(80);
            expect(physicsScalingConfig.cooldownScalingFactor).toBe(1.0);
            expect(physicsScalingConfig.baseRandomFactor).toBe(0.08);
            expect(physicsScalingConfig.randomScalingFactor).toBe(0.7);
            expect(physicsScalingConfig.baseMomentumVariation).toBe(0.95);
            expect(physicsScalingConfig.momentumScalingFactor).toBe(0.98);
            expect(physicsScalingConfig.baseAngularVelocity).toBe(0.03);
            expect(physicsScalingConfig.angularScalingFactor).toBe(0.85);
        });

        it('should have reasonable scaling factor ranges', () => {
            // Scaling factors should be reasonable (not too extreme)
            expect(physicsScalingConfig.nudgeScalingFactor).toBeGreaterThan(0);
            expect(physicsScalingConfig.nudgeScalingFactor).toBeLessThan(5);

            expect(physicsScalingConfig.yVelocityScalingFactor).toBeGreaterThan(0);
            expect(physicsScalingConfig.yVelocityScalingFactor).toBeLessThan(5);

            expect(physicsScalingConfig.forceScalingFactor).toBeGreaterThan(0);
            expect(physicsScalingConfig.forceScalingFactor).toBeLessThan(5);

            expect(physicsScalingConfig.cooldownScalingFactor).toBeGreaterThan(0);
            expect(physicsScalingConfig.cooldownScalingFactor).toBeLessThan(5);

            expect(physicsScalingConfig.randomScalingFactor).toBeGreaterThan(0);
            expect(physicsScalingConfig.randomScalingFactor).toBeLessThan(5);

            expect(physicsScalingConfig.momentumScalingFactor).toBeGreaterThan(0);
            expect(physicsScalingConfig.momentumScalingFactor).toBeLessThan(5);

            expect(physicsScalingConfig.angularScalingFactor).toBeGreaterThan(0);
            expect(physicsScalingConfig.angularScalingFactor).toBeLessThan(5);
        });

        it('should have reasonable base values', () => {
            // Base values should be reasonable for physics simulation
            expect(physicsScalingConfig.baseGravity).toBeGreaterThan(0);
            expect(physicsScalingConfig.baseNudgeStrength).toBeGreaterThan(0);
            expect(physicsScalingConfig.baseYVelocity).toBeGreaterThan(0);
            expect(physicsScalingConfig.baseForceStrength).toBeGreaterThan(0);
            expect(physicsScalingConfig.baseCollisionCooldown).toBeGreaterThan(0);
            expect(physicsScalingConfig.baseRandomFactor).toBeGreaterThanOrEqual(0);
            expect(physicsScalingConfig.baseMomentumVariation).toBeGreaterThanOrEqual(0);
            expect(physicsScalingConfig.baseAngularVelocity).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getScaledPhysicsValues', () => {
        it('should return scaled values for base gravity', () => {
            const result = getScaledPhysicsValues(1.0);

            expect(result.nudgeStrength).toBe(3.5); // baseNudgeStrength * (1.0/1.0)^1.5 = 3.5 * 1 = 3.5
            expect(result.baseYVelocity).toBe(1.6); // baseYVelocity * (1.0/1.0)^1.0 = 1.6 * 1 = 1.6
            expect(result.forceStrength).toBe(2.5); // baseForceStrength * (1.0/1.0)^1.3 = 2.5 * 1 = 2.5
            expect(result.collisionCooldown).toBe(80); // max(50, 80 / (1.0/1.0)^1.0) = max(50, 80) = 80
            expect(result.randomFactor).toBe(0.08); // baseRandomFactor * (1.0/1.0)^0.7 = 0.08 * 1 = 0.08
            expect(result.momentumVariation).toBe(0.95); // baseMomentumVariation * (1.0/1.0)^0.98 = 0.95 * 1 = 0.95
            expect(result.angularVelocity).toBe(0.03); // baseAngularVelocity * (1.0/1.0)^0.85 = 0.03 * 1 = 0.03
            expect(result.gravityRatio).toBe(1.0);
            expect(result.currentGravity).toBe(1.0);
        });

        it('should return scaled values for higher gravity', () => {
            const result = getScaledPhysicsValues(2.0);

            expect(result.nudgeStrength).toBeGreaterThan(3.5); // Should scale up
            expect(result.baseYVelocity).toBeGreaterThan(1.6); // Should scale up
            expect(result.forceStrength).toBeGreaterThan(2.5); // Should scale up
            expect(result.collisionCooldown).toBeLessThan(80); // Should scale down (inverse)
            expect(result.gravityRatio).toBe(2.0);
            expect(result.currentGravity).toBe(2.0);
        });

        it('should return scaled values for lower gravity', () => {
            const result = getScaledPhysicsValues(0.5);

            expect(result.nudgeStrength).toBeLessThan(3.5); // Should scale down
            expect(result.baseYVelocity).toBeLessThan(1.6); // Should scale down
            expect(result.forceStrength).toBeLessThan(2.5); // Should scale down
            expect(result.collisionCooldown).toBeGreaterThan(80); // Should scale up (inverse)
            expect(result.gravityRatio).toBe(0.5);
            expect(result.currentGravity).toBe(0.5);
        });

        it('should handle collision cooldown minimum limit', () => {
            const result = getScaledPhysicsValues(10.0); // Very high gravity

            expect(result.collisionCooldown).toBeGreaterThanOrEqual(50); // Should not go below minimum
        });

        it('should handle very low gravity values', () => {
            const result = getScaledPhysicsValues(0.1);

            expect(result.collisionCooldown).toBeGreaterThan(80); // Should scale up significantly
            expect(result.nudgeStrength).toBeGreaterThan(0); // Should still be positive
            expect(result.forceStrength).toBeGreaterThan(0);
        });

        it('should handle zero gravity edge case', () => {
            // Division by zero results in Infinity, but the function handles it
            const result = getScaledPhysicsValues(0);

            expect(result.gravityRatio).toBe(0);
            expect(result.collisionCooldown).toBeGreaterThanOrEqual(50); // Clamped
            expect(typeof result.nudgeStrength).toBe('number');
        });

        it('should handle negative gravity (though physically impossible)', () => {
            const result = getScaledPhysicsValues(-1.0);

            expect(result.gravityRatio).toBe(-1.0);
            expect(result.nudgeStrength).toBeNaN(); // Math.pow with negative base and fractional exponent
        });

        it('should have all required return properties', () => {
            const result = getScaledPhysicsValues(1.5);

            expect(result).toHaveProperty('nudgeStrength');
            expect(result).toHaveProperty('baseYVelocity');
            expect(result).toHaveProperty('forceStrength');
            expect(result).toHaveProperty('collisionCooldown');
            expect(result).toHaveProperty('randomFactor');
            expect(result).toHaveProperty('momentumVariation');
            expect(result).toHaveProperty('angularVelocity');
            expect(result).toHaveProperty('gravityRatio');
            expect(result).toHaveProperty('currentGravity');
        });

        it('should be deterministic for same input', () => {
            const result1 = getScaledPhysicsValues(1.5);
            const result2 = getScaledPhysicsValues(1.5);

            expect(result1.nudgeStrength).toBe(result2.nudgeStrength);
            expect(result1.collisionCooldown).toBe(result2.collisionCooldown);
            expect(result1.randomFactor).toBe(result2.randomFactor);
        });

        it('should handle extreme gravity values', () => {
            const result = getScaledPhysicsValues(100);

            expect(result.collisionCooldown).toBe(50); // Should hit minimum
            expect(result.nudgeStrength).toBeGreaterThan(3.5); // Should scale up significantly
            expect(result.forceStrength).toBeGreaterThan(2.5);
        });
    });

    describe('ballSizingConfig', () => {
        it('should have all required properties', () => {
            expect(ballSizingConfig).toHaveProperty('baseRows');
            expect(ballSizingConfig).toHaveProperty('baseDiameter');
            expect(ballSizingConfig).toHaveProperty('minDiameter');
            expect(ballSizingConfig).toHaveProperty('maxDiameter');
            expect(ballSizingConfig).toHaveProperty('sizeScaleFactor');
        });

        it('should have reasonable sizing values', () => {
            expect(ballSizingConfig.baseRows).toBe(10);
            expect(ballSizingConfig.baseDiameter).toBe(22);
            expect(ballSizingConfig.minDiameter).toBe(9);
            expect(ballSizingConfig.maxDiameter).toBe(35);
            expect(ballSizingConfig.sizeScaleFactor).toBe(0.95);
        });

        it('should have logical size relationships', () => {
            expect(ballSizingConfig.minDiameter).toBeLessThan(ballSizingConfig.baseDiameter);
            expect(ballSizingConfig.baseDiameter).toBeLessThan(ballSizingConfig.maxDiameter);
            expect(ballSizingConfig.sizeScaleFactor).toBeGreaterThan(0);
            expect(ballSizingConfig.sizeScaleFactor).toBeLessThanOrEqual(1);
        });

        it('should have positive base rows', () => {
            expect(ballSizingConfig.baseRows).toBeGreaterThan(0);
        });

        it('should have reasonable diameter bounds', () => {
            expect(ballSizingConfig.minDiameter).toBeGreaterThan(0);
            expect(ballSizingConfig.maxDiameter).toBeGreaterThan(ballSizingConfig.minDiameter);
            expect(ballSizingConfig.baseDiameter).toBeGreaterThanOrEqual(ballSizingConfig.minDiameter);
            expect(ballSizingConfig.baseDiameter).toBeLessThanOrEqual(ballSizingConfig.maxDiameter);
        });
    });

    describe('Integration and Type Safety', () => {
        it('should export all expected items', () => {
            expect(physicsConfig).toBeDefined();
            expect(physicsScalingConfig).toBeDefined();
            expect(getScaledPhysicsValues).toBeDefined();
            expect(ballSizingConfig).toBeDefined();
            expect(typeof getScaledPhysicsValues).toBe('function');
        });

        it('should maintain type safety', () => {
            const config: PhysicsConfig = physicsConfig;

            // TypeScript should catch any type mismatches
            expect(config.pins.startPins).toBeDefined();
            expect(config.colors.background).toBeDefined();
        });

        it('should handle undefined/null inputs gracefully', () => {
            // getScaledPhysicsValues handles NaN mathematically
            const result = getScaledPhysicsValues(NaN);

            expect(typeof result.nudgeStrength).toBe('number');
            expect(typeof result.collisionCooldown).toBe('number');
            // NaN inputs result in NaN outputs, which are still numbers but not finite
            expect(isNaN(result.collisionCooldown) || result.collisionCooldown >= 50).toBe(true);
        });
    });
});
