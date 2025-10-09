/** @format */

// Set NODE_ENV to development for testing
process.env.NODE_ENV = "development";

require("@testing-library/jest-dom");

// Mock canvas context with all required methods
const mockCanvasContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    closePath: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    setTransform: jest.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "left",
    textBaseline: "alphabetic",
    fillText: jest.fn(),
    strokeText: jest.fn(),
    measureText: jest.fn(() => ({ width: 10 })),
    createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
    })),
    createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
    })),
    drawImage: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    // Add missing canvas drawing methods
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    rect: jest.fn(),
    roundRect: jest.fn(),
    closePath: jest.fn(),
    createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
    })),
    canvas: {
        width: 800,
        height: 600,
    },
};

// Mock HTMLCanvasElement
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext);

// Mock canvas dimensions
Object.defineProperty(HTMLCanvasElement.prototype, "width", {
    writable: true,
    value: 800,
});

Object.defineProperty(HTMLCanvasElement.prototype, "height", {
    writable: true,
    value: 600,
});

// Mock getBoundingClientRect for canvas elements
HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: jest.fn(),
}));

// Mock physics logger globally for all tests
const mockPhysicsLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    configure: jest.fn(),
    trackPerformance: jest.fn(),
    getLogHistory: jest.fn(() => []),
    clearHistory: jest.fn(),
    exportLogs: jest.fn(() => ""),
};

// Mock the physics module globally
jest.mock("./src/features/game/components/ball/physics", () => ({
    physicsLogger: mockPhysicsLogger,
    physicsConfig: {
        engine: {
            engineGravity: 0.8,
        },
    },
    calculateBallSize: jest.fn(() => 5),
    getBallPhysicsTweaks: jest.fn(() => ({})),
    getMiddleDropPosition: jest.fn(() => 300),
    BALL_CONSTANTS: {
        SPAWN: {
            MIN_SPAWN_INTERVAL_AUTO_BET: 100,
        },
    },
    initializePhysicsEngine: jest.fn(() => ({
        engine: {},
        world: { bodies: [], gravity: { y: 0.8 } },
        isReady: true,
    })),
}));

// Provide a global ResizeObserver mock for jsdom/Jest environment
if (!global.ResizeObserver) {
    global.ResizeObserver = class {
        constructor(_callback) {}
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}
