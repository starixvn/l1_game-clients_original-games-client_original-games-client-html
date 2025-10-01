import React from "react";

interface PercentageControlProps {
    isIncreaseOn: boolean;
    setIsIncreaseOn: (isIncreaseOn: boolean) => void;
    percentage: number;
    setPercentage: (percentage: number) => void;
}

const PercentageControl: React.FC<PercentageControlProps> = ({ isIncreaseOn, setIsIncreaseOn, percentage, setPercentage }) => {
    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="col-span-1 flex items-center input p-1 gap-1 rounded-lg h-11">
                <button
                    className="inline-flex items-center justify-center whitespace-nowrap px-3 transition-all disabled:pointer-events-none disabled:opacity-40 focus-visible:!outline-none focus-visible:!outline-0 
                            rounded-lg flex-1 text-sm aria-pressed:bg-[#2a4770] h-full"
                    onClick={() => setIsIncreaseOn(false)}
                    aria-pressed={!isIncreaseOn}
                >
                    Reset
                </button>
                <button
                    className="inline-flex items-center justify-center whitespace-nowrap px-3 transition-all disabled:pointer-events-none disabled:opacity-40 focus-visible:!outline-none focus-visible:!outline-0 
                            rounded-lg flex-1 text-sm aria-pressed:bg-[#2a4770] h-full"
                    onClick={() => setIsIncreaseOn(true)}
                    aria-pressed={isIncreaseOn}
                >
                    Increase by
                </button>
            </div>
            <div className="col-span-1 relative">
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={percentage}
                    onChange={(e) => setPercentage(parseInt(e.target.value))}
                    onBlur={() => setPercentage(percentage || 0)}
                    inputMode="numeric"
                    disabled={!isIncreaseOn}
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

export default PercentageControl;
