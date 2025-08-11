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

export const mainChoices = [SeDieChoices.odd, SeDieChoices.even];
export const topChoices = [SeDieChoices.red4, SeDieChoices.red3, SeDieChoices.red2];
export const bottomChoices = [SeDieChoices.white4, SeDieChoices.white3];

// Keep percentage ring colors consistent with se-ball
export const SeDieBetOptionsPercentageColor = {
    odd: "#84C6FF",
    even: "#FF9090",
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
    balls: number[];
    drawId: number;
    time: string;
    winningChoice?: string;
};

export type Odd = {};
