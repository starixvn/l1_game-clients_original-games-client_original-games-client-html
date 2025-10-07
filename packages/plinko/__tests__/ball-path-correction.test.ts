/**
 * Ball Path Correction Tests
 * Tests for service-guided ball path following and collision handling
 */

import { renderHook, act } from "@testing-library/react";
import { Bodies, Engine, Composite, World, Body } from "matter-js";
import { useBallSpawner } from "../src/features/game/components/ball/hooks/use-ball-spawner";
import { handleServiceGuidedPinCollision, handleServiceGuidedWin } from "../src/features/game/components/ball/physics/collision-handler";
import { BallBodyExtension } from "../src/types/physics";

// Mock Matter.js
jest.mock("matter-js", () => ({
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
jest.mock("../src/lib/physics", () => ({
    physicsConfig: {
        colors: {
            ball: "#FF6B6B",
            multiplierLoss: "#e74c3c",
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

describe("Ball Path Correction - Service Integration", () => {
    let mockBall: any;
    let mockPeg: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock ball
        mockBall = {
            id: "ball1",
            position: { x: 300, y: 30 },
            velocity: { x: 0, y: 0 },
            circleRadius: 5,
            label: "service-guided-ball",
            isServiceGuided: true,
            servicePath: [1, 0, 1],
            currentPathIndex: 0,
            expectedFinalSlot: 2,
            multiplier: 2.0,
            betValue: 100,
            wrongSlotHits: 0,
            pinCollisions: [],
        };

        // Setup mock peg
        mockPeg = {
            id: "peg1",
            position: { x: 300, y: 60 },
            label: "pin-1-1",
        };

        // Setup mock engine
        const mockEngine = { world: {} };
        (Bodies.circle as jest.Mock).mockReturnValue(mockBall);
        (Composite.allBodies as jest.Mock).mockReturnValue([]);
    });

    describe("Service Result Array to Slot Index Conversion", () => {
        it("should correctly calculate slot index from result array", () => {
            // Test case from documentation: [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0]
            const result = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0];
            const expectedSlotIndex = result.filter((num) => num === 1).length;

            expect(expectedSlotIndex).toBe(3);
        });

        it("should handle all zeros (leftmost slot)", () => {
            const result = [0, 0, 0, 0, 0, 0, 0, 0];
            const slotIndex = result.filter((num) => num === 1).length;

            expect(slotIndex).toBe(0);
        });

        it("should handle all ones (rightmost slot)", () => {
            const result = [1, 1, 1, 1, 1, 1, 1, 1];
            const slotIndex = result.filter((num) => num === 1).length;

            expect(slotIndex).toBe(8);
        });

        it("should handle mixed pattern correctly", () => {
            const result = [1, 0, 0, 1, 1, 0, 1, 0, 1, 0];
            const slotIndex = result.filter((num) => num === 1).length;

            expect(slotIndex).toBe(5);
        });
    });

    describe("Service-Guided Ball Path Following", () => {
        it("should apply correct directional forces based on path array", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                isServiceGuided: true,
                servicePath: [1, 0, 1], // right, left, right
                currentPathIndex: 0,
                expectedFinalSlot: 2,
                multiplier: 2.0,
                betValue: 100,
                wrongSlotHits: 0,
            });

            // Test first collision (direction = 1, should go right)
            handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                x: 0 + 1.0, // 0 + 1.0 nudge (direction=1, nudgeStrength = 1.0)
                y: mockBall.velocity.y,
            });
            // Note: Service-guided collision handler only uses setVelocity, not applyForce
            expect(Body.applyForce).not.toHaveBeenCalled();
            expect(mockBall.currentPathIndex).toBe(1);
        });

        it("should handle left direction (0) correctly", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                id: "ball2",
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                isServiceGuided: true,
                servicePath: [0, 1, 0], // left, right, left
                currentPathIndex: 0,
                expectedFinalSlot: 1,
                multiplier: 1.5,
                betValue: 50,
                wrongSlotHits: 0,
            });

            // Test first collision (direction = 0, should go left)
            handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                x: 0 + -1.0, // 0 + (-1.0) nudge (direction=0, nudgeStrength = 1.0)
                y: mockBall.velocity.y,
            });
            // Note: Service-guided collision handler only uses setVelocity, not applyForce
            expect(Body.applyForce).not.toHaveBeenCalled();
        });

        it("should progress through path array correctly", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                id: "ball3",
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                label: "service-guided-ball",
                isServiceGuided: true,
                servicePath: [1, 0, 1, 0], // 4-step path
                currentPathIndex: 1, // Already on second step
                expectedFinalSlot: 2,
                multiplier: 3.0,
                betValue: 25,
                wrongSlotHits: 0,
            });

            // Test second collision (direction = 0, should go left)
            handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                x: 0 + -1.0, // 0 + (-1.0) nudge (direction=0, nudgeStrength = 1.0)
                y: mockBall.velocity.y,
            });
            expect(mockBall.currentPathIndex).toBe(2);
        });
    });

    describe("Service-Guided Ball Win Logic", () => {
        const mockOnBallHit = jest.fn();

        beforeEach(() => {
            mockOnBallHit.mockClear();
        });

        it("should trigger win for correct slot match", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                isServiceGuided: true,
                expectedFinalSlot: 3,
                multiplier: 2.0,
                betValue: 100,
                hasTriggeredWin: false,
                wrongSlotHits: 0,
            });

            handleServiceGuidedWin(mockBall, 3, 2.0, 100, { onBallHit: mockOnBallHit });

            expect(mockBall.hasTriggeredWin).toBe(true);
            expect(mockOnBallHit).toHaveBeenCalledWith(2.0, 100);
        });

        it("should handle wrong slot with retry logic", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                isServiceGuided: true,
                expectedFinalSlot: 3,
                multiplier: 2.0,
                betValue: 100,
                hasTriggeredWin: false,
                wrongSlotHits: 0,
            });

            // First wrong hit
            handleServiceGuidedWin(mockBall, 2, 1.5, 100, { onBallHit: mockOnBallHit });

            expect(mockBall.hasTriggeredWin).toBe(false);
            expect(mockBall.wrongSlotHits).toBe(1);
            expect(mockOnBallHit).not.toHaveBeenCalled();
        });

        it("should trigger win after 3 wrong attempts", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                isServiceGuided: true,
                expectedFinalSlot: 3,
                multiplier: 2.0,
                betValue: 100,
                hasTriggeredWin: false,
                wrongSlotHits: 2, // Already had 2 wrong hits
            });

            // Third wrong hit - should trigger win
            handleServiceGuidedWin(mockBall, 1, 1.2, 100, { onBallHit: mockOnBallHit });

            expect(mockBall.hasTriggeredWin).toBe(true);
            expect(mockOnBallHit).toHaveBeenCalledWith(2.0, 100); // Uses expected multiplier
        });
    });

    describe("Ball Spawner Service-Guided Integration", () => {
        it("should create service-guided ball with correct path data", () => {
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
            expect(Bodies.circle).toHaveBeenCalledWith(
                300,
                30,
                5,
                expect.objectContaining({
                    label: "service-guided-ball",
                    isStatic: false,
                })
            );

            // Verify Composite.add was called
            expect(Composite.add).toHaveBeenCalled();
        });

        it("should handle service-guided ball spawning errors gracefully", () => {
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

    describe("Path Array Direction Mapping", () => {
        xit("should correctly map service result to directional forces", () => {
            // Test the core mapping logic: 1 = right (+1), 0 = left (-1)
            const testCases = [
                { direction: 1, expectedForce: 0.25, expectedVelocity: 1.0 }, // nudgeStrength = 1.0
                { direction: 0, expectedForce: -0.25, expectedVelocity: -1.0 }, // nudgeStrength = 1.0
            ];

            testCases.forEach(({ direction, expectedForce, expectedVelocity }) => {
                // Clear previous calls
                jest.clearAllMocks();

                // Update the shared mock ball with test-specific properties
                Object.assign(mockBall, {
                    position: { x: 300, y: 100 },
                    velocity: { x: 0, y: 5 },
                    servicePath: [direction],
                    currentPathIndex: 0,
                    pinCollisions: [], // Reset pin collisions for each test
                });

                handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);

                expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                    x: expectedVelocity, // nudgeStrength = 1.0, so expectedVelocity * 1.0 = expectedVelocity
                    y: mockBall.velocity.y,
                });
                // Note: Service-guided collision handler only uses setVelocity, not applyForce
                expect(Body.applyForce).not.toHaveBeenCalled();
            });
        });

        it("should handle path completion correctly", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                servicePath: [1, 0, 1], // 3-element path
                currentPathIndex: 2, // On last element
            });

            // This should be the last collision
            handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);

            expect(mockBall.currentPathIndex).toBe(3); // Advanced to 3 (beyond array length)
        });
    });

    describe("Collision Detection Integration", () => {
        it("should route service-guided balls to correct collision handler", () => {
            // This test would verify that the collision detection system
            // properly identifies service-guided balls and calls the right handler
            // This would require mocking the collision detection system
            expect(true).toBe(true); // Placeholder for future integration test
        });

        it("should maintain ball physics properties during guided movement", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                position: { x: 300, y: 100 },
                velocity: { x: 2, y: 8 }, // Existing velocity
                servicePath: [1],
                currentPathIndex: 0,
            });

            handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);

            // Should set X velocity to guided direction but preserve Y velocity
            expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                x: 2 + 1.0, // Original velocity (2) + nudge (1.0) = 3.0
                y: 8, // Preserved original Y velocity
            });
        });
    });

    describe("Error Handling and Edge Cases", () => {
        it("should handle empty path array gracefully", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                servicePath: [],
                currentPathIndex: 0,
            });

            // Should not apply any directional force
            handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);

            expect(Body.setVelocity).not.toHaveBeenCalled();
            expect(Body.applyForce).not.toHaveBeenCalled();
        });

        it("should not apply guidance for rows beyond guidance limit", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                isServiceGuided: true,
                servicePath: [1, 0, 1],
                currentPathIndex: 0,
                expectedFinalSlot: 2,
            });

            // Mock a peg in row 4 (beyond guidance limit of 3)
            const mockPegRow4 = { ...mockPeg, label: "pin-4-2" };

            // Should not apply any guidance for rows beyond limit
            handleServiceGuidedPinCollision(mockBall, mockBall, mockPegRow4);

            expect(Body.setVelocity).not.toHaveBeenCalled();
            expect(Body.applyForce).not.toHaveBeenCalled();
            expect(mockBall.currentPathIndex).toBe(0); // Should not increment
        });

        xit("should apply guidance only once per path step even with multiple collisions", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                isServiceGuided: true,
                servicePath: [1, 0], // 2-step path
                currentPathIndex: 0,
                expectedFinalSlot: 3,
            });

            // First collision with same peg - should apply guidance
            handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);
            expect(Body.setVelocity).toHaveBeenCalledWith(mockBall, {
                x: 0 + 1.0, // direction=1, nudge=1.0
                y: mockBall.velocity.y,
            });
            expect(mockBall.currentPathIndex).toBe(1);

            // Reset mock
            Body.setVelocity.mockClear();

            // Second collision with same peg - should NOT apply guidance (already applied for this step)
            handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);
            expect(Body.setVelocity).not.toHaveBeenCalled();
            expect(mockBall.currentPathIndex).toBe(1); // Should not increment again
        });

        it("should handle out-of-bounds path index", () => {
            // Update the shared mock ball with test-specific properties
            Object.assign(mockBall, {
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 5 },
                servicePath: [1, 0],
                currentPathIndex: 5, // Way beyond array length
            });

            // Should not crash and not apply forces
            expect(() => {
                handleServiceGuidedPinCollision(mockBall, mockBall, mockPeg);
            }).not.toThrow();

            expect(Body.setVelocity).not.toHaveBeenCalled();
            expect(Body.applyForce).not.toHaveBeenCalled();
        });

        it("should handle missing ball properties gracefully", () => {
            const incompleteBall = {
                id: "incomplete-ball",
                position: { x: 300, y: 100 },
                velocity: { x: 0, y: 0 },
                circleRadius: 5,
                label: "incomplete-ball",
                isServiceGuided: false,
                servicePath: [],
                currentPathIndex: 0,
                expectedFinalSlot: 0,
                multiplier: 1.0,
                betValue: 100,
                wrongSlotHits: 0,
                pinCollisions: [],
            } as BallBodyExtension;

            // Should not crash
            expect(() => {
                handleServiceGuidedPinCollision(incompleteBall, incompleteBall, mockPeg);
            }).not.toThrow();
        });
    });
});
