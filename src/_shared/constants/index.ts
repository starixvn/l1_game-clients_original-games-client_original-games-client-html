import { getAppSettings } from "../app-settings";

export interface BetOptionData {
    betChoice: string;
    odds: number;
    totalStakes?: number;
    players?: number;
    percent?: number;
}

export interface RoundResultData {
    betChoiceShort: string;
    color: string;
    count: number;
}

export interface Round {
    drawId: number;
    result: any;
    settlementResult: any;
}

export const systemName = getAppSettings().system.toLocaleLowerCase();

export const ChipMapper = {
    gn: {
        "1": "chip-1",
        "2": "chip-2",
        "5": "chip-5",
        "10": "chip-10",
        "20": "chip-20",
        "50": "chip-50",
        "100": "chip-100",
        "200": "chip-200",
        "500": "chip-500",
        "1000": "chip-1000",
        "2000": "chip-2000",
        "4000": "chip-4000",
        "5000": "chip-5000",
        "10000": "chip-10000",
        "20000": "chip-20000",
        "40000": "chip-40000",
        "50000": "chip-50000",
        "100000": "chip-100000",
        "200000": "chip-200000",
    },
    vg: {
        "1": "chip-1",
        "2": "chip-2",
        "5": "chip-5",
        "10": "chip-10",
        "20": "chip-20",
        "50": "chip-50",
        "100": "chip-100",
        "200": "chip-200",
        "500": "chip-500",
        "1000": "chip-1000",
        "2000": "chip-2000",
        "4000": "chip-4000",
        "5000": "chip-5000",
        "10000": "chip-10000",
        "20000": "chip-20000",
        "40000": "chip-40000",
        "50000": "chip-50000",
        "100000": "chip-100000",
        "200000": "chip-200000",
    },
};

export const ChipLabelMapper = {
    gn: {
        1: "1",
        2: "2",
        5: "5",
        10: "10",
        20: "20",
        50: "50",
        100: "100",
        200: "200",
        500: "500",
        1000: "1k",
        2000: "2k",
        4000: "4k",
        5000: "5k",
        10000: "10k",
        20000: "20k",
        40000: "40k",
        50000: "50k",
        100000: "100k",
        200000: "200k",
    },
    vg: {
        1: "1",
        2: "2",
        5: "5",
        10: "10",
        20: "20",
        50: "50",
        100: "100",
        200: "200",
        500: "500",
        1000: "1k",
        2000: "2k",
        4000: "4k",
        5000: "5k",
        10000: "10k",
        20000: "20k",
        40000: "40k",
        50000: "50k",
        100000: "100k",
        200000: "200k",
    },
};

const ChipValues = {
    gn: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 40000, 50000, 100000, 200000],
    vg: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 40000, 50000, 100000, 200000],
};

export const ChipValuesBySystem = ChipValues[systemName];

export const locales = { en: "en", vi: "vi", th: "th", id: "id", zh_cn: "zh_cn", zh_tw: "zh_tw", ja: "ja" };

export const languageMapper = {
    "en-US": "en",
    "vi-VN": "vi",
    "th-TH": "th",
    "id-ID": "id",
    "zh-CN": "zh_cn",
    "zh-TW": "zh_tw",
    "ja-JP": "ja",
};

export const LanguageLocaleMapper = {
    en: "en-US",
    vi: "vi-VN",
    th: "th-TH",
    id: "id-ID",
    zh_cn: "zh-CN",
    zh_tw: "zh-TW",
    ja: "ja-JP",
};

export const languageNameMapper = { en: "English", vi: "Tiếng Việt" };

export const Themes = {
    dark: "dark",
    light: "light",
    numberGame: "number-game",
};

export const sabaNumberName = "Saba.numbers";
export const sabaClubName = "Saba.games";

export const buildVersion = process?.env?.buildVersion || 111;
export const AppTypes = {
    mobile: 1,
};

export const confirmBet = "confirmBet";

export const GameIds = {
    SeDieMultiplayer: 148,
};

export const LobbyGameId = 0;

export const SwiperNoSwiping = "swiper-no-swiping";

export const TimeOutConstants = {
    LoadingSpinner: 3000,
    OverlayMask: 3000,
};

// Available GN chip color assets (hex without '#'), used as fallback for VG
export const GN_CHIP_COLOR_HEXES = [
    "02268a",
    "058852",
    "1a919e",
    "222222",
    "243f67",
    "285ca0",
    "33496b",
    "359313",
    "613662",
    "6e60b7",
    "6f9296",
    "734343",
    "844cbc",
    "885f7a",
    "90361a",
    "97b22c",
    "9a2b85",
    "a12323",
    "b03166",
    "b17443",
    "b1b1b1",
    "be833b",
    "bf3175",
];

function normalizeHex(color?: string): string {
    if (!color) {
        return "";
    }
    const hex = color.trim().toLowerCase();
    return hex.startsWith("#") ? hex.substring(1) : hex;
}

function hashStringToIndex(input: string, modulo: number): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return modulo > 0 ? hash % modulo : 0;
}

// Resolve a chip color hex to an existing asset filename (hex without '#')
export function resolveChipColorHex(requestedColorHex?: string): string {
    const hex = normalizeHex(requestedColorHex);
    if (GN_CHIP_COLOR_HEXES.includes(hex)) {
        return hex;
    }
    // Stable pseudo-random fallback into GN palette
    return GN_CHIP_COLOR_HEXES[hashStringToIndex(hex || "default", GN_CHIP_COLOR_HEXES.length)] || "b1b1b1";
}
