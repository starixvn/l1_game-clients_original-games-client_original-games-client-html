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
    size = 48,
    fontSize = 18,
    isHideValue = false,
    className = "",
}) => {
    const selectedChip = useBettingStore((state) => state.selectedChip);

    const getChipClassName = () => {
        return `${Styles["chip-container"]} ${!isHideValue && selectedChip === value ? Styles["selected"] : ""} p-1/2 ${className}`;
    };

    const getDefaultChipText = () => {
        return value < 1000 ? value.toString() : `${value / 1000}K`;
    };
    const convertColorToBgLinearGradient = (hex: string) => {
        if (!hex || !hex.startsWith("#")) {
            hex = "#B3B3B3";
        }
        hex = hex.replace("#", "");

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const darkR = Math.round(r * 0.6);
        const darkG = Math.round(g * 0.6);
        const darkB = Math.round(b * 0.6);

        const brightR = Math.round(r * 1.3);
        const brightG = Math.round(g * 1.3);
        const brightB = Math.round(b * 1.3);

        return `linear-gradient(to top, 
            rgb(${darkR}, ${darkG}, ${darkB}) 0%, 
            rgb(${r}, ${g}, ${b}) 30%, 
            rgb(${r}, ${g}, ${b}) 70%, 
            rgb(${brightR}, ${brightG}, ${brightB}) 100%)`;
    };
    const renderColorChip = () => {
        const background = convertColorToBgLinearGradient(color);

        return <div className={`absolute w-full h-full rounded-full`} style={{ background: background }}></div>;
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
                <div className={`${Styles["border"]}`}></div>
                <div className={Styles["fill"]}></div>
                {!isHideValue && <span className={Styles["value"]}>{text || getDefaultChipText()}</span>}
            </div>
        </>
    );
};
