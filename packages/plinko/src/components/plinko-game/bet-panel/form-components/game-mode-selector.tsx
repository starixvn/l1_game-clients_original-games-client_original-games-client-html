import React, { memo } from "react";
import { useShallow } from "zustand/shallow";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { GAME_MODES } from "@plinko/constants";
import Label from "./label";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "@shared/resources";

const gameModes = [
    {
        text: "mode_low",
        value: GAME_MODES.LOW,
    },
    {
        text: "mode_medium",
        value: GAME_MODES.MEDIUM,
    },
    {
        text: "mode_high",
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

    const { t } = useTranslate(ResourceTypes.PLINKO);

    return (
        <div className="span-game-mode">
            <Label title={t("mode")} />
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
                        <span>{t(mode.text)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default memo(GameModeSelector);
