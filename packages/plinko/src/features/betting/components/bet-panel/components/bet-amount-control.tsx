import React, { useMemo } from "react";
import { Label } from "./label";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store/game-store";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";

export const BetAmountControl = ({
    handleBetAmountChange,
    isDisabled,
}: {
    handleBetAmountChange: (amount: number) => void;
    isDisabled: boolean;
}) => {
    const { gameConfigs, userStakeLevel } = useGameStore(
        useShallow((state) => ({
            gameConfigs: state.gameConfigs,
            userStakeLevel: state.userStakeLevel,
        }))
    );
    const maxBet = useMemo(() => {
        if (gameConfigs && userStakeLevel) {
            return Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
        }
        return 0;
    }, [gameConfigs?.maxBet, userStakeLevel]);

    const betAmount = usePlinkoGameStore((state) => state.betAmount);

    const buttonClass = "h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg disabled:opacity-50";

    return (
        <div>
            <Label title="Bet Amount" />
            <div className="relative">
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={betAmount}
                    onChange={(e) => handleBetAmountChange(+e.target.value)}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11 disabled:opacity-50"
                    disabled={isDisabled}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    <button className={buttonClass} onClick={() => handleBetAmountChange(betAmount / 2)} disabled={isDisabled}>
                        1/2
                    </button>
                    <button className={buttonClass} onClick={() => handleBetAmountChange(betAmount * 2)} disabled={isDisabled}>
                        2x
                    </button>
                    <button className={buttonClass} onClick={() => handleBetAmountChange(maxBet)} disabled={isDisabled}>
                        Max
                    </button>
                </div>
            </div>
        </div>
    );
};
