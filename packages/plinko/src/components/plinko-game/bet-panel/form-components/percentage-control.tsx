import React, { memo } from "react";
import Label from "./label";
import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import IconInfoPercentageControl from "./icon-info-percentage-control";

interface PercentageControlProps {
    isIncreaseOn: boolean;
    setIsIncreaseOn: (isIncreaseOn: boolean) => void;
    percentage: number;
    setPercentage: (percentage: number) => void;
    isDisabled: boolean;
    title: string;
    type: "on_win" | "on_loss";
}
const buttons = [
    {
        text: "reset",
        value: false,
    },
    {
        text: "increase_by",
        value: true,
    },
];
const PercentageControl: React.FC<PercentageControlProps> = ({
    isIncreaseOn,
    setIsIncreaseOn,
    percentage,
    setPercentage,
    isDisabled,
    title,
    type,
}) => {
    const { t } = useCommonTranslate();
    const clickSound = useClickSound();
    const onClick = (value: boolean) => {
        clickSound();
        setIsIncreaseOn(value);
        setPercentage(0);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.abs(Number(Number.parseFloat(e.target.value || "0").toFixed(2)));
        const maxValue = 10000;
        setPercentage(Math.min(value, maxValue));
    };

    return (
        <div>
            <div className="flex gap-2 relative">
                <Label title={title} />
                <IconInfoPercentageControl type={type} />
            </div>
            <div className="flex flex-row gap-2">
                <div className="flex flex-1 items-center input p-1 gap-1 rounded-lg h-11">
                    {buttons.map((button) => (
                        <button
                            key={`button-${button.text}`}
                            className="inline-flex items-center justify-center whitespace-nowrap px-3 transition-all disabled:pointer-events-none disabled:opacity-40 focus-visible:!outline-none focus-visible:!outline-0 
                            rounded-lg flex-1 text-sm aria-pressed:bg-[#2a4770] h-full"
                            onClick={() => onClick(button.value)}
                            aria-pressed={isIncreaseOn === button.value}
                            disabled={isDisabled}
                        >
                            {t(button.text)}
                        </button>
                    ))}
                </div>
                <div className="flex-1 relative">
                    <input
                        type="number"
                        step={0.01}
                        value={percentage?.toString() || "0"}
                        onChange={onChange}
                        disabled={!isIncreaseOn || isDisabled}
                        className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11 disabled:opacity-50 pr-6"
                    />
                    <span
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white transition-all duration-200 ${
                            !isIncreaseOn ? "opacity-50" : ""
                        }`}
                    >
                        %
                    </span>
                </div>
            </div>
        </div>
    );
};

export default memo(PercentageControl);
