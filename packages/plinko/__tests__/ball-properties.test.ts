/**
 * Ball Properties Unit Tests
 * Comprehensive tests for ball physics properties and calculations
 * Covers all functions, conditionals, and branches for 100% coverage
 */

import {
    calculateBallProperties,
    calculateBallMass,
    getBallPhysicsTweaks,
    calculateDynamicBallSize,
    calculateBallCollisionArea,
    calculateBallMomentOfInertia,
    getBallPhysicsConfig,
    DEFAULT_BALL_PROPERTIES,
    BALL_SIZE_CONSTRAINTS,
    BALL_PHYSICS_SCALING,
    BallPhysicsProperties,
    BallPhysicsTweaks
} from '../src/features/game/components/ball/physics/ball/ball-properties';

// Mock dependencies
jest.mock('../src/features/game/components/ball/physics/factors/core-factors', () => ({
    PhysicsFactors: {}
}));

jest.mock('../src/features/game/components/ball/physics/constants/ball-constants', () => ({
    BALL_CONSTANTS: {
        SIZE_CONSTRAINTS: {
            MIN_RADIUS: 4.5, // 9px diameter / 2
            MIN_ROWS: 5,
            MAX_ROWS: 20
        }
    }
}));

jest.mock('../src/features/game/components/ball/physics/performance/physics-logger', () => ({
    physicsLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

describe('Ball Properties', () => {
    let mockPhysicsLoggerDebug: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPhysicsLoggerDebug = require('../src/features/game/components/ball/physics/performance/physics-logger').physicsLogger.debug as jest.Mock;
    });

    describe('DEFAULT_BALL_PROPERTIES', () => {
        it('should have all required properties', () => {
            expect(DEFAULT_BALL_PROPERTIES).toHaveProperty('radius');
            expect(DEFAULT_BALL_PROPERTIES).toHaveProperty('mass');
            expect(DEFAULT_BALL_PROPERTIES).toHaveProperty('density');
            expect(DEFAULT_BALL_PROPERTIES).toHaveProperty('restitution');
            expect(DEFAULT_BALL_PROPERTIES).toHaveProperty('frictionAir');
            expect(DEFAULT_BALL_PROPERTIES).toHaveProperty('friction');
            expect(DEFAULT_BALL_PROPERTIES).toHaveProperty('frictionStatic');
        });

        it('should have reasonable default values', () => {
            expect(DEFAULT_BALL_PROPERTIES.radius).toBe(12);
            expect(DEFAULT_BALL_PROPERTIES.mass).toBe(0.001);
            expect(DEFAULT_BALL_PROPERTIES.density).toBe(1000);
            expect(DEFAULT_BALL_PROPERTIES.restitution).toBe(0.4);
            expect(DEFAULT_BALL_PROPERTIES.frictionAir).toBe(0.05);
            expect(DEFAULT_BALL_PROPERTIES.friction).toBe(0.4);
            expect(DEFAULT_BALL_PROPERTIES.frictionStatic).toBe(0.6);
        });

        it('should conform to BallPhysicsProperties interface', () => {
            const properties: BallPhysicsProperties = DEFAULT_BALL_PROPERTIES;
            expect(properties.radius).toBeDefined();
            expect(properties.restitution).toBeDefined();
        });
    });

    describe('BALL_SIZE_CONSTRAINTS', () => {
        it('should have all required properties', () => {
            expect(BALL_SIZE_CONSTRAINTS).toHaveProperty('MIN_RADIUS');
            expect(BALL_SIZE_CONSTRAINTS).toHaveProperty('MAX_RADIUS');
            expect(BALL_SIZE_CONSTRAINTS).toHaveProperty('MIN_ROWS');
            expect(BALL_SIZE_CONSTRAINTS).toHaveProperty('MAX_ROWS');
        });

        it('should have logical constraint relationships', () => {
            expect(BALL_SIZE_CONSTRAINTS.MIN_RADIUS).toBeLessThan(BALL_SIZE_CONSTRAINTS.MAX_RADIUS);
            expect(BALL_SIZE_CONSTRAINTS.MIN_ROWS).toBeLessThan(BALL_SIZE_CONSTRAINTS.MAX_ROWS);
        });

        it('should have reasonable constraint values', () => {
            expect(BALL_SIZE_CONSTRAINTS.MIN_RADIUS).toBe(4.5);
            expect(BALL_SIZE_CONSTRAINTS.MAX_RADIUS).toBe(17.5);
            expect(BALL_SIZE_CONSTRAINTS.MIN_ROWS).toBe(5);
            expect(BALL_SIZE_CONSTRAINTS.MAX_ROWS).toBe(20);
        });
    });

    describe('BALL_PHYSICS_SCALING', () => {
        it('should have all required scaling factors', () => {
            expect(BALL_PHYSICS_SCALING).toHaveProperty('restitutionScalingFactor');
            expect(BALL_PHYSICS_SCALING).toHaveProperty('frictionScalingFactor');
            expect(BALL_PHYSICS_SCALING).toHaveProperty('airResistanceScalingFactor');
            expect(BALL_PHYSICS_SCALING).toHaveProperty('densityScalingFactor');
        });

        it('should have reasonable scaling factor values', () => {
            expect(BALL_PHYSICS_SCALING.restitutionScalingFactor).toBe(0.1);
            expect(BALL_PHYSICS_SCALING.frictionScalingFactor).toBe(0.05);
            expect(BALL_PHYSICS_SCALING.airResistanceScalingFactor).toBe(0.3);
            expect(BALL_PHYSICS_SCALING.densityScalingFactor).toBe(0.0);
        });
    });

    describe('calculateBallProperties', () => {
        it('should calculate properties for standard radius', () => {
            const radius = 12;
            const properties = calculateBallProperties(radius);

            expect(properties.radius).toBe(12);
            expect(properties.mass).toBeGreaterThan(0);
            expect(properties.density).toBe(1000);
            expect(properties.restitution).toBe(0.4); // Same as default for sizeRatio = 1
            expect(properties.frictionAir).toBe(0.05); // Same as default for sizeRatio = 1
            expect(properties.friction).toBe(0.4); // Same as default for sizeRatio = 1
            expect(properties.frictionStatic).toBe(0.6); // Same as default for sizeRatio = 1
        });

        it('should scale properties for larger radius', () => {
            const largeRadius = 24; // 2x default
            const properties = calculateBallProperties(largeRadius);

            expect(properties.radius).toBe(24);
            expect(properties.restitution).toBeGreaterThan(0.4); // Should increase
            expect(properties.frictionAir).toBeGreaterThan(0.05); // Should increase
            expect(properties.friction).toBeGreaterThan(0.4); // Should increase
            expect(properties.frictionStatic).toBeGreaterThan(0.6); // Should increase
        });

        it('should scale properties for smaller radius', () => {
            const smallRadius = 6; // 0.5x default
            const properties = calculateBallProperties(smallRadius);

            expect(properties.radius).toBe(6);
            expect(properties.restitution).toBeLessThan(0.4); // Should decrease
            expect(properties.frictionAir).toBeLessThan(0.05); // Should decrease
            expect(properties.friction).toBeLessThan(0.4); // Should decrease
            expect(properties.frictionStatic).toBeLessThan(0.6); // Should decrease
        });

        it('should clamp restitution within bounds', () => {
            // Very large radius should clamp restitution
            const veryLargeRadius = 120;
            const properties = calculateBallProperties(veryLargeRadius);

            expect(properties.restitution).toBeLessThanOrEqual(0.9);
            expect(properties.restitution).toBeGreaterThanOrEqual(0.1);
        });

        it('should clamp frictionAir within bounds', () => {
            // Very small radius should clamp frictionAir
            const verySmallRadius = 1;
            const properties = calculateBallProperties(verySmallRadius);

            expect(properties.frictionAir).toBeGreaterThanOrEqual(0.01);
            expect(properties.frictionAir).toBeLessThanOrEqual(0.1);
        });

        it('should clamp friction within bounds', () => {
            // Very large radius should clamp friction
            const veryLargeRadius = 120;
            const properties = calculateBallProperties(veryLargeRadius);

            expect(properties.friction).toBeLessThanOrEqual(0.8);
            expect(properties.friction).toBeGreaterThanOrEqual(0.1);
        });

        it('should clamp frictionStatic within bounds', () => {
            // Very large radius should clamp frictionStatic
            const veryLargeRadius = 120;
            const properties = calculateBallProperties(veryLargeRadius);

            expect(properties.frictionStatic).toBeLessThanOrEqual(1.0);
            expect(properties.frictionStatic).toBeGreaterThanOrEqual(0.1);
        });

        it('should use provided base properties', () => {
            const customMass = 0.002;
            const customDensity = 2000;
            const baseProperties = { mass: customMass, density: customDensity };

            const properties = calculateBallProperties(12, baseProperties);

            expect(properties.mass).toBe(customMass);
            expect(properties.density).toBe(customDensity);
            expect(properties.radius).toBe(12);
        });

        it('should override calculated properties with base properties', () => {
            const baseProperties = {
                restitution: 0.8,
                frictionAir: 0.02,
                friction: 0.2,
                frictionStatic: 0.3
            };

            const properties = calculateBallProperties(12, baseProperties);

            expect(properties.restitution).toBe(0.8);
            expect(properties.frictionAir).toBe(0.02);
            expect(properties.friction).toBe(0.2);
            expect(properties.frictionStatic).toBe(0.3);
        });

        it('should log calculation details', () => {
            const radius = 15;
            calculateBallProperties(radius);

            expect(mockPhysicsLoggerDebug).toHaveBeenCalledWith('Calculating ball properties', expect.objectContaining({
                component: 'BallProperties',
                function: 'calculateBallProperties',
                metadata: expect.objectContaining({ radius: 15 })
            }));

            expect(mockPhysicsLoggerDebug).toHaveBeenCalledWith('Ball properties calculated successfully', expect.objectContaining({
                component: 'BallProperties',
                function: 'calculateBallProperties'
            }));
        });

        it('should handle zero radius', () => {
            const properties = calculateBallProperties(0);

            expect(properties.radius).toBe(0);
            expect(properties.mass).toBe(0); // Mass calculation should handle zero
        });

        it('should handle negative radius', () => {
            const properties = calculateBallProperties(-5);

            expect(properties.radius).toBe(-5);
            // Properties should still be calculated (though not physically meaningful)
            expect(typeof properties.restitution).toBe('number');
        });
    });

    describe('calculateBallMass', () => {
        it('should calculate mass for standard radius and density', () => {
            const radius = 12;
            const density = 1000;
            const mass = calculateBallMass(radius, density);

            // Formula: density × (4/3) × π × (radius/100)³
            const expectedMass = 1000 * (4 / 3) * Math.PI * Math.pow(12 / 100, 3);
            expect(mass).toBeCloseTo(expectedMass, 6);
        });

        it('should calculate mass for different radii', () => {
            const testCases = [
                { radius: 6, expected: calculateBallMass(6, 1000) },
                { radius: 12, expected: calculateBallMass(12, 1000) },
                { radius: 24, expected: calculateBallMass(24, 1000) }
            ];

            testCases.forEach(({ radius, expected }) => {
                const mass = calculateBallMass(radius);
                expect(mass).toBe(expected);
                expect(mass).toBeGreaterThan(0);
            });
        });

        it('should calculate mass for different densities', () => {
            const radius = 12;
            const densities = [500, 1000, 2000, 5000];

            densities.forEach(density => {
                const mass = calculateBallMass(radius, density);
                expect(mass).toBeGreaterThan(0);
                // Higher density should result in higher mass
                if (density > 500) {
                    const prevMass = calculateBallMass(radius, 500);
                    expect(mass).toBeGreaterThan(prevMass);
                }
            });
        });

        it('should use default density when not provided', () => {
            const radius = 12;
            const massWithDefault = calculateBallMass(radius);
            const massWithExplicit = calculateBallMass(radius, 1000);

            expect(massWithDefault).toBe(massWithExplicit);
        });

        it('should handle zero radius', () => {
            const mass = calculateBallMass(0);
            expect(mass).toBe(0);
        });

        it('should handle zero density', () => {
            const mass = calculateBallMass(12, 0);
            expect(mass).toBe(0);
        });

        it('should handle negative values', () => {
            const mass = calculateBallMass(-12, -1000);
            expect(typeof mass).toBe('number');
            // Should still compute (though not physically meaningful)
        });
    });

    describe('getBallPhysicsTweaks', () => {
        it('should return physics tweaks for radius', () => {
            const radius = 15;
            const tweaks = getBallPhysicsTweaks(radius);

            expect(tweaks).toHaveProperty('restitution');
            expect(tweaks).toHaveProperty('frictionAir');
            expect(tweaks).toHaveProperty('density');
            expect(tweaks).toHaveProperty('friction');
            expect(tweaks).toHaveProperty('frictionStatic');
        });

        it('should return BallPhysicsTweaks interface compliant object', () => {
            const tweaks: BallPhysicsTweaks = getBallPhysicsTweaks(12);

            expect(typeof tweaks.restitution).toBe('number');
            expect(typeof tweaks.frictionAir).toBe('number');
            expect(typeof tweaks.density).toBe('number');
            expect(typeof tweaks.friction).toBe('number');
            expect(typeof tweaks.frictionStatic).toBe('number');
        });

        it('should calculate tweaks based on radius', () => {
            const smallRadius = 6;
            const largeRadius = 24;

            const smallTweaks = getBallPhysicsTweaks(smallRadius);
            const largeTweaks = getBallPhysicsTweaks(largeRadius);

            expect(largeTweaks.restitution).toBeGreaterThan(smallTweaks.restitution);
            expect(largeTweaks.frictionAir).toBeGreaterThan(smallTweaks.frictionAir);
            expect(largeTweaks.friction).toBeGreaterThan(smallTweaks.friction);
            expect(largeTweaks.frictionStatic).toBeGreaterThan(smallTweaks.frictionStatic);
        });

        it('should log tweak calculation', () => {
            const radius = 18;
            getBallPhysicsTweaks(radius);

            expect(mockPhysicsLoggerDebug).toHaveBeenCalledWith('Getting ball physics tweaks', expect.objectContaining({
                component: 'BallProperties',
                function: 'getBallPhysicsTweaks',
                metadata: { radius: 18 }
            }));

            expect(mockPhysicsLoggerDebug).toHaveBeenCalledWith('Ball physics tweaks calculated', expect.objectContaining({
                component: 'BallProperties',
                function: 'getBallPhysicsTweaks'
            }));
        });

        it('should handle edge case radii', () => {
            const edgeCases = [0, 1, 100];

            edgeCases.forEach(radius => {
                const tweaks = getBallPhysicsTweaks(radius);
                expect(typeof tweaks.restitution).toBe('number');
                expect(typeof tweaks.frictionAir).toBe('number');
                expect(typeof tweaks.density).toBe('number');
                expect(typeof tweaks.friction).toBe('number');
                expect(typeof tweaks.frictionStatic).toBe('number');
            });
        });
    });

    describe('calculateDynamicBallSize', () => {
        it('should calculate size for standard rows', () => {
            const rows = 10;
            const size = calculateDynamicBallSize(rows);

            expect(size).toBe(12); // baseRadius for baseRows
        });

        it('should scale inversely with rows', () => {
            const smallRows = 5;
            const largeRows = 20;

            const smallSize = calculateDynamicBallSize(smallRows);
            const largeSize = calculateDynamicBallSize(largeRows);

            expect(smallSize).toBeGreaterThan(largeSize);
        });

        it('should clamp rows within constraints', () => {
            const tooSmallRows = 1;
            const tooLargeRows = 100;

            const clampedSmall = calculateDynamicBallSize(tooSmallRows);
            const clampedLarge = calculateDynamicBallSize(tooLargeRows);

            // Both should be clamped to valid ranges
            expect(clampedSmall).toBeGreaterThan(0);
            expect(clampedLarge).toBeGreaterThan(0);
        });

        it('should apply canvas scale factor', () => {
            const rows = 20; // Use larger rows so scaling doesn't hit bounds
            const scaleFactor = 1.5;

            const normalSize = calculateDynamicBallSize(rows, 10, 12, 1);
            const scaledSize = calculateDynamicBallSize(rows, 10, 12, scaleFactor);

            expect(scaledSize).toBe(normalSize * scaleFactor);
        });

        it('should clamp final radius within bounds', () => {
            // Very small rows with large scale factor should be clamped to MAX_RADIUS
            const clampedLarge = calculateDynamicBallSize(1, 10, 12, 10);
            expect(clampedLarge).toBeLessThanOrEqual(BALL_SIZE_CONSTRAINTS.MAX_RADIUS);

            // Very large rows with small scale factor should be clamped to MIN_RADIUS
            const clampedSmall = calculateDynamicBallSize(100, 10, 12, 0.1);
            expect(clampedSmall).toBeGreaterThanOrEqual(BALL_SIZE_CONSTRAINTS.MIN_RADIUS);
        });

        it('should use provided parameters', () => {
            const rows = 8;
            const baseRows = 12;
            const baseRadius = 15;
            const canvasScale = 1.2;

            const size = calculateDynamicBallSize(rows, baseRows, baseRadius, canvasScale);
            const expected = (baseRadius / (rows / baseRows)) * canvasScale;
            const clamped = Math.max(BALL_SIZE_CONSTRAINTS.MIN_RADIUS,
                Math.min(BALL_SIZE_CONSTRAINTS.MAX_RADIUS, expected));

            expect(size).toBe(clamped);
        });

        it('should log calculation details', () => {
            const rows = 15;
            calculateDynamicBallSize(rows);

            expect(mockPhysicsLoggerDebug).toHaveBeenCalledWith('Calculating dynamic ball size', expect.objectContaining({
                component: 'BallProperties',
                function: 'calculateDynamicBallSize',
                metadata: expect.objectContaining({ rows: 15 })
            }));

            expect(mockPhysicsLoggerDebug).toHaveBeenCalledWith('Dynamic ball size calculated', expect.objectContaining({
                component: 'BallProperties',
                function: 'calculateDynamicBallSize'
            }));
        });

        it('should handle edge cases', () => {
            // Zero rows (will be clamped)
            const zeroRows = calculateDynamicBallSize(0);
            expect(zeroRows).toBeGreaterThan(0);

            // Negative rows (will be clamped)
            const negativeRows = calculateDynamicBallSize(-5);
            expect(negativeRows).toBeGreaterThan(0);

            // Zero canvas scale (gets clamped to MIN_RADIUS)
            const zeroScale = calculateDynamicBallSize(10, 10, 12, 0);
            expect(zeroScale).toBe(BALL_SIZE_CONSTRAINTS.MIN_RADIUS);

            // Negative canvas scale (gets clamped to MIN_RADIUS)
            const negativeScale = calculateDynamicBallSize(10, 10, 12, -1);
            expect(negativeScale).toBe(BALL_SIZE_CONSTRAINTS.MIN_RADIUS);
        });
    });

    describe('calculateBallCollisionArea', () => {
        it('should calculate area for standard radius', () => {
            const radius = 12;
            const area = calculateBallCollisionArea(radius);

            const expected = Math.PI * Math.pow(radius, 2);
            expect(area).toBe(expected);
        });

        it('should scale with radius squared', () => {
            const smallRadius = 6;
            const largeRadius = 24;

            const smallArea = calculateBallCollisionArea(smallRadius);
            const largeArea = calculateBallCollisionArea(largeRadius);

            // Large radius is 4x small radius, area should be 16x
            expect(largeArea).toBeCloseTo(smallArea * 16, 6);
        });

        it('should handle zero radius', () => {
            const area = calculateBallCollisionArea(0);
            expect(area).toBe(0);
        });

        it('should handle negative radius', () => {
            const area = calculateBallCollisionArea(-5);
            expect(area).toBe(Math.PI * 25); // Still calculates
        });
    });

    describe('calculateBallMomentOfInertia', () => {
        it('should calculate moment of inertia for standard values', () => {
            const mass = 0.001;
            const radius = 12;
            const inertia = calculateBallMomentOfInertia(mass, radius);

            const expected = (2 / 5) * mass * Math.pow(radius, 2);
            expect(inertia).toBe(expected);
        });

        it('should scale correctly with mass and radius', () => {
            const doubleMass = calculateBallMomentOfInertia(0.002, 12);
            const doubleRadius = calculateBallMomentOfInertia(0.001, 24);
            const normal = calculateBallMomentOfInertia(0.001, 12);

            expect(doubleMass).toBe(normal * 2); // 2x mass
            expect(doubleRadius).toBe(normal * 4); // (2x radius)² = 4x
        });

        it('should handle zero values', () => {
            expect(calculateBallMomentOfInertia(0, 12)).toBe(0);
            expect(calculateBallMomentOfInertia(0.001, 0)).toBe(0);
            expect(calculateBallMomentOfInertia(0, 0)).toBe(0);
        });

        it('should handle negative values', () => {
            const inertia = calculateBallMomentOfInertia(-0.001, -12);
            expect(typeof inertia).toBe('number');
        });
    });

    describe('getBallPhysicsConfig', () => {
        it('should return Matter.js compatible config', () => {
            const properties: BallPhysicsProperties = {
                radius: 12,
                mass: 0.001,
                density: 1000,
                restitution: 0.4,
                frictionAir: 0.05,
                friction: 0.4,
                frictionStatic: 0.6
            };

            const config = getBallPhysicsConfig(properties);

            expect(config).toHaveProperty('restitution', 0.4);
            expect(config).toHaveProperty('friction', 0.4);
            expect(config).toHaveProperty('frictionAir', 0.05);
            expect(config).toHaveProperty('frictionStatic', 0.6);
            expect(config).toHaveProperty('density', 1000);
            expect(config).toHaveProperty('collisionFilter');
        });

        it('should use default collision filter when not provided', () => {
            const properties: BallPhysicsProperties = {
                radius: 12,
                mass: 0.001,
                density: 1000,
                restitution: 0.4,
                frictionAir: 0.05,
                friction: 0.4,
                frictionStatic: 0.6
            };

            const config = getBallPhysicsConfig(properties);

            expect(config.collisionFilter).toEqual({
                group: 0,
                category: 0x0001,
                mask: 0xFFFFFFFF
            });
        });

        it('should use provided collision filter', () => {
            const customFilter = {
                group: 1,
                category: 0x0002,
                mask: 0x0000FFFF
            };

            const properties: BallPhysicsProperties = {
                radius: 12,
                mass: 0.001,
                density: 1000,
                restitution: 0.4,
                frictionAir: 0.05,
                friction: 0.4,
                frictionStatic: 0.6,
                collisionFilter: customFilter
            };

            const config = getBallPhysicsConfig(properties);

            expect(config.collisionFilter).toEqual(customFilter);
        });

        it('should handle minimal properties', () => {
            const minimalProperties: BallPhysicsProperties = {
                radius: 10,
                mass: 0.001,
                density: 1000,
                restitution: 0.5,
                frictionAir: 0.01,
                friction: 0.3,
                frictionStatic: 0.5
            };

            const config = getBallPhysicsConfig(minimalProperties);

            expect(config.restitution).toBe(0.5);
            expect(config.collisionFilter).toBeDefined();
        });
    });
});
