import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Bodies, Engine, Composite, Runner, World, Events } from 'matter-js';
import SimplifiedCanvasBallLayout, { SimplifiedCanvasBallLayoutRef } from '../src/features/game/components/ball/SimplifiedCanvasBallLayout';
import { BallLayoutProps } from '../src/shared/types';

// Mock Matter.js with more realistic behavior
jest.mock('matter-js', () => {
    const actualMatter = jest.requireActual('matter-js');
    return {
        ...actualMatter,
        Bodies: {
            circle: jest.fn((x, y, radius, options) => ({
                position: { x, y },
                circleRadius: radius,
                label: options?.label || 'body',
                isStatic: options?.isStatic || false,
                isSensor: options?.isSensor || false,
                render: options?.render || {},
                id: Math.random(),
                velocity: { x: 0, y: 0 },
                parts: []
            })),
            rectangle: jest.fn((x, y, width, height, options) => ({
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
            }))
        },
        Engine: {
            create: jest.fn(() => ({
                world: {
                    bodies: [],
                    gravity: { y: 0.8 }
                },
                gravity: { y: 0.8 }
            })),
            clear: jest.fn()
        },
        Composite: {
            add: jest.fn((world, bodies) => {
                // Actually add bodies to the world for realistic testing
                if (Array.isArray(bodies)) {
                    world.bodies.push(...bodies);
                } else {
                    world.bodies.push(bodies);
                }
            }),
            allBodies: jest.fn((world) => world.bodies || [
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
            create: jest.fn(() => ({})),
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
    };
});

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

describe('Ball Layout Integration Tests', () => {
    let mockOnBallHit: jest.Mock;
    let mockEngine: any;
    let mockWorld: any;

    const defaultProps: BallLayoutProps = {
        multipliers: [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20],
        probabilities: [0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.03, 0.01, 0.01],
        onBallHit: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnBallHit = jest.fn();

        mockWorld = {
            bodies: [],
            gravity: { y: 0.8 }
        };

        mockEngine = {
            world: mockWorld,
            gravity: { y: 0.8 }
        };

        (Engine.create as jest.Mock).mockReturnValue(mockEngine);

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

        HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);

        Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
            width: 600,
            height: 550,
            top: 0,
            left: 0,
            bottom: 550,
            right: 600
        });

        global.ResizeObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            disconnect: jest.fn(),
            unobserve: jest.fn()
        }));
    });

    describe('Physics Engine Integration', () => {
        it('should create complete physics world with all components', async () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

            await waitFor(() => {
                expect(ref.current?.isReady()).toBe(true);
            });

            // Verify engine creation
            expect(Engine.create).toHaveBeenCalled();
            expect(Runner.create).toHaveBeenCalled();
            expect(Runner.run).toHaveBeenCalled();

            // Verify physics bodies creation
            expect(Bodies.circle).toHaveBeenCalled(); // Pins
            expect(Bodies.rectangle).toHaveBeenCalled(); // Multipliers and walls

            // Verify bodies added to world (now called individually)
            expect(Composite.add).toHaveBeenCalled();
        });

        it('should handle ball spawning and physics simulation', async () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

            await waitFor(() => {
                expect(ref.current?.isReady()).toBe(true);
            });

            // Spawn a ball
            act(() => {
                ref.current?.spawnBall(100);
            });

            // Verify ball creation
            expect(Bodies.circle).toHaveBeenCalledWith(
                expect.any(Number),
                30,
                expect.any(Number),
                expect.objectContaining({
                    label: 'ball-100',
                    isStatic: false
                })
            );

            // Verify ball added to world
            expect(Composite.add).toHaveBeenCalledWith(
                mockWorld,
                expect.any(Object)
            );
        });

        it('should handle service-guided ball spawning', async () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

            await waitFor(() => {
                expect(ref.current?.isReady()).toBe(true);
            });

            const path = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
            const finalSlot = 5;
            const multiplier = 2.5;

            act(() => {
                ref.current?.spawnBallWithPath(100, path, finalSlot, multiplier);
            });

            // Verify service-guided ball creation
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
    });

    describe('Collision Detection Integration', () => {
        it('should set up collision event listeners', async () => {
            render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

            await waitFor(() => {
                expect(Events.on).toHaveBeenCalledWith(
                    mockEngine,
                    'collisionActive',
                    expect.any(Function)
                );
            });
        });

        it('should handle collision events when they occur', async () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

            await waitFor(() => {
                expect(ref.current?.isReady()).toBe(true);
            });

            // Get the collision event handler
            const collisionHandler = (Events.on as jest.Mock).mock.calls
                .find(call => call[1] === 'collisionActive')?.[2];

            expect(collisionHandler).toBeDefined();

            // Simulate collision event
            if (collisionHandler) {
                const mockEvent = {
                    pairs: [{
                        bodyA: {
                            label: 'ball-100',
                            id: 1
                        },
                        bodyB: {
                            label: 'multiplier-2.5-3',
                            id: 2
                        }
                    }]
                };

                act(() => {
                    collisionHandler(mockEvent);
                });

                // Should handle collision without throwing
                expect(mockOnBallHit).toHaveBeenCalledWith(2.5, 100);
            }
        });
    });

    describe('Canvas Rendering Integration', () => {
        it('should render canvas with correct dimensions', async () => {
            render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

            await waitFor(() => {
                const canvas = screen.getByRole('generic', { name: /Simplified Plinko game/ }).querySelector('canvas');
                expect(canvas).toBeInTheDocument();
                expect(canvas).toHaveStyle({
                    width: '600px',
                    height: '550px'
                });
            });
        });

        it('should handle canvas scaling correctly', async () => {
            // Mock different container size
            Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
                width: 300,
                height: 275,
                top: 0,
                left: 0,
                bottom: 275,
                right: 300
            });

            render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

            await waitFor(() => {
                const canvas = screen.getByRole('generic', { name: /Simplified Plinko game/ }).querySelector('canvas');
                expect(canvas).toBeInTheDocument();

                // Should have scale transform
                const transform = canvas.style.transform;
                expect(transform).toContain('scale');
            });
        });
    });

    describe('State Management Integration', () => {
        it('should respond to store changes', async () => {
            const mockStore = require('../src/shared/stores/plinko-game-store').default;

            // Initial render
            mockStore.mockReturnValue({
                numberOfRows: 10,
                betAmount: 100
            });

            const { rerender } = render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

            await waitFor(() => {
                expect(Engine.create).toHaveBeenCalled();
            });

            // Change store values
            mockStore.mockReturnValue({
                numberOfRows: 5,
                betAmount: 200
            });

            rerender(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

            // Should reinitialize with new values
            await waitFor(() => {
                expect(Engine.create).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle missing canvas gracefully', async () => {
            // Mock canvas to be null
            HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(null);

            expect(() => {
                render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);
            }).not.toThrow();
        });

        it('should handle physics engine errors gracefully', async () => {
            // Mock engine creation to throw
            (Engine.create as jest.Mock).mockImplementation(() => {
                throw new Error('Physics engine failed');
            });

            expect(() => {
                render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);
            }).not.toThrow();
        });

        it('should handle ball spawning when not ready', async () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

            // Try to spawn ball before ready
            act(() => {
                ref.current?.spawnBall(100);
            });

            // Should not crash
            expect(ref.current).toBeDefined();
        });
    });

    describe('Performance Integration', () => {
        it('should handle multiple rapid ball spawns', async () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(<SimplifiedCanvasBallLayout ref={ref} {...defaultProps} onBallHit={mockOnBallHit} />);

            await waitFor(() => {
                expect(ref.current?.isReady()).toBe(true);
            });

            // Spawn multiple balls rapidly
            act(() => {
                for (let i = 0; i < 5; i++) {
                    ref.current?.spawnBall(100);
                }
            });

            // Should handle without crashing
            expect(Bodies.circle).toHaveBeenCalled();
        });

        it('should cleanup resources properly on unmount', () => {
            const { unmount } = render(<SimplifiedCanvasBallLayout {...defaultProps} onBallHit={mockOnBallHit} />);

            // Component should render without crashing
            expect(screen.getByText(/Loading Simplified Plinko Physics/)).toBeInTheDocument();

            // Unmount should not throw errors
            expect(() => unmount()).not.toThrow();
        });
    });
});
