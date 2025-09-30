import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useMemo } from "react";
import { getAppSettings } from "@shared/app-settings";
import { usePlayerContext } from "@shared/react-contexts";
import { useBlockBetSound, usePlaceBetSound, useStartDrawSound, useStartRoundSound } from "@shared/react-hooks";
import { GameSound } from "@shared/components/game-base/type";
import GameLoading from "@shared/components/game-components/game-loading";
import { getChipSettings } from "@shared/services/user-setting-service";
import { Props, GameComponentProps } from "./type";
import { LoadingSpinner } from "@shared/components/game-components/game-loading/loading-spinner";
import { useSettingStore } from "@shared/stores";

const LoadingGameComponent = React.memo(() => (
    <>
        <GameLoading />
        <LoadingSpinner />
    </>
));

LoadingGameComponent.displayName = "LoadingGameComponent";

export interface GameConfig {
    gameId: number;
    component: React.ComponentType<any>;
    name: string;
}

export interface GamesProps extends Props {
    gameConfig: GameConfig;
}

export const Games: React.FC<GamesProps> = ({
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    openGameId,
    gameConfig
}) => {
    const { theme } = useTheme();
    const { session } = usePlayerContext();
    const updateChips = useSettingStore((state) => state.updateChips);

    const playPlaceBetSound = usePlaceBetSound();
    const startPlaceBetSound = useStartDrawSound();
    const startRoundSound = useStartRoundSound();
    const blockBetSound = useBlockBetSound();

    const gameSound: GameSound = useMemo(
        () => ({
            playPlaceBetSound,
            startPlaceBetSound,
            startRoundSound,
            blockBetSound,
        }),
        [playPlaceBetSound, startPlaceBetSound, startRoundSound, blockBetSound]
    );

    const loadChipSettings = useCallback(async () => {
        if (!session) {
            return;
        }

        try {
            const chipSettings = await getChipSettings(session);
            if (chipSettings) {
                updateChips(chipSettings.chips);
            }
        } catch (error) {
            console.error("Failed to load chip settings:", error);
        }
    }, [session, updateChips]);

    useEffect(() => {
        loadChipSettings();
    }, [loadChipSettings]);

    const gameProps: GameComponentProps = useMemo(() => {
        const appSettings = getAppSettings();
        const { gameSettings } = appSettings;

        return {
            ...gameSettings[openGameId],
            openGameId,
            openGameName: gameSettings[openGameId]?.gameName,
            gameSound,
            setApiErrorMessage,
            theme,
            userStakeLevel,
            updateUserStakeLevel,
        };
    }, [openGameId, gameSound, setApiErrorMessage, theme, userStakeLevel, updateUserStakeLevel]);

    const renderGameComponent = useCallback(() => {
        const GameComponent = gameConfig.component;

        if (!GameComponent) {
            console.warn(`[Games] No game component found for game ID: ${openGameId}`);
            return null;
        }

        return <GameComponent key={`game-${openGameId}`} {...gameProps} />;
    }, [openGameId, gameProps, gameConfig.component]);

    return (
        <>
            {renderGameComponent()}
        </>
    );
};

export default Games;
