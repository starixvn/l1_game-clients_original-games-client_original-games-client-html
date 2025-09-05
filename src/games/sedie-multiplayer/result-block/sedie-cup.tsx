import React, { useState, useEffect } from "react";
import styles from "./sedie-cup.module.scss";
import { RoundState } from "../../../components/game-base/type";
import useResult from "../../../_shared/react-hooks/use-result";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { SeDieResult } from "../sedie-multiplayer-constants";
import { SedieButtons } from "./sedie-buttons";
import { useGameContext } from "../../../_shared/react-contexts";
import { BgCachedImage } from "../../../components/game-components/cached-image/bg-cached-image";
import Image from "next/image";
import { Spritesheet } from "../../../components/game-components/sprites-sheet";
import { motion } from "motion/react";

const BUTTON_SIZE = 29; // Button size in pixels
const PLATE_SIZE = 228; // Plate size in pixels
const BOWL_SIZE = 123; // Bowl size in pixels
const BOUNDARY_SIZE = 110; // Boundary size in pixels
const CIRCLE_RADIUS = BOUNDARY_SIZE / 2; // Half of boundary diameter
const BUTTON_BUFFER = 2; // Buffer between buttons
const SHAKE_DURATION = 2000; // Shake duration in milliseconds
const OPEN_DURATION = 1000; // Open duration in milliseconds
const CLOSE_DURATION = 1000; // Close duration in milliseconds
const MAX_ATTEMPTS = 10000;
const DELAY = 500;

type AnimationState = "idle" | "shake" | "open" | "close";

const SedieCup = () => {
    const data = `/static/images/chips/1.webp`;

    const { durations } = useGameContext();
    const { roundHistory, result, roundState, roundId } = useGameStateContext();
    const [isShow, setIsShow] = useState(false);
    const [buttonsPosition, setButtonsPosition] = useState<Array<{ x: number; y: number }>>([]);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        const id = roundState === RoundState.DisplayResult ? roundId - 1 : roundId;
    }, [roundId]);

    useEffect(() => {
        const resetState = () => {
            setIsShow(false);
            setShowButtons(false);
            setAnimationState("idle");
        };
        let timeoutDisplayResult;
        let timeout;
        switch (roundState) {
            case RoundState.LockingBet:
                setIsShow(true);
                setShowButtons(false);
                setAnimationState("shake");
                break;
            case RoundState.DisplayResult:
                timeoutDisplayResult && clearTimeout(timeoutDisplayResult);
                timeoutDisplayResult = setTimeout(() => {
                    setIsShow(true);
                    setAnimationState("idle");
                    setShowButtons(true);
                    setAnimationState("open");
                    timeout = setTimeout(() => {
                        resetState();
                    }, durations.showResult * 1000);
                }, DELAY);
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
            timeoutDisplayResult && clearTimeout(timeoutDisplayResult);
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
                    animate={{ scale: 0.4, opacity: 1 }}
                    transition={{
                        duration: 0.7,
                        delay: 0.4,
                        ease: [0, 1.7, 0.2, 1],
                    }}
                    className="relative w-full h-full top-0 z-[var(--result-animation-index)] "
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Back */}
                    <Image
                        src="/static/images/chip-box/box-back.png"
                        alt="Box Back"
                        width={450}
                        height={400}
                        className="absolute top-[27%]"
                    />

                    {/* Front */}
                    <Image
                        src="/static/images/chip-box/box-front.png"
                        alt="Box Front"
                        width={700}
                        height={500}
                        className="absolute top-[65%]"
                    />

                    {/* Bottom */}
                    <Image
                        src="/static/images/chip-box/box-inside.png"
                        alt="Box Bottom"
                        width={330}
                        height={320}
                        className={`absolute top-[32%] left-[5%]  ${animationState === "open" ? `${styles["plate-buttons-shake"]}` : ""}`}
                    />            

                    {/*Cover */}
                    <Image
                        src="/static/images/chip-box/box-cover.png"
                        alt="Box Cover"
                        className=" absolute top-[-27%]"
                        width={500}
                        height={500}
                    />

                    <div className="absolute w-full h-full top-[-60px] left-[-10px]">
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
                                    startAt={0}
                                    endAt={100}
                                />
                            </div>
                        ) : (
                            <div >
                                <Image
                                    src="/static/images/chip-box/red.png"
                                    alt="Dice-1"
                                    width={120}
                                    height={120}
                                    className="absolute top-[120px] left-[90px]"
                                />
                                <Image
                                    src="/static/images/chip-box/white.png"
                                    alt="Dice-2"
                                    width={120}
                                    height={120}
                                    className="absolute top-[120px] left-[190px]"
                                />

                                <Image
                                    src="/static/images/chip-box/red.png"
                                    alt="Dice-3"
                                    width={120}
                                    height={120}
                                    className="absolute top-[170px] left-[90px]"
                                />
                                <Image
                                    src="/static/images/chip-box/white.png"
                                    alt="Dice-4"
                                    width={120}
                                    height={120}
                                    className="absolute top-[170px] left-[190px]"
                                />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SedieCup;
