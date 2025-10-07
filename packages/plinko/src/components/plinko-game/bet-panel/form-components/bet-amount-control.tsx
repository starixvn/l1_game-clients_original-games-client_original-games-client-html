import React, { memo, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store/game-store";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import Label from "./label";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "@shared/resources";

const BetAmountControl = ({
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
    const { minBet, maxBet } = useMemo(() => {
        if (gameConfigs && userStakeLevel) {
            const minBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);
            const maxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);

            return { minBet, maxBet };
        }
        return { minBet: 0, maxBet: 0 };
    }, [gameConfigs?.maxBet, gameConfigs?.minBet, userStakeLevel]);
    const betAmount = usePlinkoGameStore((state) => state.betAmount);
    const [amount, setAmount] = useState<number | string>(minBet);
    const buttonClass =
        "h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg disabled:opacity-50 hover:scale-105 transition-all duration-200";
    const { t } = useTranslate(ResourceTypes.COMMON);

    useEffect(() => {
        setAmount(betAmount);
    }, [betAmount]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.abs(+e.target.value);
        const maxValue = 999999999;
        setAmount(Math.min(value, maxValue));
    };

    return (
        <div>
            <Label title={t("bet_amount")} />
            <div className="relative">
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={amount}
                    onChange={onChange}
                    onBlur={() => {
                        handleBetAmountChange(amount ? +amount : minBet);
                        setAmount(betAmount);
                    }}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11 disabled:opacity-50"
                    disabled={isDisabled}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    <button className={buttonClass} onClick={() => handleBetAmountChange(+amount / 2)} disabled={isDisabled}>
                        1/2
                    </button>
                    <button className={buttonClass} onClick={() => handleBetAmountChange(+amount * 2)} disabled={isDisabled}>
                        2x
                    </button>
                    <button className={buttonClass} onClick={() => handleBetAmountChange(maxBet)} disabled={isDisabled}>
                        {t("max")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(BetAmountControl);
