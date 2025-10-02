import React from "react";
import { Label } from "./label";

export const BetAmountControl = ({ betAmount, onBetAmountChange }: { betAmount: number; onBetAmountChange: (amount: number) => void }) => {
    // todo: min max bet amount
    return (
        <div>
            <Label title="Bet Amount" />
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
                        onClick={() => onBetAmountChange(betAmount / 2)}
                    >
                        1/2
                    </button>
                    <button
                        className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg"
                        onClick={() => onBetAmountChange(betAmount * 2)}
                    >
                        2x
                    </button>
                    <button className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg" onClick={() => onBetAmountChange(3000)}>
                        Max
                    </button>
                </div>
            </div>
        </div>
    );
};
