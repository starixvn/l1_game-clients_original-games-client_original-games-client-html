import { Component, ReactNode, memo } from "react";
import { Round } from "../../../components/game-base/type";
import { SwitchableScoreboard } from "../../../components/game-components/round-history/scoreboard";
import { BigRoadElement } from "../../../components/game-components/round-history/scoreboard/elements";
import { SeDieBigRoadConverter, SeDieBigRoadElement } from "./scoreboard-elements";
import Styles from "./scoreboard.module.scss";
import { SeDieResult, SeDieSettlementResult } from "../sedie-multiplayer-constants";

export type ScoreboardComponentProps = {
    roundHistory: Round<SeDieResult, SeDieSettlementResult>[];
    isShowBlink: boolean;
    isOddEven: boolean;
    playResultAnimation?: boolean;
};

class ScoreboardSeDie extends Component<ScoreboardComponentProps> {
    private scoreboardColumns: number = 22;

    updateScoreboardColumns = (actualColumns: number) => {
        this.scoreboardColumns = actualColumns;
    };



    renderBigRoad(): ReactNode {
        const { roundHistory, isShowBlink, playResultAnimation } = this.props;
        const settlements = [...roundHistory].map((round) => round.settlementResult);

        isShowBlink && SeDieBigRoadConverter.addBlinkNode(settlements);

        return (
            <div className={`${Styles["scoreboard-full"]} ${Styles["big-road"]}`} id="big-road">
                <SwitchableScoreboard
                    rounds={settlements}
                    type="switch"
                    scoreboards={[
                        {
                            element: SeDieBigRoadElement as unknown as React.ComponentType<any>,
                            arrange: BigRoadElement.arrange(SeDieBigRoadConverter.instance as any),
                            column: this.scoreboardColumns,
                            row: 6,
                            updateScoreboardColumns: this.updateScoreboardColumns,
                            className: Styles["big-road-override"],
                            blockClassName: Styles["big-road-block"],
                            elementClassName: Styles["big-road-item"],
                            scrollToRight: playResultAnimation
                        },
                    ]}
                />
            </div>
        );
    }

    // Refactored version without wrapper div
    renderBigRoadRefactored(): ReactNode {
        const { roundHistory, isShowBlink, playResultAnimation } = this.props;
        const settlements = [...roundHistory].map((round) => round.settlementResult);

        isShowBlink && SeDieBigRoadConverter.addBlinkNode(settlements);

        return (
            <div className={Styles["scoreboard-full-big-road"]} id="big-road">
                <SwitchableScoreboard
                    rounds={settlements}
                    type="switch"
                    scoreboards={[
                        {
                            element: SeDieBigRoadElement as unknown as React.ComponentType<any>,
                            arrange: BigRoadElement.arrange(SeDieBigRoadConverter.instance as any),
                            column: this.scoreboardColumns,
                            row: 6,
                            updateScoreboardColumns: this.updateScoreboardColumns,
                            className: Styles["big-road-override"],
                            blockClassName: Styles["big-road-block"],
                            elementClassName: Styles["big-road-item"],
                            scrollToRight: playResultAnimation
                        },
                    ]}
                />
            </div>
        );
    }

    render(): ReactNode {
        // Use refactored version without wrapper div
        return this.renderBigRoadRefactored();
    }
}

export default memo(ScoreboardSeDie);


