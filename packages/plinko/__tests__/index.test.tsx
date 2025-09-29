/**
 * Integration test for the main page with payout system integration
 *
 * @format
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/index';

// Mock the components to avoid complex dependencies
jest.mock('../components/GameBackground', () => () => <div data-testid="game-background">GameBackground</div>);
jest.mock('../components/MultiplierDisplay', () => ({ multipliers }: { multipliers: string[] }) => (
    <div data-testid="multiplier-display">{multipliers.join(', ')}</div>
));
jest.mock('../components/BallLayout', () => ({ rows, ballsPerRow }: { rows: number; ballsPerRow: number[] }) => (
    <div data-testid="ball-layout">BallLayout - {rows} rows, balls: {ballsPerRow.join(',')}</div>
));
jest.mock('../components/WinMessage', () => ({ winAmount }: { winAmount: number }) => (
    <div data-testid="win-message">Win: {winAmount}</div>
));
jest.mock('../components/BetControls', () => () => <div data-testid="bet-controls">BetControls</div>);
jest.mock('../components/GameTabs', () => () => <div data-testid="game-tabs">GameTabs</div>);
jest.mock('../components/GameInfo', () => () => <div data-testid="game-info">GameInfo</div>);
jest.mock('../components/BetsTable', () => () => <div data-testid="bets-table">BetsTable</div>);

// Mock PayoutsRow to avoid API calls in integration test
jest.mock('../components/PayoutsRow', () => ({
    __esModule: true,
    default: ({ gameMode, rows, betAmount }: { gameMode: string; rows: number; betAmount: number }) => (
        <div data-testid="payouts-row">
            PayoutsRow - Mode: {gameMode}, Rows: {rows}, Bet: {betAmount}
        </div>
    ),
}));

describe('Home Page Integration', () => {
    test('should render all components correctly', () => {
        render(<Home />);

        // Check that all mocked components are rendered
        expect(screen.getByTestId('game-background')).toBeInTheDocument();
        expect(screen.getByTestId('multiplier-display')).toBeInTheDocument();
        expect(screen.getByTestId('ball-layout')).toBeInTheDocument();
        expect(screen.getByTestId('payouts-row')).toBeInTheDocument();
        expect(screen.getByTestId('win-message')).toBeInTheDocument();
        expect(screen.getByTestId('bet-controls')).toBeInTheDocument();
        expect(screen.getByTestId('game-tabs')).toBeInTheDocument();
        expect(screen.getByTestId('game-info')).toBeInTheDocument();
        expect(screen.getByTestId('bets-table')).toBeInTheDocument();
    });

    test('should pass correct props to PayoutsRow component', () => {
        render(<Home />);

        const payoutsRow = screen.getByTestId('payouts-row');
        expect(payoutsRow).toHaveTextContent('Mode: Lightning');
        expect(payoutsRow).toHaveTextContent('Rows: 9');
        expect(payoutsRow).toHaveTextContent('Bet: 10000');
    });

    test('should pass correct props to BallLayout component', () => {
        render(<Home />);

        const ballLayout = screen.getByTestId('ball-layout');
        expect(ballLayout).toHaveTextContent('9 rows');
        expect(ballLayout).toHaveTextContent('balls: 3,4,5,6,7,8,9,10,11'); // 9 rows = 3 to 11 balls
    });

    test('should render the main container structure', () => {
        render(<Home />);

        // Check for main structural elements
        expect(screen.getByText('START AUTO BET')).toBeInTheDocument();

        // Check for CSS classes
        const mainContainer = document.querySelector('.main-container');
        expect(mainContainer).toBeInTheDocument();

        const gameInfo = document.querySelector('.game-info');
        expect(gameInfo).toBeInTheDocument();

        const frameGame = document.querySelector('.frame-game');
        expect(frameGame).toBeInTheDocument();

        const ballLayout = document.querySelector('.ball-layout');
        expect(ballLayout).toBeInTheDocument();
    });
});
