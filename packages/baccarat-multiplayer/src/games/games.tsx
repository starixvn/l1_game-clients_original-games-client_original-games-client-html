import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useMemo } from "react";
import { getAppSettings } from "@shared/app-settings";
import { usePlayerContext } from "@shared/react-contexts";
import { useBlockBetSound, usePlaceBetSound, useStartDrawSound, useStartRoundSound } from "@shared/react-hooks";
import { GameSound } from "@shared/components/game-base/type";
import GameLoading from "@shared/components/game-components/game-loading";
import { getChipSettings } from "@shared/services/user-setting-service";
import { Props, GameComponentProps, GameComponentRegistry } from "./type";
import { LoadingSpinner } from "@shared/components/game-components/game-loading/loading-spinner";
import dynamic from "next/dynamic";
import { GAME_ID } from "../game-constants";
import { useSettingStore } from "@shared/stores";

const LoadingGameComponent = React.memo(() => (
    <>
        <GameLoading />
        <LoadingSpinner />
    </>
));

LoadingGameComponent.displayName = "LoadingGameComponent";

// Game registry for better scalability
// Map both the shared Baccarat id and the saba-game id (150) to the same component
const BaccaratMultiPlayer = dynamic(() => import("../page"), {
    loading: () => <LoadingGameComponent />,
    ssr: false,
});

// Game registry for better scalability
const gameComponentRegistry: GameComponentRegistry = {
    [GAME_ID]: BaccaratMultiPlayer,
};

export const Games: React.FC<Props> = ({ setApiErrorMessage, userStakeLevel, updateUserStakeLevel, openGameId }) => {
    console.log("[Baccarat Games] Component props:", { openGameId, setApiErrorMessage, userStakeLevel, updateUserStakeLevel });
    console.log("[Baccarat Games] Game component registry:", gameComponentRegistry);

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
        console.log("[Baccarat Games] Looking for game component with openGameId:", openGameId);
        const GameComponent = gameComponentRegistry[openGameId];
        console.log("[Baccarat Games] Found GameComponent:", GameComponent ? "YES" : "NO");

        if (!GameComponent) {
            console.warn(`[Baccarat Games] No game component found for game ID: ${openGameId}`);
            console.log("[Baccarat Games] Available game IDs in registry:", Object.keys(gameComponentRegistry));
            return null;
        }

        console.log("[Baccarat Games] Rendering game component for gameId:", openGameId);
        return <GameComponent key={`game-${openGameId}`} {...gameProps} />;
    }, [openGameId, gameProps]);

    return renderGameComponent();
};

export default Games;
