/**
 * Integration Tests
 * Tests for the complete Ball Layout component integration
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimplifiedCanvasBallLayout, { SimplifiedCanvasBallLayoutRef } from '../src/features/game/components/ball/simplified-canvas-ball-layout';
import { BallLayoutProps } from '../src/shared/types';

// Mock physics logger
jest.mock('../src/features/game/components/ball/physics', () => ({
    physicsLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
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
        engine: {
            world: { bodies: [], gravity: { y: 0.8 } },
            gravity: { y: 0.8 }
        },
        world: { bodies: [], gravity: { y: 0.8 } },
        isReady: true,
        updateGravity: jest.fn(),
        cleanup: jest.fn(),
    })),
}));

describe('Ball Layout Integration', () => {
    const defaultProps: BallLayoutProps = {
        multipliers: [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20],
        probabilities: [0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.03, 0.01, 0.01],
        onBallHit: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Rendering', () => {
        it('should render the ball layout component', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                />
            );

            expect(screen.getByLabelText(/Simplified Plinko game/)).toBeInTheDocument();
        });

        it('should show loading state initially', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                />
            );

            expect(screen.getByText(/Loading Simplified Plinko Physics/)).toBeInTheDocument();
        });

        it('should display correct number of rows and slots', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                />
            );

            expect(screen.getByText(/Rows:\s*8/)).toBeInTheDocument();
            expect(screen.getByText(/Slots:\s*9/)).toBeInTheDocument();
        });
    });

    describe('Canvas Setup', () => {
        it('should render canvas element', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                />
            );

            const canvas = document.querySelector('canvas');
            expect(canvas).toBeInTheDocument();
            // Canvas dimensions are set via style, not HTML attributes
            expect(canvas).toHaveStyle('width: 600px');
            expect(canvas).toHaveStyle('height: 550px');
        });

        it('should have proper accessibility attributes', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                />
            );

            const container = screen.getByLabelText(/Simplified Plinko game/);
            expect(container).toHaveAttribute('aria-label', expect.stringContaining('8 rows'));
            expect(container).toHaveAttribute('aria-label', expect.stringContaining('9 multiplier slots'));
        });
    });

    describe('Props Integration', () => {
        it('should accept multipliers prop', () => {
            const customMultipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                    multipliers={customMultipliers}
                />
            );

            // Component should render without errors
            expect(screen.getByLabelText(/Simplified Plinko game/)).toBeInTheDocument();
        });

        it('should accept probabilities prop', () => {
            const customProbabilities = [0.2, 0.2, 0.2, 0.2, 0.2];
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                    probabilities={customProbabilities}
                />
            );

            // Component should render without errors
            expect(screen.getByLabelText(/Simplified Plinko game/)).toBeInTheDocument();
        });

        it('should accept onBallHit callback', () => {
            const mockOnBallHit = jest.fn();
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();

            render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                    onBallHit={mockOnBallHit}
                />
            );

            // Component should render without errors
            expect(screen.getByLabelText(/Simplified Plinko game/)).toBeInTheDocument();
        });
    });

    describe('Component Lifecycle', () => {
        it('should handle unmounting gracefully', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();
            const { unmount } = render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                />
            );

            // Should not throw during unmount
            expect(() => unmount()).not.toThrow();
        });

        it('should handle prop changes', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();
            const { rerender } = render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                />
            );

            const newMultipliers = [2, 3, 4, 5, 6, 7, 8, 9, 10];

            // Should handle prop changes without errors
            expect(() => rerender(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...defaultProps}
                    multipliers={newMultipliers}
                />
            )).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing multipliers gracefully', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();
            const propsWithoutMultipliers = {
                ...defaultProps,
                multipliers: [] as number[]
            };

            // Should not crash even with empty multipliers
            expect(() => render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...propsWithoutMultipliers}
                />
            )).not.toThrow();
        });

        it('should handle missing probabilities gracefully', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();
            const propsWithoutProbabilities = {
                ...defaultProps,
                probabilities: [] as number[]
            };

            // Should not crash even with empty probabilities
            expect(() => render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...propsWithoutProbabilities}
                />
            )).not.toThrow();
        });

        it('should handle missing onBallHit callback gracefully', () => {
            const ref = React.createRef<SimplifiedCanvasBallLayoutRef>();
            const propsWithoutCallback = {
                ...defaultProps,
                onBallHit: undefined
            };

            // Should not crash without callback
            expect(() => render(
                <SimplifiedCanvasBallLayout
                    ref={ref}
                    {...propsWithoutCallback}
                />
            )).not.toThrow();
        });
    });
});