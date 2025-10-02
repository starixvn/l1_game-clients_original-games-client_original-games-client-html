import { FC } from "react";
import { useCommonTranslate } from "@shared/react-hooks";
import { DrawInfo } from "@shared/components/game-base/type";


export type PlinkoSettlementResult = {
    slotIndex: number;
    multiplier: number;
};

export interface RoundInfoPlinko extends DrawInfo {
    roundId: number;
    result:
        | {
              balls?: Array<number>;
          }
        | Record<string, boolean>;
    settlementResult: PlinkoSettlementResult;
    numberOfRows?: number;
}

export const BetDetailResultBlock: FC<{ roundInfo: RoundInfoPlinko }> = ({ roundInfo: drawInfo }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { roundId, settlementResult } = drawInfo;
    console.log("settlementResult", settlementResult);
    return (
        <div className="flex justify-between text-secondary-text text-sm md:text-base mt-2">
            <div className="flex items-center gap-1.5 font-medium">
                {translateCommon("round").capitalizeFirstLetter()}: <span>{roundId}</span>
            </div>
            <div className="flex items-center gap-1.5">
                {settlementResult ? (
                    <span className="flex items-center gap-1.5">
                        <span className="text-secondary-text">{translateCommon("result")}</span>
                        <div>{settlementResult.slotIndex}</div>
                    </span>
                ) : (
                    <span aria-label="no result">—</span>
                )}
            </div>
        </div>
    );
};

export const produceDataBetDetailRow = (item: any) => {
    return {
        gameMode: item.gameMode,
        amount: item.amount,
        choice: item.choice,
        win: item.win,
    };
};
