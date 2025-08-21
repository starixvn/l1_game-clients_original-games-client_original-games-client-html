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
    extendedClassName = "rounded-t-[12px] mt-12",
}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const clickSound = useClickSound();
    const isIpad = useMemo(() => /iPad/i.test(navigator.userAgent), []);

    useEffect(() => {
        if (enableBackdrop) {
            document.getElementById("dashboard")?.classList.add("no-scroll");
            document.body.classList.add("no-scroll");
            isMobileOnly && document.documentElement.classList.add("no-scroll-html");
        }

        return () => {
            if (enableBackdrop && !isOverlap) {
                document.body.classList.remove("no-scroll");
                document.getElementById("dashboard")?.classList.remove("no-scroll");
                isMobileOnly && document.documentElement.classList.remove("no-scroll-html");
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
            {enableBackdrop && <div className="fixed inset-0 top-[-8px] z-[300] bg-black/40" />}

            <div
                style={getCustomStyle({ betContainerPosition })}
                ref={wrapperRef}
                className={cn(
                    "absolute cursor-auto p-4 text-popup-text z-[301] rounded-t-md",
                    type === ModalType.Full && "fixed inset-x-0 top-4 bottom-0 pl-0 pr-0 z-[300] bg-popup-gradient",
                    type === ModalType.Rebet && "top-[47px] left-10 right-10",
                    type === ModalType.Center && "bg-transparent border-none shadow-none p-0 rounded-none static",
                    type === ModalType.Message && "rounded-md p-0 left-1 right-1 shadow-none",
                    isIpad && "pb-[69px]",
                    isOpen ? "block" : "hidden",
                    extendedClassName
                )}
            >
                <div className="h-full flex flex-col">
                    {children}
                </div>
            </div>
        </>
    );
};

export default BaseDialog;
