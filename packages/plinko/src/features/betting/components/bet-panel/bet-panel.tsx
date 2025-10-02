import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BetAmountControl, GameModeSelector, RowsSelector } from "./components";
import AutoBetControl from "./auto-bet-control";
import usePlinkoBetStore from "@/shared/stores/plinko-bet-store";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store";
import { useClientSeedPF } from "@shared/react-hooks";

const BetControl = () => {
    const { gameConfigs, userStakeLevel, socket } = useGameStore(
        useShallow((state) => ({
            gameConfigs: state.gameConfigs,
            userStakeLevel: state.userStakeLevel,
            socket: state.socket,
        }))
    );
    const { clientSeed } = useClientSeedPF();
    const { minBet, maxBet } = useMemo(() => {
        if (gameConfigs && userStakeLevel) {
            const maxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
            const minBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);
            return { minBet, maxBet };
        }
        return { minBet: 0, maxBet: 0 };
    }, [gameConfigs?.maxBet, gameConfigs?.minBet, userStakeLevel]);
    const { betAmount, gameMode, numberOfRows, setBetAmount } = usePlinkoBetStore(
        useShallow((state) => ({
            betAmount: state.betAmount,
            gameMode: state.gameMode,
            numberOfRows: state.numberOfRows,
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

    const [panelTab, setPanelTab] = useState<"Manual" | "Auto">("Manual");

    const isAutoTab = panelTab === "Auto";
    const tabs = ["Manual", "Auto"];

    const handleBetClick = () => {
        if (socket?.connected) {
            socket.emit("bet", { amount: betAmount, gameMode, numberOfRows, clientSeed });
        }
    };

    return (
        <div className="flex flex-col md:flex-col-reverse px-3">
            <div>
                <button
                    className="text-sm font-bold w-full h-11 rounded-xl mb-4 bg-gradient-to-l from-[#1FDC13] to-[#1D9C05] shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                    onClick={handleBetClick}
                >
                    Bet
                </button>
            </div>
            <div className="flex flex-col gap-4 p-4 md:p-0 md:rounded-none border-stroke before:rounded-b-none">
                <BetAmountControl handleBetAmountChange={handleBetAmountChange} />
                <GameModeSelector />
                <RowsSelector />

                {isAutoTab && <AutoBetControl />}
            </div>
            <div className="flex bg-primary-bg">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setPanelTab(tab as "Manual" | "Auto")}
                        className={`flex-1 px-4 py-3 text-sm relative text-white ${
                            panelTab === tab
                                ? "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-green-500"
                                : ""
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BetControl;
