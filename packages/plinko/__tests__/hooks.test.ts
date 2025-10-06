import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '../src/features/game/components/ball/hooks/use-canvas';
import { usePhysicsEngine } from '../src/features/game/components/ball/hooks/use-physics-engine';
import { useBallSpawner } from '../src/features/game/components/ball/hooks/use-ball-spawner';
import { useBallRenderer } from '../src/features/game/components/ball/hooks/use-ball-renderer';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock Matter.js
jest.mock('matter-js', () => ({
    Bodies: {
        circle: jest.fn(() => ({ id: 1, label: 'ball', position: { x: 300, y: 30 } })),
        rectangle: jest.fn(() => ({ id: 2, label: 'wall', position: { x: 0, y: 275 } }))
    },
    Engine: {
        create: jest.fn(() => ({
            world: { bodies: [], composites: [] },
            gravity: { x: 0, y: 0.8 },
            timing: { timestamp: 0 }
        }))
    },
    Composite: {
        add: jest.fn((world, bodies) => {
            if (Array.isArray(bodies)) {
                world.bodies.push(...bodies);
            } else {
                world.bodies.push(bodies);
            }
        }),
        allBodies: jest.fn(() => [])
    },
    Runner: {
        create: jest.fn(() => ({ id: 'runner' })),
        run: jest.fn(),
        stop: jest.fn()
    },
    Events: {
        on: jest.fn(),
        off: jest.fn()
    }
}));

describe('Hooks Tests', () => {
    describe('useCanvas', () => {
        beforeEach(() => {
            // Reset all mocks
            jest.clearAllMocks();

            // Mock container element
            const mockContainer = {
                getBoundingClientRect: jest.fn(() => ({
                    width: 400,
                    height: 400,
                    left: 0,
                    top: 0
                })),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };

            // Mock document.querySelector
            document.getElementById = jest.fn(() => mockContainer as any);
        });

        it('should initialize with correct canvas dimensions', () => {
            const { result } = renderHook(() =>
                useCanvas({ canvasWidth: 600, canvasHeight: 550 })
            );

            expect(result.current.containerRef).toBeDefined();
            expect(result.current.canvasRef).toBeDefined();
            expect(result.current.containerSize).toEqual({ width: 400, height: 400 });
        });

        it('should calculate correct canvas scale', () => {
            const { result } = renderHook(() =>
                useCanvas({ canvasWidth: 600, canvasHeight: 550 })
            );

            // Scale should be based on container size which defaults to 400x400
            expect(result.current.canvasScale).toBeGreaterThan(0);
            expect(result.current.canvasScale).toBeLessThanOrEqual(1);
        });

        it('should handle container resize', () => {
            const { result } = renderHook(() =>
                useCanvas({ canvasWidth: 600, canvasHeight: 550 })
            );

            act(() => {
                // Simulate resize by calling the resize handler
                const resizeObserverCallback = (global.ResizeObserver as jest.Mock).mock.calls[0][0];
                resizeObserverCallback([{
                    contentRect: { width: 500, height: 450 }
                }]);
            });

            expect(result.current.containerSize).toEqual({ width: 500, height: 450 });
        });

        it('should handle window resize events', () => {
            const mockContainer = {
                getBoundingClientRect: jest.fn(() => ({
                    width: 300,
                    height: 350,
                    left: 0,
                    top: 0
                }))
            };

            // Mock the container ref current value
            const { result } = renderHook(() =>
                useCanvas({ canvasWidth: 600, canvasHeight: 550 })
            );

            // Manually set the ref current
            Object.defineProperty(result.current.containerRef, 'current', {
                value: mockContainer,
                writable: true
            });

            act(() => {
                // Trigger window resize
                window.dispatchEvent(new Event('resize'));
            });

            expect(mockContainer.getBoundingClientRect).toHaveBeenCalled();
        });

        it('should handle missing container gracefully', () => {
            const { result } = renderHook(() =>
                useCanvas({ canvasWidth: 600, canvasHeight: 550 })
            );

            // Container ref is null
            Object.defineProperty(result.current.containerRef, 'current', {
                value: null,
                writable: true
            });

            act(() => {
                window.dispatchEvent(new Event('resize'));
            });

            // Should not crash
            expect(result.current.containerSize).toEqual({ width: 400, height: 400 });
        });
    });

    describe('usePhysicsEngine', () => {
        const mockOnBallHit = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should initialize physics engine with correct parameters', () => {
            const { result } = renderHook(() =>
                usePhysicsEngine({
                    numberOfRows: 8,
                    multipliers: [0.5, 1, 2],
                    onBallHit: mockOnBallHit,
                    canvasWidth: 600,
                    canvasHeight: 550,
                    containerSize: { width: 400, height: 400 }
                })
            );

            expect(result.current.engine).toBeDefined();
            expect(result.current.runner).toBeDefined();
        });

        it('should initialize physics engine', () => {
            const { result } = renderHook(() =>
                usePhysicsEngine({
                    numberOfRows: 8,
                    multipliers: [0.5, 1, 2],
                    onBallHit: mockOnBallHit,
                    canvasWidth: 600,
                    canvasHeight: 550,
                    containerSize: { width: 400, height: 400 }
                })
            );

            expect(result.current.engine).toBeDefined();
            expect(result.current.runner).toBeDefined();
        });

        it('should handle empty multipliers array', () => {
            const { result } = renderHook(() =>
                usePhysicsEngine({
                    numberOfRows: 8,
                    multipliers: [],
                    onBallHit: mockOnBallHit,
                    canvasWidth: 600,
                    canvasHeight: 550,
                    containerSize: { width: 400, height: 400 }
                })
            );

            expect(result.current.engine).toBeDefined();
        });

        it('should handle different row counts', () => {
            const { result } = renderHook(() =>
                usePhysicsEngine({
                    numberOfRows: 10,
                    multipliers: [0.5, 1, 2],
                    onBallHit: mockOnBallHit,
                    canvasWidth: 600,
                    canvasHeight: 550,
                    containerSize: { width: 400, height: 400 }
                })
            );

            expect(result.current.engine).toBeDefined();
        });
    });

    describe('useBallSpawner', () => {
        let mockEngine: any;

        beforeEach(() => {
            jest.clearAllMocks();
            mockEngine = {
                current: {
                    world: { bodies: [] },
                    positionIterations: 6,
                    velocityIterations: 4
                }
            };
        });

        it('should create ball with correct properties', () => {
            const { result } = renderHook(() =>
                useBallSpawner({
                    numberOfRows: 8,
                    canvasWidth: 600,
                    engine: mockEngine
                })
            );

            const { createBall } = result.current;
            const ball = createBall(100);

            expect(ball).toHaveProperty('ball');
            expect(require('matter-js').Bodies.circle).toHaveBeenCalled();
        });

        it('should spawn ball successfully', () => {
            const { result } = renderHook(() =>
                useBallSpawner({
                    numberOfRows: 8,
                    canvasWidth: 600,
                    engine: mockEngine
                })
            );

            const { spawnBall } = result.current;

            act(() => {
                spawnBall(100);
            });

            expect(require('matter-js').Bodies.circle).toHaveBeenCalled();
            expect(require('matter-js').Composite.add).toHaveBeenCalled();
        });

        it('should prevent rapid successive spawns', () => {
            const { result } = renderHook(() =>
                useBallSpawner({
                    numberOfRows: 8,
                    canvasWidth: 600,
                    engine: mockEngine
                })
            );

            const { spawnBall } = result.current;

            act(() => {
                spawnBall(100);
                spawnBall(100); // Should be blocked
            });

            // Should only create one ball due to throttling
            expect(require('matter-js').Bodies.circle).toHaveBeenCalledTimes(1);
        });

        it('should spawn service-guided ball with path', () => {
            const { result } = renderHook(() =>
                useBallSpawner({
                    numberOfRows: 8,
                    canvasWidth: 600,
                    engine: mockEngine
                })
            );

            const { spawnBallWithPath } = result.current;

            act(() => {
                spawnBallWithPath(100, [0, 1, 0, 1], 2, 2.5);
            });

            expect(require('matter-js').Bodies.circle).toHaveBeenCalled();
            expect(require('matter-js').Composite.add).toHaveBeenCalled();
        });

        it('should handle missing engine gracefully', () => {
            const { result } = renderHook(() =>
                useBallSpawner({
                    numberOfRows: 8,
                    canvasWidth: 600,
                    engine: { current: null }
                })
            );

            const { spawnBallWithPath } = result.current;

            act(() => {
                spawnBallWithPath(100, [0, 1, 0, 1], 2, 2.5);
            });

            // Should not crash
            expect(require('matter-js').Bodies.circle).not.toHaveBeenCalled();
        });
    });

    describe('useBallRenderer', () => {
        const mockEngine = { current: { world: { bodies: [] } } };
        const mockRemovedBallsRef = { current: new Set<number>() };
        const mockPins = [{ position: { x: 100, y: 100 } }];

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should calculate correct layout data', () => {
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 8,
                    multipliers: [0.5, 1, 2],
                    canvasWidth: 600,
                    canvasHeight: 550,
                    engine: mockEngine,
                    pins: mockPins,
                    removedBallsRef: mockRemovedBallsRef
                })
            );

            expect(result.current.layoutData).toHaveProperty('scaleFactor');
            expect(result.current.layoutData).toHaveProperty('pegRadius');
            expect(result.current.layoutData).toHaveProperty('numberOfSlots');
        });

        it('should generate correct slot render data', () => {
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 8,
                    multipliers: [0.5, 1, 2],
                    canvasWidth: 600,
                    canvasHeight: 550,
                    engine: mockEngine,
                    pins: mockPins,
                    removedBallsRef: mockRemovedBallsRef
                })
            );

            expect(result.current.slotRenderData).toHaveLength(3);
            expect(result.current.slotRenderData[0]).toHaveProperty('multiplier', 0.5);
        });

        it('should handle empty multipliers with defaults', () => {
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 8,
                    multipliers: [],
                    canvasWidth: 600,
                    canvasHeight: 550,
                    engine: mockEngine,
                    pins: mockPins,
                    removedBallsRef: mockRemovedBallsRef
                })
            );

            expect(result.current.slotRenderData).toHaveLength(9); // Default multipliers
        });

        it('should start render loop with correct parameters', () => {
            const mockCtx = {
                clearRect: jest.fn(),
                fillStyle: '',
                fillRect: jest.fn(),
                strokeStyle: '',
                lineWidth: 1,
                strokeRect: jest.fn(),
                font: '',
                textAlign: 'left' as CanvasTextAlign,
                textBaseline: 'alphabetic' as CanvasTextBaseline,
                fillText: jest.fn(),
                createLinearGradient: jest.fn(() => ({
                    addColorStop: jest.fn()
                })),
                fill: jest.fn(),
                stroke: jest.fn(),
                beginPath: jest.fn(),
                arc: jest.fn(),
                setTransform: jest.fn()
            };

            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 8,
                    multipliers: [0.5, 1, 2],
                    canvasWidth: 600,
                    canvasHeight: 550,
                    engine: mockEngine,
                    pins: mockPins,
                    removedBallsRef: mockRemovedBallsRef
                })
            );

            const { startRenderLoop } = result.current;

            act(() => {
                startRenderLoop(
                    mockCtx as any,
                    mockEngine.current,
                    { width: 600, height: 550 },
                    [0.5, 1, 2],
                    mockPins,
                    8
                );
            });

            expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 600, 550);
        });

        it('should handle missing pins gracefully', () => {
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 8,
                    multipliers: [0.5, 1, 2],
                    canvasWidth: 600,
                    canvasHeight: 550,
                    engine: mockEngine,
                    pins: [],
                    removedBallsRef: mockRemovedBallsRef
                })
            );

            expect(result.current.layoutData).toBeDefined();
            expect(result.current.slotRenderData).toHaveLength(3);
        });
    });
});
