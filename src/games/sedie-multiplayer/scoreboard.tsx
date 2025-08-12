import { Component, ReactNode, memo } from "react";

import { Round } from "../../components/game-base/type";
import { SlidableScoreboard, SwitchableScoreboard } from "../../components/game-components/round-history/scoreboard";
import { BeadRoadElement, BigRoadElement } from "../../components/game-components/round-history/scoreboard/elements";
import { createBeadRoadElement, SeDieBigRoadConverter, SeDieBigRoadElement } from "./scoreboard-elements";
import Styles from "./scoreboard.module.scss";
import { SeDieResult, SeDieSettlementResult } from "./sedie-multiplayer-constants";
import { tolgee } from "../../_shared/tolgee";

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
            <div className={Styles["scoreboard-full"]} id="big-road">
                <SwitchableScoreboard
                    rounds={settlements}
                    type="switch"
                    scoreboards={[
                        {
                            element: SeDieBigRoadElement as unknown as React.ComponentType<any>,
                            arrange: BigRoadElement.arrange(SeDieBigRoadConverter.instance as any),
                            column: 18,
                            row: 6,
                        },
                    ]}
                />
            </div>
        );
    }

    renderBeadRoad(): ReactNode {
        const { roundHistory, isShowBlink } = this.props;
        const rounds = isShowBlink ? ([{}, ...roundHistory] as any) : (roundHistory as any);
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? Styles["bead-road-indo"] : "";

        return (
            <div className={Styles["scoreboard-full"]} id="bead-road">
                <SwitchableScoreboard
                    rounds={rounds}
                    type="switch"
                    scoreboards={[
                        {
                            element: createBeadRoadElement(this.props.isOddEven) as unknown as React.ComponentType<any>,
                            arrange: BeadRoadElement.arrange,
                            column: 18,
                            row: 6,
                            elementClassName: classNameIndo,
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

export default memo(ScoreboardSeDie);


