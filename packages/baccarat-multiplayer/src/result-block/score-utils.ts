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
    console.log(`sumScore: card=${card}, cardValue=${cardValue}, score=${score} -> newScore=${newScore}`);
    return newScore;
};

export const calculateTotalScore = (cards: number[]): number => {
    if (!cards || cards.length === 0) {
        throw new Error('Cards array cannot be empty');
    }

    if (cards.some(card => card < 0 || card > 12)) {
        throw new Error('Card values must be between 0 and 12');
    }

    console.log('calculateTotalScore: input cards=', cards);
    const total = cards.reduce((score, card) => sumScore(score, card), 0);
    console.log('calculateTotalScore: total=', total);
    return total;
};

export const getCardValues = (cards: any[]): number[] => {
    if (!Array.isArray(cards)) {
        console.log('getCardValues: cards not array ->', cards);
        return [];
    }
    const validCards = cards
        .filter((card) => card !== undefined && card !== null)
        .map((card) => (typeof card === 'object' && typeof card.card === 'number' ? card.card : typeof card === 'number' ? card : -1))
        .filter((v) => v >= 0);
    console.log('getCardValues: mapped=', validCards, 'from=', cards);
    return validCards;
};

export const determineWinner = (playerScore: number, bankerScore: number): string => {
    if (playerScore > bankerScore) {
        return 'player_win';
    } else if (bankerScore > playerScore) {
        return 'banker_win';
    } else {
        return 'tie_win';
    }
};

export const CardAnimationConfig = {
    baseDelay: 50,
    intervalDelay: 200,
    orders: {
        playerCard1: 1,
        bankerCard1: 2,
        playerCard2: 3,
        bankerCard2: 4,
        playerCard3: 5,
        bankerCard3: 6
    },
    getAnimationTime: (order: number) => {
        const baseTime = 50;
        const cardInterval = 200;
        const pairDelay = 100;
        const thirdCardExtraDelay = 300; // Extra delay for third cards

        const pairIndex = Math.floor((order - 1) / 2);
        const positionInPair = (order - 1) % 2;
        const isThirdCard = order >= 5; // Check if it's a third card (order 5 or 6)

        return baseTime +
            (pairIndex * (cardInterval + pairDelay)) +
            (positionInPair * cardInterval) +
            (isThirdCard ? thirdCardExtraDelay : 0);
    }
};

export interface CardOrderWithTiming {
    value: any;
    order: number;
    animationDelay: number;
    accumulatedScore: number;
    playerHasThirdCard?: boolean;
}

export const GetPlayerCardsResult = (result: any): CardOrderWithTiming[] => {
    const { orders, getAnimationTime } = CardAnimationConfig;
    let runningScore = 0;

    // Check if player has a valid third card
    const playerHasThirdCard = !!result.player.card3 && result.player.card3.card !== -1;


    const playerCards = [
        {
            value: result.player.card1,
            order: orders.playerCard1,
            animationDelay: getAnimationTime(orders.playerCard1),
            accumulatedScore: (() => { runningScore = sumScore(0, result.player.card1?.card ?? -1); return runningScore; })(),
            playerHasThirdCard: playerHasThirdCard
        },
        {
            value: result.player.card2,
            order: orders.playerCard2,
            animationDelay: getAnimationTime(orders.playerCard2),
            accumulatedScore: (() => { runningScore = sumScore(runningScore, result.player.card2?.card ?? -1); return runningScore; })(),
            playerHasThirdCard: playerHasThirdCard
        }
    ];

    // Only add third card if player actually has one
    if (playerHasThirdCard) {
        playerCards.push({
            value: result.player.card3,
            order: orders.playerCard3,
            animationDelay: getAnimationTime(orders.playerCard3),
            accumulatedScore: sumScore(runningScore, result.player.card3?.card ?? -1),
            playerHasThirdCard: playerHasThirdCard
        });
    }
    return playerCards;
};

export const GetBankerCardsResult = (result: any): CardOrderWithTiming[] => {
    const { orders, getAnimationTime } = CardAnimationConfig;
    let runningScore = 0;

    // Check if player has a third card (affects banker card order)
    const playerHasThirdCard = !!result.player.card3 && result.player.card3.card !== -1;
    const bankerHasThirdCard = !!result.banker.card3 && result.banker.card3.card !== -1;


    const bankerCards = [
        {
            value: result.banker.card1,
            order: orders.bankerCard1,
            animationDelay: getAnimationTime(orders.bankerCard1),
            accumulatedScore: (() => { runningScore = sumScore(0, result.banker.card1?.card ?? -1); return runningScore; })(),
            playerHasThirdCard: playerHasThirdCard
        },
        {
            value: result.banker.card2,
            order: orders.bankerCard2,
            animationDelay: getAnimationTime(orders.bankerCard2),
            accumulatedScore: (() => { runningScore = sumScore(runningScore, result.banker.card2?.card ?? -1); return runningScore; })(),
            playerHasThirdCard: playerHasThirdCard
        }
    ];

    // Only add third card if banker actually has one
    if (bankerHasThirdCard) {
        const bankerThirdCardOrder = playerHasThirdCard ? orders.bankerCard3 : orders.playerCard3;

        bankerCards.push({
            value: result.banker.card3,
            order: bankerThirdCardOrder,
            animationDelay: getAnimationTime(bankerThirdCardOrder),
            accumulatedScore: sumScore(runningScore, result.banker.card3?.card ?? -1),
            playerHasThirdCard: playerHasThirdCard
        });
    }
    return bankerCards;
};
