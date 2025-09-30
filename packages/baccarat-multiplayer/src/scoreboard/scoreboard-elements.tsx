import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";
import { Round } from "@shared/components/game-base/type";
import {
    BeadRoadElement,
    BigRoadElement,
    BigRoadRound,
} from "@shared/components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from '@shared/helpers/scoreboard-registry';
import { withTranslator } from "@shared/components/page-components/translator";
import { BaccaratResult, BaccaratSettlementResult, BaccaratBetOptions } from "../baccarat-multiplayer-constants";
import { GAME_ID } from '../game-config';
import BeadBoardIcon from "./beadboard-icon";
import BigRoadIcon from "./big-road-icon";
import { hasPlayerPair, hasBankerPair } from "./utils";
import dotStyles from '@shared/components/game-components/round-history/dot/dot.module.scss';

export class BaccaratBeadRoadCharacterElement extends BeadRoadElement<Round<BaccaratResult, BaccaratSettlementResult>> {

    renderElement(round: Round<BaccaratResult, BaccaratSettlementResult>, t?: (key: string) => string): ReactNode {

        if (!round.settlementResult) {
            return <span className={`${dotStyles["dot-next"]} ${dotStyles["blink"]}`}></span>;
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

export class BaccaratBigRoadConverter extends Converter<BaccaratSettlementResult> {
    static addBlinkNode(rounds: BaccaratSettlementResult[]) {
        const lastRound = rounds.find((round) => round.player || round.banker);
        const blinkRound = { banker: lastRound?.banker, player: undefined, tie: undefined, drawId: 0, anyPair: false, playerPair: false, bankerPair: false };

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
        const isBlink = round.data.some((result) => result.player === undefined || result.banker === undefined);
        const isEmpty = round.data.length === 0 || (!round.data.some((result) => result.banker) && !round.data.some((result) => result.player) && !round.data.some((result) => result.tie));

        return <BigRoadIcon round={round} isBlink={isBlink} isEmpty={isEmpty} />;
    }
}

registerBigRoadElement(BaccaratBigRoadElement, BaccaratBigRoadConverter as any, GAME_ID);
