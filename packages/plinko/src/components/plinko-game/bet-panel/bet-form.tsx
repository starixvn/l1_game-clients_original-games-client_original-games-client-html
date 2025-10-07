import { useEffect, useMemo, useCallback, memo } from "react";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store/game-store";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import AutoBetGroup from "./auto-mode/auto-bet-group";
import { BetAmountControl, GameModeSelector, RowsSelector } from "./form-components";

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
        <div className="flex flex-col gap-3 p-3 md:gap-4 md:px-0 md:py-3 md:h-[34.5rem] md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <BetAmountControl handleBetAmountChange={handleBetAmountChange} isDisabled={isDisabled} />
            <GameModeSelector isDisabled={isDisabled} />
            <RowsSelector isDisabled={isDisabled} />

            {!isManualTab && (
                <AutoBetGroup
                    isDisabled={isDisabled}
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
