import { BetAmountControl } from "./components/bet-amount-control";
import { GameModeSelector } from "./components/game-mode-selector";
import { RowsSelector } from "./components/rows-selector";
import AutoBetControl from "./auto-bet-control";
import { useGameStore } from "@shared/stores/game-store/game-store";
import { useShallow } from "zustand/shallow";
import { useEffect, useMemo } from "react";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { useCallback } from "react";

export const BetControls = ({
    isManualTab,
    numberOfBets,
    setNumberOfBets,
    isDisabled,
}: {
    isManualTab: boolean;
    numberOfBets: number;
    isDisabled: boolean;
    setNumberOfBets: (numberOfBets: number) => void;
}) => {
    const { gameConfigs, userStakeLevel } = useGameStore(
        useShallow((state) => ({
            gameConfigs: state.gameConfigs,
            userStakeLevel: state.userStakeLevel,
        }))
    );
    const { minBet, maxBet } = useMemo(() => {
        if (gameConfigs && userStakeLevel) {
            const maxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
            const minBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);
            return { minBet, maxBet };
        }
        return { minBet: 0, maxBet: 0 };
    }, [gameConfigs?.maxBet, gameConfigs?.minBet, userStakeLevel]);
    const { betAmount, setBetAmount } = usePlinkoGameStore(
        useShallow((state) => ({
            betAmount: state.betAmount,
            setBetAmount: state.actions.setBetAmount,
        }))
    );

    const handleBetAmountChange = useCallback(
        (amount: number) => {
            setBetAmount(amount, minBet, maxBet);
        },
        [minBet, maxBet]
    );

    useEffect(() => {
        setBetAmount(betAmount, minBet, maxBet);
    }, [minBet, maxBet]);

    return (
        <div className="flex flex-col gap-3 p-4 md:p-0">
            <BetAmountControl handleBetAmountChange={handleBetAmountChange} isDisabled={isDisabled} />
            <GameModeSelector isDisabled={isDisabled} />
            <RowsSelector isDisabled={isDisabled} />

            {!isManualTab && <AutoBetControl numberOfBets={numberOfBets} isDisabled={isDisabled} setNumberOfBets={setNumberOfBets} />}
        </div>
    );
};
