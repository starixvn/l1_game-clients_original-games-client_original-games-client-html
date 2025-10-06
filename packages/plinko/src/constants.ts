export const GAME_MODES = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
};

export const NUMBER_OF_ROWS = {
    MIN: 8,
    MAX: 16,
};

export const PLINKO_MODE = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
};
export const MULTIPLIER_COLORS = {
    [PLINKO_MODE.LOW]: ["#FFDC48", "#FFCE00", "#FFA700", "#FF8D00", "#FF7400", "#B8590B"],
    [PLINKO_MODE.MEDIUM]: ["#C3BEFF", "#ACA4FF", "#948BFF", "#7D71FF", "#4E3EFF", "#3423EB"],
    [PLINKO_MODE.HIGH]: ["#FFB4B6", "#FF9193", "#FF686C", "#FA3F42", "#DF272A", "#A3080A"],
};