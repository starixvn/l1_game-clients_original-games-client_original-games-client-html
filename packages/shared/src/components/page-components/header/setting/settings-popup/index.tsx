import { useClickOutside, useClickSound, useTranslator } from '@shared/react-hooks';
import BaseDialog from "../../../../game-components/base-dialog";
import { ModalType } from "../../../../game-components/base-dialog/type";
import MusicSetting from "./bgm-setting";
import Styles from "./settings-popup.module.scss";
import SoundSetting from "./sfx-setting";
import { useRef } from 'react';
import { useSettingStore } from '@shared/stores/setting-store';
import { useShallow } from 'zustand/react/shallow';

const SoundSettings = () => {
    const clickSound = useClickSound();
    const { t } = useTranslator();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { toggleSetting, isShowedSetting } = useSettingStore(useShallow((state) => ({
        toggleSetting: state.toggleSetting,
        isShowedSetting: state.isShowedSetting,
    })));
    
    const closePopup = () => {
        clickSound();
        toggleSetting(false);
    };
    
    useClickOutside([wrapperRef], closePopup);
    
    return (
        isShowedSetting && (
            <div className={`${Styles["settings"]}`} >
                <BaseDialog type={ModalType.Center} isOpen={isShowedSetting} onCloseModal={closePopup} enableBackdrop={true}>
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
