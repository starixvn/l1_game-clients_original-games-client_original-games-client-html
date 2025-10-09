import React, { useState, useRef, useEffect } from "react";
import { cn } from "@shared/utils/merge-tailwind-util";
import { useTranslate } from "@tolgee/react";

interface PayoutTooltipProps {
    children: React.ReactNode;
    winAmount: number;
    probability: number;
    index: number;
    totalItems: number;
    className?: string;
}

const PayoutTooltip: React.FC<PayoutTooltipProps> = ({ children, winAmount, probability, index, totalItems, className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTouchDevice = useRef(false);

    const {t} = useTranslate();

    useEffect(() => {
        isTouchDevice.current = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsVisible(false);
            }
        };

        if (isVisible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isVisible]);

    const handleMouseEnter = () => {
        if (!isTouchDevice.current) {
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isTouchDevice.current) {
            setIsVisible(false);
        }
    };

    const handleTouchStart = () => {
        if (touchTimeoutRef.current) {
            clearTimeout(touchTimeoutRef.current);
        }

        touchTimeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, 300);
    };

    const handleTouchEnd = () => {
        if (touchTimeoutRef.current) {
            clearTimeout(touchTimeoutRef.current);
            touchTimeoutRef.current = null;
        }
    };

    const handleTouchMove = () => {
        if (touchTimeoutRef.current) {
            clearTimeout(touchTimeoutRef.current);
            touchTimeoutRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (touchTimeoutRef.current) {
                clearTimeout(touchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={triggerRef}
            className="relative flex flex-1 items-center justify-center  mr-[1px]  p-[2px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
        >
            {children}

            {/* Simple Tooltip */}
            {isVisible && (
                <>
                    <div
                        ref={tooltipRef}
                        className={cn(
                            "absolute flex flex-row gap-3 left-0 bottom-full w-[266px] bg-gradient-to-b from-[#093B77] to-[#031122] text-white text-xs px-3 py-2 rounded-lg shadow-lg transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap",
                            className
                        )}
                        style={{
                            transform: `translateX(${Math.max((-index * 100) / totalItems, -80)}%)`,
                        }}
                    >
                        <div className="text-start">
                            <div className="font-semibold text-sm mb-1">{t("win")}</div>
                            <div className="border-[1px] border-[#2B3648] bg-[#101721] h-[36px] w-[130px] rounded-[8px] px-2 py-1 flex items-center justify-start">${winAmount.toLocaleString()}</div>
                        </div>
                        <div className="text-start">
                            <div className="font-semibold text-sm mb-1">{t("probability")}</div>
                            <div className="border-[1px] border-[#2B3648] bg-[#101721] h-[36px] w-[100px] rounded-[8px] px-2 py-1 flex items-center justify-start">{(probability * 100).toFixed(2)}%</div>
                        </div>

                        {/* Arrow luôn ở chính giữa */}
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#031122]" />
                </>
            )}
        </div>
    );
};

export default PayoutTooltip;
