import { FC, useEffect } from "react";
import classNames from "classnames";
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
        const root = document.querySelector(":root") as HTMLElement;
        root.style.setProperty("--modal-container-height", `${globalThis.innerHeight}px`);
    }, [globalThis.innerHeight]);
    
    return (
        <BaseDialog type={ModalType.Full} enableBackdrop={true} isOverlap={isOverlap}>
            <div 
                id={id} 
                className={classNames(
                    "grid grid-cols-1 grid-rows-[30px_calc(100%-30px)] h-full w-full rounded-t-2xl",
                    {
                        "grid": isOpen,
                        "hidden": !isOpen
                    }
                )}
            >
                <div className="flex items-center px-5 text-base font-semibold text-white text-center">
                    {title}
                    <span
                        className="cursor-pointer ml-auto"
                        onClick={() => {
                            clickSound();
                            onCloseModal();
                        }}
                    >
                        <Image src="/static/images/icons/close.svg" className="w-4 h-4" alt="close" width={16} height={16} />
                    </span>
                </div>

                <div className={classNames("h-full", {
                    "h-[calc(var(--modal-container-height)-86px)]": isMobileOnly
                })}>
                    {children}
                </div>
            </div>
        </BaseDialog>
    );
};

export default ModalContainer;
