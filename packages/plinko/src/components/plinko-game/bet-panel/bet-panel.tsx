import React, { memo, useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { useGameStore } from "@shared/stores/game-store";
import { useClientSeedPF, useCommonTranslate } from "@shared/react-hooks";
import { useGameContext } from "@shared/react-contexts";
import { messageEventType } from "@shared/components/game-base/handlers/game-message-handler";
import TabNavigation from "./tab-navigation";
import BetForm from "./bet-form";

const BetControl = () => {
    const sendSocketEvent = useGameStore((state) => state.sendSocketEvent);
    const { clientSeed } = useClientSeedPF();
    const { betAmount, gameMode, numberOfRows } = usePlinkoGameStore(
        useShallow((state) => ({
            betAmount: state.betAmount,
            gameMode: state.gameMode,
            numberOfRows: state.numberOfRows,
        }))
    );
    const { gameMessageHandler } = useGameContext();

    const [tabIndex, setTabIndex] = useState(0);
    const [isAutoBet, setIsAutoBet] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { t } = useCommonTranslate();

    const handleBetClick = useCallback(() => {
        sendSocketEvent("bet", { amount: betAmount, gameMode, numberOfRows, clientSeed });
        setIsProcessing(true);
    }, [sendSocketEvent, betAmount, gameMode, numberOfRows, clientSeed]);

    useEffect(() => {
        const endBetHandlerId = gameMessageHandler?.register(messageEventType.END_BET, () => {
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

    const buttonClass =
        "text-sm font-bold w-full h-11 rounded-xl uppercase bg-gradient-to-l from-[#1FDC13] to-[#1D9C05] shadow-[0_0_8px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:opacity-50";

    const isManualTab = tabIndex === 0;

    return (
        <div className="flex flex-col gap-3 px-3 mt-3 rounded-t-xl justify-end md:flex-col-reverse md:bg-primary-bg md:py-4 md:px-0 md:mt-0 md:h-full">
            <div className="md:px-3">
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
            <div className="flex flex-col md:flex-col-reverse rounded-t-xl bg-primary-bg md:gap-2">
                <BetForm
                    isManualTab={isManualTab}
                    isDisabled={isProcessing || isAutoBet}
                    isAutoBet={isAutoBet}
                    setIsAutoBet={setIsAutoBet}
                />
                <TabNavigation activeIndex={tabIndex} onChangeTab={setTabIndex} isDisabled={isProcessing || isAutoBet} />
            </div>
        </div>
    );
};

export default memo(BetControl);
