// Baccarat helper functions and constants

export const Choices = {
    banker: "banker",
    player: "player",
    tie: "tie",
    bankerPair: "bankerPair",
    playerPair: "playerPair",
};

export const BaccaratConfigs = {
    choices: [
        {
            name: "player",
            style: "player",
            label: () => "Player"
        },
        {
            name: "tie",
            style: "tie",
            label: () => "Tie"
        },
        {
            name: "banker",
            style: "banker",
            label: () => "Banker"
        },
        {
            name: "playerPair",
            style: "player-pair",
            label: () => "Player Pair"
        },
        {
            name: "bankerPair",
            style: "bank-pair",
            label: () => "Banker Pair"
        },
    ],
};

export const StatisticRuleEntriesBankerPlayer = Object.entries({
    [Choices.player]: (countResult: object, total: number) =>
        countResult[Choices.player] ? Math.round((countResult[Choices.player] * 100) / total) : 0,
    [Choices.tie]: (countResult: object, total: number) =>
        countResult[Choices.tie] ? Math.round((countResult[Choices.tie] * 100) / total) : 0,
    [Choices.banker]: (countResult: object, total: number) =>
        100 -
        (countResult[Choices.player] ? Math.round((countResult[Choices.player] * 100) / total) : 0) -
        (countResult[Choices.tie] ? Math.round((countResult[Choices.tie] * 100) / total) : 0),
});

export const StatisticRuleMapping = [StatisticRuleEntriesBankerPlayer];

export const GetTranslateChoiceMapping = (gameName = "Baccarat") => {
    return {
        player: "Player",
        banker: "Banker",
        tie: "Tie",
        playerPair: "Player Pair",
        bankerPair: "Banker Pair",
    };
};

export const ChoiceForTabActive = [
    {
        choice: ["banker", "player", "tie"],
    }
];

// Card timing constants for animations
export const CARD_TIMINGS = {
    CARD_1: 0, // First card opens immediately
    CARD_2: 1000, // Second to open
    CARD_3: 2000, // Third to open
    CARD_4: 3000, // Fourth to open
    CARD_5: 4000, // Fifth card (if present)
    CARD_6: 5000, // Sixth card (if present)
} as const;

// Card display constants
export const CARD_DISPLAY = {
    BANKER_SUFFIX: '-banker',
    BASE_CARD_COUNT: 4,
} as const;

// Card interface for API data
interface CardData {
    card: number;
    type: number;
}

// Baccarat game logic helpers
export const BaccaratGameLogic = {
    // Calculate baccarat value (face cards = 0, aces = 1, others = face value)
    getBaccaratValue: (value: number): number => {
        if (value >= 10) return 0;
        return value;
    },

    // Calculate total for a hand - handles both number arrays and card objects
    getBaccaratTotal: (cards: number[] | CardData[]): number => {
        if (!cards || !Array.isArray(cards)) return 0;

        let sum = 0;
        for (const card of cards) {
            const value = typeof card === 'number' ? card : card.card;
            sum += BaccaratGameLogic.getBaccaratValue(value);
        }

        return sum % 10;
    },

    // Determine winner
    calculateWinner: (playerCards: number[] | CardData[], bankerCards: number[] | CardData[]): "player" | "banker" | "tie" => {
        const playerTotal = BaccaratGameLogic.getBaccaratTotal(playerCards);
        const bankerTotal = BaccaratGameLogic.getBaccaratTotal(bankerCards);

        if (playerTotal > bankerTotal) return "player";
        if (bankerTotal > playerTotal) return "banker";
        return "tie";
    },

    // Check if hand is natural (8 or 9 with first two cards)
    isNatural: (cards: number[] | CardData[]): boolean => {
        if (!cards || !Array.isArray(cards) || cards.length < 2) return false;
        const firstTwo = cards.slice(0, 2);
        const total = BaccaratGameLogic.getBaccaratTotal(firstTwo);
        return total === 8 || total === 9;
    },

    // Determine if third card should be drawn
    shouldDrawThirdCard: (playerCards: number[] | CardData[], bankerCards: number[] | CardData[]): { player: boolean; banker: boolean } => {
        const playerTotal = BaccaratGameLogic.getBaccaratTotal(playerCards);
        const bankerTotal = BaccaratGameLogic.getBaccaratTotal(bankerCards);

        // If either has natural, no third cards
        if (BaccaratGameLogic.isNatural(playerCards) || BaccaratGameLogic.isNatural(bankerCards)) {
            return { player: false, banker: false };
        }

        // Player third card rules
        let playerDrawsThird = false;
        if (playerCards && playerCards.length === 2) {
            playerDrawsThird = playerTotal <= 5;
        }

        // Banker third card rules
        let bankerDrawsThird = false;
        if (bankerCards && bankerCards.length === 2) {
            if (playerDrawsThird) {
                const playerThirdCard = playerCards[2];
                let playerThirdValue = 0;
                if (playerThirdCard) {
                    if (typeof playerThirdCard === 'number') {
                        playerThirdValue = BaccaratGameLogic.getBaccaratValue(playerThirdCard);
                    } else {
                        playerThirdValue = BaccaratGameLogic.getBaccaratValue(playerThirdCard.card);
                    }
                }

                if (bankerTotal <= 2) {
                    bankerDrawsThird = true;
                } else if (bankerTotal === 3) {
                    bankerDrawsThird = playerThirdValue !== 8;
                } else if (bankerTotal === 4) {
                    bankerDrawsThird = [2, 3, 4, 5, 6, 7].includes(playerThirdValue);
                } else if (bankerTotal === 5) {
                    bankerDrawsThird = [4, 5, 6, 7].includes(playerThirdValue);
                } else if (bankerTotal === 6) {
                    bankerDrawsThird = [6, 7].includes(playerThirdValue);
                }
            } else {
                bankerDrawsThird = bankerTotal <= 5;
            }
        }

        return {
            player: playerDrawsThird,
            banker: bankerDrawsThird
        };
    },

    // Check for pairs
    hasPair: (cards: number[] | CardData[]): boolean => {
        if (!cards || !Array.isArray(cards) || cards.length < 2) return false;
        const firstTwo = cards.slice(0, 2);
        const firstValue = typeof firstTwo[0] === 'number' ? firstTwo[0] : firstTwo[0].card;
        const secondValue = typeof firstTwo[1] === 'number' ? firstTwo[1] : firstTwo[1].card;
        return BaccaratGameLogic.getBaccaratValue(firstValue) === BaccaratGameLogic.getBaccaratValue(secondValue);
    },

    // Get card display value
    getCardDisplayValue: (value: number): string => {
        if (value === 1) return 'A';
        if (value === 11) return 'J';
        if (value === 12) return 'Q';
        if (value === 13) return 'K';
        return value.toString();
    }
};
