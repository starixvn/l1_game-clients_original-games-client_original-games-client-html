import React, { useEffect, useRef, useState } from "react";
import PayoutTooltip from "./payout-tooltip";
import { getMultiplierColor } from "@plinko/lib/utils/colors-util";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
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

    // Format probability as percentage
    const formatProbability = (probability: number): string => {
        return (probability * 100).toFixed(1);
    };

    if (!multipliers || multipliers.length === 0) {
        return (
            <div className="flex gap-2">
                <div style={{ color: "white", padding: "10px", fontSize: "12px" }}>Loading payouts...</div>
            </div>
        );
    }

    return (
        <div className="absolute bottom-[120px] left-[50%] translate-x-[-50%] z-[1000]">
            <div className="flex gap-2">
                {multipliers.map((multiplier, index) => {
                    const probability = probabilities[index] || 0;
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
                                className={`w-[45px] h-[40px] rounded-[6px] flex items-center justify-center cursor-pointer`}
                                style={{
                                    backgroundColor: getMultiplierColor(index, gameMode, rows),
                                }}
                            >
                                <div className="text-white text-sm font-bold">{multiplier.toFixed(2)}</div>
                            </div>
                        </PayoutTooltip>
                    );
                })}
            </div>
        </div>
    );
};


export default PayoutsDisplay;
