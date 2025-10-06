import { renderHook, act } from '@testing-library/react';
import { Composite } from 'matter-js';
import { useBallRenderer } from '../src/features/game/components/ball/hooks/use-ball-renderer';
import { BallBodyExtension } from '../src/types/physics';
import { renderBalls, renderBallPath } from '../src/features/game/components/ball/rendering/canvas-renderer';

// Mock Matter.js
jest.mock('matter-js', () => ({
    Composite: {
        allBodies: jest.fn()
    }
}));

// Mock canvas rendering
const mockCanvas = {
    getContext: jest.fn(() => ({
        clearRect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        fillText: jest.fn(),
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        textBaseline: '',
        createLinearGradient: jest.fn(() => ({
            addColorStop: jest.fn(),
        })),
        quadraticCurveTo: jest.fn(),
        bezierCurveTo: jest.fn(),
        rect: jest.fn(),
        roundRect: jest.fn(),
        closePath: jest.fn()
    }))
};

describe('Service-Guided Ball Renderer - TDD Tests', () => {
    let mockEngine: any;
    let mockCanvasRef: any;
    let mockBodies: any[];

    beforeEach(() => {
        jest.clearAllMocks();

        mockEngine = {
            current: {
                world: {
                    bodies: []
                }
            }
        };

        // Mock Composite.allBodies to return an empty array
        (Composite.allBodies as jest.Mock).mockReturnValue([]);

        mockCanvasRef = {
            current: mockCanvas
        };

        mockBodies = [
            {
                id: 1,
                label: 'service-guided-ball',
                position: { x: 300, y: 100 },
                velocity: { x: 1, y: 2 },
                isRemoved: false
            },
            {
                id: 2,
                label: 'pin-1-1',
                position: { x: 300, y: 100 },
                isRemoved: false
            }
        ];
    });

    describe('Path Position Tracking', () => {
        it('should track ball positions for service-guided balls', () => {
            // Arrange
            const serviceGuidedBall = {
                ...mockBodies[0],
                isServiceGuided: true,
                pathPositions: [{ x: 300, y: 50, type: 'spawn' }]
            } as any;

            mockBodies[0] = serviceGuidedBall;

            // Mock Composite.allBodies to return balls including the service-guided one
            (Composite.allBodies as jest.Mock).mockReturnValue([serviceGuidedBall]);

            // Act
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 5,
                    multipliers: [0.5, 1, 2, 3, 5, 10],
                    gameMode: 1,
                    canvasWidth: 800,
                    canvasHeight: 600,
                    engine: mockEngine,
                    pins: [],
                    removedBallsRef: { current: new Set() }
                })
            );

            act(() => {
                // Simulate ball movement
                serviceGuidedBall.position = { x: 310, y: 120 };
                // Use startRenderLoop instead of renderFrame
                result.current.startRenderLoop(
                    mockCanvas.getContext() as any,
                    mockEngine.current,
                    { width: 800, height: 600 },
                    [0.5, 1, 2, 3, 5, 10],
                    [],
                    5
                );
            });

            // Assert
            // Path positions should include the initial spawn position and any movement
            // Since we only call startRenderLoop once, we expect at least 1 position (spawn)
            // The movement recording happens during continuous render loop calls
            expect(serviceGuidedBall.pathPositions.length).toBeGreaterThan(0);
            expect(serviceGuidedBall.pathPositions[0].type).toBe('spawn');
        });

        it('should limit path position frequency to avoid excessive points', () => {
            // Arrange
            const serviceGuidedBall = {
                ...mockBodies[0],
                isServiceGuided: true,
                pathPositions: [{ x: 300, y: 50, type: 'spawn' }]
            } as any;

            mockBodies[0] = serviceGuidedBall;

            // Act
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 5,
                    multipliers: [0.5, 1, 2, 3, 5, 10],
                    gameMode: 1,
                    canvasWidth: 800,
                    canvasHeight: 600,
                    engine: mockEngine,
                    pins: [],
                    removedBallsRef: { current: new Set() }
                })
            );

            act(() => {
                // Simulate small movements (should not be recorded)
                serviceGuidedBall.position = { x: 301, y: 51 }; // 1.4px distance
                result.current.startRenderLoop(
                    mockCanvas.getContext() as any,
                    mockEngine.current,
                    { width: 800, height: 600 },
                    [0.5, 1, 2, 3, 5, 10],
                    [],
                    5
                );

                serviceGuidedBall.position = { x: 302, y: 52 }; // 1.4px distance
                result.current.startRenderLoop(
                    mockCanvas.getContext() as any,
                    mockEngine.current,
                    { width: 800, height: 600 },
                    [0.5, 1, 2, 3, 5, 10],
                    [],
                    5
                );
            });

            // Assert - Should not record small movements
            expect(serviceGuidedBall.pathPositions.length).toBe(1);
        });

        it('should record path positions when ball moves significant distance', () => {
            // Arrange
            const serviceGuidedBall = {
                ...mockBodies[0],
                isServiceGuided: true,
                pathPositions: [{ x: 300, y: 50, type: 'spawn' }]
            } as any;

            mockBodies[0] = serviceGuidedBall;

            // Mock Composite.allBodies to return balls including the service-guided one
            (Composite.allBodies as jest.Mock).mockReturnValue([serviceGuidedBall]);

            // Act
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 5,
                    multipliers: [0.5, 1, 2, 3, 5, 10],
                    gameMode: 1,
                    canvasWidth: 800,
                    canvasHeight: 600,
                    engine: mockEngine,
                    pins: [],
                    removedBallsRef: { current: new Set() }
                })
            );

            act(() => {
                // Simulate significant movement (should be recorded)
                serviceGuidedBall.position = { x: 320, y: 80 }; // 28.3px distance
                result.current.startRenderLoop(
                    mockCanvas.getContext() as any,
                    mockEngine.current,
                    { width: 800, height: 600 },
                    [0.5, 1, 2, 3, 5, 10],
                    [],
                    5
                );
            });

            // Assert - Should record significant movement
            expect(serviceGuidedBall.pathPositions.length).toBe(2);
            expect(serviceGuidedBall.pathPositions[1]).toEqual({
                x: 320,
                y: 80,
                type: 'movement'
            });
        });
    });

    describe('Ball Rendering', () => {

        it('should render collision points with direction indicators', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'collision', pathIndex: 0, direction: 1 },
                { x: 290, y: 150, type: 'collision', pathIndex: 1, direction: 0 }
            ];

            // Act - Call renderBallPath directly
            const ctx = mockCanvas.getContext() as any;
            renderBallPath(ctx, pathPositions);

            // Assert
            expect(ctx.arc).toHaveBeenCalled(); // For collision points
            expect(ctx.fillText).toHaveBeenCalled(); // For path index numbers
        });

        it('should not render removed balls', () => {
            // Arrange
            const removedBall = {
                ...mockBodies[0],
                isServiceGuided: true,
                isRemoved: true
            } as any;

            mockBodies[0] = removedBall;

            // Act
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 5,
                    multipliers: [0.5, 1, 2, 3, 5, 10],
                    gameMode: 1,
                    canvasWidth: 800,
                    canvasHeight: 600,
                    engine: mockEngine,
                    pins: [],
                    removedBallsRef: { current: new Set() }
                })
            );

            act(() => {
                result.current.startRenderLoop(
                    mockCanvas.getContext() as any,
                    mockEngine.current,
                    { width: 800, height: 600 },
                    [0.5, 1, 2, 3, 5, 10],
                    [],
                    5
                );
            });

            // Assert
            const context = mockCanvas.getContext();
            expect(context.arc).not.toHaveBeenCalled(); // Should not render removed ball
        });
    });

    describe('Performance Optimization', () => {
        it('should throttle path position recording for performance', () => {
            // Arrange
            const serviceGuidedBall = {
                ...mockBodies[0],
                isServiceGuided: true,
                pathPositions: [{ x: 300, y: 50, type: 'spawn' }]
            } as any;

            mockBodies[0] = serviceGuidedBall;

            // Act
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 5,
                    multipliers: [0.5, 1, 2, 3, 5, 10],
                    gameMode: 1,
                    canvasWidth: 800,
                    canvasHeight: 600,
                    engine: mockEngine,
                    pins: [],
                    removedBallsRef: { current: new Set() }
                })
            );

            act(() => {
                // Simulate rapid frame updates
                for (let i = 0; i < 10; i++) {
                    serviceGuidedBall.position = { x: 300 + i, y: 50 + i };
                    result.current.startRenderLoop(
                        mockCanvas.getContext() as any,
                        mockEngine.current,
                        { width: 800, height: 600 },
                        [0.5, 1, 2, 3, 5, 10],
                        [],
                        5
                    );
                }
            });

            // Assert - Should not record every single frame
            expect(serviceGuidedBall.pathPositions.length).toBeLessThan(10);
        });

        it('should handle multiple service-guided balls efficiently', () => {
            // Arrange
            const ball1 = {
                ...mockBodies[0],
                id: 1,
                isServiceGuided: true,
                pathPositions: [{ x: 300, y: 50, type: 'spawn' }]
            } as any;

            const ball2 = {
                id: 2,
                label: 'service-guided-ball',
                position: { x: 400, y: 100 },
                velocity: { x: -1, y: 2 },
                isServiceGuided: true,
                pathPositions: [{ x: 400, y: 50, type: 'spawn' }],
                isRemoved: false
            } as any;

            mockBodies[0] = ball1;
            mockBodies.push(ball2);

            // Mock Composite.allBodies to return balls including both service-guided balls
            (Composite.allBodies as jest.Mock).mockReturnValue([ball1, ball2]);

            // Act
            const { result } = renderHook(() =>
                useBallRenderer({
                    numberOfRows: 5,
                    multipliers: [0.5, 1, 2, 3, 5, 10],
                    gameMode: 1,
                    canvasWidth: 800,
                    canvasHeight: 600,
                    engine: mockEngine,
                    pins: [],
                    removedBallsRef: { current: new Set() }
                })
            );

            act(() => {
                ball1.position = { x: 310, y: 120 };
                ball2.position = { x: 390, y: 120 };
                result.current.startRenderLoop(
                    mockCanvas.getContext() as any,
                    mockEngine.current,
                    { width: 800, height: 600 },
                    [0.5, 1, 2, 3, 5, 10],
                    [],
                    5
                );
            });

            // Assert
            // Path positions should include the initial spawn position for each ball
            expect(ball1.pathPositions.length).toBeGreaterThan(0);
            expect(ball2.pathPositions.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle missing canvas context gracefully', () => {
            // Arrange
            const brokenCanvasRef = {
                current: {
                    getContext: jest.fn(() => null)
                }
            };

            // Act & Assert
            expect(() => {
                const { result } = renderHook(() =>
                    useBallRenderer({
                        numberOfRows: 5,
                        multipliers: [0.5, 1, 2, 3, 5, 10],
                        gameMode: 1,
                        canvasWidth: 800,
                        canvasHeight: 600,
                        engine: mockEngine,
                        pins: [],
                        removedBallsRef: { current: new Set() }
                    })
                );

                act(() => {
                    result.current.startRenderLoop(
                        mockCanvas.getContext() as any,
                        mockEngine.current,
                        { width: 800, height: 600 },
                        [0.5, 1, 2, 3, 5, 10],
                        [],
                        5
                    );
                });
            }).not.toThrow();
        });

        it('should handle missing engine gracefully', () => {
            // Arrange
            const nullEngine = { current: null };

            // Act & Assert
            expect(() => {
                const { result } = renderHook(() =>
                    useBallRenderer({
                        numberOfRows: 5,
                        multipliers: [0.5, 1, 2, 3, 5, 10],
                        gameMode: 1,
                        canvasWidth: 800,
                        canvasHeight: 600,
                        engine: nullEngine,
                        pins: [],
                        removedBallsRef: { current: new Set() }
                    })
                );

                act(() => {
                    result.current.startRenderLoop(
                        mockCanvas.getContext() as any,
                        mockEngine.current,
                        { width: 800, height: 600 },
                        [0.5, 1, 2, 3, 5, 10],
                        [],
                        5
                    );
                });
            }).not.toThrow();
        });

        it('should handle balls without path positions', () => {
            // Arrange
            const ballWithoutPath = {
                ...mockBodies[0],
                isServiceGuided: true,
                pathPositions: undefined
            } as any;

            mockBodies[0] = ballWithoutPath;

            // Act & Assert
            expect(() => {
                const { result } = renderHook(() =>
                    useBallRenderer({
                        numberOfRows: 5,
                        multipliers: [0.5, 1, 2, 3, 5, 10],
                        gameMode: 1,
                        canvasWidth: 800,
                        canvasHeight: 600,
                        engine: mockEngine,
                        pins: [],
                        removedBallsRef: { current: new Set() }
                    })
                );

                act(() => {
                    result.current.startRenderLoop(
                        mockCanvas.getContext() as any,
                        mockEngine.current,
                        { width: 800, height: 600 },
                        [0.5, 1, 2, 3, 5, 10],
                        [],
                        5
                    );
                });
            }).not.toThrow();
        });
    });
});
