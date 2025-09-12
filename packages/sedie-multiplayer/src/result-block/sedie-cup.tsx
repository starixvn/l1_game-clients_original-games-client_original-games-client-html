import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "./sedie-cup.module.scss";
import { RoundState } from "@shared/components/game-base/type";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useGameContext } from "@shared/react-contexts";
import { Spritesheet } from "@shared/components/game-components/sprites-sheet";
import { motion } from "motion/react";
import { getWinningSubOption } from "../history/sedie-multiplayer-bet-detail-result-block";
import { CachedImage } from "@shared/components/game-components/cached-image";
import { useMemoriedImage } from "@shared/react-hooks/use-memoried-image";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";
import { useDiceShakingRollingSound } from "@shared/react-hooks/use-sound";

const OPEN_DURATION = 1500; // Open duration in milliseconds

type AnimationState = "idle" | "shake" | "open" | "close";

const operatorName = "nova88";

const SedieCup = () => {
    const { durations } = useGameContext();
    const { roundState, settlementResult, playResultAnimation } = useGameStateContext();
    const [isShow, setIsShow] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const { data } = useMemoriedImage(`/static/images/sedie-multiplayer/result/${getWinningSubOption(settlementResult)}.webp`);
    const [isUseDefaultAnimation, setIsUseDefaultAnimation] = useState(true);
    const { data: animationPhase1 } = useMemoriedImage(`/static/images/sedie-multiplayer/animation/phase-1/animation-phase-1.webp`);
    const { data: red2 } = useMemoriedImage(`/static/images/sedie-multiplayer/animation/phase-2/red2.webp`);
    const { data: red3 } = useMemoriedImage(`/static/images/sedie-multiplayer/animation/phase-2/red3.webp`);
    const { data: red4 } = useMemoriedImage(`/static/images/sedie-multiplayer/animation/phase-2/red4.webp`);
    const { data: white3 } = useMemoriedImage(`/static/images/sedie-multiplayer/animation/phase-2/white3.webp`);
    const { data: white4 } = useMemoriedImage(`/static/images/sedie-multiplayer/animation/phase-2/white4.webp`);

    const animationPhase2 = useMemo(() => {
        switch (getWinningSubOption(settlementResult)) {
            case SeDieBetOptions.RED2:
                return red2;
            case SeDieBetOptions.RED3:
                return red3;
            case SeDieBetOptions.RED4:
                return red4;
            case SeDieBetOptions.WHITE3:
                return white3;
            case SeDieBetOptions.WHITE4:
                return white4;
            default:
                return null;
        }
    }, [settlementResult]);

    const [phase, setPhase] = useState<"spin" | "result">("spin");
    const resultRef = useRef(null);

    const playDiceShakingRollingSound = useDiceShakingRollingSound();
    const playDiceShakingRollingRef = useRef(playDiceShakingRollingSound);
    useEffect(() => {
        playDiceShakingRollingRef.current = playDiceShakingRollingSound;
    }, [playDiceShakingRollingSound]);

    useEffect(() => {
        console.log("animationPhase1", isUseDefaultAnimation);
        if (animationPhase1 && animationPhase2) {
            setIsUseDefaultAnimation(false);
        }
    }, [animationPhase1, animationPhase2]);

    useEffect(() => {
        const resetState = () => {
            setIsShow(false);
            setAnimationState("idle");
            setPhase("spin");
        };
        let timeout;
        let delayDisplayResult;
        switch (roundState) {
            case RoundState.LockingBet:
                setIsShow(false);
                setAnimationState("shake");
                break;
            case RoundState.DisplayResult:
                if (playResultAnimation) {
                    setIsShow(true);
                    delayDisplayResult = setTimeout(() => {
                        playDiceShakingRollingRef.current();
                        setAnimationState("open");
                    }, OPEN_DURATION);
                }

                timeout = setTimeout(() => {
                    resetState();
                }, durations.showResult * 1000);
                break;
            case RoundState.BeforePlaceBet:
            case RoundState.InRound:
                resetState();
                break;
            default:
                break;
        }
        return () => {
            timeout && clearTimeout(timeout);
            delayDisplayResult && clearTimeout(delayDisplayResult);
        };
    }, [roundState, durations]);

    if (!isShow) {
        return null;
    }

    return (
        <div className="relative" id="sedie-cup">
            <div className={`absolute w-[370px] h-[286px] left-[50%] -translate-x-1/2 z-10`}>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        delay: 0,
                        ease: [0.2, 1.4, 0.6, 1],
                    }}
                    className="relative w-full h-full top-0 z-[var(--result-animation-index)] "
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Back */}
                    <CachedImage
                        src="/static/images/sedie-multiplayer/result/box-back.webp"
                        alt="Box Back"
                        width={202}
                        height={103}
                        className="absolute top-[92px] left-[82px] z-[1]"
                    />

                    {/* Inside */}
                    <CachedImage
                        src={`/static/images/sedie-multiplayer/result/box-inside-${operatorName}.webp`}
                        alt="Box Bottom"
                        width={168}
                        height={91}
                        className={`z-[2] absolute top-[100px] left-[99px] ${
                            animationState === "open" ? styles["box-bottom-animation"] : ""
                        }`}
                    />

                    {/* Front */}
                    <CachedImage
                        src="/static/images/sedie-multiplayer/result/box-front.webp"
                        alt="Box Front"
                        width={205}
                        height={120}
                        className="absolute top-[145px] left-[80px] z-[3]"
                    />

                    {/*Cover */}
                    <CachedImage
                        src="/static/images/sedie-multiplayer/result/box-cover.webp"
                        alt="Box Cover"
                        className=" absolute top-[13px] left-[91px] scale-[98%] z-[4]"
                        width={185}
                        height={187}
                    />

                    <div className="absolute w-full h-full top-[-59px] left-[0px] scale-[50%] z-[5]">
                        {animationState === "open" ? (
                            <div>
                                <Spritesheet
                                    key={`phase-1`}
                                    className={`absolute inset-0 transition-opacity duration-[145ms] ${
                                        phase === "spin" ? "opacity-100" : "opacity-0"
                                    }`}
                                    imageData={isUseDefaultAnimation ? data : animationPhase1}
                                    widthFrame={195}
                                    heightFrame={195}
                                    isResponsive
                                    steps={20}
                                    autoplay={true}
                                    fps={40}
                                    startAt={1}
                                    endAt={isUseDefaultAnimation ? 100 : 60}
                                    onPause={(spritesheet) => {
                                        if (!isUseDefaultAnimation) {
                                            setPhase("result");
                                            console.log("onPause phase 1", phase);
                                            if (resultRef.current) {
                                                resultRef.current.goToAndPlay(0);
                                            }
                                        }
                                    }}
                                />

                                <Spritesheet
                                    key={`phase-2`}
                                    className={`absolute inset-0 transition-opacity duration-[145ms] ${
                                        phase === "result" ? "opacity-100" : "opacity-0"
                                    }`}
                                    ref={resultRef}
                                    imageData={isUseDefaultAnimation ? data : animationPhase2}
                                    widthFrame={195}
                                    heightFrame={195}
                                    isResponsive
                                    steps={20}
                                    fps={40}
                                    startAt={1}
                                    endAt={60}
                                    autoplay={false}
                                    getInstance={(spritesheet) => (resultRef.current = spritesheet)}
                                />
                            </div>
                        ) : (
                            <Spritesheet
                                key={`waiting`}
                                className={`fade-in`}
                                imageData={isUseDefaultAnimation ? data : animationPhase1}
                                widthFrame={195}
                                heightFrame={195}
                                isResponsive
                                steps={0}
                                autoplay
                                fps={30}
                                startAt={1}
                                endAt={1}
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SedieCup;
