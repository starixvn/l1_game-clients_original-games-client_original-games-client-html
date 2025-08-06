import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";

import { Round } from "../../components/game-base/type";
import { BeadRoadElement, BigRoadElement, BigRoadRound } from "../../components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from "../../_shared/helpers/scoreboard-registry";
import { withTranslator } from "../../components/page-components/translator";
import styles from "./scoreboard-elements.module.scss";
import { SicBallBetOptions } from "./sic-ball-constants";
import { SicBallResult, SicBallSettlementResult } from "./types";
import BeadBoardIcon from "../../components/game-components/statistic/beadboard-icon";

export const ODD_EVEN_AS_DEFAULT_SCOREBOARD = true;

export function createBeadRoadElement(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
    class Element extends BeadRoadElement<Round<SicBallResult, SicBallSettlementResult>> {
        renderElement(round: Round<SicBallResult, SicBallSettlementResult>, t?: (key: string) => string): ReactNode {
            const character = (betChoice: string) => <BeadBoardIcon choice={betChoice} />;

            if (!round.settlementResult) {
                return <span className={`${styles.blink}`}></span>;
            } else if (round.settlementResult.big) {
                return character(SicBallBetOptions.BIG);
            } else if (round.settlementResult.small) {
                return character(SicBallBetOptions.SMALL);
            }
            return <></>;
        }

        render(): ReactNode {
            const { round, t } = this.props;

            if (round) {
                return this.renderElement(round, t);
            }
            return null;
        }
    }

    return withTranslator(Element);
}

export class SicBallBigRoadConverter extends Converter<SicBallSettlementResult> {
    static addBlinkNode(rounds: SicBallSettlementResult[]) {
        const lastRound = rounds.find((round) => round.big || round.small);

        const blinkRound = {
            big: lastRound?.big,
            small: undefined,
            specific1: undefined,
            specific2: undefined,
            specific3: undefined,
            specific4: undefined,
            specific5: undefined,
            specific6: undefined,
            drawId: 0,
        };

        rounds.unshift(blinkRound);
    }

    static instance = new SicBallBigRoadConverter();

    protected positiveKey(): string {
        return SicBallBetOptions.BIG;
    }

    protected specialKey(): string {
        return "";
    }
}

export class SicBallBigRoadElement extends BigRoadElement<SicBallSettlementResult> {
    renderElement(round: BigRoadRound<SicBallSettlementResult>): ReactNode {
        const odd = round.data.some((result) => result.big);
        const isBlinkNode = round.data.some((result) => result.small === undefined || result.big === undefined);

        if (isBlinkNode) {
            return <span className={styles.blink}></span>;
        } else if (odd) {
            return <span className={styles.blue}></span>;
        } else {
            return <span className={styles.red}></span>;
        }
    }
}

registerBigRoadElement(SicBallBigRoadElement, SicBallBigRoadConverter, 1007);
