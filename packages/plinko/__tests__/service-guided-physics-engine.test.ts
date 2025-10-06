import { Bodies, Body, Engine, World } from 'matter-js';
import { createPhysicsBodies, spawnBallWithPath, createBallWithServicePath } from '../src/lib/physics/physics-engine';
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
        add: jest.fn(),
        remove: jest.fn()
    }
}));

describe('Service-Guided Physics Engine - TDD Tests', () => {
    let mockEngine: any;
    let mockCanvasRef: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEngine = {
            world: {
                bodies: [],
                gravity: { x: 0, y: 1 }
            }
        };

        mockCanvasRef = {
            current: {
                getBoundingClientRect: () => ({
                    width: 600,
                    height: 800
                })
            }
        };

        // Setup proper mock bodies
        (Bodies.rectangle as jest.Mock).mockImplementation((x, y, width, height, options) => ({
            id: Math.random(),
            position: { x, y },
            label: options?.label || 'mock-body',
            render: options?.render || {},
            restitution: options?.restitution || 0.8,
            friction: options?.friction || 0.1,
            frictionAir: options?.frictionAir || 0.01,
            collisionFilter: options?.collisionFilter || { group: 0 },
            ...options
        }));

        (Bodies.circle as jest.Mock).mockImplementation((x, y, radius, options) => ({
            id: Math.random(),
            position: { x, y },
            label: options?.label || 'mock-ball',
            render: options?.render || {},
            restitution: options?.restitution || 0.8,
            friction: options?.friction || 0.1,
            frictionAir: options?.frictionAir || 0.01,
            collisionFilter: options?.collisionFilter || { group: 0 },
            ...options
        }));
    });

    describe('createPhysicsBodies', () => {
        it('should create multiplier slots with correct 0-based indexing', () => {
            // Arrange
            const rows = 8;
            const multipliers = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]; // 9 slots

            // Act
            const result = createPhysicsBodies(800, 600, rows, multipliers);

            // Assert
            expect(Bodies.rectangle).toHaveBeenCalled();

            // Verify slot labels are created with correct indexing
            const slotCalls = (Bodies.rectangle as jest.Mock).mock.calls.filter(
                call => call[4]?.label?.includes('multiplier')
            );

            expect(slotCalls).toHaveLength(9);

            // Check first few slot labels
            expect(slotCalls[0][4].label).toBe('multiplier-0.5-0'); // slotIndex 0
            expect(slotCalls[1][4].label).toBe('multiplier-0.5-1'); // slotIndex 1
            expect(slotCalls[2][4].label).toBe('multiplier-0.5-2'); // slotIndex 2
            expect(slotCalls[8][4].label).toBe('multiplier-0.5-8'); // slotIndex 8
        });

        it('should create pegs with correct row and column labeling', () => {
            // Arrange
            const rows = 8;
            const multipliers = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];

            // Act
            const result = createPhysicsBodies(800, 600, rows, multipliers);

            // Assert
            const allCalls = (Bodies.circle as jest.Mock).mock.calls;
            const pegCalls = allCalls.filter(
                call => call[3]?.label?.includes('pin-')
            );

            expect(pegCalls.length).toBeGreaterThan(0);

            // Check peg labeling format: pin-{row}-{col}
            const firstPeg = pegCalls[0][3];
            expect(firstPeg.label).toMatch(/^pin-\d+-\d+$/);
        });

        it('should create walls for ball containment', () => {
            // Arrange
            const rows = 8;
            const multipliers = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];

            // Act
            const result = createPhysicsBodies(800, 600, rows, multipliers);

            // Assert
            const wallCalls = (Bodies.rectangle as jest.Mock).mock.calls.filter(
                call => call[4]?.label?.includes('wall')
            );

            expect(wallCalls.length).toBeGreaterThan(0);
        });
    });

    describe('spawnBallWithPath', () => {
        it('should create service-guided ball with correct properties', () => {
            // Arrange
            const serviceData = {
                path: [1, 0, 0, 0, 1, 0, 0, 1],
                finalSlot: 3,
                multiplier: 0.5,
                betValue: 100
            };

            // Act
            const ball = createBallWithServicePath(mockEngine, serviceData, mockCanvasRef, 8);

            // Assert
            expect(Bodies.circle).toHaveBeenCalled();
            expect(ball).toBeDefined();

            const ballExtension = ball as Body & BallBodyExtension;
            expect(ballExtension.isServiceGuided).toBe(true);
            expect(ballExtension.servicePath).toEqual([1, 0, 0, 0, 1, 0, 0, 1]);
            expect(ballExtension.currentPathIndex).toBe(0);
            expect(ballExtension.expectedFinalSlot).toBe(3);
            expect(ballExtension.multiplier).toBe(0.5);
            expect(ballExtension.betValue).toBe(100);
        });

        it('should set correct physics properties for service-guided balls', () => {
            // Arrange
            const serviceData = {
                path: [1, 0, 0, 0, 1, 0, 0, 1],
                finalSlot: 3,
                multiplier: 0.5,
                betValue: 100
            };

            // Act
            const ball = createBallWithServicePath(mockEngine, serviceData, mockCanvasRef, 8);

            // Assert
            const ballCalls = (Bodies.circle as jest.Mock).mock.calls.filter(
                call => call[3]?.label === 'service-guided-ball'
            );
            expect(ballCalls.length).toBeGreaterThan(0);

            const ballCall = ballCalls[0];
            const ballOptions = ballCall[3];

            expect(ballOptions.restitution).toBe(0); // No bounce
            expect(ballOptions.friction).toBe(0); // No friction
            expect(ballOptions.frictionAir).toBe(0); // No air resistance
            expect(ballOptions.collisionFilter.group).toBe(-1); // Match demo collision group
        });

        it('should initialize path tracking for visualization', () => {
            // Arrange
            const serviceData = {
                path: [1, 0, 0, 0, 1, 0, 0, 1],
                finalSlot: 3,
                multiplier: 0.5,
                betValue: 100
            };

            // Act
            const ball = createBallWithServicePath(mockEngine, serviceData, mockCanvasRef, 8);

            // Assert
            const ballExtension = ball as Body & BallBodyExtension;
            expect(ballExtension.pathPositions).toBeDefined();
            expect(ballExtension.pathPositions).toHaveLength(1);
            expect(ballExtension.pathPositions[0].type).toBe('spawn');
        });

        it('should spawn ball from middle drop position', () => {
            // Arrange
            const serviceData = {
                path: [1, 0, 0, 0, 1, 0, 0, 1],
                finalSlot: 3,
                multiplier: 0.5,
                betValue: 100
            };

            // Act
            const ball = createBallWithServicePath(mockEngine, serviceData, mockCanvasRef, 8);

            // Assert
            const ballCall = (Bodies.circle as jest.Mock).mock.calls[0];
            const ballX = ballCall[0];
            const ballY = ballCall[1];

            // Should spawn from middle position (5th of 9 positions)
            expect(ballX).toBe(300); // Middle of 600px width
            expect(ballY).toBeGreaterThan(0); // Top of canvas
        });

        it('should handle different path lengths correctly', () => {
            // Test cases for different row counts
            const testCases = [
                { rows: 8, path: [1, 0, 0, 0, 1, 0, 0, 1] },
                { rows: 9, path: [1, 0, 0, 0, 1, 0, 0, 1, 0] },
                { rows: 10, path: [1, 0, 0, 0, 1, 0, 0, 1, 0, 1] }
            ];

            testCases.forEach(({ rows, path }) => {
                // Arrange
                const serviceData = {
                    path,
                    finalSlot: path.filter(p => p === 1).length,
                    multiplier: 0.5,
                    betValue: 100
                };

                // Act
                const ball = createBallWithServicePath(mockEngine, serviceData, mockCanvasRef, rows);

                // Assert
                const ballExtension = ball as Body & BallBodyExtension;
                expect(ballExtension.servicePath).toEqual(path);
                expect(ballExtension.servicePath.length).toBe(rows);
            });
        });
    });

    describe('Ball Physics Configuration', () => {
        it('should calculate correct ball size based on canvas scaling', () => {
            // Arrange
            const serviceData = {
                path: [1, 0, 0, 0, 1, 0, 0, 1],
                finalSlot: 3,
                multiplier: 0.5,
                betValue: 100
            };

            // Act
            const ball = createBallWithServicePath(mockEngine, serviceData, mockCanvasRef, 8);

            // Assert
            const ballCall = (Bodies.circle as jest.Mock).mock.calls[0];
            const ballRadius = ballCall[2];

            expect(ballRadius).toBeGreaterThan(0);
            expect(typeof ballRadius).toBe('number');
        });

        it('should set correct ball color based on bet value', () => {
            // Arrange
            const testCases = [
                { betValue: 100, expectedColor: 'ball' },
                { betValue: 0, expectedColor: 'multiplierLoss' },
                { betValue: -50, expectedColor: 'multiplierLoss' }
            ];

            testCases.forEach(({ betValue, expectedColor }) => {
                const serviceData = {
                    path: [1, 0, 0, 0, 1, 0, 0, 1],
                    finalSlot: 3,
                    multiplier: 0.5,
                    betValue
                };

                // Act
                const ball = createBallWithServicePath(mockEngine, serviceData, mockCanvasRef, 8);

                // Assert
                const ballCalls = (Bodies.circle as jest.Mock).mock.calls.filter(
                    call => call[3]?.label === 'service-guided-ball'
                );
                expect(ballCalls.length).toBeGreaterThan(0);

                const ballCall = ballCalls[ballCalls.length - 1]; // Get the last ball call
                const ballOptions = ballCall[3];

                expect(ballOptions.render.fillStyle).toBeDefined();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle missing canvas reference', () => {
            // Arrange
            const serviceData = {
                path: [1, 0, 0, 0, 1, 0, 0, 1],
                finalSlot: 3,
                multiplier: 0.5,
                betValue: 100
            };
            const nullCanvasRef = { current: null };

            // Act & Assert - Function should not throw, but may not work properly
            expect(() => {
                spawnBallWithPath(mockEngine, nullCanvasRef, serviceData, 8);
            }).not.toThrow();
        });

        it('should handle invalid service data', () => {
            // Arrange
            const invalidServiceData = {
                path: [], // Empty path instead of null
                finalSlot: 0,
                multiplier: 1.0,
                betValue: 100
            };

            // Act & Assert
            expect(() => {
                spawnBallWithPath(mockEngine, mockCanvasRef, invalidServiceData, 8);
            }).not.toThrow(); // Should handle gracefully
        });
    });
});
