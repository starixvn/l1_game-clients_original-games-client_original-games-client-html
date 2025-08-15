import React, { memo, useEffect, useState } from "react";

import { getBallColor } from "../../../_shared/helpers/ball-color-helper";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../game-base/type";
import BallLoops from "./ball-loops";
import Styles from "./cage.module.scss";
import ResultBall from "./result-ball";
import ResultNumber from "./result-number";
import { useMemoriedImage } from "../../../_shared/react-hooks";
import { BgCachedImage } from "../cached-image/bg-cached-image";

export enum CageColor {
    BLUE = "blue",
    RED = "red",
    PURPLE = "purple",
}

export enum CagePosition {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
}

export type CageProps = {
    color: string;
    isSmall: boolean;
    result?: number;
    delayShowResultTime?: number;
    position: string;
    highlight?: boolean;
    ballFPS?: number;
} & Partial<GameStateContextModel>;

const Cage: React.FC<CageProps> = ({
    position,
    isSmall,
    result,
    delayShowResultTime,
    color,
    playResultAnimation,
    roundState,
    highlight,
    ballFPS,
}) => {
    const [isDelayShowResult, setIsDelayShowResult] = useState<boolean>(false);
    const [ballColor, setBallColor] = useState<string>(null);
    const { data: cageBorder } = useMemoriedImage(`/static/images/cage/cage-border-${color}.webp`);
    const { data: cageBorder2x } = useMemoriedImage(`/static/images/cage/cage-border-${color}-2x.webp`);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;
        if (playResultAnimation) {
            timeOut = setTimeout(() => setIsDelayShowResult(true), delayShowResultTime);
        } else if (roundState === RoundState.DisplayResult) {
            setIsDelayShowResult(true);
        } else {
            setIsDelayShowResult(false);
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, [delayShowResultTime, playResultAnimation, roundState]);

    useEffect(() => {
        !!result && setBallColor(`ball-${getBallColor(result)}-${position === CagePosition.RIGHT ? "2" : "1"}`);
    }, [result]);

    return (
        <div className={`${Styles["cage-area"]} ${isSmall ? Styles["small"] : ""} ${Styles[position]}`}>
            {highlight && <div className={`${Styles["cage-bg-highlight"]}`}></div>}
            <BgCachedImage className={Styles["cage-bg"]} pathImage={`/static/images/cage/cage.webp`} />
            <BallLoops />
            <BgCachedImage className={Styles["cage-cover"]} pathImage={`/static/images/cage/cage-cover.webp`} />
            <div
                id="cage-border"
                className={`${Styles["cage-border"]}`}
                style={{ backgroundImage: `image-set(url('${cageBorder}') 1x, url('${cageBorder2x}') 2x)` }}
            >
                {!isDelayShowResult && <BgCachedImage className={Styles["cage-lid"]} pathImage={`/static/images/cage/cage-lid.webp`} />}

                {!!ballColor && (
                    <ResultBall
                        isDelayShowResult={isDelayShowResult}
                        ballColor={ballColor}
                        isShowResultAnim={playResultAnimation}
                        fps={ballFPS}
                    />
                )}
            </div>

            {!!result && (
                <ResultNumber isDelayShowResult={isDelayShowResult} number={result} isShowResultAnim={playResultAnimation} fps={ballFPS} />
            )}
        </div>
    );
};

export default memo(Cage);
