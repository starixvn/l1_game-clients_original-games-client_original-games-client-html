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
};

class ScoreboardSeDie extends Component<ScoreboardComponentProps> {
    renderBigRoad(): ReactNode {
        const { roundHistory, isShowBlink } = this.props;
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
                            column: 22,
                            row: 6,

                            className: Styles["big-road-override"],
                            blockClassName: Styles["big-road-block"],
                            elementClassName: Styles["big-road-item"],
                            style: { gridTemplateColumns: `repeat(22, 16px)` } as any,

                        },
                    ]}
                />
            </div>
        );
    }

    render(): ReactNode {

        return this.renderBigRoad();

    }
}

export default memo(ScoreboardSeDie);


