import React from "react";
import Styles from "./chip-slider.module.scss";
import useBettingStore from '@shared/stores/betting-store/betting-store';
import { BgCachedImage } from "../cached-image/bg-cached-image";

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
        const isSelected = !isHideValue && selectedChip === value;
        return `${Styles["chip-container"]} ${isSelected ? "md:scale-105 md:translate-y-[-3px]" : ""} p-1/2
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
                <BgCachedImage
                    pathImage="/static/images/chips/chip.svg"
                    className="absolute w-full h-full rounded-full"
                    backgroundSize="100% 100%"
                    backgroundRepeat="no-repeat"
                    backgroundPosition="center"
                />
                <BgCachedImage
                    pathImage={`/static/images/chips/chip-${value >= 1000 ? "yellow-" : ""}border.svg`}
                    className="absolute w-full h-full rounded-full"
                    backgroundSize="100% 100%"
                    backgroundRepeat="no-repeat"
                    backgroundPosition="center"
                />
                {!isHideValue && selectedChip === value && <div className={`${Styles["selected"]}`}></div>}
                {!isHideValue && <span className={Styles["value"]}>{text || getDefaultChipText()}</span>}
            </div>
        </>
    );
};
