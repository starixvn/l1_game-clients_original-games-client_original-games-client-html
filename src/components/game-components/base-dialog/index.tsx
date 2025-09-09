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
    const style = { scale: "var(--scale-factor, 1)", transformOrigin: "top" };
    const browserHeight = window.innerHeight;

    if (betContainerPosition != null) {
        return browserHeight / betContainerPosition > 2
            ? { top: `${betContainerPosition}px`, ...style }
            : { bottom: `${browserHeight - betContainerPosition + HeaderHeightInPixel}px`, top: "auto", ...style };
    }

    return style;
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
        const className = "overflow-hidden";
        if (enableBackdrop) {
            document.getElementById("dashboard")?.classList.add(className);
            document.body.classList.add(className);
            isMobileOnly && document.documentElement.classList.add(className);
        }

        return () => {
            document.body.classList.remove(className);
            if (enableBackdrop && !isOverlap) {
                document.getElementById("dashboard")?.classList.remove(className);
                isMobileOnly && document.documentElement.classList.remove(className);
            }
        };
    }, [enableBackdrop, isOverlap]);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (isOpen && !wrapperRef?.current?.contains(event.target) && !toggleBtnRef?.current?.contains(event.target)) {
                clickSound();
                onCloseModal?.();
            }
        };
        !isBlockUI && document.addEventListener("mousedown", handleClickOutside);
        return () => {
            !isBlockUI && document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef, isOpen, onCloseModal, clickSound, isBlockUI, toggleBtnRef]);

    const animationClasses = cn(
        isOpen
          ? (type === ModalType.Center || type === ModalType.Full
              ? "block animate-showBottom"
              : "block animate-showPopup")
          : (type === ModalType.Center || type === ModalType.Full
              ? "hidden animate-hideBottom"
              : "hidden animate-hidePopup")
      );
    

    return (
        <>
            {enableBackdrop && (
                <div className={cn("fixed inset-0 top-[-8px] z-[300] bg-black/40", type === ModalType.Rebet && "md:hidden")} />
            )}

            <div
                style={getCustomStyle({ betContainerPosition })}
                ref={wrapperRef}
                className={cn(
                    "absolute cursor-auto p-4 text-popup-text z-[301] rounded-t-xl md:rounded-b-xl",
                    type === ModalType.Full && "fixed inset-x-0 top-4 bottom-0 pl-0 pr-0 z-[300] bg-popup-gradient",
                    type === ModalType.Rebet && "fixed bg-popup-gradient md:absolute md:right-[50%] md:bottom-0",
                    type === ModalType.Center && "bg-transparent border-none shadow-none p-0 rounded-none fixed inset-0 top-0",
                    type === ModalType.Message && "rounded-md p-0 left-1 right-1 shadow-none",
                    type === ModalType.Toast && "h-full",
                    isIpad && "pb-[69px]",
                    animationClasses,
                    extendedClassName
                )}
            >
                <div className="h-full flex flex-col">{children}</div>
            </div>
        </>
    );
};

export default BaseDialog;
