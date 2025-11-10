import { FC } from "react";
import { useCommonTranslate } from "@shared/react-hooks";

export type PlinkoSettlementResult = {
    slotIndex: number;
    multiplier: number;
};

export const PlinkoBetDetailResultBlock: FC<{ roundId: number; settlementResult: PlinkoSettlementResult }> = ({
    roundId,
    settlementResult,
}) => {
    const { t: translateCommon } = useCommonTranslate();

    return (
        <div className="flex justify-between text-secondary-text text-sm md:text-base mt-2">
            <div className="flex items-center gap-1.5 font-medium">
                {translateCommon("round").capitalizeFirstLetter()}: <span>{roundId}</span>
            </div>
            <div className="flex items-center gap-1.5">
                {settlementResult ? (
                    <span className="flex items-center gap-1.5">
                        <span className="text-secondary-text">{translateCommon("result")}</span>
                        <div className="text-winning-highlight">{settlementResult.multiplier}x</div>
                    </span>
                ) : (
                    <span aria-label="no result">—</span>
                )}
            </div>
        </div>
    );
};
