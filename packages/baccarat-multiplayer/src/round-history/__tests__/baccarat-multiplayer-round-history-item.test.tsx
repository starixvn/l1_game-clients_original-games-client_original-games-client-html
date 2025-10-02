import React from 'react';
import { render, screen } from '@testing-library/react';
import { BaccaratMultiplayerRoundHistoryItem } from '../baccarat-multiplayer-round-history-item';

jest.mock('@shared/react-hooks/use-translator', () => ({
    useTranslator: jest.fn(() => ({ t: (key: string) => `translated_${key}` })),
}));

jest.mock('../../scoreboard/utils', () => ({
    hasPlayerPair: jest.fn(),
    hasBankerPair: jest.fn(),
    getWinnerFromSettlement: jest.fn(),
    getScoreboardImagePath: jest.fn((variant) => `/images/${variant}.svg`),
    getDisplayTextKey: jest.fn((variant) => `display_${variant}`),
}));

jest.mock('@shared/components/game-components/cached-image', () => ({
    CachedImage: ({ src, alt, width, height, className }: any) => (
        <div
            data-src={src}
            data-alt={alt}
            data-width={width}
            data-height={height}
            className={className}
            data-testid={`cached-image-${alt}`}
        />
    ),
}));

const MOCK_ITEM_BACCARAT_RESULT = {
    player: { card1: { rank: 1, suit: 0 }, card2: { rank: 2, suit: 1 }, card3: null, score: 3 },
    banker: { card1: { rank: 3, suit: 2 }, card2: { rank: 4, suit: 3 }, card3: null, score: 7 }
};

const MOCK_ITEM_BANKER_SETTLEMENT_RESULT = {
    player: false,
    banker: true,
    tie: false,
    anyPair: false,
    playerPair: false,
    bankerPair: false,
    natural: false,
    isBlink: false
};

// Test constants
const BANKER = 'BANKER';
const PLAYER = 'PLAYER';
const TIE = 'TIE';
const BANKER_IMAGE_PATH = '/images/BANKER.svg';
const PLAYER_IMAGE_PATH = '/images/PLAYER.svg';
const TIE_IMAGE_PATH = '/images/TIE.svg';
const TRANSLATED_BANKER_TEXT = 'translated_display_BANKER';
const TRANSLATED_PLAYER_TEXT = 'translated_display_PLAYER';
const TRANSLATED_TIE_TEXT = 'translated_display_TIE';

describe('BaccaratMultiplayerRoundHistoryItem', () => {
    const mockHasPlayerPair = require('../../scoreboard/utils').hasPlayerPair;
    const mockHasBankerPair = require('../../scoreboard/utils').hasBankerPair;
    const mockGetWinnerFromSettlement = require('../../scoreboard/utils').getWinnerFromSettlement;
    const mockGetScoreboardImagePath = require('../../scoreboard/utils').getScoreboardImagePath;
    const mockGetDisplayTextKey = require('../../scoreboard/utils').getDisplayTextKey;

    const mockResult = {
        roundId: 123,
        result: MOCK_ITEM_BACCARAT_RESULT,
        settlementResult: MOCK_ITEM_BANKER_SETTLEMENT_RESULT
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockGetWinnerFromSettlement.mockReturnValue({
            hasWinner: true,
            winner: BANKER
        });
        mockHasPlayerPair.mockReturnValue(false);
        mockHasBankerPair.mockReturnValue(false);
        mockGetScoreboardImagePath.mockImplementation((variant: string) => `/images/${variant}.svg`);
        mockGetDisplayTextKey.mockImplementation((variant: string) => `display_${variant}`);
    });

    describe('rendering behavior', () => {
        it('should render correctly for a banker win with no pairs', () => {
            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            const roundHistoryItem = screen.getByTestId('cached-image-BANKER');
            expect(roundHistoryItem).toBeInTheDocument();
            expect(roundHistoryItem).toHaveAttribute('data-src', BANKER_IMAGE_PATH);

            expect(screen.getByText(TRANSLATED_BANKER_TEXT)).toBeInTheDocument();
        });

        it('should render correctly for a player win with player pair', () => {
            mockGetWinnerFromSettlement.mockReturnValue({
                hasWinner: true,
                winner: PLAYER
            });
            mockHasPlayerPair.mockReturnValue(true);
            mockHasBankerPair.mockReturnValue(false);

            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            const roundHistoryItem = screen.getByTestId('cached-image-PLAYER');
            expect(roundHistoryItem).toBeInTheDocument();
            expect(roundHistoryItem).toHaveAttribute('data-src', PLAYER_IMAGE_PATH);

            expect(screen.getByText(TRANSLATED_PLAYER_TEXT)).toBeInTheDocument();
        });

        it('should render correctly for a tie win with both pairs', () => {
            mockGetWinnerFromSettlement.mockReturnValue({
                hasWinner: true,
                winner: TIE
            });
            mockHasPlayerPair.mockReturnValue(true);
            mockHasBankerPair.mockReturnValue(true);

            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            const roundHistoryItem = screen.getByTestId('cached-image-TIE');
            expect(roundHistoryItem).toBeInTheDocument();
            expect(roundHistoryItem).toHaveAttribute('data-src', TIE_IMAGE_PATH);

            expect(screen.getByText(TRANSLATED_TIE_TEXT)).toBeInTheDocument();
        });

        it('should render correctly for a banker win with banker pair', () => {
            mockGetWinnerFromSettlement.mockReturnValue({
                hasWinner: true,
                winner: BANKER
            });
            mockHasPlayerPair.mockReturnValue(false);
            mockHasBankerPair.mockReturnValue(true);

            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            const roundHistoryItem = screen.getByTestId('cached-image-BANKER');
            expect(roundHistoryItem).toBeInTheDocument();
            expect(roundHistoryItem).toHaveAttribute('data-src', BANKER_IMAGE_PATH);

            // Should display translated text
            expect(screen.getByText(TRANSLATED_BANKER_TEXT)).toBeInTheDocument();
        });
    });

    describe('conditional rendering', () => {
        it('should return null when result is undefined', () => {
            const { container } = render(<BaccaratMultiplayerRoundHistoryItem result={undefined as any} index={0} />);
            expect(container.firstChild).toBeNull();
        });

        it('should return null when settlementResult is undefined', () => {
            const resultWithoutSettlement = {
                ...mockResult,
                settlementResult: undefined
            };

            const { container } = render(<BaccaratMultiplayerRoundHistoryItem result={resultWithoutSettlement as any} index={0} />);
            expect(container.firstChild).toBeNull();
        });

        it('should return null when there is no winner', () => {
            mockGetWinnerFromSettlement.mockReturnValue({
                hasWinner: false,
                winner: null
            });

            const { container } = render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);
            expect(container.firstChild).toBeNull();
        });
    });

    describe('utility function calls', () => {
        it('should call getWinnerFromSettlement with settlementResult', () => {
            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            expect(mockGetWinnerFromSettlement).toHaveBeenCalledWith(mockResult.settlementResult);
        });

        it('should call hasPlayerPair with player result', () => {
            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            expect(mockHasPlayerPair).toHaveBeenCalledWith(mockResult.result.player);
        });

        it('should call hasBankerPair with banker result', () => {
            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            expect(mockHasBankerPair).toHaveBeenCalledWith(mockResult.result.banker);
        });

        it('should call getScoreboardImagePath with winner variant', () => {
            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            expect(mockGetScoreboardImagePath).toHaveBeenCalledWith(BANKER);
        });

        it('should call getDisplayTextKey with winner variant', () => {
            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            expect(mockGetDisplayTextKey).toHaveBeenCalledWith(BANKER);
        });
    });

    describe('accessibility and structure', () => {
        it('should have proper image alt text', () => {
            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            const cachedImage = screen.getByTestId('cached-image-BANKER');
            expect(cachedImage).toHaveAttribute('data-alt', BANKER);
        });

        it('should have proper image dimensions', () => {
            render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

            const cachedImage = screen.getByTestId('cached-image-BANKER');
            expect(cachedImage).toHaveAttribute('data-width', '18');
            expect(cachedImage).toHaveAttribute('data-height', '18');
        });

    });

    describe('edge cases', () => {
        it('should handle missing result properties gracefully', () => {
            const incompleteResult = {
                roundId: 123,
                result: { player: null, banker: null },
                settlementResult: mockResult.settlementResult
            };

            render(<BaccaratMultiplayerRoundHistoryItem result={incompleteResult as any} index={0} />);

            expect(mockHasPlayerPair).toHaveBeenCalledWith(null);
            expect(mockHasBankerPair).toHaveBeenCalledWith(null);
        });

        it('should handle different winner variants', () => {
            const winners = [PLAYER, BANKER, TIE];

            winners.forEach(winner => {
                mockGetWinnerFromSettlement.mockReturnValue({
                    hasWinner: true,
                    winner
                });

                const { unmount } = render(<BaccaratMultiplayerRoundHistoryItem result={mockResult} index={0} />);

                const cachedImage = screen.getByTestId(`cached-image-${winner}`);
                expect(cachedImage).toBeInTheDocument();

                unmount();
            });
        });
    });
});
