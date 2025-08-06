import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";

import { Round } from "../../components/game-base/type";
import { BeadRoadElement, BigRoadElement, BigRoadRound } from "../../components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from "../../_shared/helpers/scoreboard-registry";
import { withTranslator } from "../../components/page-components/translator";
import styles from "./scoreboard-elements.module.scss";
import { SeBallBetOptions } from "./se-ball-constants";
import { SeBallResult, SeBallSettlementResult } from "./types";
import BeadBoardIcon from "../../components/game-components/statistic/beadboard-icon";

export const ODD_EVEN_AS_DEFAULT_SCOREBOARD = true;

export function createBeadRoadElement(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
    class Element extends BeadRoadElement<Round<SeBallResult, SeBallSettlementResult>> {
        renderElement(round: Round<SeBallResult, SeBallSettlementResult>, t?: (key: string) => string): ReactNode {
            const character = (betChoice: string) => <BeadBoardIcon choice={betChoice} />;

            if (!round.settlementResult) {
                return <span className={`${styles.blink}`}></span>;
            } else if (round.settlementResult.odd) {
                return character(SeBallBetOptions.ODD);
            } else if (round.settlementResult.even) {
                return character(SeBallBetOptions.EVEN);
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

export class SeBallBigRoadConverter extends Converter<SeBallSettlementResult> {
    static addBlinkNode(rounds: SeBallSettlementResult[]) {
        const lastRound = rounds.find((round) => round.odd || round.even);

        const blinkRound = {
            odd: lastRound?.odd,
            even: undefined,
            red3: undefined,
            red4: undefined,
            blue3: undefined,
            blue4: undefined,
            red2: undefined,
            drawId: 0,
        };

        rounds.unshift(blinkRound);
    }

    static instance = new SeBallBigRoadConverter();

    protected positiveKey(): string {
        return SeBallBetOptions.ODD;
    }

    protected specialKey(): string {
        return "";
    }
}

export class SeBallBigRoadElement extends BigRoadElement<SeBallSettlementResult> {
    renderElement(round: BigRoadRound<SeBallSettlementResult>): ReactNode {
        const odd = round.data.some((result) => result.odd);
        const isBlinkNode = round.data.some((result) => result.even === undefined || result.odd === undefined);

        if (isBlinkNode) {
            return <span className={styles.blink}></span>;
        } else if (odd) {
            return <span className={styles.blue}></span>;
        } else {
            return <span className={styles.red}></span>;
        }
    }
}

registerBigRoadElement(SeBallBigRoadElement, SeBallBigRoadConverter, 1005);
