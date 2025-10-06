import React, { memo } from "react";
import { useShallow } from "zustand/shallow";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { GAME_MODES } from "@/constants";
import Label from "./label";

const gameModes = [
    {
        text: "Low",
        value: GAME_MODES.LOW,
    },
    {
        text: "Medium",
        value: GAME_MODES.MEDIUM,
    },
    {
        text: "High",
        value: GAME_MODES.HIGH,
    },
] as const;

const GameModeSelector = ({ isDisabled }: { isDisabled: boolean }) => {
    const { gameMode, setGameMode } = usePlinkoGameStore(
        useShallow((state) => ({
            gameMode: state.gameMode,
            setGameMode: state.actions.setGameMode,
        }))
    );

    return (
        <div className="span-game-mode">
            <Label title="Game Mode" />
            <div className="flex items-center input p-1 gap-1 rounded-lg h-11">
                {gameModes.map((mode) => (
                    <button
                        key={`mode-${mode.value}`}
                        className="inline-flex items-center justify-center whitespace-nowrap px-3 transition-all disabled:pointer-events-none disabled:opacity-40 focus-visible:!outline-none focus-visible:!outline-0 
                            rounded-lg flex-1 text-sm aria-pressed:bg-[#2a4770] h-full disabled:opacity-50"
                        type="button"
                        onClick={() => setGameMode(mode.value)}
                        aria-pressed={gameMode === mode.value}
                        disabled={isDisabled}
                    >
                        <span>{mode.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default memo(GameModeSelector);
