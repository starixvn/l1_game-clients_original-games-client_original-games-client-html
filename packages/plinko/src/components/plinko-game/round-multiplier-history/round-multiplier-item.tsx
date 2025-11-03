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
                `flex items-center justify-center rounded-[6px] border-none whitespace-nowrap min-w-10 text-xs font-semibold h-5 sm:h-[25px] sm:w-[60px] sm:text-sm sm:min-w-auto sm:px-1 sm:py-0.5`,
                isWin ? "text-black" : "text-[#BFBCBC]",
                className
            )}
            style={{ backgroundColor: isWin ? "#00FF11" : "#3B4A58" }}
        >
            {numberWithCommas(round.settlementResult.multiplier)}x
        </div>
    );
};

export default RoundMultiplierItem;
