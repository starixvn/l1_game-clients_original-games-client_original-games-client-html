import { DrawInfo } from "@shared/components/game-base/type";
import { useGameContext } from "@shared/react-contexts";
import { useCommonTranslate, useTranslator } from "@shared/react-hooks";
import Image from "next/image";
import { FC } from "react";
import { BaccaratBetOptions } from "../baccarat-multiplayer-constants";

export interface RoundInfoSeDie extends DrawInfo {
    roundId: number;
    result:
        | {
              balls?: Array<number>;
          }
        | Record<string, boolean>;
    odds: Record<string, number>;
    settlementResult: Record<string, boolean>;
}

const SUB_OPTIONS = [BaccaratBetOptions.BANKER, BaccaratBetOptions.TIE, BaccaratBetOptions.ANY_PAIR] as const;

const IMAGE_SIZE = 30;

export const getWinningSubOption = (settlementResult: Record<string, boolean>): string => {
    return SUB_OPTIONS.find((option) => settlementResult[option]) || "";
};

const calculateWin = (isWin: boolean, amount: number, odds: number): number => {
    return isWin ? amount * odds : 0;
};

export const BetDetailResultBlock: FC<{ roundInfo: RoundInfoSeDie }> = ({ roundInfo: drawInfo }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { roundId, settlementResult } = drawInfo;

    const winningSubOption = getWinningSubOption(settlementResult);

    return (
        <div className="flex justify-between text-secondary-text text-sm mt-2">
            <div className="flex items-center gap-1.5 font-medium">
                {translateCommon("round").capitalizeFirstLetter()}: <span>{roundId}</span>
            </div>
            <div className="flex items-center gap-1.5">
                {winningSubOption ? (
                    <span className="flex items-center gap-1.5">
                        <span className="text-secondary-text">{translateCommon("result")}</span>
                        <Image
                            src={`/static/images/sedie-multiplayer/bet-detail/bet-detail-${winningSubOption}.svg`}
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

export const produceDataBetDetailRow = (item: any, drawInfo: RoundInfoSeDie) => {
    const win = calculateWin(drawInfo.settlementResult?.[item.choice], item.amount, drawInfo.odds[item.choice]);

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

    const isOddOrEven = choice === BaccaratBetOptions.BANKER || choice === BaccaratBetOptions.PLAYER;

    return (
        <span className="font-text flex justify-center items-center">
            {isOddOrEven ? (
                t(`glossary_${choice}`)
            ) : (
                <Image
                    src={`/static/images/sedie-multiplayer/bet-detail/bet-detail-${choice}.svg`}
                    alt={`${choice} choice`}
                    width={IMAGE_SIZE}
                    height={IMAGE_SIZE}
                />
            )}
        </span>
    );
};
