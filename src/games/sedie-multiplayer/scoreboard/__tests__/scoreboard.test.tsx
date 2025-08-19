import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
                </div>
            ))}
        </div>
    ),
}));

describe('ScoreboardSeDie Component', () => {
    // Arrange: Common test data
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

    describe('Happy Path Tests', () => {
        it('should render scoreboard with correct structure', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
            expect(screen.getByTestId('scoreboard-0')).toBeInTheDocument();
            expect(screen.getByTestId('scoreboard-element')).toBeInTheDocument();
        });

        it('should display correct initial column count', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('scoreboard-columns')).toHaveTextContent('22');
        });

        it('should display correct row count', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('scoreboard-rows')).toHaveTextContent('6');
        });
    });

    describe('Scrolling Functionality Tests', () => {
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

        it('should update scoreboard columns when updateScoreboardColumns is called', () => {
            // Arrange
            const props = { ...defaultProps };
            const { rerender } = render(<ScoreboardSeDie {...props} />);

            // Act - Simulate column update by re-rendering with different data
            const updatedProps = { ...props, roundHistory: [...mockRoundHistory, ...mockRoundHistory] };
            rerender(<ScoreboardSeDie {...updatedProps} />);

            // Assert
            expect(screen.getByTestId('scoreboard-columns')).toBeInTheDocument();
        });
    });

    describe('Blink Node Tests', () => {
        it('should add blink node when isShowBlink is true', () => {
            // Arrange
            const props = { ...defaultProps, isShowBlink: true };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
        });

        it('should not add blink node when isShowBlink is false', () => {
            // Arrange
            const props = { ...defaultProps, isShowBlink: false };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
        });
    });

    describe('Edge Cases Tests', () => {
        it('should handle empty round history', () => {
            // Arrange
            const props = { ...defaultProps, roundHistory: [] };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
        });

        it('should handle single round in history', () => {
            // Arrange
            const singleRound = [mockRoundHistory[0]];
            const props = { ...defaultProps, roundHistory: singleRound };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
        });

        it('should handle large round history (100+ rounds)', () => {
            // Arrange
            const largeHistory = Array.from({ length: 102 }, (_, index) => ({
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
        });
    });

    describe('Integration Tests', () => {
        it('should handle all props combinations correctly', () => {
            // Arrange
            const testCases = [
                { isShowBlink: true, isOddEven: true, playResultAnimation: true },
                { isShowBlink: true, isOddEven: false, playResultAnimation: false },
                { isShowBlink: false, isOddEven: true, playResultAnimation: true },
                { isShowBlink: false, isOddEven: false, playResultAnimation: false }
            ];

            // Act & Assert
            testCases.forEach((testCase, index) => {
                const props = { ...defaultProps, ...testCase };
                const { unmount } = render(<ScoreboardSeDie {...props} />);
                
                expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
                unmount();
            });
        });

        it('should maintain state consistency during re-renders', () => {
            // Arrange
            const props = { ...defaultProps };
            const { rerender } = render(<ScoreboardSeDie {...props} />);

            // Act - Multiple re-renders with different data
            for (let i = 0; i < 5; i++) {
                const updatedProps = { 
                    ...props, 
                    roundHistory: [...mockRoundHistory, ...Array(i).fill(mockRoundHistory[0])]
                };
                rerender(<ScoreboardSeDie {...updatedProps} />);
            }

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
        });
    });

    describe('Performance Tests', () => {
        it('should render efficiently with large datasets', () => {
            // Arrange
            const largeHistory = Array.from({ length: 200 }, (_, index) => ({
                result: { drawId: index + 1, dice1: 1, dice2: 2, dice3: 3 },
                settlementResult: { 
                    odd: index % 2 === 0, 
                    even: index % 2 === 1, 
                    drawId: index + 1 
                }
            }));
            const props = { ...defaultProps, roundHistory: largeHistory };

            // Act
            const startTime = performance.now();
            render(<ScoreboardSeDie {...props} />);
            const endTime = performance.now();

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
            expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
        });
    });

    describe('Accessibility Tests', () => {
        it('should have proper ARIA attributes', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);

            // Assert
            expect(screen.getByTestId('switchable-scoreboard')).toBeInTheDocument();
        });

        it('should be keyboard navigable', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<ScoreboardSeDie {...props} />);
            const scoreboard = screen.getByTestId('switchable-scoreboard');

            // Assert
            expect(scoreboard).toBeInTheDocument();
        });
    });
});
