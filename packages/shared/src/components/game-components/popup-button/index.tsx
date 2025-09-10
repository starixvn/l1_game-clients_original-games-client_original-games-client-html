import React from "react";
import { cn } from '@shared/utils/merge-tailwind-util';

interface PopupButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    label: string;
    onClick?: () => void;
}

const PopupButton: React.FC<PopupButtonProps> = ({ label, className, onClick, ...props }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "font-inherit relative inline-block min-w-[100px] px-9 py-3 border-none shadow-[0px 10px 10px rgba(95, 90, 247, 0.03)]",
                "bg-center transition-all duration-800 text-center rounded-xl text-white text-xs font-semibold",
                "bg-btn-green hover:enabled:bg-btn-green-hover-bg hover:enabled:cursor-pointer",
                "disabled:opacity-60",
                "transition-all duration-300 cursor-pointer hover:scale-110",
                "md:text-base",
                className
            )}
            {...props}
        >
            {label}
        </button>
    );
};

export default PopupButton;
