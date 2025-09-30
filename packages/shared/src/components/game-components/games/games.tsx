import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
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
import LoggerControls from "@shared/components/game-components/logger-controls/LoggerControls";
import { gameRegistry } from "@shared/game-registry";

const LoadingGameComponent = React.memo(() => (
    <>
        <GameLoading />
        <LoadingSpinner />
    </>
));

LoadingGameComponent.displayName = "LoadingGameComponent";

export interface GamesProps extends Props {
    // Removed gameConfig - we'll use dynamic loading based on openGameId
}

export const Games: React.FC<GamesProps> = ({
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    openGameId
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
        // Dynamic import of game component based on openGameId
        const GameComponent = dynamic(() => {
            const loader = gameRegistry.getLoader(openGameId);
            if (!loader) {
                console.warn(`[Games] No game loader found for game ID: ${openGameId}`);
                return Promise.resolve(() => <LoadingGameComponent />);
            }
            return loader().catch((error) => {
                console.error(`[Games] Error loading game component for ID ${openGameId}:`, error);
                return () => (
                    <div className="p-4 bg-red-900 border border-red-600 rounded-lg text-white">
                        <h3 className="font-bold text-red-300">🚨 Game Component Error 🚨</h3>
                        <p className="text-sm mt-2">Failed to load game component. Check LoggerControls for details.</p>
                        <details className="mt-2">
                            <summary className="cursor-pointer text-sm">Error Details</summary>
                            <pre className="text-xs mt-1 bg-black p-2 rounded overflow-auto max-h-32">
                                {error.message}
                            </pre>
                        </details>
                    </div>
                );
            });
        }, {
            loading: () => <LoadingGameComponent />,
            ssr: false
        });

        return <GameComponent key={`game-${openGameId}`} {...gameProps} />;
    }, [openGameId, gameProps]);

    return (
        <>
            {renderGameComponent()}
        </>
    );
};

export default Games;
