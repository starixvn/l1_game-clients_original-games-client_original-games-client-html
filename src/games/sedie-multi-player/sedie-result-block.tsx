import React, { memo, useEffect, useState } from "react";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../components/game-base/type";
import { CageColor, CagePosition } from "../../components/game-components/cage";
import CageResultList from "../../components/game-components/cage-result-list";
import Style from "../se-ball/se-ball.module.scss";
import { SeDieResult } from "./sedie-constants";

export type SeDieResultBlockProps = Partial<GameStateContextModel>;

const SeDieResultBlock: React.FC<SeDieResultBlockProps> = (props: SeDieResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation } = props;
    const [zoomClass, setZoomClass] = useState(`${Style["zoom-out-no-animation"]}`);

    useEffect(() => {
        if (roundState === RoundState.Disabled || (roundState === RoundState.DisplayResult && playResultAnimation)) {
            setZoomClass(`${Style["zoom-out"]}`);
        }

        if (roundState === RoundState.InRound || roundState === RoundState.LockingBet) {
            setZoomClass(`${Style["zoom-in"]}`);
        }

        if (roundState === RoundState.DisplayResult && !playResultAnimation) {
            setZoomClass(`${Style["zoom-out-no-animation"]}`);
        }
    }, [roundState, playResultAnimation]);

    if (roundState === RoundState.BeforePlaceBet && !isPlayStartRoundAnimation) {
        return <></>;
    }

    const currentResult = result as SeDieResult;
    const resultBalls = currentResult?.balls || [];

    // Calculate additional statistics
    const calculateDiceStats = () => {
        if (!resultBalls || resultBalls.length === 0) return null;

        const sum = resultBalls.reduce((acc, val) => acc + val, 0);
        const isOdd = sum % 2 === 1;
        const isEven = sum % 2 === 0;

        return {
            sum,
            isOdd,
            isEven,
            count: resultBalls.length,
        };
    };

    const diceStats = calculateDiceStats();

    return (
        <div
            className={`${Style["result-container"]} ${zoomClass} ${roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? "showResultContainer " : ""
                }`}
        >
            <CageResultList
                color={CageColor.PURPLE}
                position={CagePosition.LEFT}
                isSmall={true}
                listResult={resultBalls}
                playResultAnimation={playResultAnimation}
                gameFolder="se-ball"
                highlightBallSize={{ width: 624, height: 216 }}
                roundState={roundState}
            />

            {currentResult && (
                <div className={Style["result-info"]}>
                    <div className={Style["result-details"]}>
                        <span className={Style["result-item"]}>
                            <strong>Draw ID:</strong> {currentResult.drawId}
                        </span>
                        <span className={Style["result-item"]}>
                            <strong>Time:</strong> {currentResult.time}
                        </span>
                        {currentResult.winningChoice && (
                            <span className={Style["result-item"]}>
                                <strong>Winner:</strong> {currentResult.winningChoice.toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Enhanced dice statistics */}
                    {diceStats && (
                        <div className={Style["dice-statistics"]}>
                            <div className={Style["stat-row"]}>
                                <span className={Style["stat-label"]}>Dice Count:</span>
                                <span className={Style["stat-value"]}>{diceStats.count}</span>
                            </div>
                            <div className={Style["stat-row"]}>
                                <span className={Style["stat-label"]}>Total Sum:</span>
                                <span className={Style["stat-value"]}>{diceStats.sum}</span>
                            </div>
                            <div className={Style["stat-row"]}>
                                <span className={Style["stat-label"]}>Result:</span>
                                <span className={`${Style["stat-value"]} ${Style[diceStats.isOdd ? "odd-result" : "even-result"]}`}>
                                    {diceStats.isOdd ? "ODD" : "EVEN"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Round history summary */}
                    {roundHistory && roundHistory.length > 0 && (
                        <div className={Style["history-summary"]}>
                            <div className={Style["history-header"]}>
                                <strong>Recent Results</strong>
                            </div>
                            <div className={Style["history-items"]}>
                                {roundHistory.slice(-5).reverse().map((round, index) => (
                                    <span
                                        key={index}
                                        className={`${Style["history-item"]} ${Style[round.result?.winningChoice || "unknown"]}`}
                                    >
                                        {round.result?.winningChoice?.toUpperCase() || "N/A"}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default memo(SeDieResultBlock);
