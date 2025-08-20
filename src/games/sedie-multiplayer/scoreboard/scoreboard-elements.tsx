import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";

import { BigRoadElement, BigRoadRound } from "../../../components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from "../../../_shared/helpers/scoreboard-registry";
import { GameIds } from "../../../_shared/constants";
import styles from "./scoreboard-elements.module.scss";
import dotStyles from "../../../components/game-components/round-history/dot/dot.module.scss";
import { SeDieBetOptions, SeDieResult, SeDieSettlementResult } from "../sedie-multiplayer-constants";

export class SeDieBigRoadConverter extends Converter<SeDieSettlementResult> {
    static addBlinkNode(rounds: SeDieSettlementResult[]) {
        const lastRound = rounds.find((round) => round.odd || round.even);

        const blinkRound = {
            odd: lastRound?.odd,
            even: undefined,
            roundId: 0,
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
        try {
            const dataLen = Array.isArray(round?.data) ? round.data.length : 0;
            const oddFlag = round?.data?.some((r: any) => r?.odd);
            const evenFlag = round?.data?.some((r: any) => r?.even);
            const blinkFlag = round?.data?.some((r: any) => r?.even === undefined || r?.odd === undefined);
            // eslint-disable-next-line no-console
            console.log("[SeDieBigRoadElement] renderElement", { dataLen, oddFlag, evenFlag, blinkFlag });
        } catch (_) { }
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


