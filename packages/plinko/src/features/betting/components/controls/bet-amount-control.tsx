import React from "react";
import { BetAmountControlsProps } from "../../../../shared/types";
import { BET_CONFIG } from "./bet-config";

const BetAmountControls: React.FC<BetAmountControlsProps> = ({ betAmount, onBetAmountChange }) => {
    return (
        <div>
            <div className="text-sm md:text-base mb-2 font-semibold">Bet Amount</div>
            <div className="relative">
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={betAmount}
                    onChange={(e) => onBetAmountChange(parseInt(e.target.value))}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                        className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg"
                        onClick={() => onBetAmountChange(Math.max(BET_CONFIG.MIN_BET, betAmount / 2))}
                    >
                        1/2
                    </button>
                    <button
                        className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg"
                        onClick={() => onBetAmountChange(Math.min(BET_CONFIG.MAX_BET, betAmount * 2))}
                    >
                        2x
                    </button>
                    <button
                        className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg"
                        onClick={() => onBetAmountChange(BET_CONFIG.MAX_BET)}
                    >
                        Max
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BetAmountControls;
