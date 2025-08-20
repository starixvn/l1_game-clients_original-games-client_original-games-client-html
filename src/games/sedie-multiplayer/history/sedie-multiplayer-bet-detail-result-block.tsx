import { FC } from "react";
import Image from "next/image";

import { useGameContext } from "../../../_shared/react-contexts";
import { useCommonTranslate, useTranslator } from "../../../_shared/react-hooks";
import { DrawInfo } from "../../../components/game-base/type";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";

export interface RoundInfoSeDie extends DrawInfo {
    drawId: number;
    result: {
        balls?: Array<number>;
    } | Record<string, boolean>;
    odds: Record<string, number>;
    settlementResult: Record<string, boolean>;
}

const SUB_OPTIONS = [
    SeDieBetOptions.RED2,
    SeDieBetOptions.RED3,
    SeDieBetOptions.RED4,
    SeDieBetOptions.WHITE3,
    SeDieBetOptions.WHITE4
] as const;

const IMAGE_SIZE = 36;

const getWinningSubOption = (settlementResult: Record<string, boolean>): string => {
    return SUB_OPTIONS.find(option => settlementResult[option]) || '';
};

const calculateWin = (isWin: boolean, amount: number, odds: number): number => {
    return isWin ? amount * odds : 0;
};

export const BetDetailResultBlock: FC<{ roundInfo: RoundInfoSeDie }> = ({ roundInfo: drawInfo }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { drawId, settlementResult } = drawInfo;
    
    const winningSubOption = getWinningSubOption(settlementResult);

    return (
        <div className="flex justify-between gap-6 px-2 text-secondary-text text-sm">
            <div className="flex items-center gap-1.5 font-medium">
                {translateCommon("round").capitalizeFirstLetter()}: <span>{drawId}</span>
            </div>
            <div className="flex items-center gap-1.5">
                {winningSubOption ? (
                    <span className="flex items-center gap-1.5">
                        <span className="text-secondary-text">Result</span>
                        <Image 
                            src={`/static/images/sedie-multiplayer/bet-detail-${winningSubOption}.svg`} 
                            alt={`${winningSubOption} result`} 
                            width={IMAGE_SIZE} 
                            height={IMAGE_SIZE} 
                        />
                    </span>
                ) : (
                    <span aria-label="no result">—</span>
                )}
            </div>
        </div>
    );
};

// Utility functions
export const produceDataBetDetailRow = (item: any, drawInfo: RoundInfoSeDie) => {
    const win = calculateWin(
        drawInfo.settlementResult?.[item.choice], 
        item.amount, 
        drawInfo.odds[item.choice]
    );

    return {
        rawTime: item.time,
        amount: item.amount,
        choice: item.choice,
        odds: drawInfo.odds[item.choice],
        win,
        hightlight: drawInfo.settlementResult?.[item.choice],
    };
};

export const BetChoice: FC<{ choice: string }> = ({ choice }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace || ""]);
    
    const isOddOrEven = choice === SeDieBetOptions.ODD || choice === SeDieBetOptions.EVEN;
    
    return (
        <span className="font-text flex justify-center items-center">
            {isOddOrEven ? (
                t(`glossary_${choice}`)
            ) : (
                <Image 
                    src={`/static/images/sedie-multiplayer/bet-detail-${choice}.svg`} 
                    alt={`${choice} choice`} 
                    width={IMAGE_SIZE} 
                    height={IMAGE_SIZE} 
                />
            )}
        </span>
    );
};


