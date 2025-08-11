import React, { memo, useEffect, useState } from "react";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../components/game-base/type";
import { CageColor, CagePosition } from "../../components/game-components/cage";
import CageResultList from "../../components/game-components/cage-result-list";
import Style from "./sedie-multi-player.module.scss";
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
                gameFolder="sedie-multi-player"
                highlightBallSize={{ width: 624, height: 216 }}
                roundState={roundState}
            />

            {currentResult && (
                <div className={Style["result-info"]}>
                    <div className={Style["result-details"]}>
                        <span>Draw ID: {currentResult.drawId}</span>
                        <span>Time: {currentResult.time}</span>
                        {currentResult.winningChoice && (
                            <span>Winner: {currentResult.winningChoice}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(SeDieResultBlock);
