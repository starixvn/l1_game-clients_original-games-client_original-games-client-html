import React from "react";

interface PercentageControlProps {
    isIncreaseOn: boolean;
    setIsIncreaseOn: (isIncreaseOn: boolean) => void;
    percentage: number;
    setPercentage: (percentage: number) => void;
    isDisabled: boolean;
}

export const PercentageControl: React.FC<PercentageControlProps> = ({
    isIncreaseOn,
    setIsIncreaseOn,
    percentage,
    setPercentage,
    isDisabled,
}) => {
    const buttons = [
        {
            text: "Reset",
            value: false,
        },
        {
            text: "Increase by",
            value: true,
        },
    ];
    return (
        <div className="flex flex-row gap-2">
            <div className="flex flex-1 items-center input p-1 gap-1 rounded-lg h-11">
                {buttons.map((button) => (
                    <button
                        key={`button-${button.text}`}
                        className="inline-flex items-center justify-center whitespace-nowrap px-3 transition-all disabled:pointer-events-none disabled:opacity-40 focus-visible:!outline-none focus-visible:!outline-0 
                            rounded-lg flex-1 text-sm aria-pressed:bg-[#2a4770] h-full disabled:opacity-50"
                        onClick={() => setIsIncreaseOn(button.value)}
                        aria-pressed={isIncreaseOn === button.value}
                        disabled={isDisabled}
                    >
                        {button.text}
                    </button>
                ))}
            </div>
            <div className="flex-1 relative">
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={percentage}
                    onChange={(e) => setPercentage(parseInt(e.target.value))}
                    onBlur={() => setPercentage(percentage || 0)}
                    inputMode="numeric"
                    disabled={!isIncreaseOn || isDisabled}
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11 disabled:opacity-50"
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
    );
};
