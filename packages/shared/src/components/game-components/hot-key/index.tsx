import { usePopupStore } from "@shared/stores/popup-store";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { useClickOutside, useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
import styles from "./hotkey.module.scss";
import { useSettingStore } from "@shared/stores/setting-store";
import { useRef } from "react";

const HotKeyModal = () => {
    const isShowHotKey = usePopupStore((state) => state.isShowHotKey);
    const toggleHotKey = usePopupStore((state) => state.toggleHotKey);
    const { t: translate } = useCommonTranslate();
    const clickSound = useClickSound();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const isToggleHotKey = useSettingStore((state) => state.isToggleHotKey);
    const toggleHotKeySetting = useSettingStore((state) => state.toggleHotKey);

    const handleCloseModal = () => {
        toggleHotKey(false);
    };

    const handleToggleHotKey = () => {
        toggleHotKeySetting(!isToggleHotKey);
    };

    useClickOutside([wrapperRef], handleCloseModal);

    return (
        isShowHotKey && (
            <BaseDialog type={ModalType.Center} isOpen={isShowHotKey} enableBackdrop={true} onCloseModal={handleCloseModal}>
                <div ref={wrapperRef} id="hot-key" className={`modal-center flex flex-col gap-3 rounded-t-2xl ${styles.hotkeyPopup}`}>
                    {/* Header */}
                    <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center flex-shrink-0">
                        <div className="flex flex-1 items-center justify-center font-semibold text-lg">{translate("hot_key")}</div>
                        <button
                            className="cursor-pointer z-10"
                            onClick={(e) => {
                                e.preventDefault();
                                clickSound();
                                handleCloseModal();
                            }}
                        >
                            <i className="icon-close text-sm md:text-base right-5"></i>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {<HotKeyContent translate={translate} isToggleHotKey={isToggleHotKey} handleToggleHotKey={handleToggleHotKey} />}
                    </div>
                </div>
            </BaseDialog>
        )
    );
};

const HotKeyContent = ({
    translate,
    isToggleHotKey,
    handleToggleHotKey,
}: {
    translate: TFnType<DefaultParamType, string, TranslationKey>;
    isToggleHotKey: boolean;
    handleToggleHotKey: () => void;
}) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
                <div>{translate("hot_key_place_bet")}:</div>
                <div className={styles.key}>Space</div>
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
                <div>{translate("hot_key_double_bet")}:</div>
                <div className={styles.key}>D</div>
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
                <div>{translate("hot_key_half_bet")}:</div>
                <div className={styles.key}>S</div>
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
                <div>{translate("hot_key_min_bet")}:</div>
                <div className={styles.key}>A</div>
            </div>
            <div className="flex items-center gap-2 mb-2 ml-1">
                <input className="input-checkbox" type="checkbox" checked={isToggleHotKey} onChange={handleToggleHotKey} />
                <div className="font-semibold text-sm md:text-base text-white">
                    {isToggleHotKey ? translate("hot_key_enable") : translate("hot_key_disable")}
                </div>
            </div>
        </div>
    );
};

export default HotKeyModal;
