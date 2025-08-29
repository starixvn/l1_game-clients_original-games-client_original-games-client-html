import { SettingEventActionType, useSettingContext, useSettingDispatch } from "../../../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../../../_shared/react-hooks";
import BaseDialog from "../../../../game-components/base-dialog";
import { ModalType } from "../../../../game-components/base-dialog/type";
import MusicSetting from "./bgm-setting";
import Styles from "./settings-popup.module.scss";
import SoundSetting from "./sfx-setting";

const SoundSettings = () => {
    const settingContext = useSettingContext();
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const { t } = useTranslator();

    const closePopup = () => {
        console.log("[Setting.Popup] close.click");
        document.body.classList.remove("overflow-hidden");
        clickSound();
        console.log("[Setting.Popup] dispatch.toggle", { isShowedSetting: false });
        settingDispatch({
            type: SettingEventActionType.TOGGLE_SETTING,
            payload: {
                isShowedSetting: false,
            },
        });
    };

    return (
        settingContext.isShowedSetting && (
            <div className={`${Styles["settings"]}`}>
                <div className={`${Styles["settings-bg"]}`}></div>
                <BaseDialog type={ModalType.Center} isOpen={settingContext.isShowedSetting} onCloseModal={closePopup}>
                    <div className={`modal-center yellow-color ${Styles["settings-popup"]} `}>
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
