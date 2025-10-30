export const suffixNameMapping = ["heart", "diamond", "club", "spade"];
export const colorNumberSuffix = ["text-red", "text-red", "text-black", "text-black"];

export const convertRank = (num: number): string => {
    num++;
    const dict = {
        11: "J",
        12: "Q",
        13: "K",
        1: "A",
    };
    return dict[num] || num.toString();
};

export const convertCardRankToIndex = (rank: string): number => {
    const dict = {
        J: 11,
        Q: 12,
        K: 13,
        A: 1,
    };

    return dict[rank] ?? parseInt(rank);
};

export const getClassFollowCondition = ({ viewMode = "", isSmall }: { viewMode?: string; isSmall: boolean }) => {
    return isSmall ? "small" : "";
};
