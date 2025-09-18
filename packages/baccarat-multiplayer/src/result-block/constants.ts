// Card timing constants for animations - direct access by order number
export const CARD_TIMINGS = {
    1: 0, // First card opens immediately
    2: 1000, // Second to open
    3: 2000, // Third to open
    4: 3000, // Fourth to open
    5: 4000, // Fifth card (if present)
    6: 5000, // Sixth card (if present)
} as const;

// Winner text mapping
export const WINNER_TEXT_MAP = {
    player: 'Player Wins',
    banker: 'Banker Wins',
    tie: 'Tie'
} as const;
// Card animation configuration
export const CARD_ANIMATION_CONFIG = {
    orders: {
        playerCard1: 1,
        bankerCard1: 2,
        playerCard2: 3,
        bankerCard2: 4,
        playerCard3: 5,
        bankerCard3: 6
    }
} as const;

