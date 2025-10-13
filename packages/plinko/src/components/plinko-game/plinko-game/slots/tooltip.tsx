import React, { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@shared/utils/merge-tailwind-util";
import { useTranslate } from "@tolgee/react";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { numberWithCommas } from "@shared";

interface TooltipProps {
    children: React.ReactNode;
    index: number;
    totalItems: number;
    odds: number;
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, index, totalItems, odds, className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTouchDevice = useRef(false);

    const { betAmount, numberOfRows } = usePlinkoGameStore(
        useShallow((state) => ({ betAmount: state.betAmount, numberOfRows: state.numberOfRows }))
    );
    const { t } = useTranslate();

    const probability = useMemo(() => {
        const binomial = (n: number, k: number) => {
            if (k > n) { return 0; }
            let result = 1;
            for (let i = 0; i < k; i++) {
                result *= (n - i) / (i + 1);
            }
            return result;
        };
        return binomial(numberOfRows, index) / Math.pow(2, numberOfRows);
    }, [numberOfRows, index]);

    const winAmount = betAmount * odds;

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
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
        >
            {children}

            {isVisible && (
                <>
                    <div
                        ref={tooltipRef}
                        className={cn(
                            "absolute bottom-[34px] left-0 flex flex-row gap-3 w-[266px] bg-gradient-to-b from-[#093B77] to-[#031122] text-white text-xs px-3 py-2 rounded-lg shadow-lg transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap",
                            className
                        )}
                        style={{
                            transform: `translateX(${Math.max((-index * 100) / totalItems, -80)}%)`,
                        }}
                    >
                        <div className="text-start">
                            <div className="font-semibold text-sm mb-1">{t("win")}</div>
                            <div className="border-[1px] border-[#2B3648] bg-[#101721] h-[36px] w-[130px] rounded-[8px] px-2 py-1 flex items-center justify-start">
                                ${numberWithCommas(winAmount)}
                            </div>
                        </div>
                        <div className="text-start">
                            <div className="font-semibold text-sm mb-1">{t("probability")}</div>
                            <div className="border-[1px] border-[#2B3648] bg-[#101721] h-[36px] w-[100px] rounded-[8px] px-2 py-1 flex items-center justify-start">
                                {numberWithCommas(probability * 100, 4)}%
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#031122]" />
                </>
            )}
        </div>
    );
};

export default Tooltip;
