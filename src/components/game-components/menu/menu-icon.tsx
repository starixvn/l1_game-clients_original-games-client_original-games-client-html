import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { useClickSound } from "../../../_shared/react-hooks";
import { StorageHelper, localStorageKeys, AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../_shared/helpers";
import { RoundState } from "../../game-base/type";

type Props = { name: string; onClick?: () => void };

export const MenuIcon = ({ name, onClick }: Props) => {
    const { roundState } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const pfDispatch = usePFDispatch();
    const clickSound = useClickSound();
    const [enabledSound, setEnabledSound] = useState<boolean>(StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true);

    const handleClick = useCallback(() => {
        if (onClick) {
            onClick();
            return;
        }

        if (roundState === RoundState.Disabled) {
            return;
        }

        if (name === "sound") {
            clickSound();
            const next = !enabledSound;
            StorageHelper.set(localStorageKeys.enableSound, next);
            setEnabledSound(next);
            AnalyticsHelper.trackFunction({ function: TrackingFunction.Sound, action: next ? TrackingAction.ToggleOn : TrackingAction.ToggleOff });
            return;
        }

        if (name === "guide") {
            clickSound();
            dispatch({
                type: GameEventActionType.TOGGLE_GAME_GUIDE,
                payload: { isShowGameGuide: true },
            });
            AnalyticsHelper.trackFunction({ function: TrackingFunction.GameGuide, action: TrackingAction.Open });
            return;
        }

        if (name === "security") {
            clickSound();
            pfDispatch({
                type: PFEventActionType.TOGGLE_PF_SETTING,
                payload: { isShowPFSetting: true },
            });
            AnalyticsHelper.trackFunction({ function: TrackingFunction.PFSetting, action: TrackingAction.Open });
            return;
        }
    }, [onClick, roundState, name, clickSound, enabledSound, dispatch, pfDispatch]);

    const iconSrc = useMemo(() => `/static/images/icons/${name}.svg`, [name]);

    return (
        <div className="cursor-pointer p-1" onClick={handleClick}>
            {name === "sound" ? (
                <span className={`icon-sound-${enabledSound ? "on" : "off"}`}></span>
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
