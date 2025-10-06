import { Bodies, Engine, Composite } from 'matter-js';
import {
    getCanvasInfo,
    createPhysicsBodies,
    spawnBall,
    spawnBallWithPath,
    CanvasInfo,
    ServiceGuidedBallData
} from '../src/lib/physics/physics-engine';
import { physicsConfig } from '../src/lib/physics/physics-config';

// Mock Matter.js for testing
jest.mock('matter-js', () => ({
    Bodies: {
        circle: jest.fn(),
        rectangle: jest.fn()
    },
    Engine: {
        create: jest.fn(),
        clear: jest.fn()
    },
    Composite: {
        add: jest.fn(),
        allBodies: jest.fn()
    },
    Runner: {
        create: jest.fn(),
        run: jest.fn(),
        stop: jest.fn()
    },
    World: {
        clear: jest.fn()
    }
}));

// Mock physics config
jest.mock('../src/lib/physics/physics-config', () => ({
    physicsConfig: {
        world: {
            width: 600,
            height: 550
        },
        colors: {
            pin: '#F5DCFF',
            ball: '#FF6B6B',
            multiplierHigh: '#8e44ad',
            multiplierMedium: '#9b59b6',
            multiplierLow: '#3498db',
            multiplierLoss: '#2c3e50'
        },
        engine: {
            engineGravity: 0.8
        }
    }
}));

// Mock ball calculations
jest.mock('../src/lib/physics/ball-calculations', () => ({
    calculateBallSize: jest.fn((rows: number) => Math.max(4, Math.min(8, 6 - rows * 0.2))),
    getBallPhysicsTweaks: jest.fn((radius: number) => ({
        restitution: 0.3,
        friction: 0.6,
        frictionAir: 0.01,
        density: 0.001
    }))
}));

// Mock drop positions
jest.mock('../src/lib/physics/drop-positions', () => ({
    getMiddleDropPosition: jest.fn((width: number) => width / 2)
}));

describe('Physics Engine', () => {
    let mockCanvasRef: React.RefObject<HTMLDivElement>;
    let mockEngine: any;
    let mockWorld: any;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock canvas ref
        mockCanvasRef = {
            current: {
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 600,
                    height: 550,
                    top: 0,
                    left: 0,
                    bottom: 550,
                    right: 600
                })
            } as any
        };

        // Setup mock engine and world
        mockWorld = {
            bodies: []
        };

        mockEngine = {
            world: mockWorld,
            gravity: { y: 0.8 }
        };

        (Engine.create as jest.Mock).mockReturnValue(mockEngine);
        (Bodies.circle as jest.Mock).mockImplementation((x, y, radius, options) => ({
            position: { x, y },
            circleRadius: radius,
            label: options?.label || 'body',
            isStatic: options?.isStatic || false,
            isSensor: options?.isSensor || false,
            render: options?.render || {},
            id: Math.random()
        }));

        (Bodies.rectangle as jest.Mock).mockImplementation((x, y, width, height, options) => ({
            position: { x, y },
            bounds: {
                min: { x: x - width / 2, y: y - height / 2 },
                max: { x: x + width / 2, y: y + height / 2 }
            },
            label: options?.label || 'body',
            isStatic: options?.isStatic || false,
            isSensor: options?.isSensor || false,
            render: options?.render || {},
            id: Math.random()
        }));
    });

    describe('getCanvasInfo', () => {
        it('should return canvas info when canvas ref exists', () => {
            const result = getCanvasInfo(mockCanvasRef);

            expect(result).toEqual({
                canvasWidth: 600,
                canvasHeight: 550,
                ballCategory: 1,
                defaultCategory: 2,
                multiplierCategory: 4
            });
        });

        it('should return null when canvas ref is null', () => {
            const nullRef = { current: null };
            const result = getCanvasInfo(nullRef);

            expect(result).toBeNull();
        });

        it('should use default dimensions when getBoundingClientRect returns zero', () => {
            mockCanvasRef.current!.getBoundingClientRect = jest.fn().mockReturnValue({
                width: 0,
                height: 0
            });

            const result = getCanvasInfo(mockCanvasRef);

            expect(result).toEqual({
                canvasWidth: 600, // physicsConfig.world.width
                canvasHeight: 550, // physicsConfig.world.height
                ballCategory: 1,
                defaultCategory: 2,
                multiplierCategory: 4
            });
        });
    });

    describe('createPhysicsBodies', () => {
        it('should create correct number of pins for given rows', () => {
            const rows = 5;
            const multipliers = [0.5, 1, 2, 3, 5, 10];

            const result = createPhysicsBodies(600, 550, rows, multipliers);

            // For 5 rows: 3 + 4 + 5 + 6 + 7 = 25 pins
            expect(result.pins).toHaveLength(25);
            expect(result.multipliersBodies).toHaveLength(6); // multipliers.length
            expect(result.walls.length).toBeGreaterThan(0); // walls are created
        });

        it('should create pins with correct labels', () => {
            const rows = 3;
            const multipliers = [1, 2];

            createPhysicsBodies(600, 550, rows, multipliers);

            // Check that Bodies.circle was called with correct labels
            expect(Bodies.circle).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.objectContaining({
                    label: 'pin-1-1',
                    isStatic: true
                })
            );
        });

        it('should create multiplier bodies with correct properties', () => {
            const rows = 3;
            const multipliers = [1, 2, 3];

            createPhysicsBodies(600, 550, rows, multipliers);

            // Check multiplier body creation
            expect(Bodies.rectangle).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.objectContaining({
                    label: 'multiplier-1-0',
                    isStatic: true,
                    isSensor: true
                })
            );
        });

        it('should create walls with correct properties', () => {
            const rows = 3;
            const multipliers = [1, 2];

            createPhysicsBodies(600, 550, rows, multipliers);

            // Check wall creation (left, right, floor)
            expect(Bodies.rectangle).toHaveBeenCalledWith(
                -10,
                275, // canvasHeight / 2
                20,
                1100, // canvasHeight * 2
                expect.objectContaining({
                    render: { visible: false },
                    isStatic: true
                })
            );
        });
    });

    describe('spawnBall', () => {
        let mockLastSpawnTimeRef: React.MutableRefObject<number>;

        beforeEach(() => {
            mockLastSpawnTimeRef = { current: 0 };
        });

        it('should create and add ball to engine world', () => {
            const rows = 5;
            const betAmount = 100;
            const minSpawnInterval = 500;

            spawnBall(mockEngine, mockCanvasRef, rows, betAmount, mockLastSpawnTimeRef, minSpawnInterval);

            expect(Bodies.circle).toHaveBeenCalledWith(
                expect.any(Number), // x position
                30, // y position
                expect.any(Number), // radius
                expect.objectContaining({
                    label: 'ball-100',
                    isStatic: false
                })
            );

            expect(Composite.add).toHaveBeenCalledWith(mockWorld, expect.any(Object));
        });

        it('should respect minimum spawn interval', () => {
            const rows = 5;
            const betAmount = 100;
            const minSpawnInterval = 500;

            // Set last spawn time to recent
            mockLastSpawnTimeRef.current = Date.now() - 100; // 100ms ago

            spawnBall(mockEngine, mockCanvasRef, rows, betAmount, mockLastSpawnTimeRef, minSpawnInterval);

            // Should not create ball due to interval restriction
            expect(Bodies.circle).not.toHaveBeenCalled();
            expect(Composite.add).not.toHaveBeenCalled();
        });

        it('should handle missing engine world gracefully', () => {
            const rows = 5;
            const betAmount = 100;
            const minSpawnInterval = 500;

            const engineWithoutWorld = { ...mockEngine, world: null };

            expect(() => {
                spawnBall(engineWithoutWorld, mockCanvasRef, rows, betAmount, mockLastSpawnTimeRef, minSpawnInterval);
            }).not.toThrow();
        });
    });

    describe('spawnBallWithPath', () => {
        const mockServiceData: ServiceGuidedBallData = {
            path: [0, 1, 0, 1, 0],
            finalSlot: 2,
            multiplier: 2.5,
            betValue: 50
        };

        it('should create service-guided ball with correct properties', () => {
            const rows = 5;

            spawnBallWithPath(mockEngine, mockCanvasRef, mockServiceData, rows);

            expect(Bodies.circle).toHaveBeenCalledWith(
                expect.any(Number), // x position
                expect.any(Number), // y position
                expect.any(Number), // radius
                expect.objectContaining({
                    label: 'service-guided-ball',
                    isStatic: false,
                    render: expect.objectContaining({
                        strokeStyle: '#FFD700'
                    })
                })
            );

            expect(Composite.add).toHaveBeenCalledWith(mockWorld, expect.any(Object));
        });

        it('should handle path length mismatch gracefully', () => {
            const rows = 3; // Different from path length
            const invalidServiceData = {
                ...mockServiceData,
                path: [0, 1, 0] // Length 3, but rows is 3
            };

            expect(() => {
                spawnBallWithPath(mockEngine, mockCanvasRef, invalidServiceData, rows);
            }).not.toThrow();
        });

        it('should handle slot mismatch gracefully', () => {
            const rows = 5;
            const invalidServiceData = {
                ...mockServiceData,
                finalSlot: 10 // Invalid slot
            };

            expect(() => {
                spawnBallWithPath(mockEngine, mockCanvasRef, invalidServiceData, rows);
            }).not.toThrow();
        });
    });
});
