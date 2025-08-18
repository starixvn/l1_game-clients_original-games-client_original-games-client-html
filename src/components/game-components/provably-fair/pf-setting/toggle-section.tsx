import { FC, ReactNode } from "react";
import Styles from "../provably-fair.module.scss";

interface ToggleSectionProps {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: ReactNode;
    className?: string;
}

const MAX_HEIGHT_EXPANDED = "max-h-[1000px]";
const MAX_HEIGHT_COLLAPSED = "max-h-[50px]";

const ToggleSection: FC<ToggleSectionProps> = ({ 
    title, 
    isExpanded, 
    onToggle, 
    children, 
    className = "" 
}) => {

    return (
        <div
            className={`rounded-[12px] overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? MAX_HEIGHT_EXPANDED : MAX_HEIGHT_COLLAPSED
            } ${className}`}
        >
            <div
                className={`flex flex-row bg-[#2A4770] p-2 justify-between items-center rounded-t-[12px] cursor-pointer`}
                onClick={onToggle}
            >
                <h3 className={Styles["section-title"]}>{title}</h3>
                <span className="bg-[#3F5F8D] rounded-md p-1 flex justify-center items-center w-[32px] h-[32px]">
                    <img
                        src="/static/images/icons/chevron-right.svg"
                        className={`w-[16px] h-[16px] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        alt="chevron-right"
                    />
                </span>
            </div>
            {isExpanded && (
                <div className={`${Styles["section-content"]} bg-[#191a1e] rounded-b-[12px]`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default ToggleSection; 