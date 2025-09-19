import { BaccaratResult } from "../baccarat-multiplayer-constants";

// Helper function to detect player pair
export const hasPlayerPair = (playerCards: BaccaratResult['player']): boolean => {
    const cards = [playerCards.card1, playerCards.card2, playerCards.card3].filter(Boolean);
    return cards.some((card1, i) => 
        cards.some((card2, j) => i !== j && card1?.rank === card2?.rank)
    );
};

// Helper function to detect banker pair
export const hasBankerPair = (bankerCards: BaccaratResult['banker']): boolean => {
    const cards = [bankerCards.card1, bankerCards.card2, bankerCards.card3].filter(Boolean);
    return cards.some((card1, i) => 
        cards.some((card2, j) => i !== j && card1?.rank === card2?.rank)
    );
};
