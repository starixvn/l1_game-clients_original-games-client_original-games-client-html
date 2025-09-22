import { Component, ReactNode, memo } from "react";
import { Round } from '@shared/components/game-base/type';
import { ScoreboardProps, SwitchableScoreboard, SlidableScoreboard } from '@shared/components/game-components/round-history/scoreboard';
import {
    BaccaratBigRoadConverter,
    BaccaratBigRoadElement,
    BaccaratBeadRoadCharacterElement,
    BaccaratBeadRoadCharacterElementWithTranslator,
} from "./scoreboard-elements";
import Styles from "./scoreboard.module.scss";
import { BaccaratResult, BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import { cn } from "@shared/utils";
import { hasPlayerPair, hasBankerPair, hasNatural } from './utils';

export type ScoreboardComponentProps = {
    roundHistory: Round<BaccaratResult, BaccaratSettlementResult>[];
    isShowBlink: boolean;
    playResultAnimation?: boolean;
};

class ScoreboardBaccarat extends Component<ScoreboardComponentProps> {

    private scoreboardColumns = 17;

    updateScoreboardColumns = (actualColumns: number) => {
        this.scoreboardColumns = actualColumns;
    };

    onSwitchBigRoad(board: Partial<ScoreboardProps<BaccaratSettlementResult>>) {
        return {
            ...board,
            className: `${board.className} ${Styles["scoreboard-expand"]}`,
        };
    }

    renderBigRoad(): ReactNode {
        const { roundHistory, isShowBlink, playResultAnimation } = this.props;

        const settlements = [...roundHistory].map((round) => ({
            ...round.settlementResult,
            natural: round.result ? hasNatural(round.result) : false,
            playerPair: round.result ? hasPlayerPair(round.result.player) : false,
            bankerPair: round.result ? hasBankerPair(round.result.banker) : false,
        }));

        if (isShowBlink) {
            BaccaratBigRoadConverter.addBlinkNode(settlements);
        }

        return (
            <div className={cn(Styles["scoreboard-full"], "py-1 px-0")} id="big-road">
                <SwitchableScoreboard
                    rounds={settlements as any}
                    scoreboards={[
                        {
                            element: BaccaratBigRoadElement,
                            arrange: BaccaratBigRoadElement.arrange(BaccaratBigRoadConverter.instance),
                            column: this.scoreboardColumns,
                            row: 6,
                            updateScoreboardColumns: this.updateScoreboardColumns,
                            className: Styles["big-bead-road-override"],
                            blockClassName: Styles["big-bead-road-block"],
                            elementClassName: Styles["big-bead-road-item"],
                            scrollToRight: playResultAnimation,
                            columnWidth: 16
                        },
                    ]}
                />
            </div>
        );
    }

    renderBeadRoad(): ReactNode {
        const { roundHistory, isShowBlink, playResultAnimation } = this.props;
        const rounds = isShowBlink ? [{}, ...roundHistory] : roundHistory;

        return (
            <div className={cn(Styles["scoreboard-full-bead-road"], "py-1 px-0")} id="bead-road">
                <SwitchableScoreboard
                    rounds={rounds}
                    scoreboards={[
                        {
                            element: BaccaratBeadRoadCharacterElementWithTranslator,
                            arrange: BaccaratBeadRoadCharacterElement.arrange,
                            column: this.scoreboardColumns,
                            row: 6,
                            updateScoreboardColumns: this.updateScoreboardColumns,
                            className: Styles["big-bead-road-override"],
                            blockClassName: Styles["big-bead-road-block"],
                            elementClassName: Styles["big-bead-road-item"],
                            scrollToRight: playResultAnimation,
                            columnWidth: 16
                        },
                    ]}
                />
            </div>
        );
    }

    render(): ReactNode {
        return <SlidableScoreboard boards={[this.renderBigRoad(), this.renderBeadRoad()]} />;
    }
}

export default memo(ScoreboardBaccarat);


