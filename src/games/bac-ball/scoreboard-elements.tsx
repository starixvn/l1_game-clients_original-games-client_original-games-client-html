import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";
import { Round } from "../../components/game-base/type";
import {
    BeadRoadElement,
    BigRoadElement,
    BigRoadRound,
    DerivedElement,
} from "../../components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from "../../_shared/helpers/scoreboard-registry";
import { withTranslator } from "../../components/page-components/translator";
import { BacBallBetOptions } from "./constants";
import styles from "./scoreboard-elements.module.scss";
import { BacBallResult, BacBallSettlementResult } from "./types";
import BeadBoardIcon from "../../components/game-components/statistic/beadboard-icon";

export class BacBallBeadRoadCharacterElement extends BeadRoadElement<Round<BacBallResult, BacBallSettlementResult>> {
    renderElement(round: Round<BacBallResult, BacBallSettlementResult>, t?: (key: string) => string): ReactNode {
        const character = (betChoice) => <BeadBoardIcon choice={betChoice} />;
        if (!round.settlementResult) {
            return <span className={`${styles.blink}`}></span>;
        } else if (round.settlementResult.tie) {
            return character(BacBallBetOptions.TIE);
        } else if (round.settlementResult.banker) {
            return character(BacBallBetOptions.BANKER);
        } else {
            return character(BacBallBetOptions.PLAYER);
        }
    }

    render(): ReactNode {
        const { round, t } = this.props;

        if (round) {
            return this.renderElement(round, t);
        }
    }
}

export const BacBallBeadRoadCharacterElementWithTranslator = withTranslator(BacBallBeadRoadCharacterElement);

export class BacBallBeadRoadValueElement extends BeadRoadElement<Round<BacBallResult, BacBallSettlementResult>> {
    renderElement(round: Round<BacBallResult, BacBallSettlementResult>): ReactNode {
        if (!round.settlementResult) {
            return <span className={`${styles.blink}`}></span>;
        } else if (round.settlementResult.tie) {
            return <span className={`${styles.tie} ${styles.value}`}>{round.result.banker}</span>;
        } else if (round.settlementResult.banker) {
            return <span className={`${styles.banker} ${styles.value}`}>{round.result.banker}</span>;
        } else {
            return <span className={`${styles.player} ${styles.value}`}>{round.result.player}</span>;
        }
    }
}

export class BacBallBigRoadConverter extends Converter<BacBallSettlementResult> {
    static addBlinkNode(rounds: BacBallSettlementResult[]) {
        const lastRound = rounds.find((round) => round.player || round.banker);
        const blinkRound = { banker: lastRound?.banker, player: undefined, tie: undefined, drawId: 0 };

        rounds.unshift(blinkRound);
    }

    static instance = new BacBallBigRoadConverter();

    protected positiveKey(): string {
        return BacBallBetOptions.BANKER;
    }

    protected specialKey(): string {
        return BacBallBetOptions.TIE;
    }
}

export class BacBallBigRoadElement extends BigRoadElement<BacBallSettlementResult> {
    renderElement(round: BigRoadRound<BacBallSettlementResult>): ReactNode {
        const banker = round.data.some((result) => result.banker);
        const player = round.data.some((result) => result.player);
        const tie = round.data.filter((result) => result.tie);
        const extendClassName = tie.length !== 0 ? styles["big-road-tie"] : "";
        const tieValue = tie.length > 1 ? tie.length : "";
        const isBlinkNode = round.data.some((result) => result.player === undefined || result.banker === undefined);

        if (isBlinkNode) {
            return <span className={`${styles.blink} ${extendClassName}`}></span>;
        } else if (banker) {
            return <span className={`${styles.banker} ${extendClassName}`}>{tieValue}</span>;
        } else if (player) {
            return <span className={`${styles.player} ${extendClassName}`}>{tieValue}</span>;
        } else {
            return <span className={`${styles["big-road-tie-first-round"]}`}>{tieValue}</span>;
        }
    }
}

export class BacBallBigEyeElement extends DerivedElement {
    renderA(): ReactNode {
        return <span className={`${styles["big-eye-banker"]}`} />;
    }

    renderB(): ReactNode {
        return <span className={`${styles["big-eye-player"]}`} />;
    }
}

export class BacBallSmallRoadElement extends DerivedElement {
    renderA(): ReactNode {
        return <span className={`${styles["small-road-banker"]}`} />;
    }

    renderB(): ReactNode {
        return <span className={`${styles["small-road-player"]}`} />;
    }
}

export class BacBallCockroachPigElement extends DerivedElement {
    renderA(): ReactNode {
        return <span className={`${styles["cockroach-pig-banker"]}`} />;
    }

    renderB(): ReactNode {
        return <span className={`${styles["cockroach-pig-player"]}`} />;
    }
}

registerBigRoadElement(BacBallBigRoadElement, BacBallBigRoadConverter, 1001, 1002);
