import React from "react";
import { GameModeSelectorProps } from "../../../../shared/types";

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ gameMode, onGameModeChange }) => {
    const gameModes = ["Lightning", "Low", "Medium", "High"] as const;

    // Handle mode change with Lightning mode placeholder logic (Section 4.3)
    const handleModeChange = (mode: GameModeSelectorProps["gameMode"]) => {
        onGameModeChange(mode);

        // Section 4.3: Lightning mode is TBD - log placeholder warning
        if (mode === "Lightning") {
            console.warn("Lightning mode selected: This mode is currently under development (Section 4.3 - TBD). Using fallback payouts.");
        }
    };

    return (
        <div className="span-game-mode">
            <div className="text-sm md:text-base mb-2 font-semibold">Game Mode</div>
            <div className="flex items-center input p-1 gap-1 rounded-lg h-11">
                {gameModes.map((mode) => (
                    <button
                        key={`mode-${mode}`}
                        className="inline-flex items-center justify-center whitespace-nowrap px-3 transition-all disabled:pointer-events-none disabled:opacity-40 focus-visible:!outline-none focus-visible:!outline-0 
                            rounded-lg flex-1 text-sm aria-pressed:bg-[#2a4770] h-full"
                        type="button"
                        onClick={() => handleModeChange(mode)}
                        aria-pressed={gameMode === mode}
                    >
                        <span>{mode}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GameModeSelector;
