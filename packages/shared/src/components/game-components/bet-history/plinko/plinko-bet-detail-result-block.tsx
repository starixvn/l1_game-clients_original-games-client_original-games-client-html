import { FC } from "react";
import Image from "next/image";
import { useGameContext } from "@shared/react-contexts";
import { useCommonTranslate, useTranslator } from "@shared/react-hooks";
import { DrawInfo } from "@shared/components/game-base/type";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
    odds: Record<string, number>;
    settlementResult: PlinkoSettlementResult;
    numberOfRows?: number;
}



const IMAGE_SIZE = 30;


const calculateWin = (isWin: boolean, amount: number, odds: number): number => {
    return isWin ? amount * odds : 0;
};

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

export const produceDataBetDetailRow = (item: any, drawInfo: RoundInfoPlinko) => {
    const win = calculateWin(true, item.amount, drawInfo.odds[item.choice]);
console.log("item", item, drawInfo);
    return {
        gameMode: item.gameMode,
        amount: item.amount,
        choice: item.choice,
        odds: drawInfo.settlementResult?.multiplier,
        win,
        hightlight: drawInfo.settlementResult?.[item.choice],
    };
};

