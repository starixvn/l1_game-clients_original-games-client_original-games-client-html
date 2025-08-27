/* eslint-disable @next/next/no-img-element */
import React, { useContext } from "react";
import { buildVersion } from "../../../_shared/constants";
import { URLContext } from "../../../_shared/react-contexts";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import PopupButton from "../popup-button";

const DisabledModal: React.FC<{ disableMessage: string }> = ({ disableMessage }) => {
    const { t } = useCommonTranslate();
    const { backToRedirectUrl, redirectUrl } = useContext(URLContext);
    const showOkButton = !!redirectUrl;

    const handleOkClick = () => {
        backToRedirectUrl?.(redirectUrl);
    };

    return (
        <BaseDialog type={ModalType.Center} isOpen={true} enableBackdrop={true}>
            <div
                className={cn(
                    "absolute text-center py-4 px-3 rounded-2xl text-sm left-1/2 transform -translate-x-1/2 min-w-[300px] font-normal",
                    "top-1/2 z-modal overflow-hidden",
                    "bg-modal-gradient border border-modal-border-color shadow-modal-new",
                    "before:content-[''] before:block before:absolute before:-top-[100px] before:-left-[100px] before:w-[240px] before:h-[240px] before:rounded-[240px] before:bg-modal-yellow-bg before:opacity-70"
                )}
            >
                <div className="relative mx-auto mb-5 w-[50px]">
                    <img className="animate-spin-slow" src={`/static/images/um-setting-big.svg?v=${buildVersion}`} alt="setting-um" />
                    <img
                        className="absolute top-[26px] right-0 animate-spin-slow-reverse"
                        src={`/static/images/um-setting-small.svg?v=${buildVersion}`}
                        alt="setting-um"
                    />
                </div>
                <div className="font-normal text-[#E6E6E6] text-sm leading-6 tracking-[0.28px] mt-2 ">
                    {disableMessage || t({ key: "message_disabled_game" })}
                </div>
                <div className="mt-4">
                    {showOkButton && (
                        <PopupButton 
                            onClick={handleOkClick} 
                            className="active:bg-btn-green-hover active:bg-[length:100%]"
                            label={t({ key: "ok" })}
                        />
                    )}
                </div>
            </div>
        </BaseDialog>
    );
};

export default DisabledModal;
