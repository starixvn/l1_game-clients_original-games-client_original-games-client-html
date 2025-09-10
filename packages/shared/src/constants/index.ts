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
    roundId: number;
    result: any;
    settlementResult: any;
}

export const systemName = getAppSettings().system.toLocaleLowerCase();

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
