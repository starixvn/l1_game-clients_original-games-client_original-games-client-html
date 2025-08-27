import React from "react";
import Styles from "./chip-slider.module.scss";
import useBettingStore from "../../../_shared/stores/betting-store/betting-store";

type ChipProps = {
    value: number;
    text: string;
    color: string;
    onClickChip?: Function;
    size?: number;
    fontSize?: number;
    isHideValue?: boolean;
    className?: string;
};

export const Chip: React.FC<ChipProps> = ({
    value,
    text,
    color,
    onClickChip = () => {},
    size = 46,
    fontSize = 18,
    isHideValue = false,
    className = "",
}) => {
    const selectedChip = useBettingStore((state) => state.selectedChip);

    const getChipClassName = () => {
        const isSelected = selectedChip === value;
        return `${Styles["chip-container"]} ${!isHideValue && isSelected} ${isSelected ? "md:scale-105" : ""} p-1/2
        transition-all duration-300 cursor-pointer md:hover:translate-y-[-3px] ${className}`;
    };

    const getDefaultChipText = () => {
        return value < 1000 ? value.toString() : `${value / 1000}K`;
    };

    const renderColorChip = () => {
        let bgColor = color;
        if (!bgColor || !bgColor.startsWith("#")) {
            bgColor = "#B3B3B3";
        }
        return <div className={`absolute w-full h-full rounded-full`} style={{ backgroundColor: bgColor }}></div>;
    };

    return (
        <>
            <div
                id={`chip-${value}`}
                key={value}
                className={getChipClassName()}
                onClick={() => onClickChip(value)}
                style={{ "--chip-size": `${size}px`, "--chip-value-font-size": `${fontSize}px` } as React.CSSProperties}
            >
                {renderColorChip()}
                <div className={Styles["inner"]}></div>
                <div className={`${Styles["border"]} ${value >= 1000 ? Styles["yellow-border"] : ""}`}></div>
                {selectedChip === value && <div className={`${Styles["selected"]}`}></div>}
                {!isHideValue && <span className={Styles["value"]}>{text || getDefaultChipText()}</span>}
            </div>
        </>
    );
};
