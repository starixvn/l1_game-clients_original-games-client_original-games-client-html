import { getAppSettings } from "../app-settings";

export const AppTypes = {
    CLUB: 1,
    DIRECT: 7,
    ORIGINAL: 10,
};

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
export const appType = getAppSettings().appType;

export const locales = {
    en: "en",
    vi: "vi",
    th: "th",
    id: "id",
    zh_cn: "zh_cn",
    zh_tw: "zh_tw",
    ms_my: "ms_my",
    hi_in: "hi_in",
    bn_bd: "bn_bd",
    ko: "ko",
    pt_br: "pt_br",
    ja: "ja",
    es: "es",
};

export const languageMapper = {
    "en-US": "en",
    "vi-VN": "vi",
    "th-TH": "th",
    "id-ID": "id",
    "zh-CN": "zh_cn",
    "zh-TW": "zh_tw",
    "ms-MY": "ms_my",
    "hi-IN": "hi_in",
    "bn-BD": "bn_bd",
    "ko-KR": "ko",
    "pt-BR": "pt_br",
    "ja-JP": "ja",
    "es-ES": "es",
};

export const LanguageLocaleMapper = {
    en: "en-US",
    vi: "vi-VN",
    th: "th-TH",
    id: "id-ID",
    zh_cn: "zh-CN",
    zh_tw: "zh-TW",
    ms_my: "ms-MY",
    hi_in: "hi-IN",
    bn_bd: "bn-BD",
    ko: "ko-KR",
    pt_br: "pt-BR",
    ja: "ja-JP",
    es: "es-ES",
};

export const languageNameMapper = {
    en: "English",
    vi: "Tiếng Việt",
    th: "ไทย",
    id: "Bahasa Indonesia",
    zh_cn: "简体中文",
    zh_tw: "繁體中文",
    ms_my: "Bahasa Melayu",
    hi_in: "हिन्दी",
    bn_bd: "বাংলা",
    ko: "한국어",
    pt_br: "Português",
    ja: "日本語",
    es: "Español",
};

export const Themes = {
    dark: "dark",
    light: "light",
    numberGame: "number-game",
};

export const sabaNumberName = "Saba.numbers";
export const sabaClubName = "Saba.games";

export const buildVersion = process?.env?.buildVersion || 111;

export const confirmBet = "confirmBet";

export const LobbyGameId = 0;

export const SwiperNoSwiping = "swiper-no-swiping";

export const TimeOutConstants = {
    LoadingSpinner: 3000,
    OverlayMask: 3000,
};
