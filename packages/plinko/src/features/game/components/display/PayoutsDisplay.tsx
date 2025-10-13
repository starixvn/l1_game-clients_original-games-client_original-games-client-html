import React from "react";
import PayoutTooltip from "./payout-tooltip";
import { getMultiplierColor } from "@plinko/lib/utils/colors-util";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import styled from "./tooltip.module.scss";
interface PayoutsDisplayProps {
    multipliers: number[];
    probabilities: number[];
    betAmount: number;
    rows: number;
    className?: string;
}

const PayoutsDisplay: React.FC<PayoutsDisplayProps> = ({ multipliers, probabilities, betAmount, rows, className = "" }) => {
    const gameMode = usePlinkoGameStore((state) => state.gameMode);

    // Calculate estimated win for a slot
    const calculateWin = (multiplier: number): number => {
        return betAmount * multiplier;
    };

    if (!multipliers || multipliers.length === 0) {
        return (
            <div className="flex gap-2">
                <div style={{ color: "white", padding: "10px", fontSize: "12px" }}>Loading payouts...</div>
            </div>
        );
    }

    const rowClass = styled[`row${rows}`];
    const xSpanClass = styled[`x-span`];
    
    return (
        <div className={styled.payoutsDisplay}>
            <div className={`flex justify-between py-0 ${rowClass}`}
             style={{ 
                boxSizing: "border-box", }}>
                {multipliers.map((multiplier, index) => {
                    const probability = probabilities[index];
                    const winAmount = calculateWin(multiplier);

                    return (
                        <PayoutTooltip
                            key={`payout-${rows}-${index}`}
                            index={index}
                            winAmount={winAmount}
                            probability={probability}
                            totalItems={multipliers.length}
                        >
                            <div
                                className={`left-0absolute h-full w-full rounded-[6px] flex items-center justify-center cursor-pointer`}
                                style={{
                                    backgroundColor: getMultiplierColor(index, gameMode, rows),
                                }}
                            >
                                <span className={`${xSpanClass} text-white font-bold`}>{multiplier.toFixed(2)}</span>
                            </div>
                        </PayoutTooltip>
                    );
                })}
            </div>
        </div>
    );
};

export default PayoutsDisplay;
