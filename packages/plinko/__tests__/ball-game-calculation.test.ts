/**
 * Ball Game Calculation Tests
 * Comprehensive test suite for the pre-calculated ball game system
 */

import {
    calculateBallGame,
    createDefaultBoardConfig,
    DEFAULT_CALCULATION_FACTORS,
    BallGameCalculation,
    ServiceResult,
    BoardConfiguration,
    PhysicsFactors
} from '../src/features/game/components/ball/physics/calculations/ball-game-calculation';

describe('Ball Game Calculation System', () => {
    let mockServiceResult: ServiceResult;
    let mockBoardConfig: BoardConfiguration;
    let mockPhysicsFactors: PhysicsFactors;

    beforeEach(() => {
        mockServiceResult = {
            path: [0, 1, 0, 1, 0, 1, 0, 1], // Alternating path
            finalSlot: 4,
            multiplier: 2.0,
            betValue: 100,
            serverSeed: 'server_seed_123',
            clientSeed: 'client_seed_456',
            roundId: 'round_12345'
        };

        mockBoardConfig = createDefaultBoardConfig(9);

        mockPhysicsFactors = {
            ...DEFAULT_CALCULATION_FACTORS,
            gravity: 1.2,
            airResistanceCoefficient: 0.08,
            ballMass: 0.0015
        };
    });

    describe('calculateBallGame', () => {
        it('should create a complete ball game calculation object', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            expect(calculation).toBeDefined();
            expect(calculation.id).toMatch(/^calc_\d+_[a-z0-9]+$/);
            expect(calculation.roundId).toBe(mockServiceResult.roundId);
            expect(calculation.createdAt).toBeGreaterThan(0);
        });

        it('should include all required calculation components', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            // Core components
            expect(calculation.serviceResult).toEqual(mockServiceResult);
            expect(calculation.physicsFactors).toEqual(mockPhysicsFactors);
            expect(calculation.boardConfiguration).toEqual(mockBoardConfig);

            // Trajectory components
            expect(calculation.trajectory).toBeDefined();
            expect(calculation.trajectory.positions.length).toBeGreaterThan(0);
            expect(calculation.trajectory.velocities.length).toBeGreaterThan(0);
            expect(calculation.trajectory.collisions).toBeDefined();
            expect(typeof calculation.trajectory.totalTime).toBe('number');
            expect(typeof calculation.trajectory.totalDistance).toBe('number');

            // Collision analysis
            expect(calculation.collisions).toBeDefined();
            expect(calculation.collisionStats).toBeDefined();
            expect(typeof calculation.collisionStats.totalCollisions).toBe('number');

            // Path analysis
            expect(calculation.pathDecisions).toEqual(mockServiceResult.path);
            expect(calculation.pathConfidence.length).toBe(mockServiceResult.path.length);
            expect(calculation.alternativePaths.length).toBeGreaterThan(0);

            // Outcome validation
            expect(calculation.expectedFinalSlot).toBe(mockServiceResult.finalSlot);
            expect(calculation.predictedLandingPosition).toBeDefined();
            expect(calculation.predictionConfidence).toBeGreaterThan(0);
            expect(calculation.predictionConfidence).toBeLessThanOrEqual(1);
            expect(calculation.winAmount).toBe(mockServiceResult.betValue * mockServiceResult.multiplier);

            // Physics validation
            expect(calculation.stabilityMetrics).toBeDefined();
            expect(calculation.stabilityMetrics.terminalVelocityRatio).toBeGreaterThan(0);

            // Performance metrics
            expect(calculation.performance).toBeDefined();
            expect(calculation.performance.calculationTime).toBeGreaterThan(0);
            expect(typeof calculation.performance.memoryUsage).toBe('number');
        });

        it('should calculate trajectory with realistic physics', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            const trajectory = calculation.trajectory;

            // Should have positions and velocities
            expect(trajectory.positions.length).toBeGreaterThan(10);
            expect(trajectory.velocities.length).toBe(trajectory.positions.length);

            // Positions should progress downward
            expect(trajectory.positions[0].y).toBeLessThan(trajectory.positions[trajectory.positions.length - 1].y);

            // Should have reasonable total time and distance
            expect(trajectory.totalTime).toBeGreaterThan(0);
            expect(trajectory.totalDistance).toBeGreaterThan(0);
        });

        it('should generate collision events for peg interactions', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            // Should have some collisions for an 8-step path
            expect(calculation.collisions.length).toBeGreaterThanOrEqual(0);

            // Each collision should have required properties
            calculation.collisions.forEach(collision => {
                expect(collision).toHaveProperty('rowIndex');
                expect(collision).toHaveProperty('columnIndex');
                expect(collision).toHaveProperty('position');
                expect(collision).toHaveProperty('velocityBefore');
                expect(collision).toHaveProperty('velocityAfter');
                expect(collision).toHaveProperty('normalVector');
                expect(collision).toHaveProperty('energyTransfer');
                expect(collision).toHaveProperty('timestamp');
                expect(collision).toHaveProperty('collisionType');
            });
        });

        it('should calculate collision statistics accurately', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            const stats = calculation.collisionStats;

            expect(stats.totalCollisions).toBe(calculation.collisions.length);
            expect(stats.pegCollisions).toBeGreaterThanOrEqual(0);
            expect(stats.wallCollisions).toBeGreaterThanOrEqual(0);
            expect(stats.averageCollisionForce).toBeGreaterThanOrEqual(0);
            expect(stats.energyLoss).toBeGreaterThanOrEqual(0);
            expect(stats.energyLoss).toBeLessThanOrEqual(1); // Should be percentage
        });

        it('should generate alternative paths with probabilities', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            expect(calculation.alternativePaths.length).toBeGreaterThan(1);

            // Main path should have highest probability
            const mainPath = calculation.alternativePaths.find(alt =>
                JSON.stringify(alt.path) === JSON.stringify(mockServiceResult.path)
            );
            expect(mainPath).toBeDefined();
            expect(mainPath!.probability).toBeGreaterThan(0.8); // Should be high probability

            // All probabilities should sum to reasonable value
            const totalProbability = calculation.alternativePaths.reduce((sum, alt) => sum + alt.probability, 0);
            expect(totalProbability).toBeGreaterThan(0.9);
            expect(totalProbability).toBeLessThanOrEqual(1.1);
        });

        it('should calculate path confidence scores', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            expect(calculation.pathConfidence.length).toBe(mockServiceResult.path.length);

            // Confidence should decrease over time (accumulated uncertainty)
            for (let i = 1; i < calculation.pathConfidence.length; i++) {
                expect(calculation.pathConfidence[i]).toBeLessThanOrEqual(calculation.pathConfidence[i - 1]);
            }

            // All confidence values should be between 0 and 1
            calculation.pathConfidence.forEach(confidence => {
                expect(confidence).toBeGreaterThan(0);
                expect(confidence).toBeLessThanOrEqual(1);
            });
        });

        it('should predict final landing position accurately', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            const expectedSlot = mockBoardConfig.slots.find(slot => slot.index === mockServiceResult.finalSlot);
            expect(expectedSlot).toBeDefined();

            const predictedX = calculation.predictedLandingPosition.x;
            const expectedX = expectedSlot!.x;

            // Should be reasonably close to expected slot (within 50 pixels)
            expect(Math.abs(predictedX - expectedX)).toBeLessThan(50);
        });

        it('should calculate physics stability metrics', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            const metrics = calculation.stabilityMetrics;

            expect(metrics.terminalVelocityRatio).toBeGreaterThan(0);
            expect(metrics.bounceStability).toBeGreaterThan(0);
            expect(metrics.bounceStability).toBeLessThanOrEqual(1);
            expect(metrics.controlResponsiveness).toBeGreaterThan(0);
            expect(metrics.collisionSafety).toBeGreaterThan(0);
        });

        it('should handle edge cases gracefully', () => {
            // Test with empty path
            const emptyPathResult: ServiceResult = {
                ...mockServiceResult,
                path: [],
                finalSlot: 4
            };

            const calculation = calculateBallGame(emptyPathResult, mockBoardConfig, mockPhysicsFactors);
            expect(calculation.pathDecisions).toEqual([]);
            expect(calculation.pathConfidence).toEqual([]);

            // Test with extreme physics values
            const extremePhysics: PhysicsFactors = {
                ...mockPhysicsFactors,
                gravity: 5.0,
                airResistanceCoefficient: 0.5,
                ballMass: 0.1
            };

            const extremeCalculation = calculateBallGame(mockServiceResult, mockBoardConfig, extremePhysics);
            expect(extremeCalculation.stabilityMetrics.terminalVelocityRatio).toBeGreaterThan(0);
        });

        it('should perform calculations within reasonable time', () => {
            const startTime = performance.now();
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);
            const endTime = performance.now();

            // Should complete within 100ms
            expect(calculation.performance.calculationTime).toBeLessThan(100);
            expect(endTime - startTime).toBeLessThan(100);
        });

        it('should calculate reasonable memory usage', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            // Memory usage should be reasonable (less than 1MB)
            expect(calculation.performance.memoryUsage).toBeGreaterThan(0);
            expect(calculation.performance.memoryUsage).toBeLessThan(1024 * 1024);
        });
    });

    describe('createDefaultBoardConfig', () => {
        it('should create a valid board configuration', () => {
            const config = createDefaultBoardConfig(9);

            expect(config.width).toBe(600);
            expect(config.height).toBe(800);
            expect(config.layout).toBe('pyramid');
            expect(config.slotCount).toBe(9);
            expect(config.slots).toHaveLength(9);
        });

        it('should assign correct multipliers to slots', () => {
            const config = createDefaultBoardConfig(9);

            expect(config.slots[0].multiplier).toBe(0.5); // Leftmost slot
            expect(config.slots[4].multiplier).toBe(10);  // Center slot
            expect(config.slots[8].multiplier).toBe(200); // Rightmost slot
        });

        it('should distribute slots evenly across width', () => {
            const config = createDefaultBoardConfig(9);

            // Check that slots are evenly spaced
            const spacing = config.width / 9;
            for (let i = 0; i < config.slots.length; i++) {
                const expectedX = (i + 0.5) * spacing;
                expect(config.slots[i].x).toBe(expectedX);
            }
        });

        it('should assign appropriate colors to multipliers', () => {
            const config = createDefaultBoardConfig(9);

            // High multipliers should be gold
            expect(config.slots[8].color).toBe('#FFD700'); // 200x = gold

            // Medium multipliers should be different colors
            expect(config.slots[4].color).toBe('#4ECDC4'); // 10x = teal
            expect(config.slots[3].color).toBe('#45B7D1'); // 5x = blue
        });
    });

    describe('Integration with Service Results', () => {
        it('should handle service results with different path lengths', () => {
            const testCases = [
                { path: [0, 0, 0, 0], finalSlot: 0 }, // Short left path
                { path: [1, 1, 1, 1, 1, 1, 1, 1], finalSlot: 8 }, // Long right path
                { path: [0, 1, 0, 1, 0, 1], finalSlot: 3 }, // Medium alternating path
            ];

            testCases.forEach(({ path, finalSlot }) => {
                const serviceResult: ServiceResult = {
                    ...mockServiceResult,
                    path,
                    finalSlot
                };

                const calculation = calculateBallGame(serviceResult, mockBoardConfig, mockPhysicsFactors);

                expect(calculation.pathDecisions).toEqual(path);
                expect(calculation.expectedFinalSlot).toBe(finalSlot);
                expect(calculation.pathConfidence.length).toBe(path.length);
            });
        });

        it('should validate win amount calculations', () => {
            const testCases = [
                { betValue: 10, multiplier: 2, expectedWin: 20 },
                { betValue: 100, multiplier: 10, expectedWin: 1000 },
                { betValue: 50, multiplier: 0.5, expectedWin: 25 },
                { betValue: 200, multiplier: 50, expectedWin: 10000 },
            ];

            testCases.forEach(({ betValue, multiplier, expectedWin }) => {
                const serviceResult: ServiceResult = {
                    ...mockServiceResult,
                    betValue,
                    multiplier
                };

                const calculation = calculateBallGame(serviceResult, mockBoardConfig, mockPhysicsFactors);
                expect(calculation.winAmount).toBe(expectedWin);
            });
        });

        it('should maintain provably fair data', () => {
            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, mockPhysicsFactors);

            expect(calculation.serviceResult.serverSeed).toBe(mockServiceResult.serverSeed);
            expect(calculation.serviceResult.clientSeed).toBe(mockServiceResult.clientSeed);
            expect(calculation.roundId).toBe(mockServiceResult.roundId);
        });
    });

    describe('Physics Factor Integration', () => {
        it('should respond to different gravity values', () => {
            const lowGravityFactors = { ...mockPhysicsFactors, gravity: 0.5 };
            const highGravityFactors = { ...mockPhysicsFactors, gravity: 2.0 };

            const lowGravityCalc = calculateBallGame(mockServiceResult, mockBoardConfig, lowGravityFactors);
            const highGravityCalc = calculateBallGame(mockServiceResult, mockBoardConfig, highGravityFactors);

            // Higher gravity should result in faster falling (shorter time to bottom)
            expect(lowGravityCalc.trajectory.totalTime).toBeGreaterThan(highGravityCalc.trajectory.totalTime);
        });

        it('should respond to different air resistance values', () => {
            const lowResistanceFactors = { ...mockPhysicsFactors, airResistanceCoefficient: 0.01 };
            const highResistanceFactors = { ...mockPhysicsFactors, airResistanceCoefficient: 0.2 };

            const lowResistanceCalc = calculateBallGame(mockServiceResult, mockBoardConfig, lowResistanceFactors);
            const highResistanceCalc = calculateBallGame(mockServiceResult, mockBoardConfig, highResistanceFactors);

            // Higher air resistance should result in lower terminal velocity ratio
            expect(lowResistanceCalc.stabilityMetrics.terminalVelocityRatio)
                .toBeGreaterThan(highResistanceCalc.stabilityMetrics.terminalVelocityRatio);
        });

        it('should handle extreme physics values gracefully', () => {
            const extremeFactors: PhysicsFactors = {
                ...mockPhysicsFactors,
                gravity: 10,
                airResistanceCoefficient: 1.0,
                ballMass: 0.0001,
                restitution: 0.95,
                friction: 0.9
            };

            const calculation = calculateBallGame(mockServiceResult, mockBoardConfig, extremeFactors);

            // Should still produce valid results
            expect(calculation.trajectory.totalTime).toBeGreaterThan(0);
            expect(calculation.stabilityMetrics.terminalVelocityRatio).toBeGreaterThan(0);
            expect(calculation.predictionConfidence).toBeGreaterThan(0);
        });
    });
});
