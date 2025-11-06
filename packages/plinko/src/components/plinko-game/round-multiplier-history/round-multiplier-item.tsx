import { buildVersion, cn, numberWithCommas } from "@shared";
import React from "react";
import Image from "next/image";
import { PlinkoRound } from "./round-multiplier-history";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface RoundMultiplierItemProps {
    round: PlinkoRound;
    isWin: boolean;
    className?: string;
}

const renderMultiplierContent = (multiplier: number) => {
    if (multiplier === 0) {
        return (
            <Image
                src={`${basePath}/static/images/icons/hell-multiplier.svg?v=${buildVersion}`}
                alt="Hell multiplier"
                width={20}
                height={20}
                className="w-5 h-5"
            />
        );
    }
    return `${numberWithCommas(multiplier)}x`;
};

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
            {renderMultiplierContent(round.settlementResult.multiplier)}
        </div>
    );
};

export default RoundMultiplierItem;
