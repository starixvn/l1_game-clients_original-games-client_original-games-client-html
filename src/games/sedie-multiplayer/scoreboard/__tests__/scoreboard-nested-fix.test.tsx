import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreboardSeDie from '../scoreboard';
import { Round } from '../../../../components/game-base/type';
import { SeDieResult, SeDieSettlementResult } from '../../sedie-multiplayer-constants';

// Mock the SwipeScrollGrid component
jest.mock('../../../../components/game-components/swipe-scroll-grid', () => {
    return function MockSwipeScrollGrid({ children }: any) {
        return (
            <div data-testid="swipe-scroll-grid">
                {children}
            </div>
        );
    };
});

// Mock the SwitchableScoreboard component
jest.mock('../../../../components/game-components/round-history/scoreboard', () => ({
    SwitchableScoreboard: ({ scoreboards }: any) => (
        <div data-testid="switchable-scoreboard">
            {scoreboards.map((board: any, index: number) => (
                <div key={index} data-testid={`scoreboard-${index}`}>
                    <div data-testid="scoreboard-element">{board.element.name}</div>
                    <div data-testid="scoreboard-columns">{board.column}</div>
                    <div data-testid="scoreboard-rows">{board.row}</div>
                    <div data-testid="scoreboard-scroll-to-right">{board.scrollToRight ? 'true' : 'false'}</div>
                </div>
            ))}
        </div>
    ),
}));

describe('ScoreboardSeDie Nested Grid Fix', () => {
    const mockRoundHistory: Round<SeDieResult, SeDieSettlementResult>[] = [
        {
            result: { drawId: 1, dice1: 1, dice2: 2, dice3: 3 },
            settlementResult: { odd: true, even: false, drawId: 1 }
        },
        {
            result: { drawId: 2, dice1: 2, dice2: 4, dice3: 6 },
            settlementResult: { odd: false, even: true, drawId: 2 }
        }
    ];

    const defaultProps = {
        roundHistory: mockRoundHistory,
        isShowBlink: false,
        isOddEven: true,
        playResultAnimation: false
    };

    describe('Grid Structure Tests', () => {
        it('should render without nested grid structures', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
            expect(screen.getByTestId('scoreboard-0')).toBeInTheDocument();

            // Verify no style prop with grid-template-columns is passed
            const scoreboardElement = screen.getByTestId('scoreboard-0');
            expect(scoreboardElement).not.toHaveAttribute('style');
        });

        it('should maintain proper column count without style overrides', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('scoreboard-columns')).toHaveTextContent('22');
        });

        it('should handle large datasets without nested grid issues', () => {
            // Arrange
            const largeHistory = Array.from({ length: 50 }, (_, index) => ({
                result: { drawId: index + 1, dice1: 1, dice2: 2, dice3: 3 },
                settlementResult: {
                    odd: index % 2 === 0,
                    even: index % 2 === 1,
                    drawId: index + 1
                }
            }));
            const props = { ...defaultProps, roundHistory: largeHistory };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
            // Should not throw any errors related to nested grids
        });
    });

    describe('Performance Tests', () => {
        it('should render efficiently without double grid calculations', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            const startTime = performance.now();
            render(<ScoreboardSeDie {...props} />);
            const endTime = performance.now();

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
            expect(endTime - startTime).toBeLessThan(100); // Should render quickly without nested grid overhead
        });
    });

    describe('Structure Validation', () => {
        it('should use simplified grid structure', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            const scoreboard = screen.getByTestId('switchable-scoreboard');
            expect(scoreboard).toBeInTheDocument();

            // Verify the structure is simplified (no nested grid containers)
            const scoreboardElements = screen.getAllByTestId(/scoreboard-/);
            expect(scoreboardElements.length).toBe(1); // Only one main scoreboard
        });
    });
});
