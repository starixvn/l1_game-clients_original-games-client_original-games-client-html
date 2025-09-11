import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";

import { BigRoadElement, BigRoadRound } from "@shared/components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from "@shared/helpers/scoreboard-registry";
import { GameIds } from "@shared/constants";
import styles from "./scoreboard-elements.module.scss";
import dotStyles from "@shared/components/game-components/round-history/dot/dot.module.scss";
import { SeDieBetOptions, SeDieSettlementResult } from "../sedie-multiplayer-constants";
import { BgCachedImage } from "@shared/components/game-components/cached-image/bg-cached-image";

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

    static readonly instance = new SeDieBigRoadConverter();

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
            return (
                <BgCachedImage pathImage="/static/images/sedie-multiplayer/scoreboard/scoreboard-red-dot.webp" className={styles.icon} />
            );
        } else if (even) {
            return (
                <BgCachedImage pathImage="/static/images/sedie-multiplayer/scoreboard/scoreboard-blue-dot.webp" className={styles.icon} />
            );
        } else {
            return <></>;
        }
    }
}

// Register for SeDieMultiplayer only
registerBigRoadElement(SeDieBigRoadElement, SeDieBigRoadConverter as any, GameIds.SeDieMultiplayer);
