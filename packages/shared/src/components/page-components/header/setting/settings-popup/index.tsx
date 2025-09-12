import { SettingEventActionType, useSettingContext, useSettingDispatch } from '@shared/react-contexts';
import { useClickOutside, useClickSound, useTranslator } from '@shared/react-hooks';
import BaseDialog from "../../../../game-components/base-dialog";
import { ModalType } from "../../../../game-components/base-dialog/type";
import MusicSetting from "./bgm-setting";
import Styles from "./settings-popup.module.scss";
import SoundSetting from "./sfx-setting";
import { useRef } from 'react';

const SoundSettings = () => {
    const settingContext = useSettingContext();
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const { t } = useTranslator();
    const wrapperRef = useRef<HTMLDivElement>(null);
    
    const closePopup = () => {
        clickSound();
        settingDispatch({
            type: SettingEventActionType.TOGGLE_SETTING,
            payload: {
                isShowedSetting: false,
            },
        });
    };
    
    useClickOutside([wrapperRef], closePopup);
    
    return (
        settingContext.isShowedSetting && (
            <div className={`${Styles["settings"]}`} >
                <BaseDialog type={ModalType.Center} isOpen={settingContext.isShowedSetting} onCloseModal={closePopup} enableBackdrop={true}>
                    <div ref={wrapperRef} className={`modal-center ${Styles["settings-popup"]} `}>
                        <div className={`${Styles["settings-header"]}`}>
                            <div className={`${Styles["setting-title"]}`}>{t("lobby_setting")}</div>
                            <span className={`icon-close ${Styles["icon-close"]}`} onClick={() => closePopup()}></span>
                        </div>
                        <div className={`${Styles["settings-content"]} `}>
                            <div className={`${Styles["settings-group"]} `}>
                                <MusicSetting />
                                <SoundSetting />
                            </div>
                        </div>
                    </div>
                </BaseDialog>
            </div>
        )
    );
};

export default SoundSettings;
