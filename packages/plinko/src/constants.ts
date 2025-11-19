import { buildLocalStorageKey } from "@shared/helpers";
import { getCurrentGameMultipliers } from "./game-config";

export const GAME_MODES = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
    LIGHTNING: 3,
};

export const GAME_MODE_MAP = {
    [GAME_MODES.LOW]: "mode_low",
    [GAME_MODES.MEDIUM]: "mode_medium",
    [GAME_MODES.HIGH]: "mode_high",
    [GAME_MODES.LIGHTNING]: "lightning",
};

export const NUMBER_OF_ROWS = {
    MIN: 8,
    MAX: 16,
    DEFAULT: 12,
};

export const PLINKO_MODE = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
};

// Dynamic multiplier colors based on current game
export const MULTIPLIER_COLORS = {
    [PLINKO_MODE.LOW]: () => getCurrentGameMultipliers().LOW.colors,
    [PLINKO_MODE.MEDIUM]: () => getCurrentGameMultipliers().MEDIUM.colors,
    [PLINKO_MODE.HIGH]: () => getCurrentGameMultipliers().HIGH.colors,
};

// For backward compatibility, provide static access to multiplier colors
// This will throw an error if called before game config is initialized
export function getMultiplierColors(mode: number): string[] {
    return MULTIPLIER_COLORS[mode]();
}

export const PLINKO_STORAGE_KEYS = {
    NUMBER_OF_BETS: buildLocalStorageKey("numberOfBets"),
};

export const PLINKO_GAME_IDS = {
    PLINKO: 145,
    PLINKO_X: 159,
};

export const MESSAGE_EVENT_TYPE = {
    LIGHTNING_CONFIG: "lightningConfig",
};
