import React, { useState, useRef, useEffect } from "react";
import { cn } from "@shared/utils/merge-tailwind-util";

export const Tooltip: React.FC<{
    message: string;
    className?: string;
    classArrow?: string;
    children: React.ReactNode;
    touchDelay?: number;
}> = ({ message, className, classArrow, children, touchDelay = 500 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTouchDevice = useRef(false);

    useEffect(() => {
        isTouchDevice.current = "ontouchstart" in window || navigator.maxTouchPoints > 0;

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

    const clearTouchTimeout = () => {
        if (touchTimeoutRef.current) {
            clearTimeout(touchTimeoutRef.current);
            touchTimeoutRef.current = null;
        }
    };

    const handleTouchStart = () => {
        clearTouchTimeout();

        touchTimeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, touchDelay);
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
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={clearTouchTimeout}
            onTouchMove={clearTouchTimeout}
        >
            {children}
            <div
                ref={tooltipRef}
                className={cn(
                    `absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2993f5] text-white text-sm md:text-base px-3 py-2 rounded-lg whitespace-nowrap transition-opacity duration-300 pointer-events-none z-10`,
                    isVisible ? "opacity-100" : "opacity-0",
                    className
                )}
            >
                {message}
                <div
                    className={cn(
                        `absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#2993f5]`,
                        classArrow
                    )}
                ></div>
            </div>
        </div>
    );
};
export default Tooltip;
