import { getMultiplierColor } from "@plinko/lib/utils/colors-util";
import { cn, numberWithCommas } from "@shared";
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
            className={cn(
                `flex items-center justify-center rounded-[6px] border border-[rgba(255,255,255,0.2)] text-white whitespace-nowrap min-w-10 text-xs font-semibold h-5 md:text-sm md:min-w-auto md:px-1 md:py-0.5`,
                className
            )}
            style={{ backgroundColor: bgColor || "#ccc" }}
        >
            {numberWithCommas(round.settlementResult.multiplier)}x
        </div>
    );
};

export default RoundMultiplierItem;
