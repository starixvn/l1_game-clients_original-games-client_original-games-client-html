import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";
import { Round } from "../../components/game-base/type";
import { BeadRoadElement, BigRoadElement, BigRoadRound } from "../../components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from "../../_shared/helpers/scoreboard-registry";
import { withTranslator } from "../../components/page-components/translator";
import { NextBallBetOptions } from "./next-ball-constants";
import styles from "./scoreboard-elements.module.scss";
import { NextBallResult, NextBallSettlementResult } from "./types";
import BeadBoardIcon from "../../components/game-components/statistic/beadboard-icon";

export const ODD_EVEN_AS_DEFAULT_SCOREBOARD = false;

export function createBeadRoadElement(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
    class Element extends BeadRoadElement<Round<NextBallResult, NextBallSettlementResult>> {
        renderElement(round: Round<NextBallResult, NextBallSettlementResult>, t?: (key: string) => string): ReactNode {
            const character = (betChoice: string) => <BeadBoardIcon choice={betChoice} />;

            if (!round.settlementResult) {
                return <span className={`${styles.blink}`}></span>;
            }

            if (isOddEven) {
                return round.settlementResult.odd ? character(NextBallBetOptions.ODD) : character(NextBallBetOptions.EVEN);
            } else {
                return round.settlementResult.over ? character(NextBallBetOptions.OVER) : character(NextBallBetOptions.UNDER);
            }
        }

        render(): ReactNode {
            const { round, t } = this.props;

            if (round) {
                return this.renderElement(round, t);
            }
        }
    }

    return withTranslator(Element);
}

export class NextBallBigRoadConverter extends Converter<NextBallSettlementResult> {
    static addBlinkNode(rounds: NextBallSettlementResult[]) {
        const lastRound = rounds.at(0) ?? ({ over: false, odd: false } as NextBallSettlementResult);
        const blinkRound = {
            over: lastRound?.over,
            odd: lastRound?.odd,
            under: undefined,
            even: undefined,
            drawId: 0,
        };

        rounds.unshift(blinkRound);
    }

    static instance = NextBallBigRoadConverter.getInstance(ODD_EVEN_AS_DEFAULT_SCOREBOARD);

    static getInstance(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
        return new NextBallBigRoadConverter(isOddEven);
    }

    constructor(private readonly isOddEven: boolean) {
        super();
    }

    protected positiveKey(): string {
        return this.isOddEven ? NextBallBetOptions.ODD : NextBallBetOptions.OVER;
    }

    protected specialKey(): string {
        return "";
    }
}

export function createBigRoadElement(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
    return class Element extends BigRoadElement<NextBallSettlementResult> {
        renderElement(round: BigRoadRound<NextBallSettlementResult>): ReactNode {
            const positive = round.data.some((result) => (isOddEven ? result.odd : result.over));
            const isBlinkNode = round.data.some((result) => result.under === undefined || result.even === undefined);

            if (isBlinkNode) {
                return <span className={styles.blink}></span>;
            } else if (positive) {
                return <span className={styles.blue}></span>;
            } else {
                return <span className={styles.red}></span>;
            }
        }
    };
}

registerBigRoadElement(createBigRoadElement(ODD_EVEN_AS_DEFAULT_SCOREBOARD), NextBallBigRoadConverter, 1003, 1004);
