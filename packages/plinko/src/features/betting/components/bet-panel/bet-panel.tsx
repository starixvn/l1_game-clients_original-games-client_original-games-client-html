import React, { useCallback, useEffect, useState } from "react";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store";
import { useClientSeedPF } from "@shared/react-hooks";
import { BetControls } from "./bet-controls";
import { TabControl } from "./tab-control";
import { useGameContext } from "@shared/react-contexts";
import { messageEventType } from "@shared/components/game-base/handlers/game-message-handler";

const BetControl = () => {
    const { socket } = useGameStore(useShallow((state) => ({ socket: state.socket })));
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
    const [numberOfBets, setNumberOfBets] = useState(Infinity);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBetClick = useCallback(() => {
        if (socket?.connected) {
            socket.emit("bet", { amount: betAmount, gameMode, numberOfRows, clientSeed });
            setIsProcessing(true);
        }
    }, [socket, betAmount, gameMode, numberOfRows, clientSeed]);

    const handleEndBet = useCallback(() => {
        setIsProcessing(false);
        if (isAutoBet) {
            const newNumberOfBets = numberOfBets - 1;
            setNumberOfBets(newNumberOfBets);
            handleBetClick();
            if (newNumberOfBets <= 0) {
                setIsAutoBet(false);
                setNumberOfBets(Infinity);
            }
        }
    }, [isAutoBet, handleBetClick, numberOfBets]);

    useEffect(() => {
        const endBetHandlerId = gameMessageHandler?.register(messageEventType.END_BET, () => {
            handleEndBet();
        });
        return () => {
            gameMessageHandler?.removeHandler(endBetHandlerId);
        };
    }, [gameMessageHandler, handleEndBet]);

    const handleAutoBetClick = useCallback(() => {
        if (isAutoBet) {
            setIsAutoBet(false);
            return;
        }
        if (numberOfBets > 0) {
            setIsAutoBet(true);
            handleBetClick();
        }
    }, [isAutoBet, handleBetClick, numberOfBets]);

    const buttonClass =
        "text-sm font-bold w-full h-11 rounded-xl uppercase bg-gradient-to-l from-[#1FDC13] to-[#1D9C05] shadow-[0_0_8px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:opacity-50";

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
            <div className="md:rounded-none border-stroke before:rounded-b-none">
                <BetControls
                    isManualTab={isManualTab}
                    numberOfBets={numberOfBets}
                    setNumberOfBets={setNumberOfBets}
                    isDisabled={isProcessing || isAutoBet}
                />
                <div className="md:hidden flex">
                    <TabControl activeTab={isManualTab} onTabChange={setIsManualTab} isDisabled={isProcessing || isAutoBet} />
                </div>
            </div>
            <div className="bg-primary-bg hidden md:flex">
                <TabControl activeTab={isManualTab} onTabChange={setIsManualTab} isDisabled={isProcessing || isAutoBet} />
            </div>
        </div>
    );
};

export default BetControl;
