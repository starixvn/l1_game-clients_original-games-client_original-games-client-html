import { useEffect, useMemo, useCallback, memo } from "react";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store/game-store";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import AutoBetGroup from "./auto-mode/auto-bet-group";
import { BetAmountControl, FastModeSelector, GameModeSelector, RowsSelector } from "./form-components";
import { cn } from "@shared";

const BetForm = ({
    isManualTab,
    isDisabled,
    isAutoBet,
    setIsAutoBet,
}: {
    isManualTab: boolean;
    isDisabled: boolean;
    isAutoBet: boolean;
    setIsAutoBet: (isAutoBet: boolean) => void;
}) => {
    const { gameMinBet, gameMaxBet, userStakeLevel } = useGameStore(
        useShallow((state) => ({
            gameMinBet: state.gameConfigs?.minBet ?? 0,
            gameMaxBet: state.gameConfigs?.maxBet ?? 0,
            userStakeLevel: state.userStakeLevel,
        }))
    );
    const { minBet, maxBet } = useMemo(() => {
        if (gameMinBet && gameMaxBet && userStakeLevel) {
            const maxBet = Math.min(userStakeLevel.maxBet, gameMaxBet);
            const minBet = Math.max(userStakeLevel.minBet, gameMinBet);
            return { minBet, maxBet };
        }
        return { minBet: 0, maxBet: 0 };
    }, [gameMinBet, gameMaxBet, userStakeLevel]);
    const { betAmount, setBetAmount, isDroppingBall } = usePlinkoGameStore(
        useShallow((state) => ({
            betAmount: state.betAmount,
            setBetAmount: state.actions.setBetAmount,
            isDroppingBall: state.numberOfDroppingBall > 0,
        }))
    );

    const handleBetAmountChange = useCallback(
        (amount: number) => {
            setBetAmount(amount, minBet, maxBet);
        },
        [minBet, maxBet, betAmount]
    );

    useEffect(() => {
        setBetAmount(betAmount, minBet, maxBet);
    }, [minBet, maxBet]);

    return (
        <div
            className={cn(
                "flex flex-col gap-3 p-3 md:gap-4 md:px-3 md:py-3 lg:max-h-[30.75rem] lg:overflow-y-auto scrollbar-hide-on-idle",
                !isManualTab && "lg:hover:pr-[9px]"
            )}
        >
            <BetAmountControl handleBetAmountChange={handleBetAmountChange} isDisabled={isDisabled} />
            <GameModeSelector isDisabled={isDisabled || isDroppingBall} />
            <RowsSelector isDisabled={isDisabled || isDroppingBall} />
            <FastModeSelector isDisabled={isDisabled || isDroppingBall} />
            {!isManualTab && (
                <AutoBetGroup
                    isDisabled={isDisabled || isDroppingBall}
                    isAutoBet={isAutoBet}
                    setIsAutoBet={setIsAutoBet}
                    handleBetAmountChange={handleBetAmountChange}
                    maxBet={maxBet}
                />
            )}
        </div>
    );
};

export default memo(BetForm);
