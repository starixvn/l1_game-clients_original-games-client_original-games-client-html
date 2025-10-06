import { Bodies, Body, Engine, Composite } from 'matter-js';
import { BallLayoutProps } from '../src/shared/types';

/**
 * Test Utilities for Ball Layout and Physics Testing
 * 
 * Provides mock objects, test data, and helper functions for comprehensive testing
 */

// Mock Matter.js bodies for testing
export const createMockBall = (id: number, betValue: number = 100): Body => ({
    id,
    position: { x: 300, y: 100 },
    velocity: { x: 0, y: 5 },
    circleRadius: 5,
    label: `ball-${betValue}`,
    isStatic: false,
    isSensor: false,
    render: { fillStyle: '#FF6B6B' },
    parts: []
} as any);

export const createMockPin = (id: number, row: number, col: number): Body => ({
    id,
    position: { x: 300, y: 200 },
    bounds: {
        min: { x: 295, y: 195 },
        max: { x: 305, y: 205 }
    },
    label: `pin-${row}-${col}`,
    isStatic: true,
    isSensor: false,
    render: { fillStyle: '#F5DCFF' }
} as any);

export const createMockMultiplier = (id: number, multiplier: number, slotIndex: number): Body => ({
    id,
    position: { x: 300, y: 500 },
    bounds: {
        min: { x: 275, y: 495 },
        max: { x: 325, y: 505 }
    },
    label: `multiplier-${multiplier}-${slotIndex}`,
    isStatic: true,
    isSensor: true,
    render: { fillStyle: '#3498db' }
} as any);

export const createMockWall = (id: number, type: 'left' | 'right' | 'floor'): Body => ({
    id,
    position: { x: type === 'left' ? -10 : type === 'right' ? 610 : 300, y: type === 'floor' ? 560 : 275 },
    bounds: {
        min: { x: -20, y: 0 },
        max: { x: 620, y: 600 }
    },
    label: `${type}-wall`,
    isStatic: true,
    isSensor: false,
    render: { visible: false }
} as any);

// Mock engine and world
export const createMockEngine = (): Engine => ({
    world: {
        bodies: [],
        gravity: { y: 0.8 }
    },
    gravity: { y: 0.8 }
} as any);

export const createMockWorld = () => ({
    bodies: [],
    gravity: { y: 0.8 }
});

// Test data generators
export const generateTestMultipliers = (count: number = 9): number[] => {
    const baseMultipliers = [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
    return baseMultipliers.slice(0, count);
};

export const generateTestProbabilities = (count: number = 9): number[] => {
    const baseProbabilities = [0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.03, 0.01, 0.01];
    return baseProbabilities.slice(0, count);
};

export const createTestBallLayoutProps = (overrides: Partial<BallLayoutProps> = {}): BallLayoutProps => ({
    multipliers: generateTestMultipliers(),
    probabilities: generateTestProbabilities(),
    onBallHit: jest.fn(),
    ...overrides
});

// Mock canvas utilities
export const createMockCanvas = (width: number = 600, height: number = 550): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const mockContext = {
        clearRect: jest.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        createLinearGradient: jest.fn(() => ({
            addColorStop: jest.fn()
        })),
        font: '',
        textAlign: '',
        textBaseline: '',
        fillText: jest.fn()
    };

    canvas.getContext = jest.fn().mockReturnValue(mockContext);
    return canvas;
};

export const createMockContainer = (width: number = 600, height: number = 550): HTMLDivElement => {
    const container = document.createElement('div');
    container.getBoundingClientRect = jest.fn().mockReturnValue({
        width,
        height,
        top: 0,
        left: 0,
        bottom: height,
        right: width
    });
    return container;
};

// Collision event mocks
export const createMockCollisionEvent = (ballId: number, targetId: number, ballLabel: string, targetLabel: string) => ({
    pairs: [{
        bodyA: {
            id: ballId,
            label: ballLabel,
            position: { x: 300, y: 500 }
        },
        bodyB: {
            id: targetId,
            label: targetLabel,
            position: { x: 300, y: 500 }
        }
    }]
});

// Service-guided ball test data
export const createTestServiceData = (path: number[], finalSlot: number, multiplier: number, betValue: number) => ({
    path,
    finalSlot,
    multiplier,
    betValue
});

export const generateTestPaths = () => ({
    leftPath: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // All left turns
    rightPath: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // All right turns
    centerPath: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // Alternating
    randomPath: [0, 1, 0, 0, 1, 1, 0, 1, 0, 1] // Random pattern
});

// Performance testing utilities
export const measurePerformance = async (fn: () => void | Promise<void>, iterations: number = 100): Promise<number> => {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        await fn();
    }

    const end = performance.now();
    return end - start;
};

export const createStressTestData = (ballCount: number = 100) => {
    const balls = [];
    for (let i = 0; i < ballCount; i++) {
        balls.push(createMockBall(i, Math.floor(Math.random() * 1000) + 1));
    }
    return balls;
};

// Mock ResizeObserver
export const createMockResizeObserver = () => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn()
});

// Test assertions helpers
export const expectBallToBeCreated = (mockBodies: jest.Mock, betValue: number) => {
    expect(mockBodies).toHaveBeenCalledWith(
        expect.any(Number),
        30,
        expect.any(Number),
        expect.objectContaining({
            label: `ball-${betValue}`,
            isStatic: false
        })
    );
};

export const expectServiceBallToBeCreated = (mockBodies: jest.Mock, betValue: number) => {
    expect(mockBodies).toHaveBeenCalledWith(
        expect.any(Number),
        40, // startY for service balls
        expect.any(Number),
        expect.objectContaining({
            label: 'service-guided-ball',
            isStatic: false
        })
    );
};

export const expectPinToBeCreated = (mockBodies: jest.Mock, row: number, col: number) => {
    expect(mockBodies).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
            label: `pin-${row}-${col}`,
            isStatic: true
        })
    );
};

export const expectMultiplierToBeCreated = (mockBodies: jest.Mock, multiplier: number, slotIndex: number) => {
    expect(mockBodies).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
            label: `multiplier-${multiplier}-${slotIndex}`,
            isStatic: true,
            isSensor: true
        })
    );
};

// Error simulation utilities
export const simulateCanvasError = () => {
    HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(() => {
        throw new Error('Canvas context failed');
    });
};

export const simulatePhysicsError = () => {
    const mockEngine = require('matter-js').Engine;
    mockEngine.create.mockImplementation(() => {
        throw new Error('Physics engine failed');
    });
};

export const simulateNetworkError = () => {
    // Mock network-related errors if needed
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
};

// Cleanup utilities
export const cleanupMocks = () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
};

export const resetDOM = () => {
    document.body.innerHTML = '';
};

// Test configuration
export const TEST_CONFIG = {
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 550,
    DEFAULT_ROWS: 10,
    DEFAULT_BET_AMOUNT: 100,
    DEFAULT_MULTIPLIERS: [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20],
    DEFAULT_PROBABILITIES: [0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.03, 0.01, 0.01],
    PHYSICS_GRAVITY: 0.8,
    BALL_RADIUS_RANGE: { min: 4, max: 8 },
    SPAWN_INTERVAL: 500
};
