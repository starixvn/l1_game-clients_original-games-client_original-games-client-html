import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";

import { getAppSettings } from "../_shared/app-settings";
import { GameIds } from "../_shared/constants";
import { SettingEventActionType, SystemContextProvider, usePlayerContext, useSettingDispatch } from "../_shared/react-contexts";
import { useBlockBetSound, usePlaceBetSound, useStartDrawSound, useStartRoundSound } from "../_shared/react-hooks";
import { GameSound } from "../components/game-base/type";
import GameLoading from "../components/game-components/game-loading";
import { getChipSettings } from "../services/user-setting-service";
import styles from "./games.module.scss";
import { Props } from "./type";
import { LoadingSpinner } from "../components/game-components/game-loading/loading-spinner";

const LoadingGameComponent = () => (
    <>
        <GameLoading />
        <LoadingSpinner />
    </>
);

// SeBall removed
const SeDieMultiPlayer = dynamic(() => import("./sedie-multiplayer/page"), { loading: () => <LoadingGameComponent /> });

export const Games: React.FC<Props> = ({ setApiErrorMessage, userStakeLevel, updateUserStakeLevel, openGameId }) => {
    const { theme } = useTheme();
    const { session } = usePlayerContext();
    const settingDispatch = useSettingDispatch();

    useEffect(() => {
        (async () => {
            const chipSettings = await getChipSettings(session);
            settingDispatch({
                type: SettingEventActionType.UPDATE_CHIPS,
                payload: {
                    chipSettings: chipSettings?.chips,
                },
            });
        })();
        // Dependencies stable for session init
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const gameSound: GameSound = {
        playPlaceBetSound: usePlaceBetSound(),
        startPlaceBetSound: useStartDrawSound(),
        startRoundSound: useStartRoundSound(),
        blockBetSound: useBlockBetSound(),
    };

    const getGameComponentById = (gameId: number) => {
        const appSettings = getAppSettings();
        const { gameSettings } = appSettings;

        const gameProps = {
            ...gameSettings[gameId],
            gameSound,
            setApiErrorMessage: setApiErrorMessage,
            theme,
            userStakeLevel,
            updateUserStakeLevel,
        };

        if (gameId === GameIds.SeDieMultiplayer) {
            return <SeDieMultiPlayer key={`game-${gameId}`} {...gameProps} />;
        }

        return null;
    };

    const gameComponent = getGameComponentById(openGameId);

    return <SystemContextProvider>{gameComponent}</SystemContextProvider>;
};

export default Games;
