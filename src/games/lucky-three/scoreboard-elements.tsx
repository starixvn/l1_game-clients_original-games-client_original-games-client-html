import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";

import { Round } from "../../components/game-base/type";
import { BeadRoadElement, BigRoadElement, BigRoadRound } from "../../components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from "../../_shared/helpers/scoreboard-registry";
import { withTranslator } from "../../components/page-components/translator";
import { LuckyThreeBetOptions } from "./lucky-three-constants";
import styles from "./scoreboard-elements.module.scss";
import { LuckyThreeResult, LuckyThreeSettlementResult } from "./types";
import BeadBoardIcon from "../../components/game-components/statistic/beadboard-icon";

export const ODD_EVEN_AS_DEFAULT_SCOREBOARD = true;

export function createBeadRoadElement(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
    class Element extends BeadRoadElement<Round<LuckyThreeResult, LuckyThreeSettlementResult>> {
        renderElement(round: Round<LuckyThreeResult, LuckyThreeSettlementResult>, t?: (key: string) => string): ReactNode {
            const character = (betChoice: string) => <BeadBoardIcon choice={betChoice} />;

            if (!round.settlementResult) {
                return <span className={`${styles.blink}`}></span>;
            } else if (round.settlementResult.over) {
                return character(LuckyThreeBetOptions.OVER);
            } else if (round.settlementResult.under) {
                return character(LuckyThreeBetOptions.UNDER);
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

export class LuckyThreeBigRoadConverter extends Converter<LuckyThreeSettlementResult> {
    static addBlinkNode(rounds: LuckyThreeSettlementResult[]) {
        const lastRound = rounds.find((round) => round.over || round.under);

        const blinkRound = {
            over: lastRound?.over,
            under: undefined,
            red2: undefined,
            red3: undefined,
            blue2: undefined,
            blue3: undefined,
            drawId: 0,
        };

        rounds.unshift(blinkRound);
    }

    static instance = new LuckyThreeBigRoadConverter();

    protected positiveKey(): string {
        return LuckyThreeBetOptions.OVER;
    }

    protected specialKey(): string {
        return "";
    }
}

export class LuckyThreeBigRoadElement extends BigRoadElement<LuckyThreeSettlementResult> {
    renderElement(round: BigRoadRound<LuckyThreeSettlementResult>): ReactNode {
        const odd = round.data.some((result) => result.over);
        const isBlinkNode = round.data.some((result) => result.under === undefined || result.over === undefined);

        if (isBlinkNode) {
            return <span className={styles.blink}></span>;
        } else if (odd) {
            return <span className={styles.blue}></span>;
        } else {
            return <span className={styles.red}></span>;
        }
    }
}

registerBigRoadElement(LuckyThreeBigRoadElement, LuckyThreeBigRoadConverter, 1006);
