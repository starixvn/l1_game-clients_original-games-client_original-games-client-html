import React, { useState } from "react";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store";
import { useClientSeedPF } from "@shared/react-hooks";
import { BetControls } from "./bet-controls";

const tabs = [
    {
        text: "Manual",
        value: true,
    },
    {
        text: "Auto",
        value: false,
    },
];

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

    const [isManualTab, setIsManualTab] = useState(true);

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
            <BetControls isManualTab={isManualTab} />
            <div className="flex bg-primary-bg">
                {tabs.map((tab) => (
                    <button
                        key={tab.text}
                        onClick={() => setIsManualTab(tab.value)}
                        className={`flex-1 px-4 py-3 text-sm relative text-white ${
                            isManualTab === tab.value
                                ? "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-green-500"
                                : ""
                        }`}
                    >
                        {tab.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BetControl;
