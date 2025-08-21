import { useShallow } from "zustand/shallow";
import useBettingStore from "../stores/betting-store/betting-store";
import { useGameStore } from "../stores/game-store/game-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { RoundState } from "../../components/game-base/type";
import { useClientSeedPF } from "./use-client-seed-pf";

interface UseRebetReturn {
    isEnabled: boolean;
    handleClickRebet: () => void;
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

    const calculateBetChoices = useCallback(() => {
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

    const disable = useCallback(() => {
        setHasPlacedPreviousBet(false);
        setIsEnabled(false);
    }, []);

    const handleClickRebet = useCallback(() => {
        startRetryInterval();
        const betChoices = calculateBetChoices();
        sendSocketEvent("rebet", { betChoices, clientSeed });
    }, [startRetryInterval, calculateBetChoices, sendSocketEvent, clientSeed]);

    // Clear retry timer when bets change or component unmounts
    useEffect(() => {
        clearRetryInterval();
        disable();
        return clearRetryInterval;
    }, [endBet, ownBets, clearRetryInterval, disable]);

    // Clear retry timer when not in active round
    useEffect(() => {
        if (roundState !== RoundState.InRound) {
            clearRetryInterval();
        }
    }, [roundState, clearRetryInterval]);

    // Manage rebet enabled state based on round state and previous bets
    useEffect(() => {
        const hasBets = Object.keys(ownBets).length > 0;

        if (roundState === RoundState.InRound) {
            if (hasPlacedPreviousBet && hasBets) {
                setIsEnabled(true);
            }
        } else {
            setIsEnabled(false);
        }

        if (roundState === RoundState.DisplayResult) {
            hasBets && setHasPlacedPreviousBet(true);
        }
    }, [roundState, hasPlacedPreviousBet]);

    return { isEnabled, handleClickRebet };
};
