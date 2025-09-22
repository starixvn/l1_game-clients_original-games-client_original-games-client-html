import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";
import { Round } from "@shared/components/game-base/type";
import {
    BeadRoadElement,
    BigRoadElement,
    BigRoadRound,
    DerivedElement,
} from "@shared/components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from '@shared/helpers/scoreboard-registry';
import { withTranslator } from "@shared/components/page-components/translator";
import styles from "./scoreboard-elements.module.scss";
import { BaccaratResult, BaccaratSettlementResult, BaccaratBetOptions } from "../baccarat-multiplayer-constants";
import { GAME_ID } from '../game-config';
import BeadBoardIcon from "./beadboard-icon";
import { hasPlayerPair, hasBankerPair } from "./utils";

export class BaccaratBeadRoadCharacterElement extends BeadRoadElement<Round<BaccaratResult, BaccaratSettlementResult>> {

    renderElement(round: Round<BaccaratResult, BaccaratSettlementResult>, t?: (key: string) => string): ReactNode {
        console.log("ROUND::: ", round);

        if (!round.settlementResult) {
            return <span className={`${styles.blink}`}></span>;
        }

        const character = (betChoice: string) => (
            <BeadBoardIcon
                choice={betChoice}
                hasPlayerPair={round.result ? hasPlayerPair(round.result.player) : false}
                hasBankerPair={round.result ? hasBankerPair(round.result.banker) : false}
            />
        );

        if (round.settlementResult.tie) {
            return character(BaccaratBetOptions.TIE);
        } else if (round.settlementResult.banker) {
            return character(BaccaratBetOptions.BANKER);
        } else {
            return character(BaccaratBetOptions.PLAYER);
        }
    }

    render(): ReactNode {
        const { round, t } = this.props;

        if (round) {
            return this.renderElement(round, t);
        }
        return <></>;
    }
}

export const BaccaratBeadRoadCharacterElementWithTranslator = withTranslator(BaccaratBeadRoadCharacterElement);

export class BaccaratBeadRoadValueElement extends BeadRoadElement<Round<BaccaratResult, BaccaratSettlementResult>> {
    renderElement(round: Round<BaccaratResult, BaccaratSettlementResult>): ReactNode {
        console.log("ROUND::: ", round);

        if (!round.settlementResult) {
            return <span className={`${styles.blink}`}></span>;
        } else if (round.settlementResult.tie) {
            return <span className={`${styles.tie} ${styles.value}`}>{round.result.banker.score}</span>;
        } else if (round.settlementResult.banker) {
            return <span className={`${styles.banker} ${styles.value}`}>{round.result.banker.score}</span>;
        } else {
            return <span className={`${styles.player} ${styles.value}`}>{round.result.player.score}</span>;
        }
    }
}

export class BaccaratBigRoadConverter extends Converter<BaccaratSettlementResult> {
    static addBlinkNode(rounds: BaccaratSettlementResult[]) {
        const lastRound = rounds.find((round) => round.player || round.banker);
        const blinkRound = { banker: lastRound?.banker, player: undefined, tie: undefined, drawId: 0, anyPair: false };

        rounds.unshift(blinkRound);
    }

    static instance = new BaccaratBigRoadConverter();

    protected positiveKey(): string {
        return BaccaratBetOptions.BANKER;
    }

    protected specialKey(): string {
        return BaccaratBetOptions.TIE;
    }
}

export class BaccaratBigRoadElement extends BigRoadElement<BaccaratSettlementResult> {
    renderElement(round: BigRoadRound<BaccaratSettlementResult>): ReactNode {
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

registerBigRoadElement(BaccaratBigRoadElement, BaccaratBigRoadConverter as any, GAME_ID);
