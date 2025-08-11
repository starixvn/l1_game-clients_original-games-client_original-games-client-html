import React, { memo, useEffect, useState } from "react";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
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

    const currentResult = useResult<SeDieResult>({ result, roundState, roundHistory });
    const resultBalls = currentResult?.balls || [];

    if (roundState === RoundState.BeforePlaceBet && !isPlayStartRoundAnimation) {
        return <></>;
    }

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

        </div>
    );
};

export default memo(SeDieResultBlock);
