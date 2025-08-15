import React, { memo, useCallback, useEffect, useState } from "react";

import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../game-base/type";
import BallLoops from "../cage/ball-loops";
import CageStyles from "../cage/cage.module.scss";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage-result-list.module.scss";
import ResultGroup from "./result-group";
import { useMemoriedImage } from "../../../_shared/react-hooks";
import { CachedImage } from "../cached-image";
import { BgCachedImage } from "../cached-image/bg-cached-image";

export type CageResultListProps = {
    color: string;
    isSmall: boolean;
    position: string;
    listResult: number[];
    gameFolder: string;
    highlightBallSize: { width: number; height: number };
    initialBallDelayTime?: number;
    ballFPS?: number;
    highlightBallSteps?: number;
    showTotalCallback?: Function;
} & Partial<GameStateContextModel>;

const CageResultList: React.FC<CageResultListProps> = ({
    position,
    isSmall,
    color,
    playResultAnimation,
    ballFPS,
    listResult,
    roundState,
    initialBallDelayTime,
    gameFolder,
    highlightBallSize,
    highlightBallSteps,
    showTotalCallback,
}) => {
    const [showBalls, setShowBalls] = useState(false);
    const [totalPoint, setTotalPoint] = useState(0);
    const [needStartDrawAnim, setNeedStartDrawAnim] = useState(false);
    const [customCageClass, setCustomCageClass] = useState("");

    const showBallDelayTime = 1000;
    const { data } = useMemoriedImage(`/static/images/${gameFolder}/result-ball/ball-highlight.webp`);
    const { data: cageBorder } = useMemoriedImage(`/static/images/cage/cage-border-${color}.webp`);
    const { data: cageBorder2x } = useMemoriedImage(`/static/images/cage/cage-border-${color}-2x.webp`);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (!showBalls && roundState === RoundState.DisplayResult) {
            timeOut = setTimeout(
                () => {
                    setShowBalls(true);
                },
                playResultAnimation ? showBallDelayTime : 0
            );
        }

        return () => {
            clearTimeout(timeOut);
        };
    });

    useEffect(() => {
        if (roundState === RoundState.InRound) {
            setShowBalls(false);
            setNeedStartDrawAnim(false);
        }

        if (roundState === RoundState.BeforePlaceBet) {
            setTotalPoint(0);
            setCustomCageClass("");
            showTotalCallback && showTotalCallback(false);
            setNeedStartDrawAnim(true);
        }
    }, [roundState]);

    const incrementTotalPoint = useCallback((point: number) => {
        showTotalCallback && showTotalCallback(!!point);
        setTotalPoint((currentTotalPoint) => currentTotalPoint + point);
        setCustomCageClass(`${playResultAnimation ? Styles["hide-ball"] : Styles["hide-ball-no-anim"]}`);
    }, []);

    return (
        <div
            className={`${CageStyles["cage-area"]} ${isSmall ? CageStyles["small"] : ""} ${CageStyles[position]} ${Styles[`type-${listResult?.length}`]
                }`}
        >
            <div className={`${Styles["ball"]} ${customCageClass}`}>
                <BgCachedImage className={CageStyles["cage-bg"]} pathImage={`/static/images/cage/cage.webp`} />
                <BallLoops />
                <BgCachedImage className={CageStyles["cage-cover"]} pathImage={`/static/images/cage/cage-cover.webp`} />
                <div
                    id="cage-border"
                    className={`${CageStyles["cage-border"]}`}
                    style={{ backgroundImage: `image-set(url('${cageBorder}') 1x, url('${cageBorder2x}') 2x)` }}
                >
                    {!showBalls && <BgCachedImage className={Styles["cage-lid"]} pathImage={`/static/images/cage/cage-lid.webp`} />}
                </div>

                {playResultAnimation && (
                    <CachedImage
                        width={140}
                        height={140}
                        className={`${CageStyles["ball-blur"]} ${Styles["ball-blur"]}`}
                        src={`/static/images/cage/cage-border-purple-blur.webp`}
                        alt="img-blur"
                    />
                )}
            </div>
            {showBalls && totalPoint > 0 && <div className={`${Styles["total-point"]} fade-in`}>{totalPoint}</div>}

            <div id="show-ball-anim" className={`${Styles["show-ball-anim"]} ${needStartDrawAnim ? "fade-out" : ""}`}>
                {showBalls && (
                    <ResultGroup
                        listResult={listResult}
                        playResultAnimation={playResultAnimation}
                        initialBallDelayTime={initialBallDelayTime}
                        incrementTotalPoint={incrementTotalPoint}
                    />
                )}

                {showBalls && playResultAnimation && data && (
                    <Spritesheet
                        className={`${Styles["ball-result"]}`}
                        imageData={data}
                        widthFrame={highlightBallSize.width}
                        isResponsive
                        heightFrame={highlightBallSize.height}
                        steps={highlightBallSteps ?? 6}
                        autoplay
                        fps={ballFPS ?? 32}
                    />
                )}
            </div>
        </div>
    );
};

export default memo(CageResultList);
