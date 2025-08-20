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
    playResultAnimation?: boolean;
};

class ScoreboardSeDie extends Component<ScoreboardComponentProps> {
    private scoreboardColumns: number = 22;

    updateScoreboardColumns = (actualColumns: number) => {
        this.scoreboardColumns = actualColumns;
    };



    render(): ReactNode {
        const { roundHistory, isShowBlink, playResultAnimation } = this.props;
        const rawSettlements = [...roundHistory].map((round) => round.settlementResult);
        const settlements = rawSettlements.map((s: any) => {
            if (!s) return s;
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
        // Debug: input size and distribution before any transformation
        try {
            const rawCounts = rawSettlements.reduce(
                (acc, r: any) => {
                    const isOdd = !!r?.odd;
                    const isEven = !!r?.even;
                    if (isOdd) acc.odd += 1;
                    if (isEven) acc.even += 1;
                    if (!isOdd && !isEven) acc.neither += 1;
                    return acc;
                },
                { odd: 0, even: 0, neither: 0 }
            );
            const counts = settlements.reduce(
                (acc, r: any) => {
                    const isOdd = !!r?.odd;
                    const isEven = !!r?.even;
                    if (isOdd) acc.odd += 1;
                    if (isEven) acc.even += 1;
                    if (!isOdd && !isEven) acc.neither += 1;
                    return acc;
                },
                { odd: 0, even: 0, neither: 0 }
            );
            const bothTrueIdx = settlementsWithIdx.filter((s: any) => s?.odd === true && s?.even === true).map((s: any) => s.__idx);
            // eslint-disable-next-line no-console
            console.log(
                "[ScoreboardSeDie] roundHistory:",
                {
                    rounds: roundHistory.length,
                    settlementsRaw: rawSettlements.length,
                    settlementsNormalized: settlements.length,
                    rawDistribution: rawCounts,
                    distribution: counts,
                    bothTrueCount: bothTrueIdx.length,
                    bothTrueSample: bothTrueIdx.slice(0, 10),
                }
            );
        } catch (_) { }

        isShowBlink && SeDieBigRoadConverter.addBlinkNode(settlementsWithIdx as any);

        // Wrap arrange with logging so we can compare input vs arranged vs rendered nodes
        const arrange = BigRoadElement.arrange(SeDieBigRoadConverter.instance as any);
        const arrangeWithLogs = (rounds: any[], scoreboard: any) => {
            try {
                const input = [...rounds].reverse();
                const grouped = (SeDieBigRoadConverter.instance as any).group(input);
                const groupSizes = grouped.map((g: any[]) => g.length);
                // eslint-disable-next-line no-console
                console.log("[ScoreboardSeDie] grouped:", { groups: grouped.length, sampleGroupSizes: groupSizes.slice(0, 20) });
            } catch { }

            const arranged = arrange(rounds, scoreboard) as any[];
            const nonEmpty = arranged.filter((n) => n && Array.isArray(n.data) && n.data.length > 0);
            const usedIdx = new Set<number>();
            for (const node of nonEmpty) {
                for (const item of node.data) {
                    if (typeof item?.__idx === "number") usedIdx.add(item.__idx);
                }
            }
            // eslint-disable-next-line no-console
            console.log(
                "[ScoreboardSeDie] arrange:",
                {
                    inputRounds: rounds.length,
                    arrangedTotal: arranged.length,
                    nonEmptyNodes: nonEmpty.length,
                    configuredColumns: this.scoreboardColumns,
                    configuredRows: 6,
                    roundsUsed: usedIdx.size,
                }
            );
            return arranged as any[];
        };

        return (
            <div className={Styles["scoreboard-full-big-road"]} id="big-road">
                <SwitchableScoreboard
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


