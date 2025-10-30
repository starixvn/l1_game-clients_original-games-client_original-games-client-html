import { FC, ReactNode } from "react";
import Styles from "../provably-fair.module.scss";

interface ToggleSectionProps {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

const ToggleSection: FC<ToggleSectionProps> = ({ title, isExpanded, onToggle, children, className = "", contentClassName = "" }) => {
    return (
        <div className={`rounded-[12px] bg-[#2A4770]  transition-all duration-300 ease-in-out ${className} ${isExpanded ? "h-full" : ""}`}>
            <div className={`flex flex-row  p-2 justify-between items-center rounded-t-[12px] cursor-pointer`} onClick={onToggle}>
                <h3 className={Styles["section-title"]}>{title}</h3>
                <span className="bg-[#3F5F8D] rounded-md p-1 flex justify-center items-center w-[32px] h-[32px]">
                    <i className={`icon-back w-4 h-4 transition-transform ${isExpanded ? "rotate-270" : "rotate-180"}`}></i>
                </span>
            </div>
            {isExpanded && (
                <div className={`${Styles["section-content"]} bg-[#191a1e] rounded-b-[12px] ${contentClassName}`}>{children}</div>
            )}
        </div>
    );
};

export default ToggleSection;
