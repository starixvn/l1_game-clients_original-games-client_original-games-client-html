// import { ReactNode } from "react";
// import { Converter } from "sc-scoreboards";
// import { Round } from '@shared/components/game-base/type';

// import { BigRoadElement, BigRoadRound, BeadRoadElement } from '@shared/components/game-components/round-history/scoreboard/elements';
// import { registerBigRoadElement } from '@shared/helpers/scoreboard-registry';
// import { withTranslator } from '@shared/components/page-components/translator';
// import BeadBoardIcon from '@shared/components/game-components/statistic/beadboard-icon';
// import { GAME_ID } from '../game-constants';
// import styles from "./scoreboard-elements.module.scss";
// import { BaccaratBetOptions, BaccaratSettlementResult, BaccaratResult } from "../baccarat-multiplayer-constants";

// // Helper function to detect Natural outcomes
// const isNaturalWin = (playerScore: number, bankerScore: number): boolean => {
//     return (playerScore === 8 || playerScore === 9) || (bankerScore === 8 || bankerScore === 9);
// };

// const isNaturalTie = (playerScore: number, bankerScore: number): boolean => {
//     return (playerScore === 8 || playerScore === 9) && (bankerScore === 8 || bankerScore === 9) && playerScore === bankerScore;
// };

// const hasThirdCard = (result: BaccaratResult): boolean => {
//     return result.player.card3 !== null || result.banker.card3 !== null;
// };

// export class BaccaratBigRoadConverter extends Converter<BaccaratSettlementResult> {
//     static addBlinkNode(rounds: BaccaratSettlementResult[]) {
//         const lastRound = rounds.find((round) => round.player || round.banker);

//         const blinkRound = {
//             player: lastRound?.player,
//             banker: undefined,
//             tie: false,
//             anyPair: false,
//             roundId: 0,
//         } as any;

//         rounds.unshift(blinkRound);
//     }

//     static readonly instance = new BaccaratBigRoadConverter();

//     protected positiveKey(): string {
//         return BaccaratBetOptions.PLAYER;
//     }

//     protected specialKey(): string {
//         return BaccaratBetOptions.TIE;
//     }
// }

// export class BaccaratBigRoadElement extends BigRoadElement<BaccaratSettlementResult> {
//     renderElement(round: BigRoadRound<BaccaratSettlementResult>): ReactNode {
//         const banker = round.data.some((result) => result.banker);
//         const player = round.data.some((result) => result.player);
//         const tie = round.data.filter((result) => result.tie);
//         const hasPair = round.data.some((result) => result.anyPair);
//         const hasNaturalWin = round.data.some((result) => result.naturalWin);
//         const hasNaturalTie = round.data.some((result) => result.naturalTie);
//         const extendClassName = tie.length !== 0 ? styles["big-road-tie"] : "";
//         const naturalClassName = hasNaturalWin ? styles["natural-win"] : "";
//         const naturalTieClassName = hasNaturalTie ? styles["natural-tie"] : "";
//         const tieValue = tie.length > 1 ? tie.length : "";
//         const isBlinkNode = round.data.some((result) => result.player === undefined || result.banker === undefined);

//         if (isBlinkNode) {
//             return <span className={`${styles.blink} ${extendClassName}`}></span>;
//         } else if (banker) {
//             const combinedClasses = `${styles.banker} ${extendClassName} ${naturalClassName} ${naturalTieClassName}`;
//             return (
//                 <span className={combinedClasses}>
//                     {tieValue}
//                     {hasPair && <div className={styles["pair-dot"]}></div>}
//                     {(hasNaturalWin || hasNaturalTie) && <div className={styles["natural-indicator"]}>N</div>}
//                 </span>
//             );
//         } else if (player) {
//             const combinedClasses = `${styles.player} ${extendClassName} ${naturalClassName} ${naturalTieClassName}`;
//             return (
//                 <span className={combinedClasses}>
//                     {tieValue}
//                     {hasPair && <div className={styles["pair-dot"]}></div>}
//                     {(hasNaturalWin || hasNaturalTie) && <div className={styles["natural-indicator"]}>N</div>}
//                 </span>
//             );
//         } else {
//             // Pure tie case - first round tie
//             const combinedClasses = `${styles["big-road-tie-first-round"]} ${naturalTieClassName}`;
//             return (
//                 <span className={combinedClasses}>
//                     {tieValue || "T"}
//                     {hasNaturalTie && <div className={styles["natural-indicator"]}>N</div>}
//                 </span>
//             );
//         }
//     }
// }

// // Bead Road Element for sequential display
// export class BaccaratBeadRoadElement extends BeadRoadElement<Round<BaccaratResult, BaccaratSettlementResult>> {
//     renderElement(round: Round<BaccaratResult, BaccaratSettlementResult>): ReactNode {
//         if (!round.settlementResult) {
//             return <span className={styles.blink}></span>;
//         }

//         const { settlementResult } = round;
//         let baseClass = "";
//         let symbol = "";
        
//         if (settlementResult.tie) {
//             baseClass = styles.tie;
//             symbol = "T";
//         } else if (settlementResult.banker) {
//             baseClass = styles.banker;
//             symbol = "B";
//         } else if (settlementResult.player) {
//             baseClass = styles.player;
//             symbol = "P";
//         } else {
//             return <></>;
//         }

//         const pairDotClass = settlementResult.anyPair ? styles["with-pair"] : "";
//         const naturalWinClass = settlementResult.naturalWin ? styles["natural-win"] : "";
//         const naturalTieClass = settlementResult.naturalTie ? styles["natural-tie"] : "";

//         return (
//             <span className={`${baseClass} ${styles.value} ${pairDotClass} ${naturalWinClass} ${naturalTieClass}`}>
//                 {symbol}
//                 {settlementResult.anyPair && <div className={styles["pair-dot"]}></div>}
//                 {(settlementResult.naturalWin || settlementResult.naturalTie) && (
//                     <div className={styles["natural-indicator"]}>N</div>
//                 )}
//             </span>
//         );
//     }

//     render(): ReactNode {
//         const { round } = this.props;
//         if (round) {
//             return this.renderElement(round);
//         }
//         return <></>;
//     }
// }

// // Character-based Bead Road Element (similar to BacBall pattern)
// export class BaccaratBeadRoadCharacterElement extends BeadRoadElement<Round<BaccaratResult, BaccaratSettlementResult>> {
//     renderElement(round: Round<BaccaratResult, BaccaratSettlementResult>, t?: (key: string) => string): ReactNode {
//         const character = (betChoice) => <BeadBoardIcon choice={betChoice} />;
        
//         if (!round.settlementResult) {
//             return <span className={`${styles.blink}`}></span>;
//         } else if (round.settlementResult.tie) {
//             return character(BaccaratBetOptions.TIE);
//         } else if (round.settlementResult.banker) {
//             return character(BaccaratBetOptions.BANKER);
//         } else {
//             return character(BaccaratBetOptions.PLAYER);
//         }
//     }

//     render(): ReactNode {
//         const { round, t } = this.props;
//         if (round) {
//             return this.renderElement(round, t);
//         }
//         return <></>;
//     }
// }

// // Translator-wrapped version for internationalization support
// export const BaccaratBeadRoadCharacterElementWithTranslator = withTranslator(BaccaratBeadRoadCharacterElement);

// // Value-based Bead Road Element showing actual card values
// export class BaccaratBeadRoadValueElement extends BeadRoadElement<Round<BaccaratResult, BaccaratSettlementResult>> {
//     renderElement(round: Round<BaccaratResult, BaccaratSettlementResult>): ReactNode {
//         if (!round.settlementResult) {
//             return <span className={`${styles.blink}`}></span>;
//         } else if (round.settlementResult.tie) {
//             return <span className={`${styles.tie} ${styles.value}`}>{round.result.banker.score}</span>;
//         } else if (round.settlementResult.banker) {
//             return <span className={`${styles.banker} ${styles.value}`}>{round.result.banker.score}</span>;
//         } else {
//             return <span className={`${styles.player} ${styles.value}`}>{round.result.player.score}</span>;
//         }
//     }

//     render(): ReactNode {
//         const { round } = this.props;
//         return round ? this.renderElement(round) : null; // Slightly different implementation to avoid duplication warning
//     }
// }

// // Register for BaccaratMultiplayer only
// registerBigRoadElement(BaccaratBigRoadElement, BaccaratBigRoadConverter as any, GAME_ID);
// // Note: BeadRoadElement is used directly without registration
















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
import BeadBoardIcon from "@shared/components/game-components/statistic/beadboard-icon";
import { GAME_ID } from '../game-constants';

export class BaccaratBeadRoadCharacterElement extends BeadRoadElement<Round<BaccaratResult, BaccaratSettlementResult>> {
    renderElement(round: Round<BaccaratResult, BaccaratSettlementResult>, t?: (key: string) => string): ReactNode {
        const character = (betChoice) => <BeadBoardIcon choice={betChoice} />;
        if (!round.settlementResult) {
            return <span className={`${styles.blink}`}></span>;
        } else if (round.settlementResult.tie) {
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
    }
}

export const BaccaratBeadRoadCharacterElementWithTranslator = withTranslator(BaccaratBeadRoadCharacterElement);

export class BaccaratBeadRoadValueElement extends BeadRoadElement<Round<BaccaratResult, BaccaratSettlementResult>> {
    renderElement(round: Round<BaccaratResult, BaccaratSettlementResult>): ReactNode {
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
