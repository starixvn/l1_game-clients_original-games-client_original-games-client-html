import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreboardSeDie from '../scoreboard';
import { Round } from '../../../../components/game-base/type';
import { SeDieResult, SeDieSettlementResult } from '../../sedie-multiplayer-constants';

// Mock the SwipeScrollGrid component
jest.mock('../../../../components/game-components/swipe-scroll-grid', () => {
    return function MockSwipeScrollGrid({ children, scrollRightSignal }: any) {
        return (
            <div data-testid="swipe-scroll-grid" data-scroll-right={scrollRightSignal}>
                {children}
            </div>
        );
    };
});

// Mock the SwitchableScoreboard component
jest.mock('../../../../components/game-components/round-history/scoreboard', () => ({
    SwitchableScoreboard: ({ scoreboards, scrollToRight }: any) => (
        <div data-testid="switchable-scoreboard" data-scroll-to-right={scrollToRight}>
            {scoreboards.map((board: any, index: number) => (
                <div key={index} data-testid={`scoreboard-${index}`}>
                    <div data-testid="scoreboard-element">{board.element.name}</div>
                    <div data-testid="scoreboard-columns">{board.column}</div>
                    <div data-testid="scoreboard-rows">{board.row}</div>
                    <div data-testid="scoreboard-scroll-to-right">{board.scrollToRight ? 'true' : 'false'}</div>
                    <div data-testid="scoreboard-class-name">{board.className}</div>
                </div>
            ))}
        </div>
    ),
}));

describe('ScoreboardSeDie Scrolling Functionality', () => {
    const mockRoundHistory: Round<SeDieResult, SeDieSettlementResult>[] = [
        {
            result: { drawId: 1, dice1: 1, dice2: 2, dice3: 3 },
            settlementResult: { odd: true, even: false, drawId: 1 }
        },
        {
            result: { drawId: 2, dice1: 2, dice2: 4, dice3: 6 },
            settlementResult: { odd: false, even: true, drawId: 2 }
        },
        {
            result: { drawId: 3, dice1: 1, dice2: 3, dice3: 5 },
            settlementResult: { odd: true, even: false, drawId: 3 }
        }
    ];

    const defaultProps = {
        roundHistory: mockRoundHistory,
        isShowBlink: false,
        isOddEven: true,
        playResultAnimation: false
    };

    describe('Scrolling Structure Tests', () => {
        it('should render with proper grid structure for scrolling', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
            expect(screen.getByTestId('scoreboard-0')).toBeInTheDocument();

            // Verify the scoreboard has the correct class for grid layout
            const scoreboardElement = screen.getByTestId('scoreboard-class-name');
            expect(scoreboardElement).toHaveTextContent('big-road-override');
        });

        it('should enable scroll to right when playResultAnimation is true', () => {
            // Arrange
            const props = { ...defaultProps, playResultAnimation: true };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('scoreboard-scroll-to-right')).toHaveTextContent('true');
        });

        it('should disable scroll to right when playResultAnimation is false', () => {
            // Arrange
            const props = { ...defaultProps, playResultAnimation: false };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('scoreboard-scroll-to-right')).toHaveTextContent('false');
        });
    });

    describe('Large Dataset Scrolling Tests', () => {
        it('should handle large datasets for horizontal scrolling', () => {
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
            // Should render without errors and be ready for horizontal scrolling
        });

        it('should maintain proper column count for scrolling', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('scoreboard-columns')).toHaveTextContent('22');
        });
    });

    describe('Grid Layout Tests', () => {
        it('should use proper grid layout for horizontal scrolling', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            const scoreboard = screen.getByTestId('switchable-scoreboard');
            expect(scoreboard).toBeInTheDocument();

            // Verify the structure supports horizontal scrolling
            const scoreboardElements = screen.getAllByTestId(/scoreboard-/);
            expect(scoreboardElements.length).toBeGreaterThan(0);
        });

        it('should have correct row configuration for scrolling', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('scoreboard-rows')).toHaveTextContent('6');
        });
    });

    describe('SwipeScrollGrid Integration Tests', () => {
        it('should integrate with SwipeScrollGrid for scrolling', () => {
            // Arrange
            const props = { ...defaultProps, playResultAnimation: true };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('swipe-scroll-grid')).toBeInTheDocument();
            expect(screen.getByTestId('swipe-scroll-grid')).toHaveAttribute('data-scroll-right', 'true');
        });

        it('should pass scroll signal to SwipeScrollGrid', () => {
            // Arrange
            const props = { ...defaultProps, playResultAnimation: false };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('swipe-scroll-grid')).toHaveAttribute('data-scroll-right', 'false');
        });
    });
});
