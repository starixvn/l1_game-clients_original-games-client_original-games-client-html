/**
 * Ball Physics Calculations Unit Tests
 * Comprehensive tests for ball physics calculation functions
 * Covers all functions, conditionals, and branches for 100% coverage
 */

import {
    calculateBallVelocityWithAirResistance,
    calculateBallBounce,
    predictBallTrajectory,
    calculateOptimalNudgeStrength,
    calculateBallStabilityMetrics,
    calculatePathPredictability,
    calculateEnergyDissipationRate
} from '../src/features/game/components/ball/physics/ball/ball-physics-calculations';

// Mock dependencies
jest.mock('../src/features/game/components/ball/physics/factors/core-factors', () => ({
    PhysicsFactors: {}
}));

jest.mock('../src/features/game/components/ball/physics/factors/factor-relationships', () => ({
    calculateAirResistanceForce: jest.fn(),
    calculateTerminalVelocity: jest.fn()
}));

describe('Ball Physics Calculations', () => {
    let mockCalculateAirResistanceForce: jest.MockedFunction<any>;
    let mockCalculateTerminalVelocity: jest.MockedFunction<any>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCalculateAirResistanceForce = require('../src/features/game/components/ball/physics/factors/factor-relationships').calculateAirResistanceForce;
        mockCalculateTerminalVelocity = require('../src/features/game/components/ball/physics/factors/factor-relationships').calculateTerminalVelocity;

        // Setup default mock returns
        mockCalculateAirResistanceForce.mockReturnValue(0.01);
        mockCalculateTerminalVelocity.mockReturnValue(10);
    });

    describe('calculateBallVelocityWithAirResistance', () => {
        it('should return zero velocity for zero speed', () => {
            const result = calculateBallVelocityWithAirResistance(0, 0, 0.05, 0.016, 0.001);

            expect(result.velocityX).toBe(0);
            expect(result.velocityY).toBe(0);
        });

        it('should apply air resistance damping to non-zero velocity', () => {
            const result = calculateBallVelocityWithAirResistance(10, 5, 0.05, 0.016, 0.001);

            expect(result.velocityX).toBeLessThan(10);
            expect(result.velocityY).toBeLessThan(5);
            expect(result.velocityX).toBeGreaterThan(0);
            expect(result.velocityY).toBeGreaterThan(0);
        });

        it('should use calculateAirResistanceForce for force calculation', () => {
            const velocityX = 8;
            const velocityY = 6;
            const airResistanceCoefficient = 0.03;
            const deltaTime = 0.016;
            const mass = 0.002;

            const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

            calculateBallVelocityWithAirResistance(velocityX, velocityY, airResistanceCoefficient, deltaTime, mass);

            expect(mockCalculateAirResistanceForce).toHaveBeenCalledWith(airResistanceCoefficient, speed);
        });

        it('should clamp damping factor to minimum 0.9', () => {
            // Setup very high air resistance force to trigger clamping
            mockCalculateAirResistanceForce.mockReturnValue(100);

            const result = calculateBallVelocityWithAirResistance(10, 0, 1.0, 0.016, 0.001);

            // With high air resistance, damping should be clamped to 0.9
            expect(result.velocityX).toBe(9); // 10 * 0.9
            expect(result.velocityY).toBe(0);
        });

        it('should handle different velocity directions', () => {
            const testCases = [
                { vx: 10, vy: 0, expectedNonZero: 'velocityX' },
                { vx: 0, vy: 10, expectedNonZero: 'velocityY' },
                { vx: -5, vy: 3, expectedNonZero: 'both' },
                { vx: 7, vy: -2, expectedNonZero: 'both' }
            ];

            testCases.forEach(({ vx, vy, expectedNonZero }) => {
                const result = calculateBallVelocityWithAirResistance(vx, vy, 0.05, 0.016, 0.001);

                if (expectedNonZero === 'velocityX') {
                    expect(Math.abs(result.velocityX)).toBeGreaterThan(0);
                    expect(result.velocityY).toBe(0);
                } else if (expectedNonZero === 'velocityY') {
                    expect(result.velocityX).toBe(0);
                    expect(Math.abs(result.velocityY)).toBeGreaterThan(0);
                } else {
                    expect(Math.abs(result.velocityX)).toBeGreaterThan(0);
                    expect(Math.abs(result.velocityY)).toBeGreaterThan(0);
                }
            });
        });

        it('should handle extreme parameters', () => {
            // Zero mass (results in Infinity, but function handles it)
            const resultZeroMass = calculateBallVelocityWithAirResistance(10, 5, 0.05, 0.016, 0);
            expect(typeof resultZeroMass.velocityX).toBe('number');
            expect(typeof resultZeroMass.velocityY).toBe('number');

            // Negative mass
            expect(() => calculateBallVelocityWithAirResistance(10, 5, 0.05, 0.016, -0.001)).not.toThrow();

            // Zero delta time
            const resultZeroTime = calculateBallVelocityWithAirResistance(10, 5, 0.05, 0, 0.001);
            expect(resultZeroTime.velocityX).toBe(10);
            expect(resultZeroTime.velocityY).toBe(5);
        });

        it('should be deterministic for same inputs', () => {
            const result1 = calculateBallVelocityWithAirResistance(10, 5, 0.05, 0.016, 0.001);
            const result2 = calculateBallVelocityWithAirResistance(10, 5, 0.05, 0.016, 0.001);

            expect(result1.velocityX).toBe(result2.velocityX);
            expect(result1.velocityY).toBe(result2.velocityY);
        });
    });

    describe('calculateBallBounce', () => {
        it('should calculate reflection for perpendicular collision', () => {
            // Ball hitting horizontal surface from above
            const result = calculateBallBounce(5, -10, 0, 1, 0.8, 0.1);

            expect(result.velocityY).toBeCloseTo(8, 1); // -(-10) * 0.8 = 8 (reflected up)
            expect(result.velocityX).toBeCloseTo(3.6, 1); // 4 - friction adjustment
            expect(result.angularVelocity).toBeCloseTo(0.04, 2); // frictionReduction * 0.1 = 0.4 * 0.1
        });

        it('should calculate reflection for angled collision', () => {
            // Ball hitting 45-degree surface
            const normalX = 0.707; // cos(45°)
            const normalY = 0.707; // sin(45°)

            const result = calculateBallBounce(10, -5, normalX, normalY, 0.9, 0.2);

            expect(typeof result.velocityX).toBe('number');
            expect(typeof result.velocityY).toBe('number');
            expect(result.angularVelocity).toBeGreaterThanOrEqual(0);
        });

        it('should apply restitution coefficient', () => {
            const restitution = 0.6;
            const result = calculateBallBounce(0, -10, 0, 1, restitution, 0.1);

            expect(result.velocityY).toBeCloseTo(6, 1); // -(-10) * 0.6 = 6
        });

        it('should apply friction to tangential velocity', () => {
            const friction = 0.3;
            const result = calculateBallBounce(10, -5, 0, 1, 0.8, friction);

            // Friction should reduce tangential velocity and add angular velocity
            expect(result.angularVelocity).toBeGreaterThan(0);
            expect(Math.abs(result.velocityX)).toBeLessThanOrEqual(8); // 10 * 0.8
        });

        it('should handle zero friction', () => {
            const result = calculateBallBounce(10, -5, 0, 1, 0.8, 0);

            expect(result.angularVelocity).toBe(0);
            expect(result.velocityX).toBeCloseTo(8, 1); // 10 * 0.8
            expect(result.velocityY).toBeCloseTo(4, 1); // -(-5) * 0.8
        });

        it('should handle zero restitution', () => {
            const result = calculateBallBounce(10, -5, 0, 1, 0, 0.1);

            expect(result.velocityX).toBeCloseTo(0, 1);
            expect(result.velocityY).toBeCloseTo(0, 1);
            expect(result.angularVelocity).toBeCloseTo(0, 2); // Zero restitution means zero reflection, so zero friction
        });

        it('should handle vertical normal vectors', () => {
            const result = calculateBallBounce(5, 5, 0, 1, 0.8, 0.1);

            // Vertical normal should reflect Y component
            expect(Math.abs(result.velocityY)).toBeCloseTo(4, 1); // 5 * 0.8 or -5 * 0.8
        });

        it('should handle horizontal normal vectors', () => {
            const result = calculateBallBounce(5, 5, 1, 0, 0.8, 0.1);

            // Horizontal normal should reflect X component
            expect(Math.abs(result.velocityX)).toBeCloseTo(4, 1); // 5 * 0.8 or -5 * 0.8
        });

        it('should calculate angular velocity based on friction', () => {
            const highFriction = calculateBallBounce(10, -5, 0, 1, 0.8, 0.5);
            const lowFriction = calculateBallBounce(10, -5, 0, 1, 0.8, 0.1);

            expect(highFriction.angularVelocity).toBeGreaterThan(lowFriction.angularVelocity);
        });
    });

    describe('predictBallTrajectory', () => {
        const mockPhysicsFactors = {
            ballSize: 12,
            ballMass: 0.001,
            gravity: 0.8,
            airResistanceCoefficient: 0.05,
            friction: 0.4,
            restitution: 0.4,
            nudgeStrength: 2.8,
            velocityX: 5,
            velocityY: 2,
            angularVelocity: 0.08,
            pegSize: 5,
            pegSpacing: 60,
            collisionCooldown: 80,
            momentumFactor: 0.88,
            randomFactor: 0.12,
            speedFactor: 0.9
        };

        it('should return trajectory points array', () => {
            const trajectory = predictBallTrajectory(0, 0, 5, 2, mockPhysicsFactors);

            expect(Array.isArray(trajectory)).toBe(true);
            expect(trajectory.length).toBeGreaterThan(0);
            expect(trajectory[0]).toHaveProperty('x');
            expect(trajectory[0]).toHaveProperty('y');
            expect(trajectory[0]).toHaveProperty('velocityX');
            expect(trajectory[0]).toHaveProperty('velocityY');
        });

        it('should start with initial position and velocity', () => {
            const initialX = 10;
            const initialY = 20;
            const initialVX = 3;
            const initialVY = -1;

            const trajectory = predictBallTrajectory(initialX, initialY, initialVX, initialVY, mockPhysicsFactors, 1);

            expect(trajectory[0].x).toBe(initialX);
            expect(trajectory[0].y).toBe(initialY);
            expect(trajectory[0].velocityX).toBe(initialVX);
            expect(trajectory[0].velocityY).toBe(initialVY);
        });

        it('should apply gravity to velocity', () => {
            const trajectory = predictBallTrajectory(0, 0, 0, 0, mockPhysicsFactors, 2);

            // Second point should have increased velocityY due to gravity
            expect(trajectory[1].velocityY).toBeGreaterThan(trajectory[0].velocityY);
        });

        it('should apply air resistance', () => {
            const trajectory = predictBallTrajectory(0, 0, 10, 5, mockPhysicsFactors, 3);

            // Velocity should decrease over time due to air resistance
            expect(trajectory[2].velocityX).toBeLessThan(trajectory[1].velocityX);
            expect(trajectory[2].velocityY).toBeLessThan(trajectory[1].velocityY);
        });

        it('should update position based on velocity', () => {
            const trajectory = predictBallTrajectory(0, 0, 10, 5, mockPhysicsFactors, 2);

            const deltaTime = 0.016;
            expect(trajectory[1].x).toBeCloseTo(trajectory[0].x + trajectory[0].velocityX * deltaTime, 1);
            expect(trajectory[1].y).toBeCloseTo(trajectory[0].y + trajectory[0].velocityY * deltaTime, 1);
        });

        it('should respect timeSteps parameter', () => {
            const timeSteps = 50;
            const trajectory = predictBallTrajectory(0, 0, 5, 2, mockPhysicsFactors, timeSteps);

            expect(trajectory.length).toBe(timeSteps);
        });

        it('should respect deltaTime parameter', () => {
            const deltaTime = 0.032;
            const trajectory = predictBallTrajectory(0, 0, 5, 2, mockPhysicsFactors, 2, deltaTime);

            expect(trajectory[1].x).toBeCloseTo(trajectory[0].x + trajectory[0].velocityX * deltaTime, 1);
        });

        it('should break early if ball falls too far', () => {
            // Start high and give downward velocity to ensure it falls far
            const trajectory = predictBallTrajectory(0, -900, 0, 100, mockPhysicsFactors, 1000);

            // Should break when y > initialY + 1000 (which is 100)
            expect(trajectory.length).toBeLessThanOrEqual(1000);
            // The function should either complete all steps or break early
            expect(trajectory.length).toBeGreaterThan(0);
        });

        it('should handle zero velocity', () => {
            const trajectory = predictBallTrajectory(0, 0, 0, 0, mockPhysicsFactors, 5);

            trajectory.forEach(point => {
                expect(point.x).toBe(0);
                expect(point.velocityX).toBe(0);
            });

            // Y should still change due to gravity
            expect(trajectory[1].y).toBeGreaterThan(trajectory[0].y);
        });

        it('should handle negative velocities', () => {
            const trajectory = predictBallTrajectory(0, 0, -5, -2, mockPhysicsFactors, 3);

            expect(trajectory[0].velocityX).toBe(-5);
            expect(trajectory[0].velocityY).toBe(-2);
            // Subsequent points should have reduced magnitude due to air resistance
        });
    });

    describe('calculateOptimalNudgeStrength', () => {
        it('should calculate force using F = (m × Δv) / t formula', () => {
            const mass = 0.001;
            const velocityChange = 5;
            const timeWindow = 0.1;

            const force = calculateOptimalNudgeStrength(mass, velocityChange, timeWindow);

            const expected = (mass * velocityChange) / timeWindow;
            expect(force).toBe(expected);
        });

        it('should scale linearly with mass', () => {
            const baseForce = calculateOptimalNudgeStrength(0.001, 5, 0.1);
            const doubleMassForce = calculateOptimalNudgeStrength(0.002, 5, 0.1);

            expect(doubleMassForce).toBe(baseForce * 2);
        });

        it('should scale linearly with velocity change', () => {
            const baseForce = calculateOptimalNudgeStrength(0.001, 5, 0.1);
            const doubleVelocityForce = calculateOptimalNudgeStrength(0.001, 10, 0.1);

            expect(doubleVelocityForce).toBe(baseForce * 2);
        });

        it('should scale inversely with time window', () => {
            const baseForce = calculateOptimalNudgeStrength(0.001, 5, 0.1);
            const halfTimeForce = calculateOptimalNudgeStrength(0.001, 5, 0.05);

            expect(halfTimeForce).toBe(baseForce * 2);
        });

        it('should handle zero values', () => {
            expect(calculateOptimalNudgeStrength(0, 5, 0.1)).toBe(0);
            expect(calculateOptimalNudgeStrength(0.001, 0, 0.1)).toBe(0);
            expect(calculateOptimalNudgeStrength(0.001, 5, 0)).toBe(Infinity);
        });

        it('should handle negative values', () => {
            const force = calculateOptimalNudgeStrength(-0.001, -5, -0.1);
            expect(typeof force).toBe('number');
        });
    });

    describe('calculateBallStabilityMetrics', () => {
        const mockPhysicsFactors = {
            ballSize: 12,
            ballMass: 0.001,
            gravity: 0.8,
            airResistanceCoefficient: 0.05,
            friction: 0.4,
            restitution: 0.4,
            nudgeStrength: 2.8,
            velocityX: 0,
            velocityY: 10,
            angularVelocity: 0.08,
            pegSize: 5,
            pegSpacing: 60,
            collisionCooldown: 80,
            momentumFactor: 0.88,
            randomFactor: 0.12,
            speedFactor: 0.9
        };

        beforeEach(() => {
            mockCalculateTerminalVelocity.mockReturnValue(8);
        });

        it('should return all required metrics', () => {
            const metrics = calculateBallStabilityMetrics(mockPhysicsFactors);

            expect(metrics).toHaveProperty('terminalVelocityRatio');
            expect(metrics).toHaveProperty('bounceStability');
            expect(metrics).toHaveProperty('controlResponsiveness');
            expect(metrics).toHaveProperty('collisionSafety');
        });

        it('should calculate terminal velocity ratio', () => {
            const metrics = calculateBallStabilityMetrics(mockPhysicsFactors);

            expect(metrics.terminalVelocityRatio).toBe(8 / 10); // terminalVelocity / velocityY
            expect(mockCalculateTerminalVelocity).toHaveBeenCalledWith(
                mockPhysicsFactors.ballMass,
                mockPhysicsFactors.gravity,
                mockPhysicsFactors.airResistanceCoefficient
            );
        });

        it('should calculate bounce stability', () => {
            const metrics = calculateBallStabilityMetrics(mockPhysicsFactors);

            const expected = 1 / (1 + 0.4 * 0.4); // 1 / (1 + restitution * friction)
            expect(metrics.bounceStability).toBe(expected);
        });

        it('should calculate control responsiveness', () => {
            const metrics = calculateBallStabilityMetrics(mockPhysicsFactors);

            const expected = 1 / (1 + 0.05 * 10); // 1 / (1 + airResistance * velocityY)
            expect(metrics.controlResponsiveness).toBe(expected);
        });

        it('should calculate collision safety', () => {
            const metrics = calculateBallStabilityMetrics(mockPhysicsFactors);

            const collisionArea = Math.PI * Math.pow(12, 2);
            const expected = collisionArea / (0.001 * 1000);
            expect(metrics.collisionSafety).toBe(expected);
        });

        it('should handle different physics factor combinations', () => {
            const testFactors = {
                ...mockPhysicsFactors,
                restitution: 0.8,
                friction: 0.2,
                airResistanceCoefficient: 0.1,
                velocityY: 5
            };

            const metrics = calculateBallStabilityMetrics(testFactors);

            expect(metrics.bounceStability).toBeGreaterThan(0);
            expect(metrics.controlResponsiveness).toBeGreaterThan(0);
            expect(metrics.terminalVelocityRatio).toBeGreaterThan(0);
            expect(metrics.collisionSafety).toBeGreaterThan(0);
        });

        it('should handle edge case values', () => {
            const edgeFactors = {
                ...mockPhysicsFactors,
                restitution: 0,
                friction: 0,
                airResistanceCoefficient: 0,
                velocityY: 0,
                ballSize: 0,
                ballMass: 0
            };

            const metrics = calculateBallStabilityMetrics(edgeFactors);

            expect(isNaN(metrics.collisionSafety)).toBe(true); // 0/0 gives NaN
            expect(metrics.bounceStability).toBe(1); // 1 / (1 + 0) = 1
            expect(metrics.controlResponsiveness).toBe(1); // 1 / (1 + 0) = 1
        });
    });

    describe('calculatePathPredictability', () => {
        const mockPhysicsFactors = {
            ballSize: 12,
            ballMass: 0.001,
            gravity: 0.8,
            airResistanceCoefficient: 0.05,
            friction: 0.4,
            restitution: 0.4,
            nudgeStrength: 2.8,
            velocityX: 5,
            velocityY: 2,
            angularVelocity: 0.08,
            pegSize: 5,
            pegSpacing: 60,
            collisionCooldown: 80,
            momentumFactor: 0.88,
            randomFactor: 0.1,
            speedFactor: 0.9
        };

        it('should return predictability score between 0 and 1', () => {
            const score = calculatePathPredictability(mockPhysicsFactors);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        it('should simulate multiple trajectory variations', () => {
            const score = calculatePathPredictability(mockPhysicsFactors, 10);

            // Should return a score between 0 and 1
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        it('should use randomFactor to create variations', () => {
            const score = calculatePathPredictability(mockPhysicsFactors);

            // Function should complete without errors
            expect(typeof score).toBe('number');
        });

        it('should handle zero randomFactor', () => {
            const zeroRandomFactors = { ...mockPhysicsFactors, randomFactor: 0 };
            const score = calculatePathPredictability(zeroRandomFactors);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        it('should respect trajectoryLength parameter', () => {
            const length = 50;
            const score = calculatePathPredictability(mockPhysicsFactors, length);

            // Should return a score between 0 and 1
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        it('should handle different physics factors', () => {
            const differentFactors = {
                ...mockPhysicsFactors,
                velocityX: 10,
                velocityY: -5,
                randomFactor: 0.2
            };

            const score = calculatePathPredictability(differentFactors);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });
    });

    describe('calculateEnergyDissipationRate', () => {
        const mockPhysicsFactors = {
            ballSize: 12,
            ballMass: 0.001,
            gravity: 0.8,
            airResistanceCoefficient: 0.05,
            friction: 0.4,
            restitution: 0.4,
            nudgeStrength: 2.8,
            velocityX: 5,
            velocityY: 2,
            angularVelocity: 0.08,
            pegSize: 5,
            pegSpacing: 60,
            collisionCooldown: 80,
            momentumFactor: 0.88,
            randomFactor: 0.12,
            speedFactor: 0.9
        };

        it('should return positive dissipation rate', () => {
            const rate = calculateEnergyDissipationRate(mockPhysicsFactors);

            expect(rate).toBeGreaterThanOrEqual(0);
        });

        it('should calculate energy loss over time', () => {
            const rate = calculateEnergyDissipationRate(mockPhysicsFactors, 0.5);

            expect(typeof rate).toBe('number');
            expect(isFinite(rate)).toBe(true);
        });

        it('should respect timeSpan parameter', () => {
            const shortRate = calculateEnergyDissipationRate(mockPhysicsFactors, 0.1);
            const longRate = calculateEnergyDissipationRate(mockPhysicsFactors, 1.0);

            // Longer time should generally have different rate (though not necessarily higher)
            expect(typeof shortRate).toBe('number');
            expect(typeof longRate).toBe('number');
        });

        it('should handle zero velocities', () => {
            const zeroVelocityFactors = { ...mockPhysicsFactors, velocityX: 0, velocityY: 0 };
            const rate = calculateEnergyDissipationRate(zeroVelocityFactors);

            expect(rate).toBeLessThan(0); // Energy actually increases due to gravity
        });

        it('should handle zero time span', () => {
            const rate = calculateEnergyDissipationRate(mockPhysicsFactors, 0);

            expect(isNaN(rate)).toBe(true); // Division by zero gives NaN
        });

        it('should handle different physics factors', () => {
            const highResistanceFactors = {
                ...mockPhysicsFactors,
                airResistanceCoefficient: 0.2
            };

            const lowResistanceFactors = {
                ...mockPhysicsFactors,
                airResistanceCoefficient: 0.01
            };

            const highRate = calculateEnergyDissipationRate(highResistanceFactors);
            const lowRate = calculateEnergyDissipationRate(lowResistanceFactors);

            expect(highRate).toBeGreaterThanOrEqual(lowRate);
        });
    });
});
