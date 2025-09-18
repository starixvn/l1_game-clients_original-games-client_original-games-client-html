import React, { useState, useRef, useEffect } from "react";
import { cn } from '@shared/utils/merge-tailwind-util';

export const Tooltip: React.FC<{
    message: string;
    className?: string;
    classArrow?: string;
    children: React.ReactNode;
}> = ({ message, className, classArrow, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Chỉ ẩn tooltip nếu click outside và tooltip đang hiển thị
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) && 
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsVisible(false);
            }
        };

        // Chỉ thêm event listener khi tooltip đang hiển thị
        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible]);

    const handleMouseEnter = () => {
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <div 
            ref={triggerRef}
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <div
                ref={tooltipRef}
                className={cn(
                    `absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2993f5] text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap transition-opacity duration-300 pointer-events-none z-10`,
                    isVisible ? 'opacity-100' : 'opacity-0',
                    className
                )}
            >
                {message}
                <div className={cn(`absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#2993f5]`, classArrow)}></div>
            </div>
        </div>
    );
};
export default Tooltip;
