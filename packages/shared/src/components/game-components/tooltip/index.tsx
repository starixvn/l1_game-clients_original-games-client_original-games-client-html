import React from "react";
import { cn } from "../../../_shared/utils/merge-tailwind-util";

export const Tooltip: React.FC<{
    message: string;
    className?: string;
    classArrow?: string;
}> = ({ message, className, classArrow }) => {
    return (
        <div
            className={cn(`absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2993f5] text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10`, className)}
        >
            {message}
            <div className={cn(`absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#2993f5]`, classArrow)}></div>
        </div>
    );
};
export default Tooltip;
