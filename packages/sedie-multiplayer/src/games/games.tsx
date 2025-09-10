import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo } from "react";
import { getAppSettings } from "@shared/app-settings";
import { GameIds } from "@shared/constants";
import { SettingEventActionType, usePlayerContext, useSettingDispatch } from "@shared/react-contexts";
import { useBlockBetSound, usePlaceBetSound, useStartDrawSound, useStartRoundSound } from "@shared/react-hooks";
import { GameSound } from "@shared/components/game-base/type";
import GameLoading from "@shared/components/game-components/game-loading";
import { getChipSettings } from "@shared/services/user-setting-service";
import { Props, GameComponentProps, GameComponentRegistry } from "./type";
import { LoadingSpinner } from "@shared/components/game-components/game-loading/loading-spinner";

const LoadingGameComponent = React.memo(() => (
    <>
        <GameLoading />
        <LoadingSpinner />
    </>
));

LoadingGameComponent.displayName = "LoadingGameComponent";

// SeBall removed
const SeDieMultiPlayer = dynamic(() => import("../page"), {
    loading: () => <LoadingGameComponent />,
    ssr: false,
});

// Game registry for better scalability
const gameComponentRegistry: GameComponentRegistry = {
    [GameIds.SeDieMultiplayer]: SeDieMultiPlayer,
};

export const Games: React.FC<Props> = ({ setApiErrorMessage, userStakeLevel, updateUserStakeLevel, openGameId }) => {
    const { theme } = useTheme();
    const { session } = usePlayerContext();
    const settingDispatch = useSettingDispatch();

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
                settingDispatch({
                    type: SettingEventActionType.UPDATE_CHIPS,
                    payload: {
                        chipSettings: chipSettings.chips,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to load chip settings:", error);
        }
    }, [session, settingDispatch, setApiErrorMessage]);

    useEffect(() => {
        loadChipSettings();
    }, [loadChipSettings]);

    const gameProps: GameComponentProps = useMemo(() => {
        const appSettings = getAppSettings();
        const { gameSettings } = appSettings;

        return {
            ...gameSettings[openGameId],
            gameSound,
            setApiErrorMessage,
            theme,
            userStakeLevel,
            updateUserStakeLevel,
        };
    }, [openGameId, gameSound, setApiErrorMessage, theme, userStakeLevel, updateUserStakeLevel]);

    const renderGameComponent = useCallback(() => {
        const GameComponent = gameComponentRegistry[openGameId];

        if (!GameComponent) {
            console.warn(`No game component found for game ID: ${openGameId}`);
            return null;
        }

        return <GameComponent key={`game-${openGameId}`} {...gameProps} />;
    }, [openGameId, gameProps]);

    return renderGameComponent();
};

export default Games;
