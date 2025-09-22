import { DrawInfo } from "@shared/components/game-base/type";
import { useGameContext } from "@shared/react-contexts";
import { useCommonTranslate, useTranslator } from "@shared/react-hooks";
import Image from "next/image";
import { FC } from "react";
import { BaccaratBetOptions } from "../baccarat-multiplayer-constants";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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

const calculateWin = (isWin: boolean, amount: number, odds: number, choice: string, settlementResult: Record<string, boolean>): number => {
    // Standard win calculation
    let winAmount = isWin ? amount * odds : 0;

    // Special case for Baccarat: when tie wins, return player/banker bet amounts
    if (settlementResult.tie && (choice === 'player' || choice === 'banker')) {
        winAmount += amount; // Return the original bet amount
    }

    return winAmount;
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
                        <span className="text-secondary-text">{translateCommon("result")}
                        <Image
                            src={`${basePath}/static/images/sedie-multiplayer/bet-detail/bet-detail-${winningSubOption}.svg`}
                            alt={`${winningSubOption} result`}
                            width={IMAGE_SIZE}
                            height={IMAGE_SIZE}
                        />
                        </span>
                    </span>
                ) : (
                    <span aria-label="no result">—</span>
                )}
            </div>
        </div>
    );
};

export const produceDataBetDetailRow = (item: any, drawInfo: RoundInfoSeDie) => {
    const isWin = drawInfo.settlementResult?.[item.choice];
    const odds = drawInfo.odds?.[item.choice];

    const win = calculateWin(isWin, item.amount, odds, item.choice, drawInfo.settlementResult);

    const result = {
        rawTime: item.time,
        amount: item.amount,
        choice: item.choice,
        odds: odds,
        win,
        hightlight: isWin,
    };

    return result;
};

export const BetChoice: FC<{ choice: string }> = ({ choice }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace || ""]);

    const isOddOrEven = choice === BaccaratBetOptions.BANKER || choice === BaccaratBetOptions.PLAYER;

    return (
        <span className="font-text flex justify-center items-center">
            {t(`glossary_${choice.toLowerCase()}`)}
        </span>
    );
};
