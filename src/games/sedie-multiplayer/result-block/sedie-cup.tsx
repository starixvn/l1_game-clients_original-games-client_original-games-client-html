import React, { useState, useEffect } from "react";
import styles from "./sedie-cup.module.scss";
import { RoundState } from "../../../components/game-base/type";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useGameContext } from "../../../_shared/react-contexts";
import Image from "next/image";
import { Spritesheet } from "../../../components/game-components/sprites-sheet";
import { motion } from "motion/react";
import { getWinningSubOption } from "../history/sedie-multiplayer-bet-detail-result-block";

const OPEN_DURATION = 1500; // Open duration in milliseconds

type AnimationState = "idle" | "shake" | "open" | "close";

const SedieCup = () => {
    const { durations } = useGameContext();
    const { roundState, settlementResult, playResultAnimation } = useGameStateContext();
    const [isShow, setIsShow] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const [data, setData] = useState("");

    useEffect(() => {
        if (settlementResult) {
            setData(`/static/images/chips/${getWinningSubOption(settlementResult)}.webp`);
        }
    }, [settlementResult]);

    useEffect(() => {
        const resetState = () => {
            setIsShow(false);
            setAnimationState("idle");
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
        <div className="relative">
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
                    <Image
                        src="/static/images/chip-box/box-back.png"
                        alt="Box Back"
                        width={202}
                        height={103}
                        className="absolute top-[92px] left-[82px] z-[1]"
                    />

                    {/* Inside */}
                    <Image
                        src="/static/images/chip-box/box-inside.png"
                        alt="Box Bottom"
                        width={168}
                        height={91}
                        className={`z-[2] absolute top-[100px] left-[99px] ${animationState === "open" ? styles["box-bottom-animation"] : ""}`}
                    />

                    {/* Front */}
                    <Image
                        src="/static/images/chip-box/box-front.png"
                        alt="Box Front"
                        width={205}
                        height={120}
                        className="absolute top-[145px] left-[80px] z-[3]"
                    />

                    {/*Cover */}
                    <Image
                        src="/static/images/chip-box/box-cover.png"
                        alt="Box Cover"
                        className=" absolute top-[13px] left-[91px] scale-[98%] z-[4]"
                        width={185}
                        height={187}
                    />

                    <div className="absolute w-full h-full top-[-57px] left-[0px] scale-[45%] z-[5]">
                        {animationState === "open" ? (
                            <div>
                                <Spritesheet
                                    className={`fade-in`}
                                    imageData={data}
                                    widthFrame={195}
                                    heightFrame={195}
                                    isResponsive
                                    steps={20}
                                    autoplay
                                    fps={40}
                                    startAt={1}
                                    endAt={100}
                                />
                            </div>
                        ) : (
                            <Spritesheet
                                className={`fade-in`}
                                imageData={data}
                                widthFrame={195}
                                heightFrame={195}
                                isResponsive
                                steps={0}
                                autoplay
                                fps={40}
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
