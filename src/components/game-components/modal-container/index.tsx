import { FC, useEffect } from "react";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import Image from "next/image";

import { useClickSound } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { isMobileOnly } from "react-device-detect";

const ModalContainer: FC<{
    id?: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    onCloseModal: Function;
    isOpen: boolean;
    isOverlap?: boolean;
}> = ({ title, children, onCloseModal, isOpen, isOverlap, id }) => {
    const clickSound = useClickSound();
    useEffect(() => {
        const root = document.querySelector(":root");
        if (root && root instanceof HTMLElement) {
            root.style.setProperty("--modal-container-height", `${globalThis.innerHeight}px`);
        }
    }, [globalThis.innerHeight]);
    
    return (
        <BaseDialog type={ModalType.Full} enableBackdrop={true} isOverlap={isOverlap}>
            <div 
                id={id} 
                className={cn(
                    "grid grid-cols-1 grid-rows-[30px_calc(100%-30px)] h-full w-full rounded-t-2xl",
                    {
                        "grid": isOpen,
                        "hidden": !isOpen
                    }
                )}
            >
                <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center my-2">
                    <div className="flex flex-1 items-center justify-center font-semibold text-[18px] leading-8">
                        {title}
                    </div>
                    <span
                        className="cursor-pointer ml-auto relative z-10"
                        onClick={() => {
                            clickSound();
                            onCloseModal();
                        }}
                    >
                        <Image src="/static/images/icons/close.svg" className="w-4 h-4" alt="close" width={16} height={16} />
                    </span>
                </div>

                <div className={cn("h-full", {
                    "h-[calc(var(--modal-container-height)-86px)]": isMobileOnly
                })}>
                    {children}
                </div>
            </div>
        </BaseDialog>
    );
};

export default ModalContainer;
