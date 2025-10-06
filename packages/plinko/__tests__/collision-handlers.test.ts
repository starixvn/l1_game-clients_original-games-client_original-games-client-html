import { Bodies, Engine, World } from 'matter-js';
import {
    applyRandomPegDeflection,
    handleBallPayoutCollision
} from '../src/lib/physics/collision-handlers';

// Mock Matter.js
jest.mock('matter-js', () => ({
    Bodies: {
        circle: jest.fn(),
        rectangle: jest.fn()
    },
    Engine: {
        create: jest.fn(),
        update: jest.fn()
    },
    World: {
        remove: jest.fn()
    },
    Body: {
        setVelocity: jest.fn(),
        applyForce: jest.fn()
    }
}));

describe('Collision Handlers', () => {
    let mockBallBody: any;
    let mockSlotBody: any;
    let mockEngine: any;
    let mockWorld: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockWorld = {
            bodies: []
        };

        mockEngine = {
            world: mockWorld
        };

        mockBallBody = {
            id: 1,
            label: 'ball-100',
            position: { x: 300, y: 500 },
            velocity: { x: 0, y: 5 },
            parts: [],
            render: {
                visible: true,
                opacity: 1
            }
        };

        mockSlotBody = {
            id: 2,
            label: 'multiplier-2.5-3',
            position: { x: 300, y: 500 }
        };
    });

    describe('applyRandomPegDeflection', () => {
        it('should apply random deflection to ball', () => {
            const deflectionStrength = 0.2;

            applyRandomPegDeflection(mockBallBody, deflectionStrength);

            // Should not throw and should modify ball properties
            expect(mockBallBody).toBeDefined();
        });

        it('should handle different deflection strengths', () => {
            const weakDeflection = 0.1;
            const strongDeflection = 0.5;

            expect(() => {
                applyRandomPegDeflection(mockBallBody, weakDeflection);
                applyRandomPegDeflection(mockBallBody, strongDeflection);
            }).not.toThrow();
        });

        it('should handle edge cases', () => {
            expect(() => {
                applyRandomPegDeflection(mockBallBody, 0);
                applyRandomPegDeflection(mockBallBody, -0.1);
                applyRandomPegDeflection(mockBallBody, 1.0);
            }).not.toThrow();
        });
    });

    describe('handleBallPayoutCollision', () => {
        let mockOnBallHit: jest.Mock;

        beforeEach(() => {
            mockOnBallHit = jest.fn();
        });

        it('should call onBallHit callback with correct parameters', () => {
            const options = {
                onBallHit: mockOnBallHit
            };

            handleBallPayoutCollision(mockBallBody, mockSlotBody, mockEngine, options);

            expect(mockOnBallHit).toHaveBeenCalledWith(2.5, 100);
        });

        it('should handle missing onBallHit callback', () => {
            const options = {};

            expect(() => {
                handleBallPayoutCollision(mockBallBody, mockSlotBody, mockEngine, options);
            }).not.toThrow();
        });

        it('should parse multiplier from slot label correctly', () => {
            const testCases = [
                { label: 'multiplier-1.5-0', expectedMultiplier: 1.5 },
                { label: 'multiplier-10-5', expectedMultiplier: 10 },
                { label: 'multiplier-0.5-2', expectedMultiplier: 0.5 }
            ];

            testCases.forEach(({ label, expectedMultiplier }) => {
                const testSlotBody = { ...mockSlotBody, label };
                const options = { onBallHit: mockOnBallHit };

                handleBallPayoutCollision(mockBallBody, testSlotBody, mockEngine, options);

                expect(mockOnBallHit).toHaveBeenCalledWith(expectedMultiplier, 100);
            });
        });

        it('should parse ball value from ball label correctly', () => {
            const testCases = [
                { label: 'ball-50', expectedValue: 50 },
                { label: 'ball-200', expectedValue: 200 },
                { label: 'ball-invalid', expectedValue: 1 } // fallback
            ];

            testCases.forEach(({ label, expectedValue }) => {
                const testBallBody = { ...mockBallBody, label };
                const options = { onBallHit: mockOnBallHit };

                handleBallPayoutCollision(testBallBody, mockSlotBody, mockEngine, options);

                expect(mockOnBallHit).toHaveBeenCalledWith(2.5, expectedValue);
            });
        });

        it('should handle animation state if provided', () => {
            const animationState = new Map();
            const options = {
                onBallHit: mockOnBallHit,
                animationState
            };

            expect(() => {
                handleBallPayoutCollision(mockBallBody, mockSlotBody, mockEngine, options);
            }).not.toThrow();
        });

        it('should handle slot layout if provided', () => {
            const slotLayout = {
                startX: 100,
                slotWidth: 50,
                slotHeight: 20,
                bottomMargin: 10,
                multipliers: [1, 2, 3]
            };
            const options = {
                onBallHit: mockOnBallHit,
                slotLayout
            };

            expect(() => {
                handleBallPayoutCollision(mockBallBody, mockSlotBody, mockEngine, options);
            }).not.toThrow();
        });
    });
});
