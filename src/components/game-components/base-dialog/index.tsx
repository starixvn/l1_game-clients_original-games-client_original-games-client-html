import React, { useEffect, useMemo, useRef } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";

import { useClickSound } from "../../../_shared/react-hooks";
import Styles from "./base-dialog.module.scss";
import { ModalType } from "./type";

const HeaderHeightInPixel = 55;

export type Props = {
    isOpen?: boolean;
    onCloseModal?: Function;
    children?: React.ReactNode;
    type?: ModalType;
    betContainerPosition?: number;
    enableBackdrop?: boolean;
    toggleBtnRef?: React.MutableRefObject<HTMLElement>;
    isBlockUI?: boolean;
    isOverlap?: boolean;
};

const getClassFollowDevice = () => {
    if (isMobileOnly) {
        return isIOS ? Styles["ios-device"] : Styles["android-device"];
    }
    return "";
};

const getCustomStyle = ({ betContainerPosition }) => {
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
}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const classModal = `modal-${ModalType[type].toLocaleLowerCase()}`;
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
    }, [wrapperRef]);

    return (
        <>
            {enableBackdrop && <div className={`overlay-mask ${Styles["overlay"]}`}></div>}
            <div
                style={getCustomStyle({ betContainerPosition })}
                ref={wrapperRef}
                className={`rounded-t-[12px] mt-10 ${Styles.popup} ${Styles[classModal]} ${isMobileOnly ? Styles["isMobile"] : ""} ${getClassFollowDevice()} ${
                    isIpad ? Styles["ipad"] : ""
                } ${isOpen ? "modal-open" : ""}`}
            >
                {children}
            </div>
        </>
    );
};

export default BaseDialog;
