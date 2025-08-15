import Image from "next/image";
import { useCallback, useMemo } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { useClickSound } from "../../../_shared/react-hooks";
import { StorageHelper, localStorageKeys, AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../_shared/helpers";
import { SettingEventActionType, useSettingDispatch } from "../../../_shared/react-contexts";
import { RoundState } from "../../game-base/type";
import { useSettingContext } from "../../../_shared/react-contexts";
import usePFStore from "../../../_shared/stores/pf-store/pf-store";

type Props = { name: string; onClick?: () => void };

export const MenuIcon = ({ name, onClick }: Props) => {
    const { roundState } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const togglePFSetting = usePFStore((state) => state.togglePFSetting);
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const settingContext = useSettingContext();

    const handleClick = useCallback(() => {
        console.log("[MenuIcon] click", { name, roundState });
        if (onClick) {
            console.log("[MenuIcon] delegated onClick", { name });
            onClick();
            return;
        }

        if (roundState === RoundState.Disabled) {
            return;
        }

        if (name === "sound") {
            clickSound();
            console.log("[MenuIcon] sound.open.settings");
            settingDispatch({
                type: SettingEventActionType.TOGGLE_SETTING,
                payload: { isShowedSetting: true },
            });
            return;
        }

        if (name === "guide") {
            clickSound();
            console.log("[MenuIcon] guide.open.dispatch");
            dispatch({
                type: GameEventActionType.TOGGLE_GAME_GUIDE,
                payload: { isShowGameGuide: true },
            });
            AnalyticsHelper.trackFunction({ function: TrackingFunction.GameGuide, action: TrackingAction.Open });
            console.log("[MenuIcon] analytics.track", { function: TrackingFunction.GameGuide, action: TrackingAction.Open });
            return;
        }

        if (name === "security") {
            clickSound();
            console.log("[MenuIcon] pf.open.dispatch");
            togglePFSetting(true);
            AnalyticsHelper.trackFunction({ function: TrackingFunction.PFSetting, action: TrackingAction.Open });
            console.log("[MenuIcon] analytics.track", { function: TrackingFunction.PFSetting, action: TrackingAction.Open });
            return;
        }
    }, [onClick, roundState, name, clickSound, dispatch, settingDispatch]);

    const iconSrc = useMemo(() => `/static/images/icons/${name}.svg`, [name]);
    const computedEnabledSound = ((settingContext?.enabledSound ?? (StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true)) && ((settingContext?.volumeSFX ?? 50) > 0));

    return (
        <div className="cursor-pointer p-1" onClick={handleClick}>
            {name === "sound" ? (
                <span className={`icon-sound-${computedEnabledSound ? "on" : "off"}`}></span>
            ) : name === "security" ? (
                <span className={`icon-pf`}></span>
            ) : name === "guide" ? (
                <span className={`icon-guide`}></span>
            ) : (
                <Image src={iconSrc} height={24} width={24} alt="Logo" />
            )}
        </div>
    );
};
