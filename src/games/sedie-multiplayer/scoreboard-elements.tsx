import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";

import { Round } from "../../components/game-base/type";
import { BeadRoadElement, BigRoadElement, BigRoadRound } from "../../components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from "../../_shared/helpers/scoreboard-registry";
import { GameIds } from "../../_shared/constants";
import { withTranslator } from "../../components/page-components/translator";
import styles from "./scoreboard-elements.module.scss";
import dotStyles from "../../components/game-components/round-history/dot/dot.module.scss";
import { SeDieBetOptions, SeDieResult, SeDieSettlementResult } from "./sedie-multiplayer-constants";
import BeadBoardIcon from "../../components/game-components/statistic/beadboard-icon";

export const ODD_EVEN_AS_DEFAULT_SCOREBOARD = true;

export function createBeadRoadElement(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
    class Element extends BeadRoadElement<Round<SeDieResult, SeDieSettlementResult>> {
        renderElement(round: Round<SeDieResult, SeDieSettlementResult>, t?: (key: string) => string): ReactNode {
            const character = (betChoice: string) => <BeadBoardIcon choice={betChoice} />;

            if (!round.settlementResult) {
                return <span className={`${styles.blink}`}></span>;
            } else if (round.settlementResult.odd) {
                return character(SeDieBetOptions.EVEN);
            } else if (round.settlementResult.even) {
                return character(SeDieBetOptions.ODD);
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

export class SeDieBigRoadConverter extends Converter<SeDieSettlementResult> {
    static addBlinkNode(rounds: SeDieSettlementResult[]) {
        const lastRound = rounds.find((round) => round.odd || round.even);

        const blinkRound = {
            odd: lastRound?.odd,
            even: undefined,
            red3: undefined,
            red4: undefined,
            white3: undefined,
            white4: undefined,
            red2: undefined,
            drawId: 0,
        } as any;

        rounds.unshift(blinkRound);
    }

    static instance = new SeDieBigRoadConverter();

    protected positiveKey(): string {
        return SeDieBetOptions.ODD;
    }

    protected specialKey(): string {
        return "";
    }
}

export class SeDieBigRoadElement extends BigRoadElement<SeDieSettlementResult> {
    renderElement(round: BigRoadRound<SeDieSettlementResult>): ReactNode {
        const odd = round.data.some((result) => result.odd);
        const even = round.data.some((result) => result.even);
        const isBlinkNode = round.data.some((result) => result.even === undefined || result.odd === undefined);

        if (isBlinkNode) {
            return <span className={`${dotStyles["dot-next"]} ${dotStyles["blink"]}`}></span>;
        } else if (odd) {
            return <span className={styles.red}></span>;
        } else if (even) {
            return <span className={styles.blue}></span>;
        } else {
            return <></>;
        }
    }
}

// Register for SeDieMultiplayer only
registerBigRoadElement(SeDieBigRoadElement, SeDieBigRoadConverter as any, GameIds.SeDieMultiplayer);


