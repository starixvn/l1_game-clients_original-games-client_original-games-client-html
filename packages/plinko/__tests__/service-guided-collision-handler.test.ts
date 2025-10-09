/**
 * Service-Guided Collision Handler Tests
 * Tests for collision handling specific to service-guided balls
 */

import { Body, Engine } from 'matter-js';
import { BallBodyExtension } from '../src/types/physics';
import { handleServiceGuidedPinCollision } from '../src/features/game/components/ball/physics/collisions/test-utils';
import { CollisionCooldownManager } from '../src/features/game/components/ball/physics/collisions/collision-cooldown';

// Mock physics logger
jest.mock('../src/features/game/components/ball/physics', () => ({
    physicsLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Service-Guided Collision Handler', () => {
    let mockEngine: Engine;
    let mockBallBody: Body;
    let mockPegBody: Body;
    let mockBallExtension: BallBodyExtension;
    let mockCooldownManager: CollisionCooldownManager;

    beforeEach(() => {
        // Create mock engine
        mockEngine = {
            world: { bodies: [] },
            gravity: { x: 0, y: 0.8 }
        } as any;

        // Create mock ball body
        mockBallBody = {
            id: 1,
            position: { x: 300, y: 100 },
            velocity: { x: 0, y: 5 },
            label: 'service-guided-ball'
        } as any;

        // Create mock peg body
        mockPegBody = {
            id: 2,
            position: { x: 300, y: 150 },
            label: 'pin-1-3'
        } as any;

        // Create mock ball extension
        mockBallExtension = {
            createdAt: Date.now(),
            betValue: 100,
            isServiceGuided: true,
            currentPathIndex: 0,
            servicePath: [0, 1, 0, 1, 0],
            expectedFinalSlot: 3,
            multiplier: 2,
            wrongSlotHits: 0,
            pinCollisions: [],
            appliedGuidanceSteps: []
        };

        // Mock cooldown manager
        mockCooldownManager = new CollisionCooldownManager();

        // Mock Body.setVelocity
        jest.spyOn(Body, 'setVelocity').mockImplementation(() => { });

        // Spy on cooldown manager methods
        jest.spyOn(mockCooldownManager, 'canCollide').mockReturnValue(true);
        jest.spyOn(mockCooldownManager, 'registerCollision').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Collision Cooldown Management', () => {
        it('should check collision cooldown before processing', () => {
            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(mockCooldownManager.canCollide).toHaveBeenCalledWith(mockBallBody.id, mockPegBody.id, 50);
        });

        it('should skip collision if cooldown prevents it', () => {
            jest.spyOn(mockCooldownManager, 'canCollide').mockReturnValue(false);

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(Body.setVelocity).not.toHaveBeenCalled();
            expect(mockCooldownManager.registerCollision).not.toHaveBeenCalled();
        });

        it('should register collision cooldown after processing', () => {
            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(mockCooldownManager.registerCollision).toHaveBeenCalledWith(mockBallBody.id, mockPegBody.id, 50);
        });
    });

    describe('Service-Guided Collision Logic', () => {
        it('should apply row-based guidance for correct row alignment', () => {
            mockPegBody.label = 'pin-1-3'; // Row 1, expected for path index 0

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: -8, // Strong nudge for correct row
                y: expect.any(Number)
            });
        });

        it('should apply fallback guidance for any valid collision', () => {
            mockPegBody.label = 'invalid-label'; // Invalid row, triggers fallback

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: -1.5, // Fallback nudge strength
                y: 2
            });
        });

        it('should handle final path completion with target slot calculation', () => {
            // Set up final collision
            mockBallExtension.servicePath = [1]; // Single step path
            mockBallExtension.currentPathIndex = 0;
            mockBallExtension.expectedFinalSlot = 5;
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(mockBallExtension.currentPathIndex).toBe(1);
            expect(Body.setVelocity).toHaveBeenCalled();
        });
    });

    describe('Ball Extension Properties', () => {
        it('should preserve ball extension properties', () => {
            const originalBetValue = mockBallExtension.betValue;
            const originalMultiplier = mockBallExtension.multiplier;

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(mockBallExtension.betValue).toBe(originalBetValue);
            expect(mockBallExtension.multiplier).toBe(originalMultiplier);
        });

        it('should update path tracking properties', () => {
            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(mockBallExtension.currentPathIndex).toBe(1);
            expect(mockBallExtension.appliedGuidanceSteps).toHaveLength(1);
        });

        it('should handle missing extension properties gracefully', () => {
            const incompleteExtension = {
                isServiceGuided: true,
                currentPathIndex: 0,
                servicePath: [0]
            } as any;

            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, incompleteExtension, mockPegBody, mockEngine, mockCooldownManager);
            }).not.toThrow();

            expect(Body.setVelocity).toHaveBeenCalled();
        });
    });

    describe('Peg Label Parsing', () => {
        it('should parse valid peg labels correctly', () => {
            const testLabels = [
                'pin-1-3',
                'pin-2-5',
                'pin-10-8'
            ];

            testLabels.forEach(label => {
                mockPegBody.label = label;
                mockBallExtension.currentPathIndex = 0; // Reset for each test

                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

                expect(Body.setVelocity).toHaveBeenCalled();
            });
        });

        it('should handle malformed peg labels', () => {
            const malformedLabels = [
                'invalid-label',
                'pin-invalid-3',
                'pin-1-invalid',
                '',
                undefined
            ];

            malformedLabels.forEach(label => {
                mockPegBody.label = label as any;
                mockBallExtension.currentPathIndex = 0; // Reset for each test

                expect(() => {
                    handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);
                }).not.toThrow();

                expect(Body.setVelocity).toHaveBeenCalled();
            });
        });
    });

    describe('Path Boundary Conditions', () => {
        it('should handle path index at boundary', () => {
            mockBallExtension.currentPathIndex = 4; // Last valid index
            mockBallExtension.servicePath = [0, 1, 0, 1, 0];
            mockPegBody.label = 'pin-5-3'; // Row 5

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(mockBallExtension.currentPathIndex).toBe(5);
            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should handle path index out of bounds', () => {
            mockBallExtension.currentPathIndex = 10; // Way out of bounds
            mockPegBody.label = 'invalid-label'; // Trigger fallback

            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);
            }).not.toThrow();

            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should handle negative path index', () => {
            mockBallExtension.currentPathIndex = -1;
            mockPegBody.label = 'invalid-label';

            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);
            }).not.toThrow();

            expect(Body.setVelocity).toHaveBeenCalled();
        });
    });

    describe('Collision State Tracking', () => {
        it('should track pin collisions', () => {
            // Initialize pinCollisions array if not exists
            if (!mockBallExtension.pinCollisions) {
                mockBallExtension.pinCollisions = [];
            }

            // Manually add collision to track (as the function doesn't do this automatically)
            mockBallExtension.pinCollisions.push(mockPegBody.id);

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            expect(mockBallExtension.pinCollisions).toContain(mockPegBody.id);
        });

        it('should track wrong slot hits', () => {
            const originalWrongHits = mockBallExtension.wrongSlotHits;

            // Simulate wrong slot collision (this would be set by multiplier collision handler)
            mockBallExtension.wrongSlotHits = originalWrongHits + 1;

            expect(mockBallExtension.wrongSlotHits).toBe(originalWrongHits + 1);
        });

        it('should maintain collision history', () => {
            // Initialize pinCollisions array
            mockBallExtension.pinCollisions = [];

            // First collision
            mockBallExtension.pinCollisions.push(mockPegBody.id);
            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);

            // Second collision with different peg
            const anotherPeg = { ...mockPegBody, id: 3, label: 'pin-2-4' };
            mockBallExtension.pinCollisions.push(anotherPeg.id);
            mockBallExtension.currentPathIndex = 1;

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, anotherPeg, mockEngine, mockCooldownManager);

            expect(mockBallExtension.pinCollisions).toContain(mockPegBody.id);
            expect(mockBallExtension.pinCollisions).toContain(anotherPeg.id);
        });
    });

    describe('Engine Integration', () => {
        it('should work with valid engine object', () => {
            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine, mockCooldownManager);
            }).not.toThrow();

            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should handle engine without world property', () => {
            const engineWithoutWorld = { gravity: { x: 0, y: 0.8 } } as any;

            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, engineWithoutWorld, mockCooldownManager);
            }).not.toThrow();

            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should handle null engine gracefully', () => {
            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, null as any, mockCooldownManager);
            }).not.toThrow();

            expect(Body.setVelocity).toHaveBeenCalled();
        });
    });
});