import { usePopupStore } from "@shared/stores/popup-store";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { useClickOutside, useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
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
            <BaseDialog type={ModalType.Center} isOpen={isShowHotKey} onCloseModal={handleCloseModal} enableBackdrop={true}>
                <div ref={wrapperRef} id="hot-key" className={`modal-center popup-modal px-4 py-3`}>
                    {/* Header */}
                    <div className="flex items-center px-5 py-2 text-base font-semibold text-primary-text text-center flex-shrink-0 mb-2">
                        <div className="flex flex-1 items-center justify-center font-semibold text-[24px]">{translate("hot_key")}</div>
                        <button
                            className="cursor-pointer z-10"
                            onClick={(e) => {
                                e.preventDefault();
                                clickSound();
                                handleCloseModal();
                            }}
                        >
                            <i className="icon-close text-sm md:text-[14px] right-5 top-5"></i>
                        </button>
                    </div>

                    {/* Content */}
                    <div>
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
    const keyStyle = "flex items-center justify-center px-4 py-1.5 bg-[#FFFFFF33] rounded-lg text-white font-bold text-sm md:text-base h-8";
    const keyTextStyle = "text-[#B3BEC1]";
    return (
        <div className="flex flex-col gap-2 text-sm md:text-base leading-1">
            <div className="flex flex-row items-center justify-between">
                <div className={keyTextStyle}>{translate("hot_key_place_bet")}:</div>
                <div className={keyStyle}>Space</div>
            </div>
            <div className="flex flex-row items-center justify-between">
                <div className={keyTextStyle}>{translate("hot_key_double_bet")}:</div>
                <div className={keyStyle}>D</div>
            </div>
            <div className="flex flex-row items-center justify-between">
                <div className={keyTextStyle}>{translate("hot_key_half_bet")}:</div>
                <div className={keyStyle}>S</div>
            </div>
            <div className="flex flex-row items-center justify-between">
                <div className={keyTextStyle}>{translate("hot_key_min_bet")}:</div>
                <div className={keyStyle}>A</div>
            </div>
            <div className="flex items-center gap-2 ">
                <input className="input-checkbox" type="checkbox" checked={isToggleHotKey} onChange={handleToggleHotKey} />
                <div className="font-semibold text-sm md:text-base text-white">
                    {isToggleHotKey ? translate("hot_key_enable") : translate("hot_key_disable")}
                </div>
            </div>
        </div>
    );
};

export default HotKeyModal;
