/**
 * Body Factory Unit Tests
 * Comprehensive tests for physics body creation functionality
 * Covers all functions, conditionals, and branches for 100% coverage
 */

import { Bodies, Body } from 'matter-js';
import {
    createPinBodies,
    createMultiplierBodies,
    createWallBodies,
    createPhysicsBodies,
    PhysicsBody,
    BodyCreationOptions
} from '../src/features/game/components/ball/physics/body-factory';
import logger from '../src/services/logger';
import { physicsLogger } from '../src/features/game/components/ball/physics/performance/physics-logger';
jest.mock('matter-js', () => ({
    Bodies: {
        circle: jest.fn(),
        rectangle: jest.fn(),
        triangle: jest.fn(),
        polygon: jest.fn(),
        trapezoid: jest.fn(),
        fromVertices: jest.fn()
    },
    Body: {
        create: jest.fn(),
        setStatic: jest.fn(),
        setPosition: jest.fn(),
        setVelocity: jest.fn(),
        setAngle: jest.fn(),
        setDensity: jest.fn(),
        setMass: jest.fn(),
        setInertia: jest.fn(),
        setVertices: jest.fn(),
        setParts: jest.fn(),
        setCentre: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        scale: jest.fn(),
        update: jest.fn(),
        nextGroup: jest.fn(),
        nextCategory: jest.fn()
    }
}));

jest.mock('../src/features/game/components/ball/physics/physics-config', () => ({
    physicsConfig: {
        colors: {
            pin: '#ff0000'
        }
    }
}));

jest.mock('../src/lib/utils/colors-util', () => ({
    getMultiplierColor: jest.fn(() => '#00ff00')
}));

jest.mock('../src/services/logger', () => ({
    logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

jest.mock('../src/features/game/components/ball/physics/performance/physics-logger', () => ({
    physicsLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

jest.mock('../src/features/game/components/ball/physics/constants/layout-constants', () => ({
    LAYOUT_CONSTANTS: {
        SCALE_BOUNDS: {
            MIN_SCALE: 0.5,
            MAX_SCALE: 2.0
        },
        BOARD: {
            SCALE_FACTOR_BASE_ROWS: 8,
            PEG_RADIUS_BASE: 6,
            PEG_GAP_BASE: 40
        }
    }
}));

jest.mock('../src/features/game/components/ball/physics/constants/physics-constants', () => ({
    PHYSICS_CONSTANTS: {
        WALLS: {
            THICKNESS: 10
        }
    }
}));

describe('Body Factory', () => {
    let mockBodiesCircle: jest.MockedFunction<typeof Bodies.circle>;
    let mockBodiesRectangle: jest.MockedFunction<typeof Bodies.rectangle>;
    let mockLoggerDebug: jest.Mock;
    let mockPhysicsLoggerInfo: jest.Mock;
    let mockGetMultiplierColor: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mocks
        mockBodiesCircle = Bodies.circle as jest.MockedFunction<typeof Bodies.circle>;
        mockBodiesRectangle = Bodies.rectangle as jest.MockedFunction<typeof Bodies.rectangle>;

        // Mock the logger functions
        const logger = require('../src/services/logger').logger;
        mockLoggerDebug = logger.debug as jest.Mock;

        const physicsLogger = require('../src/features/game/components/ball/physics/performance/physics-logger').physicsLogger;
        mockPhysicsLoggerInfo = physicsLogger.info as jest.Mock;

        const colorsUtil = require('../src/lib/utils/colors-util');
        mockGetMultiplierColor = colorsUtil.getMultiplierColor as jest.Mock;

        // Mock Bodies.circle to return a mock body
        mockBodiesCircle.mockImplementation((x, y, radius, options) => ({
            id: Math.random(),
            position: { x, y },
            circleRadius: radius,
            label: options?.label || 'circle',
            render: options?.render || {},
            isStatic: options?.isStatic || false,
            ...options
        } as any));

        // Mock Bodies.rectangle to return a mock body
        mockBodiesRectangle.mockImplementation((x, y, width, height, options) => ({
            id: Math.random(),
            position: { x, y },
            label: options?.label || 'rectangle',
            render: options?.render || {},
            isStatic: options?.isStatic || false,
            isSensor: options?.isSensor || false,
            ...options
        } as any));
    });

    describe('createPinBodies', () => {
        it('should create pins for minimum rows (1)', () => {
            const pins = createPinBodies(1, 600, 550);

            expect(pins).toHaveLength(3); // 1 row has 3 columns
            expect(mockBodiesCircle).toHaveBeenCalledTimes(3);
            expect(mockLoggerDebug).toHaveBeenCalledTimes(3); // All pins logged (length <= 5)
        });

        it('should create pins for standard rows (8)', () => {
            const pins = createPinBodies(8, 600, 550);

            // Row 1: 3 pins, Row 2: 4 pins, ..., Row 8: 10 pins
            // Total: 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 = 52 pins
            expect(pins).toHaveLength(52);
            expect(mockBodiesCircle).toHaveBeenCalledTimes(52);
            expect(mockLoggerDebug).toHaveBeenCalledTimes(5); // Only first 5 pins logged
        });

        it('should create pins with correct labels and properties', () => {
            const pins = createPinBodies(2, 600, 550);

            expect(mockBodiesCircle).toHaveBeenCalledWith(
                expect.any(Number), // x
                expect.any(Number), // y
                expect.any(Number), // radius
                expect.objectContaining({
                    label: expect.stringMatching(/^pin-\d+-\d+$/),
                    render: { fillStyle: '#ff0000' },
                    isStatic: true
                })
            );
        });

        it('should handle minimum scale factor bounds', () => {
            // Very large number of rows should hit MIN_SCALE
            const pins = createPinBodies(100, 600, 550);

            expect(pins.length).toBeGreaterThan(0);
            expect(mockBodiesCircle).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                3, // Minimum peg radius
                expect.any(Object)
            );
        });

        it('should handle maximum scale factor bounds', () => {
            // Very small number of rows should hit MAX_SCALE
            const pins = createPinBodies(1, 600, 550);

            expect(pins.length).toBeGreaterThan(0);
            expect(mockBodiesCircle).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                12, // Maximum peg radius
                expect.any(Object)
            );
        });

        it('should position pins correctly in triangular layout', () => {
            const pins = createPinBodies(3, 600, 550);

            // Verify first row (3 pins)
            expect(mockBodiesCircle).toHaveBeenNthCalledWith(1,
                expect.any(Number), 40, expect.any(Number), // y = boardTopMargin = 40
                expect.objectContaining({ label: 'pin-1-0' })
            );

            // Verify second row (4 pins)
            expect(mockBodiesCircle).toHaveBeenNthCalledWith(4,
                expect.any(Number), 80, expect.any(Number), // y = 40 + 40 = 80
                expect.objectContaining({ label: 'pin-2-0' })
            );
        });

        it('should handle edge case canvas dimensions', () => {
            const pins = createPinBodies(5, 100, 100);

            expect(pins.length).toBeGreaterThan(0);
            expect(mockBodiesCircle).toHaveBeenCalled();
        });
    });

    describe('createMultiplierBodies', () => {
        const mockMultipliers = [1, 2, 3, 4, 5];
        const mockGameMode = 1;

        it('should create multiplier bodies for minimum rows', () => {
            const multipliers = createMultiplierBodies(1, mockMultipliers, mockGameMode, 600, 550);

            expect(multipliers).toHaveLength(2); // 1 row + 1 = 2 slots, limited by multipliers.length
            expect(mockBodiesRectangle).toHaveBeenCalledTimes(2);
        });

        it('should create multiplier bodies for standard rows', () => {
            const multipliers = createMultiplierBodies(8, mockMultipliers, mockGameMode, 600, 550);

            expect(multipliers).toHaveLength(5); // Limited by multipliers.length
            expect(mockBodiesRectangle).toHaveBeenCalledTimes(5);
        });

        it('should create multiplier bodies with correct properties', () => {
            const multipliers = createMultiplierBodies(3, [10], mockGameMode, 600, 550);

            expect(mockBodiesRectangle).toHaveBeenCalledWith(
                expect.any(Number), // x
                expect.any(Number), // y (below last row)
                expect.any(Number), // width
                1, // height (thin slot)
                expect.objectContaining({
                    label: 'multiplier-10-0',
                    isStatic: true,
                    isSensor: true,
                    render: { fillStyle: '#00ff00' }
                })
            );
            expect(mockGetMultiplierColor).toHaveBeenCalledWith(0, mockGameMode, 3);
        });

        it('should position slots correctly below the physics board', () => {
            const multipliers = createMultiplierBodies(3, [5], mockGameMode, 600, 550);

            // Verify slot is positioned below the last row
            const lastRowY = 40 + (3 - 1) * 40; // boardTopMargin + (rows-1) * pegGap
            const expectedSlotY = lastRowY + 40 * 0.8; // lastRowY + pegGap * 0.8

            expect(mockBodiesRectangle).toHaveBeenCalledWith(
                expect.any(Number),
                expectedSlotY,
                expect.any(Number),
                1,
                expect.any(Object)
            );
        });

        it('should handle slot width scaling correctly', () => {
            // Test minimum slot width
            createMultiplierBodies(20, [1], mockGameMode, 600, 550); // Large rows = small scale

            expect(mockBodiesRectangle).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                8, // Minimum slot width
                1,
                expect.any(Object)
            );

            // Reset mock
            mockBodiesRectangle.mockClear();

            // Test maximum slot width
            createMultiplierBodies(1, [1], mockGameMode, 600, 550); // Small rows = large scale

            expect(mockBodiesRectangle).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                32, // pegGap (40) - 8 * scaleFactor (minimum scale)
                1,
                expect.any(Object)
            );
        });

        it('should limit slots to available multipliers', () => {
            const manyMultipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const multipliers = createMultiplierBodies(3, manyMultipliers, mockGameMode, 600, 550);

            expect(multipliers).toHaveLength(4); // rows (3) + 1 = 4 slots
            expect(mockBodiesRectangle).toHaveBeenCalledTimes(4);
        });

        it('should handle empty multipliers array', () => {
            const multipliers = createMultiplierBodies(5, [], mockGameMode, 600, 550);

            expect(multipliers).toHaveLength(0);
            expect(mockBodiesRectangle).not.toHaveBeenCalled();
        });

        it('should handle edge case canvas dimensions', () => {
            const multipliers = createMultiplierBodies(5, mockMultipliers, mockGameMode, 100, 100);

            expect(multipliers.length).toBeGreaterThan(0);
            expect(mockBodiesRectangle).toHaveBeenCalled();
        });
    });

    describe('createWallBodies', () => {
        it('should create all required wall bodies', () => {
            const walls = createWallBodies(600, 550);

            expect(walls).toHaveLength(5); // left, right, floor, extended-left, extended-right
            expect(mockBodiesRectangle).toHaveBeenCalledTimes(5);
        });

        it('should create left wall correctly', () => {
            createWallBodies(600, 550);

            expect(mockBodiesRectangle).toHaveBeenNthCalledWith(1,
                -5, // -wallThickness / 2 = -10/2 = -5
                275, // canvasHeight / 2 = 550/2 = 275
                10, // wallThickness
                1100, // canvasHeight * 2 = 550 * 2
                expect.objectContaining({
                    render: { visible: false },
                    isStatic: true
                })
            );
        });

        it('should create right wall correctly', () => {
            createWallBodies(600, 550);

            expect(mockBodiesRectangle).toHaveBeenNthCalledWith(2,
                605, // canvasWidth + wallThickness / 2 = 600 + 10/2 = 605
                275, // canvasHeight / 2
                10, // wallThickness
                1100, // canvasHeight * 2
                expect.objectContaining({
                    render: { visible: false },
                    isStatic: true
                })
            );
        });

        it('should create floor correctly', () => {
            createWallBodies(600, 550);

            expect(mockBodiesRectangle).toHaveBeenNthCalledWith(3,
                300, // canvasWidth / 2 = 600/2 = 300
                555, // canvasHeight + wallThickness / 2 = 550 + 10/2 = 555
                1200, // canvasWidth * 2 = 600 * 2
                10, // wallThickness
                expect.objectContaining({
                    render: { visible: false },
                    isStatic: true
                })
            );
        });

        it('should create extended left wall correctly', () => {
            createWallBodies(600, 550);

            expect(mockBodiesRectangle).toHaveBeenNthCalledWith(4,
                -20, // -wallThickness * 2 = -10 * 2 = -20
                275, // canvasHeight / 2
                10, // wallThickness
                1650, // canvasHeight * 3 = 550 * 3
                expect.objectContaining({
                    render: { visible: false },
                    isStatic: true,
                    label: 'extended-left-wall'
                })
            );
        });

        it('should create extended right wall correctly', () => {
            createWallBodies(600, 550);

            expect(mockBodiesRectangle).toHaveBeenNthCalledWith(5,
                620, // canvasWidth + wallThickness * 2 = 600 + 10 * 2 = 620
                275, // canvasHeight / 2
                10, // wallThickness
                1650, // canvasHeight * 3 = 550 * 3
                expect.objectContaining({
                    render: { visible: false },
                    isStatic: true,
                    label: 'extended-right-wall'
                })
            );
        });

        it('should handle different canvas dimensions', () => {
            const walls = createWallBodies(800, 600);

            expect(walls).toHaveLength(5);
            expect(mockBodiesRectangle).toHaveBeenCalledTimes(5);

            // Verify right wall position for new width
            expect(mockBodiesRectangle).toHaveBeenNthCalledWith(2,
                805, // 800 + 10/2 = 805
                300, // 600/2 = 300
                10,
                1200, // 600 * 2
                expect.any(Object)
            );
        });
    });

    describe('createPhysicsBodies', () => {
        const mockOptions: BodyCreationOptions = {
            rows: 8,
            multipliers: [1, 2, 3, 4, 5],
            gameMode: 1,
            canvasWidth: 600,
            canvasHeight: 550
        };

        it('should create complete physics body set', () => {
            const result = createPhysicsBodies(mockOptions);

            expect(result).toHaveProperty('pins');
            expect(result).toHaveProperty('multipliersBodies');
            expect(result).toHaveProperty('walls');
            expect(Array.isArray(result.pins)).toBe(true);
            expect(Array.isArray(result.multipliersBodies)).toBe(true);
            expect(Array.isArray(result.walls)).toBe(true);
        });

        it('should call all sub-functions with correct parameters', () => {
            const result = createPhysicsBodies(mockOptions);

            expect(result.pins.length).toBeGreaterThan(0);
            expect(result.multipliersBodies.length).toBeGreaterThan(0);
            expect(result.walls).toHaveLength(5);
        });

        it('should log creation start and success', () => {
            createPhysicsBodies(mockOptions);

            expect(mockPhysicsLoggerInfo).toHaveBeenCalledTimes(2);
            expect(mockPhysicsLoggerInfo).toHaveBeenNthCalledWith(1, 'Creating physics bodies', expect.objectContaining({
                component: 'BodyFactory',
                function: 'createPhysicsBodies',
                metadata: expect.objectContaining({
                    rows: 8,
                    multipliersCount: 5,
                    gameMode: 1,
                    canvasWidth: 600,
                    canvasHeight: 550
                })
            }));

            expect(mockPhysicsLoggerInfo).toHaveBeenNthCalledWith(2, 'Physics bodies created successfully', expect.objectContaining({
                component: 'BodyFactory',
                function: 'createPhysicsBodies',
                metadata: expect.objectContaining({
                    pinsCount: expect.any(Number),
                    multipliersCount: expect.any(Number),
                    wallsCount: 5
                })
            }));
        });

        it('should handle edge case parameters', () => {
            const edgeOptions: BodyCreationOptions = {
                rows: 1,
                multipliers: [],
                gameMode: 0,
                canvasWidth: 100,
                canvasHeight: 100
            };

            const result = createPhysicsBodies(edgeOptions);

            expect(result.pins.length).toBeGreaterThan(0);
            expect(result.multipliersBodies).toHaveLength(0);
            expect(result.walls).toHaveLength(5);
        });

        it('should return PhysicsBody interface compliant object', () => {
            const result = createPhysicsBodies(mockOptions);

            const physicsBody: PhysicsBody = result;
            expect(physicsBody.pins).toBeDefined();
            expect(physicsBody.multipliersBodies).toBeDefined();
            expect(physicsBody.walls).toBeDefined();
        });
    });

    describe('Integration and Error Handling', () => {
        it('should handle Matter.js mock failures gracefully', () => {
            mockBodiesCircle.mockImplementationOnce(() => {
                throw new Error('Matter.js error');
            });

            expect(() => createPinBodies(1, 600, 550)).toThrow('Matter.js error');
        });

        it('should handle logger failures gracefully', () => {
            mockLoggerDebug.mockImplementationOnce(() => {
                throw new Error('Logger error');
            });

            // Should still create pins even if logging fails
            const pins = createPinBodies(1, 600, 550);
            expect(pins).toHaveLength(3);
        });

        it('should handle physics logger failures gracefully', () => {
            mockPhysicsLoggerInfo.mockImplementationOnce(() => {
                throw new Error('Physics logger error');
            });

            // Should still create bodies even if logging fails
            const result = createPhysicsBodies({
                rows: 1,
                multipliers: [1],
                gameMode: 1,
                canvasWidth: 600,
                canvasHeight: 550
            });

            expect(result.pins.length).toBeGreaterThan(0);
        });

        it('should handle color utility failures gracefully', () => {
            mockGetMultiplierColor.mockImplementationOnce(() => {
                throw new Error('Color utility error');
            });

            expect(() => createMultiplierBodies(1, [1], 1, 600, 550)).toThrow('Color utility error');
        });
    });
});
