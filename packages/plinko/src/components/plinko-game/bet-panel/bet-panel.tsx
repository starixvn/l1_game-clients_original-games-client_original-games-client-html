import React, { memo, useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { useGameStore } from "@shared/stores/game-store";
import { useClientSeedPF } from "@shared/react-hooks";
import { useGameContext } from "@shared/react-contexts";
import { messageEventType } from "@shared/components/game-base/handlers/game-message-handler";
import TabNavigation from "./tab-navigation";
import BetForm from "./bet-form";

const BetControl = () => {
    const socket = useGameStore((state) => state.socket);
    const { clientSeed } = useClientSeedPF();
    const { betAmount, gameMode, numberOfRows } = usePlinkoGameStore(
        useShallow((state) => ({
            betAmount: state.betAmount,
            gameMode: state.gameMode,
            numberOfRows: state.numberOfRows,
        }))
    );
    const { gameMessageHandler } = useGameContext();

    const [isManualTab, setIsManualTab] = useState(true);
    const [isAutoBet, setIsAutoBet] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBetClick = useCallback(() => {
        if (socket?.connected) {
            socket.emit("bet", { amount: betAmount, gameMode, numberOfRows, clientSeed });
            setIsProcessing(true);
        }
    }, [socket, betAmount, gameMode, numberOfRows, clientSeed]);

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
            return;
        } else {
            setIsAutoBet(true);
            handleBetClick();
        }
    }, [isAutoBet, handleBetClick]);

    const buttonClass =
        "text-sm font-bold w-full h-11 rounded-xl uppercase bg-gradient-to-l from-[#1FDC13] to-[#1D9C05] shadow-[0_0_8px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:opacity-50 hover:scale-105 transition-all duration-200";

    return (
        <div className="flex flex-col px-3 gap-3 mt-3 rounded-t-xl justify-end md:flex-col-reverse md:bg-primary-bg md:py-4 md:mt-0 md:h-full">
            <div>
                {isManualTab ? (
                    <button className={buttonClass} onClick={handleBetClick} disabled={isProcessing}>
                        Bet
                    </button>
                ) : (
                    <button className={buttonClass} onClick={handleAutoBetClick}>
                        {isAutoBet ? "Stop Auto Bet" : "Start Auto Bet"}
                    </button>
                )}
            </div>
            <div className="flex flex-col md:flex-col-reverse gap-3 rounded-t-xl bg-primary-bg">
                <BetForm
                    isManualTab={isManualTab}
                    isDisabled={isProcessing || isAutoBet}
                    isAutoBet={isAutoBet}
                    setIsAutoBet={setIsAutoBet}
                />
                <TabNavigation activeTab={isManualTab} onTabChange={setIsManualTab} isDisabled={isProcessing || isAutoBet} />
            </div>
        </div>
    );
};

export default memo(BetControl);
