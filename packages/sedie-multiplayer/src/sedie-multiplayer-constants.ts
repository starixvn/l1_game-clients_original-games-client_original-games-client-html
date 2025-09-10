import { buildVersion } from "@shared/constants";

export const SeDieBetOptions = {
    ODD: "odd",
    EVEN: "even",
    RED2: "red2",
    RED3: "red3",
    RED4: "red4",
    WHITE3: "white3",
    WHITE4: "white4",
};

export const SeDieChoices = {
    odd: "odd",
    even: "even",
    red4: "red4",
    red3: "red3",
    red2: "red2",
    white4: "white4",
    white3: "white3",
};

export const mainChoices = [SeDieChoices.even, SeDieChoices.odd];
export const topChoices = [SeDieChoices.red4, SeDieChoices.red3, SeDieChoices.red2];
export const bottomChoices = [SeDieChoices.white4, SeDieChoices.white3];

// Statistic bar colors (matches SCSS variables)
export const SeDieStatisticColors = {
    even: "#1E5AEF", // Blue for even (left side)
    odd: "#D5102B", // Red for odd (right side)
};

// Percentage ring colors
export const SeDieBetOptionsPercentageColor = {
    odd: "#84C6FF",
    even: "#FF9090",
};

// Dot and background mapping for sedie-multiplayer
export const DotColorMapper: Record<string, boolean[]> = {
    red3: [true, true, true, false],
    red4: [true, true, true, true],
    blue3: [true, false, false, false],
    blue4: [false, false, false, false],
    red2: [true, true, false, false],
};

export const BetChoiceImagesData: Record<string, { src: string; blur: string }> = {
    odd: {
        src: `/static/images/sedie-multiplayer/2x/bg-odd.webp?v=${buildVersion}`,
        blur: ``,
    },
    even: {
        src: `/static/images/sedie-multiplayer/2x/bg-even.webp?v=${buildVersion}`,
        blur: ``,
    },
    blue3: {
        src: `/static/images/sedie-multiplayer/2x/bg-blue3.webp?v=${buildVersion}`,
        blur: "",
    },
    red2: {
        src: `/static/images/sedie-multiplayer/2x/bg-red2.webp?v=${buildVersion}`,
        blur: "",
    },
    red4: {
        src: `/static/images/sedie-multiplayer/2x/bg-red4.webp?v=${buildVersion}`,
        blur: "",
    },
};

export const ChoiceSeDieIconMapper: Record<string, boolean[]> = {
    red4: [true, true, true, true],
    red2: [true, true, false, false],
    white4: [false, false, false, false],
    red3: [true, true, true, false],
    white3: [true, false, false, false],
};

export type SeDieSettlementResult = {
    odd: boolean;
    even: boolean;
    red2: boolean;
    red3: boolean;
    red4: boolean;
    white3: boolean;
    white4: boolean;
};

export type SeDieResult = {
    red1: boolean;
    red2: boolean;
    red3: boolean;
    red4: boolean;
};

export type Odd = {};
