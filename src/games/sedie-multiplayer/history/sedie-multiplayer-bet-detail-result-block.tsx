import { FC } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { useCommonTranslate, useTranslator } from "../../../_shared/react-hooks";
import SmallBall from "../../../components/game-components/small-ball";
import { DrawInfo } from "../../../components/game-base/type";
import Styles from "../history/history.module.scss";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";

export interface RoundInfoSeDie extends DrawInfo {
    drawId: number;
    result: {
        balls?: Array<number>;
    } | Record<string, boolean>;
    odds: Record<string, number>;
    settlementResult: Record<string, boolean>;
}

export const BetDetailResultBlock: FC<{ roundInfo: RoundInfoSeDie }> = ({ roundInfo: drawInfo }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { drawId, result } = drawInfo;
    const balls: number[] = Array.isArray((result as any)?.balls) ? ((result as any).balls as number[]) : [];
    const activeKeys: string[] = !balls.length && result && typeof result === "object"
        ? Object.keys(result).filter((k) => (result as Record<string, boolean>)[k])
        : [];

    let totalPoint = 0;

    return (
        <div className={Styles["draw-info"]}>
            <div className={`${Styles["info-item"]} font-weight-500`}>
                {translateCommon("round").capitalizeFirstLetter()}: <span>{drawId}</span>
            </div>
            <div className={Styles["info-item"]}>
                {balls.length > 0 ? (
                    <>
                        {balls.map((ball, index) => {
                            totalPoint += ball;
                            return <SmallBall key={index} number={ball} />;
                        })}
                        <div className={Styles["bet-detail-total"]}> - {totalPoint}</div>
                    </>
                ) : activeKeys.length > 0 ? (
                    activeKeys.map((key, index) => (
                        <span key={index} className="font-text">{key}</span>
                    ))
                ) : (
                    <span aria-label="no result">—</span>
                )}
            </div>
        </div>
    );
};

const calculateWin = (isWin: boolean, amount: number, odds: number) => {
    return isWin ? amount * odds : 0;
};

export const produceDataBetDetailRow = (item: any, drawInfo: RoundInfoSeDie) => {
    const win = calculateWin(drawInfo.settlementResult?.[item.choice], item.amount, drawInfo.odds[item.choice]);

    return {
        rawTime: item.time,
        amount: item.amount,
        choice: item.choice,
        odds: drawInfo.odds[item.choice],
        win: win,
        hightlight: drawInfo.settlementResult?.[item.choice],
    };
};

export const BetChoice: FC<{ choice: string }> = ({ choice }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    const mapToSeBallAsset = (c: string) => {
        if (c === SeDieBetOptions.WHITE3) {
            return "blue3";
        }
        if (c === SeDieBetOptions.WHITE4) {
            return "blue4";
        }
        return c;
    };

    return (
        <span className="font-text">
            {choice === SeDieBetOptions.ODD || choice === SeDieBetOptions.EVEN ? (
                t(`glossary_${choice}`)
            ) : (
                <img src={`/static/images/sedie-multiplayer/bet-detail-${mapToSeBallAsset(choice)}.svg`} alt="" />
            )}
        </span>
    );
};


