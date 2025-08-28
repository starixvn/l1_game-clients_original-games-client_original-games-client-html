import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "../stores/game-store/game-store";
import { RoundState } from "../../components/game-base/type";
import useBettingStore from "../stores/betting-store/betting-store";
import { useRebet } from "./use-rebet";

interface UseAutoRebetReturn {
    isAutoRebetActive: boolean;
    remainingRounds: number;
    startAutoRebet: (rounds: number) => void;
    stopAutoRebet: () => void;
}

export const useAutoRebet = (): UseAutoRebetReturn => {
    const { isAutoRebetActive, setIsAutoRebetActive } = useBettingStore(
        useShallow((state) => ({
            isAutoRebetActive: state.isAutoRebetActive,
            setIsAutoRebetActive: state.actions.setIsAutoRebetActive,
        }))
    );
    const { roundState, endBet } = useGameStore(
        useShallow((state) => ({
            roundState: state.roundState,
            endBet: state.endBet,
        }))
    );
    const { handleClickRebet } = useRebet();
    const [remainingRounds, setRemainingRounds] = useState(0);

    const startAutoRebet = useCallback(
        (rounds: number) => {
            setRemainingRounds(rounds);
            setIsAutoRebetActive(true);
        },
        [setIsAutoRebetActive]
    );

    const stopAutoRebet = useCallback(() => {
        setIsAutoRebetActive(false);
        setRemainingRounds(0);
    }, [setIsAutoRebetActive]);

    const rebet = useCallback(() => {
        if (remainingRounds === 1) {
            handleClickRebet();
            stopAutoRebet();
        }
        let isSuccess = false;
        if (remainingRounds > 1) {
            setRemainingRounds((prev) => prev - 1);
            isSuccess = handleClickRebet();
        } else {
            stopAutoRebet();
        }
        if (!isSuccess) {
            stopAutoRebet();
        }
    }, [remainingRounds, stopAutoRebet, handleClickRebet]);

    useEffect(() => {
        if (!isAutoRebetActive) {
            return;
        }
        if (roundState === RoundState.InRound) {
            rebet();
        }
    }, [roundState, isAutoRebetActive]);

    useEffect(() => {
        if (endBet < 0) {
            stopAutoRebet();
        }
    }, [endBet, stopAutoRebet]);

    return {
        isAutoRebetActive,
        remainingRounds,
        startAutoRebet,
        stopAutoRebet,
    };
};
