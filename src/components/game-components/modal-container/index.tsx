import { FC, useEffect } from "react";

import { useClickSound } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { isMobileOnly } from "react-device-detect";
import Styles from "./modal-container.module.scss";

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
        const root: HTMLElement = document.querySelector(":root");
        root.style.setProperty("--modal-container-height", `${globalThis.innerHeight}px`);
    }, [globalThis.innerHeight]);
    return (
        <BaseDialog type={ModalType.Full} enableBackdrop={true} isOverlap={isOverlap}>
            <div id={id} className={`${Styles["modal-full"]} ${isOpen ? Styles["open"] : Styles["close"]}`}>
                <div className={`flex items-center px-5 ${Styles["title"]}`}>
                    {title}
                    <span
                        className="cursor-pointer ml-auto"
                        onClick={() => {
                            clickSound();
                            onCloseModal();
                        }}
                    >
                        <img src="/static/images/icons/close.svg" className="w-[16px] h-[16px]" alt="close" />
                    </span>
                </div>

                <div className={`${Styles["content"]} ${isMobileOnly ? Styles["mobile"] : ""}`}>{children}</div>
            </div>
        </BaseDialog>
    );
};

export default ModalContainer;
