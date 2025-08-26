import Image from "next/image";
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
            console.log("[MenuIcon] sound.open.settings");
            settingDispatch({
                type: SettingEventActionType.TOGGLE_SETTING,
                payload: { isShowedSetting: true },
            });
        }
    }, [onClick, roundState, name, clickSound, dispatch, settingDispatch]);

    const iconSrc = useMemo(() => `/static/images/icons/${name}.svg`, [name]);
    const computedEnabledSound = ((settingContext?.enabledSound ?? (StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true)) && ((settingContext?.volumeSFX ?? 50) > 0));

    const iconClassName = useMemo(() => {
        if (name === "sound") {
            return computedEnabledSound ? Styles.soundOn : Styles.soundOff;
        }
        if (name === "guide") {
            return Styles.guide;
        }
        if (name === "pf-guide") {
            return Styles.pfGuide;
        }
        return "";
    }, [name, computedEnabledSound]);

    return (
        <div className="cursor-pointer p-1" onClick={handleClick}>
            {iconClassName ? (
                <span className={`${Styles.menuIcon} ${iconClassName}`}></span>
            ) : (
                <Image src={iconSrc} height={24} width={24} alt="Logo" />
            )}
        </div>
    );
};
