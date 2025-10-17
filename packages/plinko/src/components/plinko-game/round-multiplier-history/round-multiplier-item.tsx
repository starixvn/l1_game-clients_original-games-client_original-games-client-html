import { cn, numberWithCommas } from "@shared";
import React from "react";
import { PlinkoRound } from "./round-multiplier-history";

interface RoundMultiplierItemProps {
    round: PlinkoRound;
    isWin: boolean;
    className?: string;
}

const RoundMultiplierItem: React.FC<RoundMultiplierItemProps> = ({ round, isWin, className = "" }) => {
    return (
        <div
            className={cn(
                `flex items-center justify-center rounded-[6px] border border-[rgba(255,255,255,0.2)] whitespace-nowrap min-w-10 text-xs font-semibold h-5 md:h-[25px] md:w-[60px] md:text-sm md:min-w-auto md:px-1 md:py-0.5`,
                isWin ? "text-black" : "text-white",
                className
            )}
            style={{ backgroundColor: isWin ? "#00FF11" : "#3B4A58" }}
        >
            {numberWithCommas(round.settlementResult.multiplier)}x
        </div>
    );
};

export default RoundMultiplierItem;
