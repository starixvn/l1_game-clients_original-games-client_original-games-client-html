/* eslint-disable @next/next/no-img-element */
import React, { useContext } from "react";
import { URLContext } from '@shared/react-contexts';
import { useClickSound, useCommonTranslate } from '@shared/react-hooks';
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { cn } from '@shared/utils/merge-tailwind-util';
import PopupButton from "../popup-button";
import Image from "next/image";

const DisabledModal: React.FC<{ disableMessage: string }> = ({ disableMessage }) => {
    const { t } = useCommonTranslate();
    const clickSound = useClickSound();
    const { backToRedirectUrl, redirectUrl } = useContext(URLContext);
    const showOkButton = !!redirectUrl;

    const handleOkClick = () => {
        clickSound();
        backToRedirectUrl?.(redirectUrl);
    };

    return (
        <BaseDialog type={ModalType.Center} isOpen={true} enableBackdrop={true}>
            <div
                className={cn(
                    "absolute text-center py-4 px-3 rounded-2xl text-sm left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-[343px] font-normal",
                    "bottom-1/2 translate-y-1/2 z-modal overflow-hidden",
                    "bg-modal-bg border border-modal-border-color shadow-modal",
                )}
            >
                <Image src={`/static/images/icons/popup-mask.svg`} alt="popup-mask" className="absolute top-[-65px] left-[-74px]" width={212} height={212} />
                <div className="relative mx-auto mb-5 w-[45px] h-[41px] md:w-[70px] md:h-[70px]">
                    <Image className="animate-spin-slow md:w-[50px] md:h-[50px]" src={`/static/images/um-setting-big.svg`} alt="setting-um" width={30} height={30} />
                    <Image
                        className="absolute top-[35px] right-0 animate-spin-slow-reverse md:w-[35px] md:h-[35px]"
                        src={`/static/images/um-setting-small.svg`}
                        alt="setting-um"
                        width={20}
                        height={20}
                    />
                </div>
                <div className="font-normal text-modal-text text-sm md:text-base leading-6 tracking-[0.28px] mt-2 md:mt-3">
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
