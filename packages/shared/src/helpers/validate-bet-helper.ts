import { GameConfigs, RoundState } from "../../components/game-base/type";
import { confirmBet } from "../constants";
import { NoticeErrorCode } from "../constants/error-code-dictionary";
import { GameStateContextModel } from "../react-contexts/game-state-context/game-state-context-model";
import { PlaceBetContextModel } from "../react-contexts/game-state-context/place-bet-context/place-bet-context-model";

export interface IAvailableSuggestBetAmount {
    suggestAmount?: number;
    isInsufficientFunds?: boolean;
    isSuggestBet?: boolean;
    errorCode?: string;
    args?: object;
    maxBetPerChoice?: number;
    mode: SuggestBetMode;
}

enum SuggestBetMode {
    ReachMaxBet = "ReachMaxBet",
    SuggestBet = "SuggestBet",
    MinBet = "MinBet",
    MaxBetRound = "MaxBetRound",
}

interface SuggestBetOptions {
    suggestAmount: number;
    isInsufficientFunds: boolean;
    isOptionReachMaxBet: boolean;
    isMaxBetRound: boolean;
    maxBetPerChoice: number;
    roundMaxBet: number;
    roundMinBet: number;
    currentAmountOfChoice: number;
}

export const validateHedgeBet = (hedgeBetGroup: string[], ownBets: object, betChoice: string, amount: number): boolean => {
    const betTracks = { ...ownBets };
    betTracks[betChoice] = (betTracks[betChoice] ?? 0) + amount;

    return (
        hedgeBetGroup &&
        Object.keys(betTracks).some(
            (betKey) => betTracks[betKey] && hedgeBetGroup.includes(betKey) && hedgeBetGroup.includes(betChoice) && betKey !== betChoice
        )
    );
};

export const getRoundMinBet = (gameConfigs: GameConfigs, userMinBet: number): number => {
    return Math.max(userMinBet, gameConfigs.minBet);
};

export const getRoundMaxBet = (gameConfigs: GameConfigs, userMaxBet: number): number => {
    return Math.min(userMaxBet, gameConfigs.maxBet);
};

export const getMaxBetPerChoice = (gameConfigs: GameConfigs, betChoice: string): number => {
    return gameConfigs.maxBetPerChoices[betChoice] || Infinity;
};

export const getCurrentAmountOfChoice = (ownBets: object, notConfirmOwnBets: object, betChoice: string): number => {
    return (ownBets[betChoice] || 0) + (notConfirmOwnBets[betChoice] || 0);
};

export const isInsufficientFunds = (
    amount: number,
    accountBalance: number,
    totalBetNotConfirmAmount: number,
    enabledQuickBet: boolean
): boolean => {
    if (enabledQuickBet) {
        return amount > accountBalance;
    }

    return totalBetNotConfirmAmount + amount > accountBalance;
};

export const isOptionReachMaxBet = (currentTotalAmountOfChoice: number, maxBetPerChoice: number): boolean => {
    return currentTotalAmountOfChoice > maxBetPerChoice;
};

export const isMinBet = (amount: number, roundMinBet: number, suggestAmount: number): boolean => {
    if (suggestAmount > 0) {
        return suggestAmount < roundMinBet;
    }
    return amount > 0 && amount < roundMinBet;
};

export const isMaxBetRound = (amount: number, roundMaxBet: number, totalBetAmount: number): boolean => {
    return amount + totalBetAmount > roundMaxBet || totalBetAmount > roundMaxBet;
};

export const isInPhasePreventBet = (roundState: RoundState): boolean => {
    return roundState !== RoundState.InRound;
};

export const isBalanceUnavailable = (
    availableBalance: number,
    amount: number,
    gameStateContext: GameStateContextModel,
    notConfirmOwnBets: object,
    enabledQuickBet: boolean
): boolean => {
    if (enabledQuickBet && availableBalance === 0) {
        return true;
    }

    const { gameConfigs, userStakeLevel } = gameStateContext;
    const minBet = getRoundMinBet(gameConfigs, userStakeLevel?.minBet || 0) ?? 0;
    const totalBetAmount = getTotalNotConfirmBet(notConfirmOwnBets);
    return amount > 0 && (availableBalance - totalBetAmount === 0 || availableBalance < minBet);
};

export const isHedgeBet = (hedgeBetGroups: string[], betChoice: string, amount: number, ownBets: object): boolean => {
    return validateHedgeBet(hedgeBetGroups, ownBets, betChoice, amount);
};

export const findHedgeBetGroup = (hedgeBetGroups: string[][], betChoice: string): string[] => {
    return hedgeBetGroups?.find((group) => group.includes(betChoice)) ?? [];
};

export const getAccountBalance = (balance: number): number => {
    return Math.trunc(balance || 0);
};

export const getMaxAvailableAmountOfChoice = (
    maxBetPerChoice: number,
    currentAmountOfChoice: number,
    roundMaxBet: number,
    totalBetNotConfirmAmount: number,
    totalBeAmount: number,
    accountBalance: number,
    enabledQuickBet: boolean
): number => {
    if (totalBeAmount === roundMaxBet) {
        return 0;
    }

    if (totalBetNotConfirmAmount > accountBalance) {
        return 0;
    }

    let remainAmount = maxBetPerChoice - currentAmountOfChoice;
    if (remainAmount + totalBeAmount >= roundMaxBet) {
        remainAmount = roundMaxBet - totalBeAmount;
    }
    if (!enabledQuickBet && totalBetNotConfirmAmount + remainAmount > accountBalance) {
        remainAmount = accountBalance - totalBetNotConfirmAmount;
    }
    return remainAmount > 0 ? remainAmount : 0;
};

export const getCriteriaValidateBet = (
    gameStateContext: GameStateContextModel,
    placeBetContext: PlaceBetContextModel,
    betChoice: string,
    amount: number,
    accountBalance: number,
    enabledQuickBet: boolean
): { errorCode: string; args?: object } => {
    if (betChoice !== confirmBet) {
        const criteria = composeValidationCriteria(amount, accountBalance, gameStateContext, placeBetContext, betChoice, enabledQuickBet);

        if (criteria?.suggestAmount > 0 && criteria?.isSuggestBet) {
            return { errorCode: NoticeErrorCode.suggestBet, args: criteria };
        }

        if (criteria?.errorCode) {
            return { errorCode: criteria?.errorCode, args: criteria?.args };
        }
    }

    return { errorCode: NoticeErrorCode.validBet };
};

const composeValidationCriteria = (
    amount: number,
    accountBalance: number,
    context: GameStateContextModel,
    placeBetContext: PlaceBetContextModel,
    betChoice: string,
    enabledQuickBet: boolean
): IAvailableSuggestBetAmount => {
    const { gameConfigs, userStakeLevel } = context;
    const { notConfirmOwnBets, ownBets } = placeBetContext;
    const { minBet: userMinBet, maxBet: userMaxBet } = userStakeLevel;
    const totalBetNotConfirmAmount = getTotalNotConfirmBet(notConfirmOwnBets);
    const totalBeAmount = getTotalBetAmount(placeBetContext);

    const roundMaxBet = getRoundMaxBet(gameConfigs, userMaxBet);
    const maxBetPerChoice = getMaxBetPerChoice(gameConfigs, betChoice);
    const currentAmountOfChoice = getCurrentAmountOfChoice(ownBets, notConfirmOwnBets, betChoice);
    const maxAvailableAmountOfChoice = getMaxAvailableAmountOfChoice(
        maxBetPerChoice,
        currentAmountOfChoice,
        roundMaxBet,
        totalBetNotConfirmAmount,
        totalBeAmount,
        accountBalance,
        enabledQuickBet
    );
    const suggestAmount = Math.min(accountBalance, maxAvailableAmountOfChoice);

    return determineBetMode({
        suggestAmount,
        isInsufficientFunds: isInsufficientFunds(amount, accountBalance, totalBetNotConfirmAmount, enabledQuickBet),
        isOptionReachMaxBet: isOptionReachMaxBet(currentAmountOfChoice + amount, maxBetPerChoice),
        isMaxBetRound: isMaxBetRound(amount, roundMaxBet, totalBeAmount),
        maxBetPerChoice,
        roundMaxBet,
        roundMinBet: getRoundMinBet(gameConfigs, userMinBet),
        currentAmountOfChoice,
    });
};

const determineBetMode = ({
    suggestAmount,
    isInsufficientFunds,
    isOptionReachMaxBet,
    isMaxBetRound,
    maxBetPerChoice,
    roundMaxBet,
    roundMinBet,
    currentAmountOfChoice,
}: SuggestBetOptions): IAvailableSuggestBetAmount => {
    if (suggestAmount === 0) {
        if (isMaxBetRound) {
            return getMaxBetRoundMode(roundMaxBet, maxBetPerChoice);
        }
        if (isOptionReachMaxBet) {
            return getReachMaxBetMode(maxBetPerChoice);
        }
    }

    const isSuggestBet = isSuggestBetAvailable(
        suggestAmount,
        currentAmountOfChoice,
        roundMinBet,
        roundMaxBet,
        isInsufficientFunds,
        isOptionReachMaxBet,
        isMaxBetRound
    );

    return {
        suggestAmount,
        isInsufficientFunds,
        isSuggestBet,
        mode: SuggestBetMode.SuggestBet,
    };
};

const getReachMaxBetMode = (maxBetPerChoice: number): IAvailableSuggestBetAmount => {
    return {
        mode: SuggestBetMode.ReachMaxBet,
        errorCode: NoticeErrorCode.optionMaxBet,
        args: { maxBet: maxBetPerChoice },
    };
};

const getMaxBetRoundMode = (roundMaxBet: number, maxBetPerChoice: number): IAvailableSuggestBetAmount => {
    return {
        mode: SuggestBetMode.MaxBetRound,
        maxBetPerChoice,
        errorCode: NoticeErrorCode.drawMaxBet,
        args: { maxBet: roundMaxBet },
    };
};

const isSuggestBetAvailable = (
    suggestAmount: number,
    currentAmountOfChoice: number,
    roundMinBet: number,
    roundMaxBet: number,
    isInsufficientFunds: boolean,
    isOptionReachMaxBet: boolean,
    isMaxBetRoundResult: boolean
): boolean => {
    return (
        (suggestAmount + currentAmountOfChoice >= roundMinBet || suggestAmount + currentAmountOfChoice <= roundMaxBet) &&
        (isInsufficientFunds || isOptionReachMaxBet || isMaxBetRoundResult)
    );
};

export const getTotalNotConfirmBet = (notConfirmOwnBets: object): number => {
    return Object.values(notConfirmOwnBets).reduce((a, b) => a + b, 0);
};

export const getTotalBetAmount = (placeBetContext: PlaceBetContextModel): number => {
    return (
        Object.values(placeBetContext.notConfirmOwnBets).reduce((a, b) => a + b, 0) +
        Object.values(placeBetContext.ownBets).reduce((a, b) => a + b, 0)
    );
};
