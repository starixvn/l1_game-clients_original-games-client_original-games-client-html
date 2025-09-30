import { buildVersion } from "@shared/constants";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const BaccaratBetOptions = {
    PLAYER: "player",
    BANKER: "banker",
    TIE: "tie",
    ANY_PAIR: "anyPair",
};

export const BaccaratChoices = {
    player: "player",
    banker: "banker",
    tie: "tie",
    anyPair: "anyPair",
};

export const mainChoices = [BaccaratChoices.player, BaccaratChoices.banker];
export const sideChoices = [BaccaratChoices.tie, BaccaratChoices.anyPair];

// Statistic bar colors (matches SCSS variables)
export const BaccaratStatisticColors = {
    player: "#1E5AEF", // Blue for player
    banker: "#D5102B", // Red for banker
    tie: "#10B981", // Green for tie
};

// Percentage ring colors
export const BaccaratBetOptionsPercentageColor = {
    player: "#84C6FF",
    banker: "#FF9090",
    tie: "#90FFB0",
    anyPair: "#FFD700",
};

// Card suit mapping
export const CardSuitMapper = {
    0: "♠", // Spades
    1: "♥", // Hearts
    2: "♦", // Diamonds
    3: "♣", // Clubs
};

// Card rank mapping
export const CardRankMapper = {
    1: "A",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "J",
    12: "Q",
    13: "K",
};

export const BetChoiceImagesData: Record<string, { src: string; blur: string }> = {
    player: {
        src: `${basePath}/static/images/baccarat-multiplayer/2x/bg-player.webp?v=${buildVersion}`,
        blur: ``,
    },
    banker: {
        src: `${basePath}/static/images/baccarat-multiplayer/2x/bg-banker.webp?v=${buildVersion}`,
        blur: ``,
    },
    tie: {
        src: `${basePath}/static/images/baccarat-multiplayer/2x/bg-tie.webp?v=${buildVersion}`,
        blur: "",
    },
    anyPair: {
        src: `${basePath}/static/images/baccarat-multiplayer/2x/bg-anypair.webp?v=${buildVersion}`,
        blur: "",
    },
};

export type BaccaratSettlementResult = {
    player: boolean;
    banker: boolean;
    tie: boolean;
    anyPair: boolean;
    playerPair?: boolean;
    bankerPair?: boolean;
    natural?: boolean;
    isBlink?: boolean;
};

export type BaccaratResult = {
    player: {
        card1: { rank: number; suit: number } | null;
        card2: { rank: number; suit: number } | null;
        card3: { rank: number; suit: number } | null;
        score: number;
    };
    banker: {
        card1: { rank: number; suit: number } | null;
        card2: { rank: number; suit: number } | null;
        card3: { rank: number; suit: number } | null;
        score: number;
    };
};

export type BaccaratWinner = "player" | "banker" | "tie";

export const Winner = {
    PLAYER: "player",
    BANKER: "banker",
    TIE: "tie",
    ANY_PAIR: "anyPair",
} as const;
