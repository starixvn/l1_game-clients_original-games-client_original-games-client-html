import { Bodies, Body, Engine, World } from 'matter-js';
import {
    handleServiceGuidedPinCollision,
    handlePinCollision,
    handleMultiplierCollision
} from '../src/features/game/components/ball/physics/collision-handler';
import { BallBodyExtension } from '../src/types/physics';

// Mock Matter.js
jest.mock('matter-js', () => ({
    Bodies: {
        circle: jest.fn(),
        rectangle: jest.fn()
    },
    Body: {
        setVelocity: jest.fn(),
        applyForce: jest.fn()
    },
    Engine: {
        create: jest.fn(),
        update: jest.fn()
    },
    World: {
        remove: jest.fn()
    }
}));

describe('Service-Guided Collision Handler - TDD Tests', () => {
    let mockBallBody: any;
    let mockPegBody: any;
    let mockSlotBody: any;
    let mockEngine: any;
    let mockBallExtension: BallBodyExtension;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEngine = {
            world: { bodies: [] }
        };

        mockBallBody = {
            id: 1,
            position: { x: 300, y: 100 },
            velocity: { x: 0, y: 2 },
            label: 'service-guided-ball'
        };

        mockPegBody = {
            id: 2,
            label: 'pin-1-1',
            position: { x: 300, y: 100 }
        };

        mockSlotBody = {
            id: 3,
            label: 'multiplier-0.5-3',
            position: { x: 300, y: 500 }
        };

        mockBallExtension = {
            isServiceGuided: true,
            servicePath: [1, 0, 0, 0, 1, 0, 0, 1], // 3 ones = slotIndex 3
            currentPathIndex: 0,
            expectedFinalSlot: 3,
            multiplier: 0.5,
            betValue: 100,
            pinCollisions: [],
            pathPositions: []
        };
    });

    describe('handleServiceGuidedPinCollision', () => {
        describe('Path Following Logic', () => {
            it('should apply velocity nudge for first path step (direction 1 = right)', () => {
                // Arrange
                mockBallExtension.currentPathIndex = 0;
                mockBallExtension.servicePath = [1, 0, 0, 0, 1, 0, 0, 1];
                mockBallExtension.pinCollisions = [];

                // Act
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody);

                // Assert
                expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                    x: 1.0, // nudgeStrength = 1.0, direction = 1 (right)
                    y: 2
                });
                expect(mockBallExtension.currentPathIndex).toBe(1);
                expect(mockBallExtension.appliedGuidanceSteps).toContain('step-0');
            });

            it('should apply velocity nudge for path step (direction 0 = left)', () => {
                // Arrange
                mockBallExtension.currentPathIndex = 1;
                mockBallExtension.servicePath = [1, 0, 0, 0, 1, 0, 0, 1];
                mockBallExtension.pinCollisions = ['step-0'];

                // Act
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody);

                // Assert
                expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                    x: -1.0, // nudgeStrength = 1.0, direction = 0 (left)
                    y: 2
                });
                expect(mockBallExtension.currentPathIndex).toBe(2);
                expect(mockBallExtension.appliedGuidanceSteps).toContain('step-1');
            });

            it('should track path positions for visualization', () => {
                // Arrange
                mockBallExtension.currentPathIndex = 0;
                mockBallExtension.servicePath = [1, 0, 0, 0, 1, 0, 0, 1];
                mockBallExtension.pinCollisions = [];
                mockBallExtension.pathPositions = [];

                // Act
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody);

                // Assert
                expect(mockBallExtension.pathPositions).toHaveLength(1);
                expect(mockBallExtension.pathPositions[0]).toEqual({
                    x: 300,
                    y: 100,
                    type: 'collision',
                    pegRow: 1,
                    pegCol: 1,
                    pathIndex: 0,
                    direction: 1
                });
            });
        });

        describe('Collision Prevention Logic', () => {
            it('should skip nudge if already applied for current path step', () => {
                // Arrange
                const callsBefore = Body.setVelocity.mock.calls.length;
                mockBallExtension.currentPathIndex = 0;
                mockBallExtension.servicePath = [1, 0, 0, 0, 1, 0, 0, 1];
                mockBallExtension.appliedGuidanceSteps = ['step-0'];

                // Act
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody);

                // Assert
                expect(Body.setVelocity).toHaveBeenCalledTimes(callsBefore); // No additional calls
                expect(mockBallExtension.currentPathIndex).toBe(0); // Should not increment
            });

            it('should skip nudge if path is completed', () => {
                // Arrange
                mockBallExtension.currentPathIndex = 8; // Beyond path length
                mockBallExtension.servicePath = [1, 0, 0, 0, 1, 0, 0, 1]; // Length 8
                mockBallExtension.pinCollisions = [];

                // Act
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody);

                // Assert
                expect(Body.setVelocity).not.toHaveBeenCalled();
                expect(mockBallExtension.currentPathIndex).toBe(8); // Should not increment
            });
        });

        describe('Path Execution Scenarios', () => {
            it('should execute complete path: [1,0,0,0,1,0,0,1] -> slotIndex 3', () => {
                // Arrange
                const path = [1, 0, 0, 0, 1, 0, 0, 1];
                mockBallExtension.servicePath = path;
                mockBallExtension.currentPathIndex = 0;
                mockBallExtension.pinCollisions = [];

                // Act - Simulate hitting all 8 pegs
                for (let i = 0; i < 8; i++) {
                    mockBallExtension.currentPathIndex = i;
                    handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody);
                }

                // Assert
                expect(Body.setVelocity).toHaveBeenCalledTimes(8);
                expect(mockBallExtension.currentPathIndex).toBe(8);
                expect(mockBallExtension.appliedGuidanceSteps).toHaveLength(8);

                // Verify nudges: 1(right), 0(left), 0(left), 0(left), 1(right), 0(left), 0(left), 1(right)
                expect(Body.setVelocity).toHaveBeenNthCalledWith(1, mockBallBody, { x: 1.0, y: 2 }); // step 0: right
                expect(Body.setVelocity).toHaveBeenNthCalledWith(2, mockBallBody, { x: -1.0, y: 2 }); // step 1: left
                expect(Body.setVelocity).toHaveBeenNthCalledWith(3, mockBallBody, { x: -1.0, y: 2 }); // step 2: left
                expect(Body.setVelocity).toHaveBeenNthCalledWith(4, mockBallBody, { x: -1.0, y: 2 }); // step 3: left
                expect(Body.setVelocity).toHaveBeenNthCalledWith(5, mockBallBody, { x: 1.0, y: 2 }); // step 4: right
                expect(Body.setVelocity).toHaveBeenNthCalledWith(6, mockBallBody, { x: -1.0, y: 2 }); // step 5: left
                expect(Body.setVelocity).toHaveBeenNthCalledWith(7, mockBallBody, { x: -1.0, y: 2 }); // step 6: left
                expect(Body.setVelocity).toHaveBeenNthCalledWith(8, mockBallBody, { x: 1.0, y: 2 }); // step 7: right
            });

            it('should execute path: [0,0,0,0,0,0,0,0] -> slotIndex 0', () => {
                // Arrange
                const path = [0, 0, 0, 0, 0, 0, 0, 0];
                mockBallExtension.servicePath = path;
                mockBallExtension.currentPathIndex = 0;
                mockBallExtension.pinCollisions = [];

                // Act - Simulate hitting all 8 pegs
                for (let i = 0; i < 8; i++) {
                    mockBallExtension.currentPathIndex = i;
                    handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody);
                }

                // Assert - All nudges should be left (negative)
                expect(Body.setVelocity).toHaveBeenCalledTimes(8);
                for (let i = 1; i <= 8; i++) {
                    expect(Body.setVelocity).toHaveBeenNthCalledWith(i, mockBallBody, { x: -1.0, y: 2 });
                }
            });

            it('should execute path: [1,1,1,1,1,1,1,1] -> slotIndex 8', () => {
                // Arrange
                const path = [1, 1, 1, 1, 1, 1, 1, 1];
                mockBallExtension.servicePath = path;
                mockBallExtension.currentPathIndex = 0;
                mockBallExtension.pinCollisions = [];

                // Act - Simulate hitting all 8 pegs
                for (let i = 0; i < 8; i++) {
                    mockBallExtension.currentPathIndex = i;
                    handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody);
                }

                // Assert - All nudges should be right (positive)
                expect(Body.setVelocity).toHaveBeenCalledTimes(8);
                for (let i = 1; i <= 8; i++) {
                    expect(Body.setVelocity).toHaveBeenNthCalledWith(i, mockBallBody, { x: 1.0, y: 2 });
                }
            });
        });
    });

    describe('handlePinCollision', () => {
        it('should call service-guided handler for service-guided balls', () => {
            // Arrange
            const result = {
                ballBody: mockBallBody,
                ballExtension: mockBallExtension,
                obstacleBody: mockPegBody,
                engine: mockEngine
            };

            // Act
            handlePinCollision(result);

            // Assert
            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should call random handler for non-service-guided balls', () => {
            // Arrange
            const nonServiceBallExtension = { ...mockBallExtension, isServiceGuided: false };
            const result = {
                ballBody: mockBallBody,
                ballExtension: nonServiceBallExtension,
                obstacleBody: mockPegBody,
                engine: mockEngine
            };

            // Act
            handlePinCollision(result);

            // Assert
            expect(Body.setVelocity).not.toHaveBeenCalled();
        });
    });

    describe('handleMultiplierCollision', () => {
        it('should verify slot index matches expected final slot', () => {
            // Arrange
            const result = {
                ballBody: mockBallBody,
                ballExtension: mockBallExtension,
                obstacleBody: mockSlotBody,
                engine: mockEngine
            };
            const options = {
                onBallHit: jest.fn()
            };

            // Act
            handleMultiplierCollision(result, options);

            // Assert
            expect(options.onBallHit).toHaveBeenCalledWith(0.5, 100);
        });

        it('should handle wrong slot landing with logging', () => {
            // Arrange
            const wrongSlotBody = {
                ...mockSlotBody,
                label: 'multiplier-0.5-6' // Wrong slot (6 instead of 3)
            };
            const result = {
                ballBody: mockBallBody,
                ballExtension: mockBallExtension,
                obstacleBody: wrongSlotBody,
                engine: mockEngine
            };
            const options = {
                onBallHit: jest.fn()
            };

            // Act
            handleMultiplierCollision(result, options);

            // Assert - onBallHit should NOT be called for wrong slots
            expect(options.onBallHit).not.toHaveBeenCalled();
            expect(mockBallExtension.wrongSlotHits).toBe(1);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle missing service path gracefully', () => {
            // Arrange
            const invalidExtension = { ...mockBallExtension, servicePath: undefined };

            // Act & Assert
            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, invalidExtension, mockPegBody);
            }).not.toThrow();
        });

        it('should handle empty service path', () => {
            // Arrange
            const emptyPathExtension = { ...mockBallExtension, servicePath: [] };

            // Act & Assert
            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, emptyPathExtension, mockPegBody);
            }).not.toThrow();
        });

        it('should handle invalid path directions', () => {
            // Arrange
            const invalidPathExtension = {
                ...mockBallExtension,
                servicePath: [2, -1, 0.5, 1] // Invalid directions
            };

            // Act & Assert
            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, invalidPathExtension, mockPegBody);
            }).not.toThrow();
        });
    });
});
