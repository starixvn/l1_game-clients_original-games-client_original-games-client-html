import { usePopupStore } from "@shared/stores/popup-store";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { cn } from "@shared/utils";
import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
import styles from "./hotkey.module.scss";
import { useSettingStore } from "@shared/stores/setting-store";

const HotKeyModal = () => {
    const isShowHotKey = usePopupStore((state) => state.isShowHotKey);
    const toggleHotKey = usePopupStore((state) => state.toggleHotKey);
    const { t: translate } = useCommonTranslate();
    const clickSound = useClickSound();

    const isToggleHotKey = useSettingStore((state) => state.isToggleHotKey);
    const toggleHotKeySetting = useSettingStore((state) => state.toggleHotKey);

    const handleCloseModal = () => {
        toggleHotKey(false);
    };

    const handleToggleHotKey = () => {
        toggleHotKeySetting(!isToggleHotKey);
    };

    return (
        isShowHotKey && (
            <BaseDialog
                type={ModalType.Full}
                isOpen={isShowHotKey}
                enableBackdrop={false}
                onCloseModal={handleCloseModal}
                extendedClassName="h-[250px] w-[354px] top-[200px] left-[50px]"
            >
                <div id="hot-key" className={cn("flex flex-col h-full w-full gap-3 rounded-t-2xl")}>
                    {/* Header */}
                    <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center flex-shrink-0">
                        <div className="flex flex-1 items-center justify-center font-semibold text-lg leading-[22px]">
                            {translate("hot_key")}
                        </div>
                        <span
                            className="cursor-pointer ml-auto relative z-10"
                            onClick={() => {
                                clickSound();
                                handleCloseModal();
                            }}
                        >
                            <i className="icon-close text-sm w-4 h-4"></i>
                        </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-h-0 overflow-hidden px-3">{<HotKeyContent translate={translate} isToggleHotKey={isToggleHotKey} handleToggleHotKey={handleToggleHotKey} />}</div>
                </div>
            </BaseDialog>
        )
    );
};

const HotKeyContent = ({ translate, isToggleHotKey, handleToggleHotKey }: { translate: TFnType<DefaultParamType, string, TranslationKey>, isToggleHotKey: boolean, handleToggleHotKey: () => void }) => {

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
                <div>{translate("place_bet")}</div>
                <h1>Space</h1>
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
                <div>{translate("double_bet")}</div>
                <h1>D</h1>
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
                <div>{translate("half_bet")}</div>
                <h1>S</h1>
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
                <div>{translate("min_bet")}</div>
                <h1>A</h1>
            </div>
            <div className="flex items-center gap-2">
                <label className={styles.switch}>
                    <input type="checkbox" checked={isToggleHotKey} onChange={handleToggleHotKey} />
                    <span className={styles.slider}></span>
                </label>
                <div>{ isToggleHotKey ? translate("on") : translate("off")}</div>
            </div>
        </div>
    );
};

export default HotKeyModal;
