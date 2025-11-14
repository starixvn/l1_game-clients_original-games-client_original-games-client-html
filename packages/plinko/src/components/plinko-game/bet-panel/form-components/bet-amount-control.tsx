import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store/game-store";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import Label from "./label";
import { useClickOutside, useClickSound, useCommonTranslate } from "@shared/react-hooks";

const BetAmountControl = ({
    handleBetAmountChange,
    isDisabled,
}: {
    handleBetAmountChange: (amount: number) => void;
    isDisabled: boolean;
}) => {
    const [isShowPopOver, setIsShowPopOver] = useState(false);
    const popOverRef = useRef<HTMLDivElement>(null);
    useClickOutside([popOverRef], () => setIsShowPopOver(false));
    const clickSound = useClickSound();
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
    const { t } = useCommonTranslate();

    useEffect(() => {
        minBet && setTimeout(() => handleBetAmountChange(minBet), 0);
    }, [minBet]);

    useEffect(() => {
        setAmount(betAmount);
    }, [betAmount]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.abs(+e.target.value || 0);
        const maxValue = 999999999;
        setAmount(Math.min(value, maxValue));
    };

    return (
        <div>
            <div className="flex items-center gap-2">
                <Label title={t("bet_amount")} />
                <div>
                    <i className="icon-circle-info text-lg cursor-pointer pb-[5px]" onClick={() => setIsShowPopOver(true)} />

                    {isShowPopOver && (
                        <div
                            ref={popOverRef}
                            className={`absolute -translate-y-[200%] -translate-x-[calc(50%-40px)] bg-[#2993f5] text-white text-sm px-4 py-2 rounded-lg pointer-events-none flex flex-col gap-1 z-10`}
                        >
                            <div
                                className={`absolute -bottom-[6px] left-[calc(35%+10px)] -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#2993f5]`}
                            ></div>
                            {t("pop_over_demo_mode")}
                        </div>
                    )}
                </div>
            </div>
            <div className="relative">
                <input
                    type="number"
                    step={0.01}
                    value={amount?.toString() || "0"}
                    onChange={onChange}
                    onBlur={() => {
                        handleBetAmountChange(+amount);
                        setAmount(betAmount);
                    }}
                    className="input text-white text-sm rounded-lg pl-3 pr-[10.5rem] input-focus w-full h-11 disabled:opacity-50"
                    disabled={isDisabled}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                        className={buttonClass}
                        onClick={() => {
                            clickSound();
                            handleBetAmountChange(+amount / 2);
                        }}
                        disabled={isDisabled}
                    >
                        1/2
                    </button>
                    <button
                        className={buttonClass}
                        onClick={() => {
                            clickSound();
                            handleBetAmountChange(+amount * 2);
                        }}
                        disabled={isDisabled}
                    >
                        2x
                    </button>
                    <button
                        className={buttonClass}
                        onClick={() => {
                            clickSound();
                            handleBetAmountChange(maxBet);
                        }}
                        disabled={isDisabled}
                    >
                        {t("max")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(BetAmountControl);
