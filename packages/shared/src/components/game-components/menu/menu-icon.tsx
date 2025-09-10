import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useGameStateContext, useGameStatesDispatch } from '@shared/react-contexts/game-state-context/game-state-context';
import { useSettingContext, SettingEventActionType, useSettingDispatch } from '@shared/react-contexts';
import { useClickSound, useCommonTranslate } from '@shared/react-hooks';
import { StorageHelper, localStorageKeys } from '@shared/helpers';
import { RoundState } from "../../game-base/type";
import Styles from "./menu-icon.module.scss";
const Tooltip = dynamic(() => import("../tooltip"), { ssr: false });
type Props = { name: string; onClick?: () => void };

export const MenuIcon = ({ name, onClick }: Props) => {
    const { roundState } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const settingContext = useSettingContext();
    const { t } = useCommonTranslate();

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
        <div className="relative group">
            <Tooltip message={t(`tooltip_${name}`)} />
            <div className="cursor-pointer w-8 h-8 flex items-center justify-center" onClick={handleClick}>
                <i className={`icon-${iconClassName} ${Styles.menuIcon}`}></i>
            </div>
        </div>
    );
};
