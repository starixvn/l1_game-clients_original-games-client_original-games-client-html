import { getMultiplierColor } from "@/lib/utils/colors-util";
import { cn } from "@shared";
import React from "react";
import { PlinkoRound } from "./round-multiplier-history";


interface RoundMultiplierItemProps {
    round: PlinkoRound;
    className?: string;
}

const RoundMultiplierItem: React.FC<RoundMultiplierItemProps> = ({ round, className = "" }) => {
    const bgColor = getMultiplierColor(round.settlementResult.slotIndex, round.gameMode, round.numberOfRows);

    return (
        <div
            className={cn(`flex items-center justify-center px-2 py-[2px] rounded-[6px] border border-[rgba(255,255,255,0.2)] text-white whitespace-nowrap flex-shrink-0 min-w-10 text-sm font-semibold`, className)}
            style={{ backgroundColor: bgColor || '#ccc' }}
        >
            {round.settlementResult.multiplier.toFixed(2)}x
        </div>
    );
};

export default RoundMultiplierItem;