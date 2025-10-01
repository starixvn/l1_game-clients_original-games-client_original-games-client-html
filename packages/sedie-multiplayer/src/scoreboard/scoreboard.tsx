import { Component, ReactNode, memo } from "react";
import { Round } from '@shared/components/game-base/type';
import { SwitchableScoreboard } from '@shared/components/game-components/round-history/scoreboard';
import { BigRoadElement } from '@shared/components/game-components/round-history/scoreboard/elements';
import { SeDieBigRoadConverter, SeDieBigRoadElement } from "./scoreboard-elements";
import Styles from "./scoreboard.module.scss";
import { SeDieResult, SeDieSettlementResult } from "../sedie-multiplayer-constants";

export type ScoreboardComponentProps = {
    roundHistory: Round<SeDieResult, SeDieSettlementResult>[];
    isShowBlink: boolean;
    playResultAnimation?: boolean;
};

class ScoreboardSeDie extends Component<ScoreboardComponentProps> {
    private scoreboardColumns = 20;
    private scrollTrigger = 0;

    updateScoreboardColumns = (actualColumns: number) => {
        this.scoreboardColumns = actualColumns;
    };

    componentDidUpdate(prevProps: ScoreboardComponentProps) {
        if (prevProps.roundHistory !== this.props.roundHistory) {
            this.scrollTrigger = Date.now();
        }
    }

    render(): ReactNode {
        const { roundHistory, isShowBlink, playResultAnimation } = this.props;
        const rawSettlements = [...roundHistory].map((round) => round.settlementResult);
        const settlements = rawSettlements.map((s: any) => {
            if (!s) {
                return s;
            }
            const hasOddEven = s.odd !== undefined || s.even !== undefined;
            const bothFalse = s.odd === false && s.even === false;
            const bothTrue = s.odd === true && s.even === true;
            if (!hasOddEven || bothFalse) {
                const odd = Boolean(s?.red3 || s?.white3);
                const even = Boolean(s?.red2 || s?.red4 || s?.white4);
                return { ...s, odd, even };
            }
            if (bothTrue) {
                const preferOdd = Boolean(s?.red3 || s?.white3);
                const preferEven = Boolean(s?.red2 || s?.red4 || s?.white4);
                if (preferOdd && !preferEven) {
                    return { ...s, odd: true, even: false };
                }
                if (preferEven && !preferOdd) {
                    return { ...s, odd: false, even: true };
                }
                // Default: force even to be the opposite of odd
                return { ...s, even: !s.odd };
            }
            return s;
        });
        // Attach index for traceability through arrange
        const settlementsWithIdx = settlements.map((s, idx) => ({ ...s, __idx: idx }));


        if (isShowBlink) {
            SeDieBigRoadConverter.addBlinkNode(settlementsWithIdx as any);
        }

        const arrange = BigRoadElement.arrange(SeDieBigRoadConverter.instance as any);
        const arrangeWithLogs = (rounds: any[], scoreboard: any) => arrange(rounds, scoreboard) as any[];

        return (
            <div className={Styles["scoreboard-full-big-road"]} id="big-road">
                <SwitchableScoreboard
                    key={`sedie-big-road-${this.scrollTrigger}`}
                    rounds={settlementsWithIdx as any}
                    scoreboards={[
                        {
                            element: SeDieBigRoadElement as unknown as React.ComponentType<any>,
                            arrange: arrangeWithLogs as any,
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
}

export default memo(ScoreboardSeDie);


