import React, { memo, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { useGameStore } from "@shared/stores/game-store";
import { GAME_MODES, NUMBER_OF_ROWS } from "@plinko/constants";
import Label from "./label";
import { useClickSound, useTranslator } from "@shared/react-hooks";
import { useGameContext } from "@shared/react-contexts";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";
import { useGetLightningConfig } from "@plinko/shared/hooks/use-get-lightning-config";
import { buildVersion } from "@shared";
import Image from "next/image";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface GameModeOption {
    key: string;
    label: string;
    value?: number;
    isLightning?: boolean;
}

const gameModes: GameModeOption[] = [
    { key: "lightning", label: "lightning", isLightning: true },
    { key: "low", label: "mode_low", value: GAME_MODES.LOW },
    { key: "medium", label: "mode_medium", value: GAME_MODES.MEDIUM },
    { key: "high", label: "mode_high", value: GAME_MODES.HIGH },
];

const GameModeSelector = ({ isDisabled }: { isDisabled: boolean }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);
    const clickSound = useClickSound();
    const { getLightningConfig } = useGetLightningConfig();

    const gameConfigs: any = useGameStore(
        (state) => state.gameConfigs
    );

    const { isLightningMode, setIsLightningMode } = usePlinkoLightningModeGameStore(
        useShallow((state) => ({
            isLightningMode: state.isLightningMode,
            setIsLightningMode: state.actions.setIsLightningMode,
        }))
    );

    const { gameMode, setGameMode, setNumberOfRows } = usePlinkoGameStore(
        useShallow((state) => ({
            gameMode: state.gameMode,
            setGameMode: state.actions.setGameMode,
            setNumberOfRows: state.actions.setNumberOfRows,
        }))
    );

    const availableGameModes = useMemo(() => {
        if (gameConfigs?.enabledLightningMode) {
            return gameModes;
        }
        return gameModes.filter((mode) => !mode.isLightning);
    }, [gameConfigs?.enabledLightningMode]);

    const handleSelectMode = (option: GameModeOption) => {
        clickSound();
        if (option.isLightning) {
            setIsLightningMode(true);
            setNumberOfRows(NUMBER_OF_ROWS.MAX);
            getLightningConfig();
        } else if (option.value !== undefined) {
            setIsLightningMode(false);
            setGameMode(option.value);
        }
    };

    const isActive = (option: GameModeOption): boolean => {
        if (option.isLightning) {
            return isLightningMode;
        }
        return !isLightningMode && gameMode === option.value;
    };

    return (
        <div className="span-game-mode">
            <Label title={t("mode")} />
            <div className="flex items-center input p-1 gap-1 rounded-lg h-11">
                {availableGameModes.map((option) => (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => handleSelectMode(option)}
                        aria-pressed={isActive(option)}
                        disabled={isDisabled}
                        className={`
                            inline-flex items-center justify-center whitespace-nowrap px-3 transition-all disabled:pointer-events-none focus-visible:!outline-none focus-visible:!outline-0 rounded-lg flex-1 text-sm aria-pressed:bg-[#2a4770] h-full disabled:opacity-50
                            ${isActive(option) ? "bg-[#2a4770]" : ""}
                        `}
                    >
                        <span className="flex justify-center items-center gap-1">
                            {option.isLightning && (
                                <Image
                                    src={`${basePath}/static/images/icons/lightning-mode.svg?v=${buildVersion}`}
                                    alt="lightning"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5"
                                />
                            )}
                            <span>{t(option.label)}</span>
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default memo(GameModeSelector);
