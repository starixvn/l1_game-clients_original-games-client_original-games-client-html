/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";

type Props = {
    isOpen: boolean;
    onClose: Function;
    children: React.ReactNode;
};

export const ContainerToolTip: React.FC<Props> = ({ isOpen, onClose, children }) => {
    const innerTooltipRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && tooltipRef && tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && innerTooltipRef) {
            const screenWidth = window.innerWidth;
            const wrapperRect = tooltipRef.current.getBoundingClientRect();
            const innerTooltip = innerTooltipRef.current;
            let customTranslateX = "-50%";

            if (wrapperRect.right + 60 > screenWidth) {
                customTranslateX = `${screenWidth - wrapperRect.right - innerTooltip.getBoundingClientRect().width - 10}px`;
            }

            if (wrapperRect.left - 50 < 0) {
                customTranslateX = `${5 - wrapperRect.left - wrapperRect.width / 2}px`;
            }

            innerTooltip.setAttribute("style", `position: absolute; transform: translateX(${customTranslateX})`);
        }
    }, [innerTooltipRef.current]);

    return (
        <div className={`tooltip mini-round-history ${isOpen ? "show" : ""}`} ref={tooltipRef} data-testid="tooltip">
            <div ref={innerTooltipRef} className="tooltip-inner" data-testid="tooltip-inner">
                {children}
            </div>
            <div className="arrow down"></div>
        </div>
    );
};
