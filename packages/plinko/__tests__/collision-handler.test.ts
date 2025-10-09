/**
 * Collision Handler Tests
 * Tests for the collision handling system
 */

import { Body, Engine } from 'matter-js';
import { BallBodyExtension } from '../src/types/physics';
import { handleServiceGuidedPinCollision } from '../src/features/game/components/ball/physics/collisions/test-utils';

// Mock physics logger
jest.mock('../src/features/game/components/ball/physics', () => ({
    physicsLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Collision Handler', () => {
    let mockEngine: Engine;
    let mockBallBody: Body;
    let mockPegBody: Body;
    let mockBallExtension: BallBodyExtension;

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
            servicePath: [0, 1, 0, 1, 0], // 0 = left, 1 = right
            expectedFinalSlot: 3,
            multiplier: 2,
            wrongSlotHits: 0,
            pinCollisions: [],
            appliedGuidanceSteps: []
        };

        // Mock Body.setVelocity
        jest.spyOn(Body, 'setVelocity').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Service-Guided Ball Collisions', () => {
        it('should apply left nudge for path step 0', () => {
            // Setup for first collision (row 1, path index 0)
            mockPegBody.label = 'pin-1-3'; // Row 1
            mockBallExtension.currentPathIndex = 0; // Expects row 1 (index + 1)

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: -8, // Left nudge (8.0 strength)
                y: expect.any(Number) // Reduced Y velocity
            });
        });

        it('should apply right nudge for path step 1', () => {
            // Setup for second collision (row 2, path index 1)
            mockPegBody.label = 'pin-2-3'; // Row 2
            mockBallExtension.currentPathIndex = 1; // Expects row 2 (index + 1)

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: 8, // Right nudge (8.0 strength)
                y: expect.any(Number) // Reduced Y velocity
            });
        });

        it('should increment path index after applying nudge', () => {
            mockPegBody.label = 'pin-1-3';
            mockBallExtension.currentPathIndex = 0;

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);

            expect(mockBallExtension.currentPathIndex).toBe(1);
        });

        it('should track applied guidance steps', () => {
            mockPegBody.label = 'pin-1-3';
            mockBallExtension.currentPathIndex = 0;

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);

            expect(mockBallExtension.appliedGuidanceSteps).toContain('row-1-step-0');
        });

        it('should apply nudge regardless of service-guided flag', () => {
            // Current implementation applies row-based nudges even for non-service-guided balls if conditions met
            mockBallExtension.isServiceGuided = false;
            mockPegBody.label = 'pin-1-3'; // Row 1
            mockBallExtension.currentPathIndex = 0; // Expects row 1

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: -8, // Row-based nudge strength
                y: expect.any(Number) // Reduced Y velocity
            });
        });

        it('should apply row-based nudge for correct row', () => {
            // Ball expects row 1 and hits row 1
            mockPegBody.label = 'pin-1-3';
            mockBallExtension.currentPathIndex = 0;

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: -8, // Strong nudge for correct row
                y: expect.any(Number)
            });
        });

        it('should handle missing service path gracefully', () => {
            mockBallExtension.servicePath = undefined;
            mockPegBody.label = 'pin-1-3';

            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);
            }).not.toThrow();

            // Should still apply fallback nudge since servicePath check is bypassed
            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should handle malformed peg labels gracefully', () => {
            mockPegBody.label = 'invalid-label';
            mockBallExtension.currentPathIndex = 0;

            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);
            }).not.toThrow();

            // Should apply fallback nudge since row parsing fails
            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: -1.5, // Fallback nudge
                y: 2
            });
        });
    });

    describe('Path Completion', () => {
        it('should complete path when final step is applied', () => {
            // Set up final collision
            mockPegBody.label = 'pin-5-3';
            mockBallExtension.currentPathIndex = 4; // Last step
            mockBallExtension.servicePath = [0, 1, 0, 1, 0];

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);

            expect(mockBallExtension.currentPathIndex).toBe(5); // Incremented to complete
            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should handle path index out of bounds', () => {
            mockPegBody.label = 'invalid-label'; // Use invalid label to trigger fallback
            mockBallExtension.currentPathIndex = 5; // Beyond path length
            mockBallExtension.servicePath = [0, 1, 0, 1, 0];

            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, mockEngine);
            }).not.toThrow();

            // Should apply fallback nudge even with out-of-bounds index
            expect(Body.setVelocity).toHaveBeenCalled();
        });
    });
});
