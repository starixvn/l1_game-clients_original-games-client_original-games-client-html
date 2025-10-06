import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Bodies, Engine, Composite, Runner, World, Events } from 'matter-js';
import SimplifiedCanvasBallLayout, { SimplifiedCanvasBallLayoutRef } from '../src/features/game/components/ball/SimplifiedCanvasBallLayout';
import { BallLayoutProps } from '../src/shared/types';

// Mock Matter.js
jest.mock('matter-js', () => ({
    Bodies: {
        circle: jest.fn(),
        rectangle: jest.fn()
    },
    Engine: {
        create: jest.fn(() => ({
            world: {
                bodies: [],
                composites: []
            },
            gravity: { x: 0, y: 0.8 },
            timing: { timestamp: 0 }
        })),
        clear: jest.fn()
    },
    Composite: {
        add: jest.fn(),
        allBodies: jest.fn().mockReturnValue([
            {
                id: 1,
                label: 'pin-0-0',
                position: { x: 100, y: 100 },
                render: { visible: false },
                bounds: {
                    min: { x: 95, y: 95 },
                    max: { x: 105, y: 105 }
                }
            }
        ])
    },
    Runner: {
        create: jest.fn(),
        run: jest.fn(),
        stop: jest.fn()
    },
    World: {
        clear: jest.fn(),
        remove: jest.fn()
    },
    Events: {
        on: jest.fn(),
        off: jest.fn()
    },
    Body: {
        setVelocity: jest.fn(),
        applyForce: jest.fn()
    }
}));

// Mock physics config and calculations
jest.mock('../src/lib/physics', () => ({
    physicsConfig: {
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
    },
    calculateBallSize: jest.fn((rows: number) => Math.max(4, Math.min(8, 6 - rows * 0.2))),
    getBallPhysicsTweaks: jest.fn((radius: number) => ({
        restitution: 0.3,
        friction: 0.6,
        frictionAir: 0.01,
        density: 0.001
    })),
    getMiddleDropPosition: jest.fn((width: number) => width / 2)
}));

// Mock zustand store
jest.mock('../src/shared/stores/plinko-game-store', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        numberOfRows: 10,
        betAmount: 100
    }))
}));

// Mock useShallow
jest.mock('zustand/shallow', () => ({
    useShallow: jest.fn((selector) => selector)
}));

describe('SimplifiedCanvasBallLayout', () => {
    let mockEngine: any;
    let mockRunner: any;
    let mockWorld: any;
    let mockOnBallHit: jest.Mock;

    const defaultProps: BallLayoutProps = {
        multipliers: [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20],
        probabilities: [0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.03, 0.01, 0.01],
        onBallHit: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockOnBallHit = jest.fn();

        mockWorld = {
            bodies: []
        };

        mockEngine = {
            world: mockWorld,
            gravity: { y: 0.8 }
        };

        mockRunner = {};

        (Engine.create as jest.Mock).mockReturnValue(mockEngine);
        (Runner.create as jest.Mock).mockReturnValue(mockRunner);
        (Bodies.circle as jest.Mock).mockImplementation((x, y, radius, options) => ({
            position: { x, y },
            circleRadius: radius,
            label: options?.label || 'body',
            isStatic: options?.isStatic || false,
            isSensor: options?.isSensor || false,
            render: options?.render || {},
            id: Math.random(),
            velocity: { x: 0, y: 0 }
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

        // Mock canvas context
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

        // Mock getContext
        HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);

        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
            width: 600,
            height: 550,
            top: 0,
            left: 0,
            bottom: 550,
            right: 600
        });

        // Mock ResizeObserver
        global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
            observe: jest.fn(),
            disconnect: jest.fn(),
            unobserve: jest.fn()
        }));
    });

    it('should render without crashing', () => {
        render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

        expect(screen.getByText(/Loading Simplified Plinko Physics/)).toBeInTheDocument();
    });

    it('should show loading indicator initially', () => {
        render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

        expect(screen.getByText(/Loading Simplified Plinko Physics/)).toBeInTheDocument();
    });

    it('should initialize physics engine after mount', async () => {
        render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(Engine.create).toHaveBeenCalled();
            expect(Runner.create).toHaveBeenCalled();
            expect(Runner.run).toHaveBeenCalledWith(mockRunner, mockEngine);
        });
    });

    it('should create physics bodies for pins and multipliers', async () => {
        render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(Bodies.circle).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.objectContaining({
                    label: expect.stringMatching(/^pin-/),
                    isStatic: true
                })
            );

            expect(Bodies.rectangle).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.objectContaining({
                    label: expect.stringMatching(/^multiplier-/),
                    isStatic: true,
                    isSensor: true
                })
            );
        });
    });

    it('should expose spawnBall method via ref', async () => {
        const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

        render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(ref.current?.spawnBall).toBeDefined();
            expect(typeof ref.current?.spawnBall).toBe('function');
        });
    });

    it('should expose spawnBallWithPath method via ref', async () => {
        const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

        render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(ref.current?.spawnBallWithPath).toBeDefined();
            expect(typeof ref.current?.spawnBallWithPath).toBe('function');
        });
    });

    it('should expose isReady method via ref', async () => {
        const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

        render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(ref.current?.isReady).toBeDefined();
            expect(typeof ref.current?.isReady).toBe('function');
        });
    });

    it('should spawn ball when spawnBall is called', async () => {
        const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

        render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(ref.current?.isReady()).toBe(true);
        });

        act(() => {
            ref.current?.spawnBall(100);
        });

        expect(Bodies.circle).toHaveBeenCalledWith(
            expect.any(Number),
            30,
            expect.any(Number),
            expect.objectContaining({
                label: 'ball-100',
                isStatic: false
            })
        );
    });

    it('should spawn service-guided ball when spawnBallWithPath is called', async () => {
        const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

        render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(ref.current?.isReady()).toBe(true);
        });

        const path = [0, 1, 0, 1, 0];
        const finalSlot = 2;
        const multiplier = 2.5;

        act(() => {
            ref.current?.spawnBallWithPath(100, path, finalSlot, multiplier);
        });

        expect(Bodies.circle).toHaveBeenCalledWith(
            expect.any(Number),
            40, // startY for service balls
            expect.any(Number),
            expect.objectContaining({
                label: 'service-guided-ball',
                isStatic: false
            })
        );
    });

    it('should handle mouse hover over multiplier slots', async () => {
        render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
        });

        const container = screen.getByRole('generic', { name: /Simplified Plinko game/ });

        // Simulate mouse move over slot area
        fireEvent.mouseMove(container, {
            clientX: 300,
            clientY: 500
        });

        // Should not crash and should handle mouse events
        expect(container).toBeInTheDocument();
    });

    it('should cleanup on unmount', () => {
        const { unmount } = render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

        // Component should render without crashing
        expect(screen.getByText(/Loading Simplified Plinko Physics/)).toBeInTheDocument();

        // Unmount should not throw errors
        expect(() => unmount()).not.toThrow();
    });

    it('should handle different number of rows', async () => {
        const propsWithDifferentRows = {
            ...defaultProps,
            // Mock store to return different row count
        };

        // Mock the store to return different row count
        const mockStore = require('../src/shared/stores/plinko-game-store').default;
        mockStore.mockReturnValue({
            numberOfRows: 5,
            betAmount: 100
        });

        render(<SimplifiedCanvasBallLayout {...propsWithDifferentRows} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(Engine.create).toHaveBeenCalled();
        });

        // Should create different number of pins for different rows
        expect(Bodies.circle).toHaveBeenCalled();
    });

    it('should handle empty multipliers array', async () => {
        const propsWithEmptyMultipliers = {
            ...defaultProps,
            multipliers: []
        };

        render(<SimplifiedCanvasBallLayout {...propsWithEmptyMultipliers} onBallHit={mockOnBallHit} />);

        await waitFor(() => {
            expect(Engine.create).toHaveBeenCalled();
        });

        // Should use default multipliers
        expect(Bodies.rectangle).toHaveBeenCalled();
    });
});
