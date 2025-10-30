import { useShallow } from "zustand/shallow";
import useBettingStore from "../stores/betting-store/betting-store";
import { useGameStore } from "../stores/game-store/game-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { RoundState } from '@shared/components/game-base/type';
import { useClientSeedPF } from "./use-client-seed-pf";
import { NoticeErrorCode } from "../constants/error-code-dictionary";
import { broadcastNotice, getNotice } from "../helpers";
import { useBalance } from "./use-balance";

interface UseRebetReturn {
    isEnabled: boolean;
    handleClickRebet: () => boolean;
}

const RETRY_INTERVAL_MS = 3000;

export const useRebet = (isDoubleBet = false): UseRebetReturn => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [hasPlacedPreviousBet, setHasPlacedPreviousBet] = useState(true);
    const { clientSeed } = useClientSeedPF();
    const { sendSocketEvent, roundState, endBet } = useGameStore(
        useShallow((state) => ({
            sendSocketEvent: state.sendSocketEvent,
            roundState: state.roundState,
            endBet: state.endBet,
        }))
    );
    const ownBets = useBettingStore((state) => state.ownBets);
    const balance = useBalance();
    const retryIntervalRef = useRef<NodeJS.Timeout>();

    const clearRetryInterval = useCallback(() => {
        if (retryIntervalRef.current) {
            clearInterval(retryIntervalRef.current);
            retryIntervalRef.current = undefined;
        }
    }, []);

    const startRetryInterval = useCallback(() => {
        clearRetryInterval();
        retryIntervalRef.current = setInterval(() => {
            sendSocketEvent("retry", {});
        }, RETRY_INTERVAL_MS);
    }, [clearRetryInterval, sendSocketEvent]);

    const calculateBetChoices: () => Record<string, number> = useCallback(() => {
        if (!isDoubleBet) {
            return ownBets;
        }
        return Object.keys(ownBets).reduce(
            (accumulator, betChoice) => ({
                ...accumulator,
                [betChoice]: ownBets[betChoice] * 2,
            }),
            {}
        );
    }, [ownBets, isDoubleBet]);

    const isEnoughBalance = useCallback(() => {
        const totalAmount = Object.values(calculateBetChoices()).reduce((acc, bet) => acc + bet, 0);
        return balance >= totalAmount;
    }, [calculateBetChoices, balance]);

    const disable = useCallback(() => {
        setHasPlacedPreviousBet(false);
        setIsEnabled(false);
    }, []);

    const handleClickRebet = useCallback(() => {
        if (!isEnoughBalance()) {
            broadcastNotice(getNotice(NoticeErrorCode.notEnoughMoney, false));
            return false;
        }
        startRetryInterval();
        const betChoices = calculateBetChoices();
        sendSocketEvent("rebet", { betChoices, clientSeed });
        return true;
    }, [startRetryInterval, calculateBetChoices, sendSocketEvent, clientSeed, isEnoughBalance, disable]);

    useEffect(() => {
        clearRetryInterval();
        disable();
        return clearRetryInterval;
    }, [endBet, ownBets, clearRetryInterval, disable]);

    useEffect(() => {
        if (roundState !== RoundState.InRound) {
            clearRetryInterval();
        }
    }, [roundState, clearRetryInterval]);

    useEffect(() => {
        const hasBets = Object.keys(ownBets).length > 0;
        if (roundState === RoundState.InRound) {
            if (hasPlacedPreviousBet && hasBets) {
                setIsEnabled(true);
            }
        }

        if (roundState === RoundState.DisplayResult) {
            hasBets && setHasPlacedPreviousBet(true);
        }
    }, [roundState, hasPlacedPreviousBet]);

    return { isEnabled, handleClickRebet };
};
