// Helper functions for card processing
const createCardValue = (card: any) => ({
    rank: card?.rank ?? -1,
    suit: card?.suit ?? 0
});

const calculateAccumulatedScore = (currentScore: number, card: any) => {
    const newScore = sumScore(currentScore, card?.rank ?? -1);
    return { score: newScore, accumulatedScore: newScore };
};

export const sumScore = (score: number, card: number): number => {
    // Card values in baccarat: 0-12 (0=A, 1=2, ..., 9=10, 10=J, 11=Q, 12=K)
    // Baccarat values: A=1, 2-9=face value, 10/J/Q/K=0
    let cardValue;
    if (card < 0 || card === undefined || card === null) {
        return score; // ignore invalid
    }
    if (card === 0) {
        cardValue = 1; // Ace = 1
    } else if (card >= 1 && card <= 9) {
        cardValue = card + 1; // 2-10 = face value
    } else {
        cardValue = 0; // J, Q, K = 0
    }

    const newScore = (score + cardValue) % 10;
    return newScore;
};

export const determineWinner = (playerScore: number, bankerScore: number): "player" | "banker" | "tie" => {
    if (playerScore > bankerScore) return "player";
    if (bankerScore > playerScore) return "banker";
    return "tie";
};

export const GetPlayerCardsResult = (result: any): import('./types').CardOrderWithTiming[] => {
    const { CARD_ANIMATION_CONFIG } = require('./constants');
    const { orders } = CARD_ANIMATION_CONFIG;
    const { CARD_TIMINGS } = require('./constants');
    let runningScore = 0;

    // Check if player has a valid third card
    const playerHasThirdCard = !!result.player.card3 && result.player.card3.rank !== undefined;

    const playerCards = [
        {
            value: createCardValue(result.player.card1),
            order: orders.playerCard1,
            animationDelay: CARD_TIMINGS[orders.playerCard1],
            accumulatedScore: (() => {
                const { score } = calculateAccumulatedScore(0, result.player.card1);
                runningScore = score;
                return score;
            })(),
            playerHasThirdCard
        },
        {
            value: createCardValue(result.player.card2),
            order: orders.playerCard2,
            animationDelay: CARD_TIMINGS[orders.playerCard2],
            accumulatedScore: (() => {
                const { score } = calculateAccumulatedScore(runningScore, result.player.card2);
                runningScore = score;
                return score;
            })(),
            playerHasThirdCard
        }
    ];

    // Add third card if player has one
    if (playerHasThirdCard) {
        const { accumulatedScore } = calculateAccumulatedScore(runningScore, result.player.card3);
        playerCards.push({
            value: createCardValue(result.player.card3),
            order: orders.playerCard3,
            animationDelay: CARD_TIMINGS[orders.playerCard3],
            accumulatedScore,
            playerHasThirdCard
        });
    }

    return playerCards;
};

export const GetBankerCardsResult = (result: any): import('./types').CardOrderWithTiming[] => {
    const { CARD_ANIMATION_CONFIG } = require('./constants');
    const { orders } = CARD_ANIMATION_CONFIG;
    const { CARD_TIMINGS } = require('./constants');
    let runningScore = 0;

    // Check third card status
    const playerHasThirdCard = !!result.player.card3 && result.player.card3.rank !== undefined;
    const bankerHasThirdCard = !!result.banker.card3 && result.banker.card3.rank !== undefined;

    const bankerCards = [
        {
            value: createCardValue(result.banker.card1),
            order: orders.bankerCard1,
            animationDelay: CARD_TIMINGS[orders.bankerCard1],
            accumulatedScore: (() => {
                const { score } = calculateAccumulatedScore(0, result.banker.card1);
                runningScore = score;
                return score;
            })(),
            playerHasThirdCard
        },
        {
            value: createCardValue(result.banker.card2),
            order: orders.bankerCard2,
            animationDelay: CARD_TIMINGS[orders.bankerCard2],
            accumulatedScore: (() => {
                const { score } = calculateAccumulatedScore(runningScore, result.banker.card2);
                runningScore = score;
                return score;
            })(),
            playerHasThirdCard
        }
    ];

    // Add third card if banker has one
    if (bankerHasThirdCard) {
        const bankerThirdCardOrder = playerHasThirdCard ? orders.bankerCard3 : orders.playerCard3;
        const { accumulatedScore } = calculateAccumulatedScore(runningScore, result.banker.card3);

        bankerCards.push({
            value: createCardValue(result.banker.card3),
            order: bankerThirdCardOrder,
            animationDelay: CARD_TIMINGS[bankerThirdCardOrder],
            accumulatedScore,
            playerHasThirdCard
        });
    }

    return bankerCards;
};
