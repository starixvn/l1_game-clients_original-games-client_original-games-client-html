export const CARD_DISPLAY = {
    BANKER_SUFFIX: '-banker',
    BASE_CARD_COUNT: 4,
} as const;

export const CARD_TIMINGS = {
    CARD_1: 0, // First card opens immediately
    CARD_2: 1000, // Second to open
    CARD_3: 2000, // Third to open
    CARD_4: 3000, // Fourth to open
    CARD_5: 4000, // Fifth card (if present)
    CARD_6: 5000, // Sixth card (if present)
} as const;

export const TRANSLATIONS = {
    PLAYER: 'player',
    BANKER: 'banker',
} as const;
