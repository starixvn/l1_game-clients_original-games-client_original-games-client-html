import { render, screen, fireEvent } from '@testing-library/react';
import { BaccaratBetCountsComponent } from '../baccarat-bet-counts';

jest.mock('../../scoreboard/utils', () => ({
    calculateBaccaratBetCounts: jest.fn(),
    getScoreboardImagePath: jest.fn((variant) => `/images/${variant}.svg`),
    getDisplayTextKey: jest.fn((variant) => `display_${variant}`),
}));

jest.mock('@shared/react-hooks/use-translator', () => ({
    useTranslator: jest.fn((resources) => ({ t: (key: string) => `translated_${key}` })),
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, className, onClick, ...props }: any) => (
        <div
            data-src={src}
            data-alt={alt}
            className={className}
            onClick={onClick}
            data-testid={`image-${alt}`}
            {...props}
        />
    ),
}));

describe('BaccaratBetCountsComponent', () => {
    const TOOLTIP_OVERLAY_TEST_ID = 'tooltip-overlay';
    const GUIDE_BUTTON_TEST_ID = 'image-scoreboard-question-mark';
    const GUIDE_BUTTON_ICON_PATH = '/static/images/icons/scoreboard-question-mark.svg';
    const TRANSLATED_TEXT_REGEX = /^translated_/;
    const IMAGE_TEST_ID_REGEX = /^image-/;
    const PLAYER_BET_COUNT = '15';
    const BANKER_BET_COUNT = '12';
    const TIE_BET_COUNT = '3';
    const PLAYER_PAIR_BET_COUNT = '8';
    const BANKER_PAIR_BET_COUNT = '6';

    const mockRoundHistory = [
        {
            roundId: 1,
            result: {
                player: { card1: { rank: 1, suit: 0 }, card2: { rank: 2, suit: 1 }, card3: null, score: 3 },
                banker: { card1: { rank: 3, suit: 2 }, card2: { rank: 4, suit: 3 }, card3: null, score: 7 }
            },
            settlementResult: {
                player: true,
                banker: false,
                tie: false,
                anyPair: false,
                playerPair: false,
                bankerPair: false,
                natural: false,
                isBlink: false
            }
        },
        {
            roundId: 2,
            result: {
                player: { card1: { rank: 5, suit: 0 }, card2: { rank: 6, suit: 1 }, card3: null, score: 1 },
                banker: { card1: { rank: 7, suit: 2 }, card2: { rank: 8, suit: 3 }, card3: null, score: 5 }
            },
            settlementResult: {
                player: false,
                banker: true,
                tie: false,
                anyPair: false,
                playerPair: false,
                bankerPair: false,
                natural: false,
                isBlink: false
            }
        },
    ];

    const mockBetCounts = {
        player: 15,
        banker: 12,
        tie: 3,
        playerPair: 8,
        bankerPair: 6,
    };

    const mockOnOpenGuide = jest.fn();
    const mockIsTooltipVisible = false;
    const mockOnCloseGuide = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        const { calculateBaccaratBetCounts, getScoreboardImagePath, getDisplayTextKey } = require('../../scoreboard/utils');
        calculateBaccaratBetCounts.mockReturnValue(mockBetCounts);
        getScoreboardImagePath.mockImplementation((variant: string) => `/images/${variant}.svg`);
        getDisplayTextKey.mockImplementation((variant: string) => `display_${variant}`);

        const { useTranslator } = require('@shared/react-hooks/use-translator');
        useTranslator.mockReturnValue({ t: (key: string) => `translated_${key}` });
    });

    describe('bet counts calculation', () => {
        it('should call calculateBaccaratBetCounts with roundHistory', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            const { calculateBaccaratBetCounts } = require('../../scoreboard/utils');
            expect(calculateBaccaratBetCounts).toHaveBeenCalledWith(mockRoundHistory);
        });

        it('should display all bet count types', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            expect(screen.getByText(PLAYER_BET_COUNT)).toBeInTheDocument();
            expect(screen.getByText(BANKER_BET_COUNT)).toBeInTheDocument();
            expect(screen.getByText(TIE_BET_COUNT)).toBeInTheDocument();
            expect(screen.getByText(PLAYER_PAIR_BET_COUNT)).toBeInTheDocument();
            expect(screen.getByText(BANKER_PAIR_BET_COUNT)).toBeInTheDocument();
        });
    });

    describe('guide button functionality', () => {
        it('should render guide button with question mark icon', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            const guideButton = screen.getByTestId(GUIDE_BUTTON_TEST_ID);
            expect(guideButton).toBeInTheDocument();
            expect(guideButton).toHaveAttribute('data-src', expect.stringContaining('scoreboard-question-mark.svg'));
        });

        it('should call onOpenGuide when guide button is clicked', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            const guideButton = screen.getByTestId(GUIDE_BUTTON_TEST_ID);
            fireEvent.click(guideButton);

            expect(mockOnOpenGuide).toHaveBeenCalledTimes(1);
        });

        it('should handle guide button click when onOpenGuide is undefined', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            const guideButton = screen.getByTestId(GUIDE_BUTTON_TEST_ID);
            expect(() => fireEvent.click(guideButton)).not.toThrow();
        });
    });

    describe('tooltip overlay', () => {
        it('should not render tooltip overlay when isTooltipVisible is false', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={false}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            expect(screen.queryByTestId(TOOLTIP_OVERLAY_TEST_ID)).not.toBeInTheDocument();
        });


        it('should call onCloseGuide when overlay is clicked', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={true}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            const overlay = document.querySelector('.absolute.inset-0.z-40') as HTMLElement;
            fireEvent.click(overlay);

            expect(mockOnCloseGuide).toHaveBeenCalledTimes(1);
        });

        it('should prevent event propagation when overlay is clicked', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={true}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            const overlay = document.querySelector('.absolute.inset-0.z-40') as HTMLElement;
            fireEvent.click(overlay);

            expect(overlay).toBeInTheDocument();
            expect(mockOnCloseGuide).toHaveBeenCalledTimes(1);
        });
    });

    describe('BetCountItem component', () => {
        it('should render correct number of bet count items', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            const betItems = screen.getAllByTestId(IMAGE_TEST_ID_REGEX);
            expect(betItems).toHaveLength(6);
        });

        it('should render images with correct sources', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            expect(screen.getByTestId('image-player')).toBeInTheDocument();
            expect(screen.getByTestId('image-banker')).toBeInTheDocument();
            expect(screen.getByTestId('image-tie')).toBeInTheDocument();
            expect(screen.getByTestId('image-playerPair')).toBeInTheDocument();
            expect(screen.getByTestId('image-bankerPair')).toBeInTheDocument();
        });

        it('should display translated text for bet types', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            expect(screen.getAllByText(TRANSLATED_TEXT_REGEX)).toHaveLength(5);
        });
    });

    describe('translation integration', () => {
        it('should use translator for display text', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            expect(screen.getAllByText(TRANSLATED_TEXT_REGEX)).toHaveLength(5);
        });

        it('should handle translator returning same key', () => {
            const { useTranslator } = require('@shared/react-hooks/use-translator');
            useTranslator.mockReturnValue({ t: (key: string) => key });

            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            expect(screen.getByText('display_player')).toBeInTheDocument();
            expect(screen.getByText('display_banker')).toBeInTheDocument();
        });

        it('should handle empty translation key', () => {
            const { getDisplayTextKey } = require('../../scoreboard/utils');
            getDisplayTextKey.mockReturnValue(null);

            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            expect(screen.queryByText(TRANSLATED_TEXT_REGEX)).toBeNull();
        });
    });

    describe('base path handling', () => {
        it('should use base path for guide button image', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            const guideButton = screen.getByTestId(GUIDE_BUTTON_TEST_ID);
            expect(guideButton).toHaveAttribute('data-src', expect.stringContaining(GUIDE_BUTTON_ICON_PATH));
        });

        it('should handle empty base path', () => {
            const originalEnv = process.env;
            process.env.NEXT_PUBLIC_BASE_PATH = '';

            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            const guideButton = screen.getByTestId(GUIDE_BUTTON_TEST_ID);
            expect(guideButton).toHaveAttribute('data-src', GUIDE_BUTTON_ICON_PATH);

            process.env = originalEnv;
        });
    });

    describe('empty or zero counts', () => {
        it('should handle zero counts', () => {
            const { calculateBaccaratBetCounts } = require('../../scoreboard/utils');
            calculateBaccaratBetCounts.mockReturnValue({
                player: 0,
                banker: 0,
                tie: 0,
                playerPair: 0,
                bankerPair: 0,
            });

            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            expect(screen.getAllByText('0')).toHaveLength(5);
        });

        it('should handle empty round history', () => {
            const { calculateBaccaratBetCounts } = require('../../scoreboard/utils');
            calculateBaccaratBetCounts.mockReturnValue({
                player: 0,
                banker: 0,
                tie: 0,
                playerPair: 0,
                bankerPair: 0,
            });

            render(
                <BaccaratBetCountsComponent
                    roundHistory={[]}
                    onOpenGuide={mockOnOpenGuide}
                    isTooltipVisible={mockIsTooltipVisible}
                    onCloseGuide={mockOnCloseGuide}
                />
            );

            expect(calculateBaccaratBetCounts).toHaveBeenCalledWith([]);
        });
    });

    describe('edge cases', () => {
        it('should handle undefined optional props', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                />
            );

            expect(screen.getByTestId(GUIDE_BUTTON_TEST_ID)).toBeInTheDocument();
        });

        it('should handle all optional props being undefined', () => {
            render(
                <BaccaratBetCountsComponent
                    roundHistory={mockRoundHistory}
                    isTooltipVisible={false}
                />
            );

            expect(screen.getByTestId(GUIDE_BUTTON_TEST_ID)).toBeInTheDocument();
        });
    });
});
