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
import { BigRoadElement } from "@shared/components/game-components/round-history/scoreboard/elements";
import { cn } from "@shared/utils";

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
        const settlements = [...roundHistory].map((round) => round.settlementResult);

        // Add blink node for Big Road animation
        if (isShowBlink) {
            BaccaratBigRoadConverter.addBlinkNode(settlements);
        }

        const arrange = BigRoadElement.arrange(BaccaratBigRoadConverter.instance as any);
        const arrangeWithLogs = (rounds: any[], scoreboard: any) => arrange(rounds, scoreboard) as any[];

        return (
            <div className={cn(Styles["scoreboard-full"], "p-1")} id="big-road">
                <SwitchableScoreboard
                    rounds={settlements as any}
                    scoreboards={[
                        {
                            // element: BaccaratBigRoadElement as unknown as React.ComponentType<any>,
                            // arrange: arrangeWithLogs as any,
                            element: BaccaratBigRoadElement,
                            arrange: BaccaratBigRoadElement.arrange(BaccaratBigRoadConverter.instance),
                            column: this.scoreboardColumns,
                            row: 6,
                            // className: Styles["big-road-override"],
                            // blockClassName: Styles["big-road-block"],
                            // elementClassName: Styles["big-road-item"],
                            // scrollToRight: playResultAnimation
                        },
                    ]}
                />
            </div>
        );
    }

    renderBeadRoad(): ReactNode {
        const { roundHistory, isShowBlink } = this.props;
        const rounds = isShowBlink ? [{}, ...roundHistory] : roundHistory;

        return (
            <div className={Styles["scoreboard-full"]} id="bead-road">
                <SwitchableScoreboard
                    rounds={rounds}
                    scoreboards={[
                        {
                            element: BaccaratBeadRoadCharacterElementWithTranslator,
                            arrange: BaccaratBeadRoadCharacterElement.arrange,
                            column: this.scoreboardColumns,
                            row: 6,
                            // updateScoreboardColumns: this.updateScoreboardColumns,

                            // className: Styles["big-road-override"],
                            // blockClassName: Styles["big-road-block"],
                            // elementClassName: Styles["big-road-item"],
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


