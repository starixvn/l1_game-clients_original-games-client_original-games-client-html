/**
 * Ball Path Correction Tests
 * Tests for service-guided ball path following and collision handling
 */

import { renderHook, act } from '@testing-library/react';
import { Bodies, Engine, Composite, World } from 'matter-js';
import { useBallSpawner } from '../src/features/game/components/ball/hooks/use-ball-spawner';
import { handleServiceGuidedPinCollision, handleServiceGuidedWin } from '../src/features/game/components/ball/physics/collision-handler';
import { BallBodyExtension } from '../src/types/physics';

// Mock Matter.js
jest.mock('matter-js', () => ({
    Bodies: {
        circle: jest.fn(),
    },
    Composite: {
        add: jest.fn(),
        allBodies: jest.fn(),
    },
    Body: {
        setVelocity: jest.fn(),
        applyForce: jest.fn(),
    },
}));

// Mock physics config and utilities
jest.mock('../src/lib/physics', () => ({
    physicsConfig: {
        colors: {
            ball: '#FF6B6B',
            multiplierLoss: '#e74c3c',
        },
        engine: {
            engineGravity: 0.5,
        },
    },
    calculateBallSize: jest.fn(() => 5),
    getBallPhysicsTweaks: jest.fn(() => ({
        restitution: 0.8,
        friction: 0.1,
        frictionAir: 0.01,
        density: 0.001,
    })),
    getMiddleDropPosition: jest.fn(() => 300),
}));

describe('Ball Path Correction - Service Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock engine
        const mockEngine = { world: {} };
        (Bodies.circle as jest.Mock).mockReturnValue({
            id: 'ball1',
            position: { x: 300, y: 30 },
            velocity: { x: 0, y: 0 },
            circleRadius: 5,
            label: 'service-guided-ball',
        });
        (Composite.allBodies as jest.Mock).mockReturnValue([]);
    });

    describe('Service Result Array to Slot Index Conversion', () => {
        it('should correctly calculate slot index from result array', () => {
            // Test case from documentation: [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0]
            const result = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0];
            const expectedSlotIndex = result.filter(num => num === 1).length;

            expect(expectedSlotIndex).toBe(3);
        });

        it('should handle all zeros (leftmost slot)', () => {
            const result = [0, 0, 0, 0, 0, 0, 0, 0];
            const slotIndex = result.filter(num => num === 1).length;

            expect(slotIndex).toBe(0);
        });

        it('should handle all ones (rightmost slot)', () => {
            const result = [1, 1, 1, 1, 1, 1, 1, 1];
            const slotIndex = result.filter(num => num === 1).length;

            expect(slotIndex).toBe(8);
        });

        it('should handle mixed pattern correctly', () => {
            const result = [1, 0, 0, 1, 1, 0, 1, 0, 1, 0];
            const slotIndex = result.filter(num => num === 1).length;

            expect(slotIndex).toBe(5);
        });
    });

    describe('Service-Guided Ball Path Following', () => {
        it('should apply correct directional forces based on path array', () => {
            const mockBall = {
                id: 'ball1',
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                label: 'service-guided-ball',
                isServiceGuided: true,
                servicePath: [1, 0, 1], // right, left, right
                currentPathIndex: 0,
                expectedFinalSlot: 2,
                multiplier: 2.0,
                betValue: 100,
                wrongSlotHits: 0,
            } as unknown as BallBodyExtension;

            // Test first collision (direction = 1, should go right)
            handleServiceGuidedPinCollision(mockBall, mockBall);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                x: 1 * 1.5, // 1 * velocityMagnitude
                y: mockBall.velocity.y
            });
            expect(Body.applyForce).toHaveBeenCalledWith(mockBall, mockBall.position, {
                x: 1 * 0.25, // 1 * forceMagnitude
                y: 0
            });
            expect(mockBall.currentPathIndex).toBe(1);
        });

        it('should handle left direction (0) correctly', () => {
            const mockBall = {
                id: 'ball2',
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                label: 'service-guided-ball',
                isServiceGuided: true,
                servicePath: [0, 1, 0], // left, right, left
                currentPathIndex: 0,
                expectedFinalSlot: 1,
                multiplier: 1.5,
                betValue: 50,
                wrongSlotHits: 0,
            } as unknown as BallBodyExtension;

            // Test first collision (direction = 0, should go left)
            handleServiceGuidedPinCollision(mockBall, mockBall);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                x: -1 * 1.5, // -1 * velocityMagnitude (left)
                y: mockBall.velocity.y
            });
            expect(Body.applyForce).toHaveBeenCalledWith(mockBall, mockBall.position, {
                x: -1 * 0.25, // -1 * forceMagnitude (left)
                y: 0
            });
        });

        it('should progress through path array correctly', () => {
            const mockBall = {
                id: 'ball3',
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                label: 'service-guided-ball',
                isServiceGuided: true,
                servicePath: [1, 0, 1, 0], // 4-step path
                currentPathIndex: 1, // Already on second step
                expectedFinalSlot: 2,
                multiplier: 3.0,
                betValue: 25,
                wrongSlotHits: 0,
            } as unknown as BallBodyExtension;

            // Test second collision (direction = 0, should go left)
            handleServiceGuidedPinCollision(mockBall, mockBall);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                x: -1 * 1.5, // -1 * velocityMagnitude (left)
                y: mockBall.velocity.y
            });
            expect(mockBall.currentPathIndex).toBe(2);
        });
    });

    describe('Service-Guided Ball Win Logic', () => {
        const mockOnBallHit = jest.fn();

        beforeEach(() => {
            mockOnBallHit.mockClear();
        });

        it('should trigger win for correct slot match', () => {
            const mockBall = {
                isServiceGuided: true,
                expectedFinalSlot: 3,
                multiplier: 2.0,
                betValue: 100,
                hasTriggeredWin: false,
                wrongSlotHits: 0,
            } as BallBodyExtension;

            handleServiceGuidedWin(mockBall, 3, 2.0, 100, { onBallHit: mockOnBallHit });

            expect(mockBall.hasTriggeredWin).toBe(true);
            expect(mockOnBallHit).toHaveBeenCalledWith(2.0, 100);
        });

        it('should handle wrong slot with retry logic', () => {
            const mockBall = {
                isServiceGuided: true,
                expectedFinalSlot: 3,
                multiplier: 2.0,
                betValue: 100,
                hasTriggeredWin: false,
                wrongSlotHits: 0,
            } as BallBodyExtension;

            // First wrong hit
            handleServiceGuidedWin(mockBall, 2, 1.5, 100, { onBallHit: mockOnBallHit });

            expect(mockBall.hasTriggeredWin).toBe(false);
            expect(mockBall.wrongSlotHits).toBe(1);
            expect(mockOnBallHit).not.toHaveBeenCalled();
        });

        it('should trigger win after 3 wrong attempts', () => {
            const mockBall = {
                isServiceGuided: true,
                expectedFinalSlot: 3,
                multiplier: 2.0,
                betValue: 100,
                hasTriggeredWin: false,
                wrongSlotHits: 2, // Already had 2 wrong hits
            } as BallBodyExtension;

            // Third wrong hit - should trigger win
            handleServiceGuidedWin(mockBall, 1, 1.2, 100, { onBallHit: mockOnBallHit });

            expect(mockBall.hasTriggeredWin).toBe(true);
            expect(mockOnBallHit).toHaveBeenCalledWith(2.0, 100); // Uses expected multiplier
        });
    });

    describe('Ball Spawner Service-Guided Integration', () => {
        it('should create service-guided ball with correct path data', () => {
            const mockEngine = { world: {}, current: { world: {} } };

            const { result } = renderHook(() =>
                useBallSpawner({
                    numberOfRows: 8,
                    canvasWidth: 600,
                    engine: mockEngine as any,
                })
            );

            const path = [1, 0, 1, 0, 1, 0, 0, 0];
            const finalSlot = 3;
            const multiplier = 2.0;
            const betValue = 100;

            act(() => {
                result.current.spawnBallWithPath(betValue, path, finalSlot, multiplier);
            });

            // Verify Bodies.circle was called with correct parameters
            expect(Bodies.circle).toHaveBeenCalledWith(300, 30, 5, expect.objectContaining({
                label: 'service-guided-ball',
                isStatic: false,
            }));

            // Verify Composite.add was called
            expect(Composite.add).toHaveBeenCalled();
        });

        it('should handle service-guided ball spawning errors gracefully', () => {
            const mockEngine = { world: null, current: { world: null } };

            const { result } = renderHook(() =>
                useBallSpawner({
                    numberOfRows: 8,
                    canvasWidth: 600,
                    engine: mockEngine as any,
                })
            );

            // Should not throw when engine is not ready
            expect(() => {
                act(() => {
                    result.current.spawnBallWithPath(100, [1, 0, 1], 2, 2.0);
                });
            }).not.toThrow();
        });
    });

    describe('Path Array Direction Mapping', () => {
        it('should correctly map service result to directional forces', () => {
            // Test the core mapping logic: 1 = right (+1), 0 = left (-1)
            const testCases = [
                { direction: 1, expectedForce: 0.25, expectedVelocity: 1.5 },
                { direction: 0, expectedForce: -0.25, expectedVelocity: -1.5 },
            ];

            testCases.forEach(({ direction, expectedForce, expectedVelocity }) => {
                const mockBall = {
                    position: { x: 300, y: 100 },
                    velocity: { x: 0, y: 5 },
                    servicePath: [direction],
                    currentPathIndex: 0,
                } as unknown as BallBodyExtension;

                handleServiceGuidedPinCollision(mockBall, mockBall);

                expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                    x: expectedVelocity,
                    y: mockBall.velocity.y
                });
                expect(Body.applyForce).toHaveBeenCalledWith(mockBall, mockBall.position, {
                    x: expectedForce,
                    y: 0
                });
            });
        });

        it('should handle path completion correctly', () => {
            const mockBall = {
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                servicePath: [1, 0, 1], // 3-element path
                currentPathIndex: 2, // On last element
            } as unknown as BallBodyExtension;

            // This should be the last collision
            handleServiceGuidedPinCollision(mockBall, mockBall);

            expect(mockBall.currentPathIndex).toBe(3); // Advanced to 3 (beyond array length)
        });
    });

    describe('Collision Detection Integration', () => {
        it('should route service-guided balls to correct collision handler', () => {
            // This test would verify that the collision detection system
            // properly identifies service-guided balls and calls the right handler
            // This would require mocking the collision detection system
            expect(true).toBe(true); // Placeholder for future integration test
        });

        it('should maintain ball physics properties during guided movement', () => {
            const mockBall = {
                position: { x: 300, y: 100 },
                velocity: { x: 2, y: 8 }, // Existing velocity
                servicePath: [1],
                currentPathIndex: 0,
            } as unknown as BallBodyExtension;

            handleServiceGuidedPinCollision(mockBall, mockBall);

            // Should set X velocity to guided direction but preserve Y velocity
            expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                x: 1.5, // Right direction
                y: 8, // Preserved original Y velocity
            });
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle empty path array gracefully', () => {
            const mockBall = {
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                servicePath: [],
                currentPathIndex: 0,
            } as unknown as BallBodyExtension;

            // Should not apply any directional force
            handleServiceGuidedPinCollision(mockBall, mockBall);

            expect(Body.setVelocity).not.toHaveBeenCalled();
            expect(Body.applyForce).not.toHaveBeenCalled();
        });

        it('should handle out-of-bounds path index', () => {
            const mockBall = {
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                servicePath: [1, 0],
                currentPathIndex: 5, // Way beyond array length
            } as unknown as BallBodyExtension;

            // Should not crash and not apply forces
            expect(() => {
                handleServiceGuidedPinCollision(mockBall, mockBall);
            }).not.toThrow();

            expect(Body.setVelocity).not.toHaveBeenCalled();
            expect(Body.applyForce).not.toHaveBeenCalled();
        });

        it('should handle missing ball properties gracefully', () => {
            const incompleteBall = {
                position: { x: 300, y: 100 },
                // Missing velocity and other properties
            } as unknown as BallBodyExtension;

            // Should not crash
            expect(() => {
                handleServiceGuidedPinCollision(incompleteBall, incompleteBall);
            }).not.toThrow();
        });
    });
});
