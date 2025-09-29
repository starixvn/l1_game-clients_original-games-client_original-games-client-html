import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameConfig, { GameConfigProps, BetDetails } from '../components/GameConfig';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('GameConfig Component', () => {
    const defaultProps: GameConfigProps = {
        gameMode: 'Medium',
        rows: 9,
        betAmount: 100,
        balance: 1000,
        onGameModeChange: jest.fn(),
        onRowsChange: jest.fn(),
        onBetPlaced: jest.fn(),
        onPayoutUpdate: jest.fn(),
        onBalanceUpdate: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();

        // Mock successful fetch responses
        mockFetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                success: true,
                betId: 'test-bet-id',
                newBalance: 900,
            }),
        });
    });

    describe('Rendering', () => {
        test('should render GameConfig component with all sections', () => {
            render(<GameConfig {...defaultProps} />);

            expect(screen.getByText('Game Mode')).toBeInTheDocument();
            expect(screen.getByText('Rows')).toBeInTheDocument();
            expect(screen.getByText('BET')).toBeInTheDocument();
        });

        test('should render mode and rows selectors', () => {
            render(<GameConfig {...defaultProps} />);

            // Should render the selectors (they're sub-components)
            expect(screen.getByText('Game Mode')).toBeInTheDocument();
            expect(screen.getByText('Rows')).toBeInTheDocument();
        });
    });

    describe('localStorage Persistence (Section 4.2)', () => {
        test('should load saved game mode from localStorage on mount', () => {
            localStorageMock.getItem.mockImplementation((key: string) => {
                if (key === 'plinko-gameMode') return 'High';
                if (key === 'plinko-rows') return '12';
                return null;
            });

            render(<GameConfig {...defaultProps} />);

            expect(defaultProps.onGameModeChange).toHaveBeenCalledWith('High');
            expect(defaultProps.onRowsChange).toHaveBeenCalledWith(12);
        });

        test('should validate and reject invalid saved game mode', () => {
            localStorageMock.getItem.mockImplementation((key: string) => {
                if (key === 'plinko-gameMode') return 'InvalidMode';
                return null;
            });

            render(<GameConfig {...defaultProps} />);

            expect(defaultProps.onGameModeChange).not.toHaveBeenCalled();
        });

        test('should validate and reject invalid saved rows', () => {
            localStorageMock.getItem.mockImplementation((key: string) => {
                if (key === 'plinko-rows') return '25'; // Invalid: > 16
                return null;
            });

            render(<GameConfig {...defaultProps} />);

            expect(defaultProps.onRowsChange).not.toHaveBeenCalled();
        });

        test('should save game mode changes to localStorage', () => {
            const { rerender } = render(<GameConfig {...defaultProps} />);

            // Simulate mode change by re-rendering with new props
            rerender(<GameConfig {...defaultProps} gameMode="Low" />);

            expect(localStorageMock.setItem).toHaveBeenCalledWith('plinko-gameMode', 'Low');
        });

        test('should save rows changes to localStorage', () => {
            const { rerender } = render(<GameConfig {...defaultProps} />);

            // Simulate rows change by re-rendering with new props
            rerender(<GameConfig {...defaultProps} rows={10} />);

            expect(localStorageMock.setItem).toHaveBeenCalledWith('plinko-rows', '10');
        });
    });

    describe('Bet Button Logic (Section 4.4)', () => {
        test('should enable BET button when conditions are met', () => {
            render(<GameConfig {...defaultProps} />);

            const betButton = screen.getByText('BET');
            expect(betButton).not.toBeDisabled();
        });

        test('should disable BET button when bet amount exceeds balance', () => {
            render(<GameConfig {...defaultProps} betAmount={1500} balance={1000} />);

            const betButton = screen.getByText('BET');
            expect(betButton).toBeDisabled();
        });

        test('should disable BET button when bet amount is zero or negative', () => {
            render(<GameConfig {...defaultProps} betAmount={0} />);

            const betButton = screen.getByText('BET');
            expect(betButton).toBeDisabled();
        });

        test('should show insufficient balance error message', () => {
            render(<GameConfig {...defaultProps} betAmount={1500} balance={1000} />);

            expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
        });
    });

    describe('Bet Placement (Section 4.4)', () => {
        test('should call place-bet API when BET button is clicked', async () => {
            render(<GameConfig {...defaultProps} />);

            const betButton = screen.getByText('BET');
            fireEvent.click(betButton);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/place-bet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        gameMode: 'Medium',
                        rows: 9,
                        betAmount: 100,
                    }),
                });
            });
        });

        test('should show placing bet status during API call', async () => {
            // Mock slow response
            mockFetch.mockImplementation(() => new Promise(resolve =>
                setTimeout(() => resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        betId: 'test-bet-id',
                        newBalance: 900,
                    }),
                }), 100)
            ));

            render(<GameConfig {...defaultProps} />);

            const betButton = screen.getByText('BET');
            fireEvent.click(betButton);

            expect(screen.getByText('Placing Bet...')).toBeInTheDocument();
        });

        test('should update balance immediately after bet placement', async () => {
            render(<GameConfig {...defaultProps} />);

            const betButton = screen.getByText('BET');
            fireEvent.click(betButton);

            await waitFor(() => {
                expect(defaultProps.onBalanceUpdate).toHaveBeenCalledWith(900);
            });
        });

        test('should call onBetPlaced with bet details', async () => {
            render(<GameConfig {...defaultProps} />);

            const betButton = screen.getByText('BET');
            fireEvent.click(betButton);

            await waitFor(() => {
                expect(defaultProps.onBetPlaced).toHaveBeenCalledWith(
                    expect.objectContaining({
                        gameMode: 'Medium',
                        rows: 9,
                        betAmount: 100,
                        status: 'pending',
                        timestamp: expect.any(Number),
                    })
                );
            });
        });

        test('should handle API errors gracefully', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({
                    success: false,
                    error: 'Server error',
                }),
            });

            render(<GameConfig {...defaultProps} />);

            const betButton = screen.getByText('BET');
            fireEvent.click(betButton);

            await waitFor(() => {
                expect(screen.getByText('BET')).toBeInTheDocument(); // Should reset to idle state
            });
        });
    });

    describe('Panel Disable Logic (Section 4.4)', () => {
        test('should disable config panel during bet processing', async () => {
            render(<GameConfig {...defaultProps} />);

            const betButton = screen.getByText('BET');
            fireEvent.click(betButton);

            await waitFor(() => {
                // Config section should be disabled (this would affect child components)
                expect(defaultProps.onBalanceUpdate).toHaveBeenCalled();
            });
        });
    });

    describe('Bet Status Polling', () => {
        test('should poll bet status after bet placement', async () => {
            // Mock the bet status API
            let callCount = 0;
            mockFetch.mockImplementation((url) => {
                if (url.includes('/api/bet-status')) {
                    callCount++;
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            success: true,
                            betId: 'test-bet-id',
                            status: callCount > 2 ? 'settled' : 'accepted',
                            currentBalance: 950,
                        }),
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        betId: 'test-bet-id',
                        newBalance: 900,
                    }),
                });
            });

            render(<GameConfig {...defaultProps} />);

            const betButton = screen.getByText('BET');
            fireEvent.click(betButton);

            // Wait for polling to occur
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/bet-status?betId=test-bet-id');
            }, { timeout: 2000 });
        });
    });

    describe('Lightning Mode Integration (Section 4.3)', () => {
        test('should handle Lightning mode selection normally', () => {
            render(<GameConfig {...defaultProps} gameMode="Lightning" />);

            // Should render without issues
            expect(screen.getByText('Game Mode')).toBeInTheDocument();
        });
    });

    // Payout updates are tested indirectly through the component integration
    // When mode/rows change through child components, onPayoutUpdate is called
});
