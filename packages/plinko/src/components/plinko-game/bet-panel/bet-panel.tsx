import React, { memo, useCallback, useEffect, useState, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { useGameStore } from "@shared/stores/game-store";
import { useClientSeedPF, useCommonTranslate, useHotKey } from "@shared/react-hooks";
import { useGameContext } from "@shared/react-contexts";
import { messageEventType } from "@shared/components/game-base/handlers/game-message-handler";
import TabNavigation from "./tab-navigation";
import BetForm from "./bet-form";

const BetControl = () => {
    const { sendSocketEvent, gameConfigs, userStakeLevel } = useGameStore(
        useShallow((state) => ({
            sendSocketEvent: state.sendSocketEvent,
            gameConfigs: state.gameConfigs,
            userStakeLevel: state.userStakeLevel,
        }))
    );
    const { clientSeed } = useClientSeedPF();
    const { betAmount, gameMode, numberOfRows, numberOfDroppingBall, setBetAmount } = usePlinkoGameStore(
        useShallow((state) => ({
            betAmount: state.betAmount,
            gameMode: state.gameMode,
            numberOfRows: state.numberOfRows,
            numberOfDroppingBall: state.numberOfDroppingBall,
            setBetAmount: state.actions.setBetAmount,
        }))
    );
    const { gameMessageHandler } = useGameContext();

    const [tabIndex, setTabIndex] = useState(0);
    const [isAutoBet, setIsAutoBet] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { t } = useCommonTranslate();

    const { minBet, maxBet } = useMemo(() => {
        if (gameConfigs?.minBet && gameConfigs?.maxBet && userStakeLevel) {
            const maxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
            const minBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);
            return { minBet, maxBet };
        }
        return { minBet: 0, maxBet: 0 };
    }, [gameConfigs?.minBet, gameConfigs?.maxBet, userStakeLevel]);

    const handleBetClick = useCallback(() => {
        sendSocketEvent("bet", { amount: betAmount, gameMode, numberOfRows, clientSeed });
        setIsProcessing(true);
    }, [sendSocketEvent, betAmount, gameMode, numberOfRows, clientSeed]);

    useEffect(() => {
        const endBetHandlerId = gameMessageHandler?.register(messageEventType.END_BET, ({ endBet }) => {
            if (endBet < 0) {
                setIsAutoBet(false);
            }
            setIsProcessing(false);
        });
        return () => {
            gameMessageHandler?.removeHandler(endBetHandlerId);
        };
    }, [gameMessageHandler]);

    const handleAutoBetClick = useCallback(() => {
        if (isAutoBet) {
            setIsAutoBet(false);
        } else {
            setIsAutoBet(true);
            handleBetClick();
        }
    }, [isAutoBet, handleBetClick]);

    useHotKey({
        onSpaceKey: () => {
            if (!isProcessing && !isAutoBet && isManualTab) {
                handleBetClick();
            }
        },
        onDKey: () => {
            if (!isProcessing && !isAutoBet && minBet > 0) {
                const newBetAmount = Math.min(betAmount * 2, maxBet);
                setBetAmount(newBetAmount, minBet, maxBet);
            }
        },
        onSKey: () => {
            if (!isProcessing && !isAutoBet && minBet > 0) {
                const newBetAmount = Math.max(betAmount / 2, minBet);
                setBetAmount(newBetAmount, minBet, maxBet);
            }
        },
        onAKey: () => {
            if (!isProcessing && !isAutoBet && minBet > 0) {
                setBetAmount(minBet, minBet, maxBet);
            }
        },
        isEnabled: true,
    });

    const buttonClass =
        "text-sm font-bold w-full h-11 rounded-xl uppercase bg-gradient-to-l from-[#1FDC13] to-[#1D9C05] shadow-[0_0_8px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:opacity-50";

    const isManualTab = tabIndex === 0;

    return (
        <div className="flex flex-col gap-3 px-3 mt-3 rounded-t-xl justify-end lg:flex-col-reverse lg:bg-primary-bg lg:py-4 lg:px-0 lg:mt-0 lg:h-full">
            <div className="relative">
                <div className="lg:px-3">
                    {isManualTab ? (
                        <button className={buttonClass} onClick={handleBetClick} disabled={isProcessing}>
                            {t("glossary_bet")}
                        </button>
                    ) : (
                        <button className={buttonClass} onClick={handleAutoBetClick}>
                            {isAutoBet ? t("stop_auto_bet") : t("start_auto_bet")}
                        </button>
                    )}
                </div>
                <div className="hidden lg:block absolute -top-3 h-[1px] w-full bg-[#2934454D] shadow-[0_-4px_20px_2px_#000000]"></div>
            </div>

            <div className="flex flex-col lg:flex-col-reverse rounded-t-xl bg-primary-bg lg:gap-2">
                <BetForm
                    isManualTab={isManualTab}
                    isDisabled={isProcessing || isAutoBet}
                    isAutoBet={isAutoBet}
                    setIsAutoBet={setIsAutoBet}
                />
                <TabNavigation
                    activeIndex={tabIndex}
                    onChangeTab={setTabIndex}
                    isDisabled={isProcessing || isAutoBet || numberOfDroppingBall > 0}
                />
            </div>
        </div>
    );
};

export default memo(BetControl);
