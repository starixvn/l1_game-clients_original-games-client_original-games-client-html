import { useCallback, useMemo } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useSettingContext, SettingEventActionType, useSettingDispatch } from "../../../_shared/react-contexts";
import { useClickSound } from "../../../_shared/react-hooks";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { RoundState } from "../../game-base/type";
import Styles from "./menu-icon.module.scss";

type Props = { name: string; onClick?: () => void };

export const MenuIcon = ({ name, onClick }: Props) => {
    const { roundState } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const settingContext = useSettingContext();

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
            settingDispatch({
                type: SettingEventActionType.TOGGLE_SETTING,
                payload: { isShowedSetting: true },
            });
        }
    }, [onClick, roundState, name, clickSound, dispatch, settingDispatch]);

    const computedEnabledSound =
        (settingContext?.enabledSound ?? StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true) &&
        (settingContext?.volumeSFX ?? 50) > 0;

    const iconClassName = useMemo(() => {
        if (name === "sound") {
            return computedEnabledSound ? "sound-on" : "sound-off";
        }
        return name;
    }, [name, computedEnabledSound]);

    return (
        <div className="cursor-pointer w-8 h-8 flex items-center justify-center" onClick={handleClick}>
            <i className={`icon-${iconClassName} ${Styles.menuIcon}`}></i>
        </div>
    );
};
