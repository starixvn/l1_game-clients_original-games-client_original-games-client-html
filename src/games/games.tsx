import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React, { useContext, useEffect } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";

import { getAppSettings, getAppSettingsForGame } from "../_shared/app-settings";
import { GameIds } from "../_shared/constants";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../_shared/helpers";
import {
    SettingEventActionType,
    SystemContextProvider,
    URLContext,
    updateURLContext,
    usePlayerContext,
    useSettingDispatch,
} from "../_shared/react-contexts";
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

const SeBall = dynamic(() => import("./se-ball/page"), { loading: () => <LoadingGameComponent /> });
// SicBall removed
const SeDieMultiPlayer = dynamic(() => import("./sedie-multi-player/page"), { loading: () => <LoadingGameComponent /> });

export const Games: React.FC<Props> = ({
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    openGameId,
}) => {
    console.log("[Games] Games component rendering with:", { openGameId, userStakeLevel });
    const { theme } = useTheme();
    const { session } = usePlayerContext();
    const settingDispatch = useSettingDispatch();

    useEffect(() => {
        console.log("[Games] useEffect called, getting chip settings");
        (async () => {
            const chipSettings = await getChipSettings(session);
            console.log("[Games] chip settings received:", chipSettings);
            settingDispatch({
                type: SettingEventActionType.UPDATE_CHIPS,
                payload: {
                    chipSettings: chipSettings?.chips,
                },
            });
        })();
    }, []);

    const gameSound: GameSound = {
        playPlaceBetSound: usePlaceBetSound(),
        startPlaceBetSound: useStartDrawSound(),
        startRoundSound: useStartRoundSound(),
        blockBetSound: useBlockBetSound(),
    };

    const getGameComponentById = (gameId: number) => {
        console.log("[Games] getGameComponentById called with gameId:", gameId);
        const appSettings = getAppSettingsForGame(gameId);
        const { gameSettings } = appSettings;

        const gameProps = {
            ...gameSettings[gameId],
            gameSound,
            setApiErrorMessage: setApiErrorMessage,
            theme,
            userStakeLevel,
            updateUserStakeLevel,
        };

        console.log("[Games] gameProps:", gameProps);

        switch (gameId) {
            case GameIds.SeBall1:
                console.log("[Games] rendering SeBall component");
                return <SeBall key={`game-${gameId}`} {...gameProps} />;

            // case GameIds.SicBall: removed

            case GameIds.SeDie:
                console.log("[Games] rendering SeDieMultiPlayer component");
                return <SeDieMultiPlayer key={`game-${gameId}`} {...gameProps} />;

            default:
                console.log("[Games] no matching game component found for gameId:", gameId);
                return null;
        }
    };

    const gameComponent = getGameComponentById(openGameId);
    console.log("[Games] gameComponent:", !!gameComponent);

    return (
        <div className={`game-container ${styles["game-wrapper"]} ${styles["open-chips"]}`}>
            <SystemContextProvider>
                <div className={`${styles["game-list"]} ${isMobileOnly ? styles[isIOS ? "ios-device" : "android-device"] : ""}`}>
                    {gameComponent}
                </div>
            </SystemContextProvider>
        </div>
    );
};

export default Games;
