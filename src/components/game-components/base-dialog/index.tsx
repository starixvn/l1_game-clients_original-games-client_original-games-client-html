import React, { useEffect, useMemo, useRef } from "react";
import { isMobileOnly } from "react-device-detect";

import { useClickSound } from "../../../_shared/react-hooks";
import { ModalType } from "./type";
import { cn } from "../../../_shared/utils/merge-tailwind-util";

const HeaderHeightInPixel = 55;

export type Props = {
    isOpen?: boolean;
    onCloseModal?: Function | null;
    children?: React.ReactNode;
    type?: ModalType;
    betContainerPosition?: number;
    enableBackdrop?: boolean;
    toggleBtnRef?: React.MutableRefObject<HTMLElement>;
    isBlockUI?: boolean;
    isOverlap?: boolean;
    extendedClassName?: string;
};

const getCustomStyle = ({ betContainerPosition }: { betContainerPosition?: number }) => {
    const browserHeight = window.innerHeight;

    if (betContainerPosition != null) {
        return browserHeight / betContainerPosition > 2
            ? { top: `${betContainerPosition}px` }
            : { bottom: `${browserHeight - betContainerPosition + HeaderHeightInPixel}px`, top: "auto" };
    }

    return {};
};

const BaseDialog: React.FC<Props> = ({
    children,
    onCloseModal = null,
    isOpen = true,
    type = ModalType.Full,
    betContainerPosition,
    enableBackdrop,
    toggleBtnRef,
    isBlockUI,
    isOverlap = false,
    extendedClassName = "",
}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const clickSound = useClickSound();
    const isIpad = useMemo(() => /iPad/i.test(navigator.userAgent), []);

    useEffect(() => {
        const classList = ["overflow-hidden", "md:overflow-auto"];
        if (enableBackdrop) {
            document.getElementById("dashboard")?.classList.add(...classList);
            document.body.classList.add(...classList);
            isMobileOnly && document.documentElement.classList.add(...classList);
        }

        return () => {
            if (enableBackdrop && !isOverlap) {
                document.body.classList.remove(...classList);
                document.getElementById("dashboard")?.classList.remove(...classList);
                isMobileOnly && document.documentElement.classList.remove(...classList);
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (isOpen && !wrapperRef?.current?.contains(event.target) && !toggleBtnRef?.current?.contains(event.target)) {
                clickSound();
                onCloseModal && onCloseModal();
            }
        };
        !isBlockUI && document.addEventListener("mousedown", handleClickOutside);
        return () => {
            !isBlockUI && document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef, isOpen, onCloseModal, clickSound, isBlockUI, toggleBtnRef]);

    return (
        <>
            {enableBackdrop && (
                <div className={cn("fixed inset-0 top-[-8px] z-[300] bg-black/40", type === ModalType.Rebet && "md:hidden")} />
            )}

            <div
                style={getCustomStyle({ betContainerPosition })}
                ref={wrapperRef}
                className={cn(
                    "absolute cursor-auto p-4 text-popup-text z-[301] rounded-t-xl",
                    type === ModalType.Full && "fixed inset-x-0 top-4 bottom-0 pl-0 pr-0 z-[300] bg-popup-gradient",
                    type === ModalType.Rebet && "fixed bg-popup-gradient md:absolute md:right-[50%] md:bottom-0",
                    type === ModalType.Center && "h-full",
                    type === ModalType.Message && "rounded-md p-0 left-1 right-1 shadow-none",
                    isIpad && "pb-[69px]",
                    isOpen ? "block" : "hidden",
                    extendedClassName
                )}
            >
                <div className="h-full flex flex-col">{children}</div>
            </div>
        </>
    );
};

export default BaseDialog;
