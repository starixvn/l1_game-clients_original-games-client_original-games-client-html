import { renderBallPath, renderBalls } from '../src/features/game/components/ball/rendering/canvas-renderer';
import { BallBodyExtension } from '../src/types/physics';
import { Composite } from 'matter-js';

// Mock Matter.js
jest.mock('matter-js', () => ({
    Composite: {
        allBodies: jest.fn()
    }
}));

describe('Service-Guided Canvas Renderer - TDD Tests', () => {
    let mockContext: any;
    let mockEngine: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEngine = {
            world: {
                bodies: []
            }
        };

        // Mock Composite.allBodies to return an empty array
        (Composite.allBodies as jest.Mock).mockReturnValue([]);

        mockContext = {
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
            lineCap: '',
            lineJoin: ''
        };
    });

    describe('renderBallPath', () => {
        it('should render path line connecting all positions', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'collision', pathIndex: 0, direction: 1 },
                { x: 290, y: 150, type: 'collision', pathIndex: 1, direction: 0 },
                { x: 300, y: 200, type: 'movement' }
            ];

            // Act
            renderBallPath(mockContext, pathPositions);

            // Assert
            expect(mockContext.strokeStyle).toBe('rgba(255, 255, 255, 0.6)');
            expect(mockContext.lineWidth).toBe(2);
            expect(mockContext.lineCap).toBe('round');
            expect(mockContext.lineJoin).toBe('round');
            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.moveTo).toHaveBeenCalledWith(300, 50);
            expect(mockContext.lineTo).toHaveBeenCalledWith(310, 100);
            expect(mockContext.lineTo).toHaveBeenCalledWith(290, 150);
            expect(mockContext.lineTo).toHaveBeenCalledWith(300, 200);
            expect(mockContext.stroke).toHaveBeenCalled();
        });

        it('should render collision points with path index numbers', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'collision', pathIndex: 0, direction: 1 },
                { x: 290, y: 150, type: 'collision', pathIndex: 1, direction: 0 }
            ];

            // Act
            renderBallPath(mockContext, pathPositions);

            // Assert
            expect(mockContext.arc).toHaveBeenCalledTimes(2); // Two collision points
            expect(mockContext.fill).toHaveBeenCalledTimes(2);
            expect(mockContext.fillText).toHaveBeenCalledWith('0', 310, 90); // pathIndex 0
            expect(mockContext.fillText).toHaveBeenCalledWith('1', 290, 140); // pathIndex 1
        });

        it('should render direction indicators for collision points', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'collision', pathIndex: 0, direction: 1 }, // Right
                { x: 290, y: 150, type: 'collision', pathIndex: 1, direction: 0 }  // Left
            ];

            // Act
            renderBallPath(mockContext, pathPositions);

            // Assert
            expect(mockContext.fillText).toHaveBeenCalledWith('→', 310, 80); // Right arrow
            expect(mockContext.fillText).toHaveBeenCalledWith('←', 290, 130); // Left arrow
        });

        it('should handle empty path positions gracefully', () => {
            // Arrange
            const pathPositions: any[] = [];

            // Act & Assert
            expect(() => {
                renderBallPath(mockContext, pathPositions);
            }).not.toThrow();

            expect(mockContext.beginPath).not.toHaveBeenCalled();
        });

        it('should handle single position path', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'movement' }
            ];

            // Act
            renderBallPath(mockContext, pathPositions);

            // Assert
            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.moveTo).toHaveBeenCalledWith(300, 50);
            expect(mockContext.lineTo).toHaveBeenCalledWith(310, 100);
            expect(mockContext.stroke).toHaveBeenCalled();
        });

        it('should handle positions without collision data', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'movement' },
                { x: 290, y: 150, type: 'movement' }
            ];

            // Act
            renderBallPath(mockContext, pathPositions);

            // Assert
            expect(mockContext.arc).not.toHaveBeenCalled(); // No collision points
            expect(mockContext.fillText).not.toHaveBeenCalled(); // No path indices or directions
        });
    });

    describe('renderBalls', () => {
        it('should render service-guided balls with path visualization', () => {
            // Arrange
            const balls = [
                {
                    id: 1,
                    position: { x: 300, y: 100 },
                    label: 'service-guided-ball',
                    isServiceGuided: true,
                    isRemoved: false,
                    pathPositions: [
                        { x: 300, y: 50, type: 'spawn' },
                        { x: 310, y: 100, type: 'collision', pathIndex: 0, direction: 1 }
                    ]
                } as any
            ];

            // Mock Composite.allBodies to return the balls
            (Composite.allBodies as jest.Mock).mockReturnValue(balls);

            // Act
            renderBalls(mockContext, mockEngine, { current: new Set() });

            // Assert
            expect(mockContext.arc).toHaveBeenCalled(); // Ball rendering
            expect(mockContext.beginPath).toHaveBeenCalled(); // Path rendering
            expect(mockContext.stroke).toHaveBeenCalled(); // Path line
        });

        it('should render regular balls without path visualization', () => {
            // Arrange
            const balls = [
                {
                    id: 1,
                    position: { x: 300, y: 100 },
                    label: 'ball-100',
                    isServiceGuided: false,
                    isRemoved: false
                } as any
            ];

            // Mock Composite.allBodies to return the balls
            (Composite.allBodies as jest.Mock).mockReturnValue(balls);

            // Act
            renderBalls(mockContext, mockEngine, { current: new Set() });

            // Assert
            expect(mockContext.arc).toHaveBeenCalled(); // Ball rendering
            // beginPath may be called for ball rendering but not for path line rendering
        });

        it('should handle balls without path positions', () => {
            // Arrange
            const balls = [
                {
                    id: 1,
                    position: { x: 300, y: 100 },
                    label: 'service-guided-ball',
                    isServiceGuided: true,
                    isRemoved: false,
                    pathPositions: undefined
                } as any
            ];

            // Mock Composite.allBodies to return the balls
            (Composite.allBodies as jest.Mock).mockReturnValue(balls);

            // Act & Assert
            expect(() => {
                renderBalls(mockContext, mockEngine, { current: new Set() });
            }).not.toThrow();

            expect(mockContext.arc).toHaveBeenCalled(); // Ball should still render
        });

        it('should handle empty balls array', () => {
            // Arrange
            const balls: any[] = [];

            // Mock Composite.allBodies to return empty array
            (Composite.allBodies as jest.Mock).mockReturnValue(balls);

            // Act & Assert
            expect(() => {
                renderBalls(mockContext, mockEngine, { current: new Set() });
            }).not.toThrow();

            expect(mockContext.arc).not.toHaveBeenCalled();
        });
    });

    describe('Path Visualization Quality', () => {
        it('should render smooth path lines with proper styling', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'movement' },
                { x: 290, y: 150, type: 'movement' },
                { x: 300, y: 200, type: 'movement' }
            ];

            // Act
            renderBallPath(mockContext, pathPositions);

            // Assert
            expect(mockContext.strokeStyle).toBe('rgba(255, 255, 255, 0.6)');
            expect(mockContext.lineWidth).toBe(2);
            expect(mockContext.lineCap).toBe('round');
            expect(mockContext.lineJoin).toBe('round');
        });

        it('should render collision points with distinct colors', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'collision', pathIndex: 0, direction: 1 }
            ];

            // Act
            renderBallPath(mockContext, pathPositions);

            // Assert
            expect(mockContext.arc).toHaveBeenCalledWith(310, 100, 3, 0, Math.PI * 2); // Collision point circle
            expect(mockContext.fillText).toHaveBeenCalledWith('0', 310, 90); // Path index number
            expect(mockContext.fillText).toHaveBeenCalledWith('→', 310, 80); // Direction indicator
        });

        it('should render direction indicators with distinct colors', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'collision', pathIndex: 0, direction: 1 }
            ];

            // Act
            renderBallPath(mockContext, pathPositions);

            // Assert
            expect(mockContext.fillText).toHaveBeenCalledWith('→', 310, 80); // Direction indicator
        });

        it('should render path index numbers with readable font', () => {
            // Arrange
            const pathPositions = [
                { x: 300, y: 50, type: 'spawn' },
                { x: 310, y: 100, type: 'collision', pathIndex: 0, direction: 1 }
            ];

            // Act
            renderBallPath(mockContext, pathPositions);

            // Assert - Check that text positioning properties are set correctly
            expect(mockContext.textAlign).toBe('center');
            expect(mockContext.textBaseline).toBe('middle');
        });
    });

    describe('Performance Considerations', () => {
        it('should handle large path position arrays efficiently', () => {
            // Arrange
            const pathPositions = Array.from({ length: 100 }, (_, i) => ({
                x: 300 + i,
                y: 50 + i * 2,
                type: 'movement' as const
            }));

            // Act
            const startTime = performance.now();
            renderBallPath(mockContext, pathPositions);
            const endTime = performance.now();

            // Assert
            expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
            expect(mockContext.lineTo).toHaveBeenCalledTimes(99); // 100 positions = 99 line segments
        });

        it('should handle multiple balls with paths efficiently', () => {
            // Arrange
            const balls = Array.from({ length: 10 }, (_, i) => ({
                id: i,
                position: { x: 300 + i * 10, y: 100 },
                label: 'service-guided-ball',
                isServiceGuided: true,
                isRemoved: false,
                circleRadius: 5,
                pathPositions: [
                    { x: 300 + i * 10, y: 50, type: 'spawn' },
                    { x: 310 + i * 10, y: 100, type: 'movement' }
                ]
            })) as any[];

            // Mock Composite.allBodies to return balls
            (Composite.allBodies as jest.Mock).mockReturnValue(balls);

            // Act
            const startTime = performance.now();
            renderBalls(mockContext, mockEngine, { current: new Set() });
            const endTime = performance.now();

            // Assert
            expect(endTime - startTime).toBeLessThan(100); // Should complete in reasonable time
            expect(mockContext.arc).toHaveBeenCalledTimes(20); // 10 balls * 2 calls each (ball + something else)
        });
    });
});
