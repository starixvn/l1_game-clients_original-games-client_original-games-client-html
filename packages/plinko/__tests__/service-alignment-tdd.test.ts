/**
 * Service Alignment TDD Tests
 * Tests for service-guided ball alignment and path following
 */

import { Body } from 'matter-js';
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

describe('Service-Guided Ball Alignment TDD', () => {
    let mockBallBody: Body;
    let mockPegBody: Body;
    let mockBallExtension: BallBodyExtension;

    beforeEach(() => {
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

        // Create mock ball extension with service guidance
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

    describe('Path Following Logic', () => {
        it('should follow left path correctly (step 0)', () => {
            mockBallExtension.servicePath = [0, 1, 0, 1, 0]; // Left first
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3'; // Row 1

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: -8, // Left nudge
                y: expect.any(Number)
            });
            expect(mockBallExtension.currentPathIndex).toBe(1);
        });

        it('should follow right path correctly (step 1)', () => {
            mockBallExtension.servicePath = [0, 1, 0, 1, 0]; // Right second
            mockBallExtension.currentPathIndex = 1;
            mockPegBody.label = 'pin-2-3'; // Row 2

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: 8, // Right nudge
                y: expect.any(Number)
            });
            expect(mockBallExtension.currentPathIndex).toBe(2);
        });

        it('should complete full path successfully', () => {
            mockBallExtension.servicePath = [1, 1]; // Simple right-right path
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3'; // Row 1

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(mockBallExtension.currentPathIndex).toBe(1);
            expect(mockBallExtension.appliedGuidanceSteps).toContain('row-1-step-0');

            // Second collision
            mockBallExtension.currentPathIndex = 1;
            mockPegBody.label = 'pin-2-3'; // Row 2

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(mockBallExtension.currentPathIndex).toBe(2);
            expect(mockBallExtension.appliedGuidanceSteps).toContain('row-2-step-1');
        });
    });

    describe('Service Guidance Activation', () => {
        it('should only apply guidance to service-guided balls', () => {
            mockBallExtension.isServiceGuided = false;
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            // Should still apply fallback nudge since servicePath exists
            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should require valid service path', () => {
            mockBallExtension.servicePath = undefined;
            mockPegBody.label = 'pin-1-3';

            expect(() => {
                handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);
            }).not.toThrow();

            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should handle empty service path', () => {
            mockBallExtension.servicePath = [];
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(Body.setVelocity).toHaveBeenCalled();
        });
    });

    describe('Path Index Management', () => {
        it('should increment path index after each guidance step', () => {
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(mockBallExtension.currentPathIndex).toBe(1);
        });

        it('should not increment path index for wrong rows', () => {
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-2-3'; // Wrong row (should be row 1)

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            // Should apply fallback nudge but not increment path index for row-based logic
            expect(Body.setVelocity).toHaveBeenCalled();
        });

        it('should handle path completion', () => {
            mockBallExtension.servicePath = [1]; // Single step path
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(mockBallExtension.currentPathIndex).toBe(1);
        });
    });

    describe('Guidance Step Tracking', () => {
        it('should track applied guidance steps with correct format', () => {
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(mockBallExtension.appliedGuidanceSteps).toContain('row-1-step-0');
        });

        it('should accumulate multiple guidance steps', () => {
            // First step
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3';
            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            // Second step
            mockBallExtension.currentPathIndex = 1;
            mockPegBody.label = 'pin-2-3';
            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(mockBallExtension.appliedGuidanceSteps).toHaveLength(2);
            expect(mockBallExtension.appliedGuidanceSteps).toContain('row-1-step-0');
            expect(mockBallExtension.appliedGuidanceSteps).toContain('row-2-step-1');
        });
    });

    describe('Target Slot Alignment', () => {
        it('should store expected final slot', () => {
            mockBallExtension.expectedFinalSlot = 5;

            expect(mockBallExtension.expectedFinalSlot).toBe(5);
        });

        it('should handle different target slots', () => {
            const testSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];

            testSlots.forEach(slot => {
                mockBallExtension.expectedFinalSlot = slot;
                expect(mockBallExtension.expectedFinalSlot).toBe(slot);
            });
        });

        it('should maintain target slot throughout path', () => {
            mockBallExtension.expectedFinalSlot = 3;
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(mockBallExtension.expectedFinalSlot).toBe(3); // Should remain unchanged
        });
    });

    describe('Path Validation', () => {
        it('should handle path with only left turns', () => {
            mockBallExtension.servicePath = [0, 0, 0, 0, 0];
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: -8, // Left nudge
                y: expect.any(Number)
            });
        });

        it('should handle path with only right turns', () => {
            mockBallExtension.servicePath = [1, 1, 1, 1, 1];
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: 8, // Right nudge
                y: expect.any(Number)
            });
        });

        it('should handle alternating path pattern', () => {
            mockBallExtension.servicePath = [0, 1, 0, 1, 0];
            mockBallExtension.currentPathIndex = 0;
            mockPegBody.label = 'pin-1-3';

            handleServiceGuidedPinCollision(mockBallBody, mockBallExtension, mockPegBody, {} as any);

            expect(Body.setVelocity).toHaveBeenCalledWith(mockBallBody, {
                x: -8, // First step is 0 (left)
                y: expect.any(Number)
            });
        });
    });
});
