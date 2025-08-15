import React, { useEffect, useState } from "react";

import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../game-base/type";
import Ball, { BallStatus, IBall } from "../ball";
import Style from "./turn-base-result-container.module.scss";

export type IResultSlotContainer = {
    delayTime: number;
    betChoice: string;
    className?: string;
    defaultRoundData: IBall[];
    betChoiceBalls: string;
    groupType?: number;
    delayClassName?: string;
} & Partial<GameStateContextModel>;

export const RoundBaseResultSlotContainer: React.FC<IResultSlotContainer> = (props) => {
    const {
        delayTime,
        betChoice,
        className,
        roundState,
        roundData,
        defaultRoundData,
        betChoiceBalls,
        playResultAnimation,
        delayClassName,
    } = props;

    const [ballsData, setBallsData] = useState<IBall[]>([]);

    const updateLoadingIcon = (data) => {
        const currentRound = data?.find((ball) => ball.number === 0);
        if (currentRound) {
            currentRound.status = BallStatus.LOADING;
        }
    };

    useEffect(() => {
        const cloneDefaultData = () => {
            return defaultRoundData.map((data) => {
                return { ...data };
            });
        };

        const updateBallData = (clonedData: IBall[], number: number, index: number) => {
            clonedData[index].number = number;

            if (playResultAnimation) {
                clonedData[index].status = BallStatus.LOADING;
                clonedData[index].delayTime = playResultAnimation ? delayTime : 0;
            } else {
                clonedData[index].status = BallStatus.SHOW;
                clonedData[index].delayTime = 0;
            }
        };

        const processRoundData = (clonedData: IBall[]) => {
            if (roundData?.[betChoiceBalls]?.length > 0) {
                for (let i = 0; i < clonedData.length; i++) {
                    const number = roundData[betChoiceBalls][i];
                    if (number) {
                        updateBallData(clonedData, number, i);
                    }
                }
            }
            return clonedData;
        };

        const getBallsDataFromRoundData = () => {
            const clonedData = cloneDefaultData();
            return processRoundData(clonedData);
        };

        const data = getBallsDataFromRoundData();
        updateLoadingIcon(data);
        setBallsData(data);
    }, [roundData]);

    useEffect(() => {
        if (roundState === RoundState.LockingBet || roundState === RoundState.InRound) {
            updateLoadingIcon([...ballsData]);
        }
    }, [roundState]);

    if (betChoice === null) {
        return (
            <div className={`${Style["ball-container"]} ${className}`}>
                {defaultRoundData.map((result, index) => {
                    return <Ball key={index} index={index} {...result} />;
                })}
            </div>
        );
    }

    return (
        <div className={`${Style["ball-container"]} ${className}`}>
            {ballsData.map((result, index) => {
                return <Ball key={index} index={index} {...result} delayClassName={result.delayTime > 0 ? delayClassName : ""} />;
            })}
        </div>
    );
};
