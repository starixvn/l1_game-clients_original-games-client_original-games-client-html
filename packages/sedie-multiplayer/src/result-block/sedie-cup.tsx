import React, { useState, useEffect, useRef } from "react";
import styles from "./sedie-cup.module.scss";
import { RoundState } from "@shared/components/game-base/type";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useGameContext } from "@shared/react-contexts";
import { Spritesheet } from "@shared/components/game-components/sprites-sheet";
import { motion } from "motion/react";
import { CachedImage } from "@shared/components/game-components/cached-image";
import { useDiceShakingRollingSound } from "@shared/react-hooks/use-sound";
import dynamic from "next/dynamic";
import { getWinningSubOption } from "@/history/sedie-multiplayer-bet-detail-result-block";
import { useMemoriedImage } from "@shared/react-hooks/use-memoried-image";

const WinningBalanceEffect = dynamic(() => import("@shared/components/game-components/balance-effect/winning-balance-effect"), { ssr: false });

const OPEN_DURATION = 500; // Open duration in milliseconds

type AnimationState = "idle" | "shake" | "open" | "close";

const operatorName = "nova88";

const SedieCup = () => {
    const { durations } = useGameContext();
    const { roundState, settlementResult, playResultAnimation } = useGameStateContext();
    const [isShow, setIsShow] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");

    // Use custom hook to manage all animation images
    const { data } = useMemoriedImage(`/static/images/sedie-multiplayer/result/${getWinningSubOption(settlementResult)}.webp`); 


    const playDiceShakingRollingSound = useDiceShakingRollingSound();

    useEffect(() => {
        const resetState = () => {
            setAnimationState("idle");
        };

        const startExitAnimation = () => {
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsShow(false);
                setIsAnimatingOut(false);
                resetState();
            }, 300); // Match animation duration
        };

        let timeout;
        let delayDisplayResult;
        switch (roundState) {
            case RoundState.LockingBet:
                setIsShow(false);
                setIsAnimatingOut(false);
                setAnimationState("shake");
                break;
            case RoundState.DisplayResult:
                if (playResultAnimation) {
                    setIsShow(true);
                    setIsAnimatingOut(false);
                    delayDisplayResult = setTimeout(() => {
                        playDiceShakingRollingSound();
                        setAnimationState("open");
                    }, OPEN_DURATION);
                }

                timeout = setTimeout(() => {
                    startExitAnimation();
                }, durations.showResult * 1000);
                break;
            case RoundState.BeforePlaceBet:
            case RoundState.InRound:
                setIsShow(false);
                setIsAnimatingOut(false);
                resetState();
                break;
            default:
                break;
        }
        return () => {
            timeout && clearTimeout(timeout);
            delayDisplayResult && clearTimeout(delayDisplayResult);
        };
    }, [roundState, durations, playResultAnimation]);

    if (!isShow) {
        return null;
    }

    return (
        <div className="relative" id="sedie-cup">
            <div className={`absolute w-[370px] h-[286px] left-[50%] -translate-x-1/2 z-10`}>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isAnimatingOut ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                    transition={{
                        duration: isAnimatingOut ? 0.3 : 0.5,
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

                    <div className="relative w-full h-full top-[13px] left-[83px] z-[5] scale-[92%]">
                        {animationState === "open" ? (
                            <div>
                                    <Spritesheet
                                        key={`phase-1`}
                                        className={`absolute`}
                                        imageData={data}
                                        widthFrame={195}
                                        heightFrame={195}
                                        isResponsive={false}
                                        steps={20}
                                        autoplay={true}
                                        fps={40}
                                        startAt={1}
                                        endAt={100}
                                    />
                            </div>
                        ) : (
                            <Spritesheet
                                key={`waiting`}
                                className={`fade-in`}
                                imageData={data}
                                widthFrame={195}
                                heightFrame={195}
                                isResponsive={false}
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

            <WinningBalanceEffect />

        </div>
    );
};

export default SedieCup;
