import React, { useState, useEffect, useRef } from "react";
import styles from "./sedie-cup.module.scss";
import { RoundState } from "@shared/components/game-base/type";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useGameContext } from "@shared/react-contexts";
import { Spritesheet } from "@shared/components/game-components/sprites-sheet";
import { motion } from "motion/react";
import { CachedImage } from "@shared/components/game-components/cached-image";
import { useDiceShakingRollingSound } from "@shared/react-hooks/use-sound";
import { useAnimationImages } from "./use-animation-images";
import { logger } from '@shared/services/logger';
import dynamic from "next/dynamic";
import LoggerControls from "../features/ui/components/controls/LoggerControls";

const WinningBalanceEffect = dynamic(() => import("@shared/components/game-components/balance-effect/winning-balance-effect"), { ssr: false });

const OPEN_DURATION = 500; // Open duration in milliseconds

type AnimationState = "idle" | "shake" | "open" | "close";

const operatorName = "nova88";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const SedieCup = () => {
    const { durations } = useGameContext();
    const { roundState, settlementResult, playResultAnimation } = useGameStateContext();
    const [isShow, setIsShow] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");

    logger.info('🎲 [SEDIE-CUP] SedieCup component initialized', {
        roundState,
        hasSettlementResult: !!settlementResult,
        playResultAnimation,
        timestamp: new Date().toISOString()
    });

    // Use custom hook to manage all animation images
    const { animationPhase1, animationPhase2 } = useAnimationImages(settlementResult);

    const resultRef = useRef(null);
    const phase1Ref = useRef(null);
    const phase2Ref = useRef(null);

    const playDiceShakingRollingSound = useDiceShakingRollingSound();

    logger.debug('🎲 [SEDIE-CUP] Animation images loaded', {
        hasAnimationPhase1: !!animationPhase1,
        hasAnimationPhase2: !!animationPhase2,
        hasSettlementResult: !!settlementResult
    });

    useEffect(() => {
        const resetState = () => {
            logger.debug('🔄 [SEDIE-CUP] Resetting animation state to idle');
            setAnimationState("idle");
        };

        const startExitAnimation = () => {
            logger.info('🚪 [SEDIE-CUP] Starting exit animation');
            setIsAnimatingOut(true);
            setTimeout(() => {
                logger.debug('✅ [SEDIE-CUP] Exit animation completed');
                setIsShow(false);
                setIsAnimatingOut(false);
                resetState();
            }, 300); // Match animation duration
        };

        let timeout;
        let delayDisplayResult;

        logger.info('🎲 [SEDIE-CUP] Round state changed', {
            roundState,
            playResultAnimation,
            showResultDuration: durations.showResult
        });

        switch (roundState) {
            case RoundState.LockingBet:
                logger.info('🔒 [SEDIE-CUP] Locking bet state - hiding cup and setting shake animation');
                setIsShow(false);
                setIsAnimatingOut(false);
                setAnimationState("shake");
                break;
            case RoundState.DisplayResult:
                logger.info('📊 [SEDIE-CUP] Display result state', {
                    playResultAnimation,
                    showResultDuration: durations.showResult
                });
                if (playResultAnimation) {
                    setIsShow(true);
                    setIsAnimatingOut(false);
                    delayDisplayResult = setTimeout(() => {
                        logger.info('🎵 [SEDIE-CUP] Playing dice shaking sound and opening cup');
                        playDiceShakingRollingSound();
                        setAnimationState("open");
                    }, OPEN_DURATION);
                }

                timeout = setTimeout(() => {
                    logger.info('⏰ [SEDIE-CUP] Show result timeout reached, starting exit animation');
                    startExitAnimation();
                }, durations.showResult * 1000);
                break;
            case RoundState.BeforePlaceBet:
            case RoundState.InRound:
                logger.info('🎯 [SEDIE-CUP] Betting round state - hiding cup and resetting');
                setIsShow(false);
                setIsAnimatingOut(false);
                resetState();
                break;
            default:
                logger.debug('❓ [SEDIE-CUP] Unknown round state', { roundState });
                break;
        }
        return () => {
            timeout && clearTimeout(timeout);
            delayDisplayResult && clearTimeout(delayDisplayResult);
        };
    }, [roundState, durations, playResultAnimation]);

    if (!isShow) {
        logger.debug('👻 [SEDIE-CUP] Cup not showing, returning null');
        return null;
    }

    logger.debug('🎨 [SEDIE-CUP] Rendering sedie cup', {
        animationState,
        isAnimatingOut,
        hasSettlementResult: !!settlementResult
    });

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
                    className="relative z-[var(--result-animation-index)] "
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Back */}
                    <CachedImage
                        src={`${basePath}/static/images/sedie-multiplayer/result/box-back.webp`}
                        alt="Box Back"
                        width={202}
                        height={103}
                        className="absolute top-[92px] left-[82px] z-[1]"
                    />

                    {/* Inside */}
                    <CachedImage
                        src={`${basePath}/static/images/sedie-multiplayer/result/box-inside-${operatorName}.webp`}
                        alt="Box Bottom"
                        width={168}
                        height={91}
                        className={`z-[2] absolute top-[100px] left-[99px] ${animationState === "open" ? styles["box-bottom-animation"] : ""
                            }`}
                    />

                    {/* Front */}
                    <CachedImage
                        src={`${basePath}/static/images/sedie-multiplayer/result/box-front.webp`}
                        alt="Box Front"
                        width={205}
                        height={120}
                        className="absolute top-[145px] left-[80px] z-[3]"
                    />

                    {/*Cover */}
                    <CachedImage
                        src={`${basePath}/static/images/sedie-multiplayer/result/box-cover.webp`}
                        alt="Box Cover"
                        className=" absolute top-[13px] left-[91px] scale-[98%] z-[4]"
                        width={185}
                        height={187}
                    />

                    <div className="relative w-full h-full top-[15px] left-[83px] z-[5] scale-[92%]">
                        {animationState === "open" ? (
                            <div>
                                <div ref={phase1Ref} style={{ opacity: 1 }}>
                                    <Spritesheet
                                        key={`phase-1`}
                                        className={`absolute`}
                                        imageData={animationPhase1}
                                        widthFrame={195}
                                        heightFrame={195}
                                        isResponsive={false}
                                        steps={20}
                                        autoplay={true}
                                        fps={40}
                                        startAt={1}
                                        endAt={60}
                                        onPause={(spritesheet) => {
                                            if (resultRef.current && phase1Ref.current) {
                                                phase1Ref.current.style.opacity = "0";
                                                resultRef.current?.goToAndPlay(0);
                                                phase2Ref.current.style.opacity = "1";
                                            }
                                        }}
                                    />
                                </div>
                                <div ref={phase2Ref} style={{ opacity: 0 }}>
                                    <Spritesheet
                                        key={`phase-2`}
                                        className={`absolute`}
                                        ref={resultRef}
                                        imageData={animationPhase2}
                                        widthFrame={195}
                                        heightFrame={195}
                                        isResponsive={false}
                                        steps={20}
                                        fps={40}
                                        startAt={1}
                                        endAt={60}
                                        autoplay={false}
                                        getInstance={(spritesheet) => {
                                            resultRef.current = spritesheet;
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <Spritesheet
                                key={`waiting`}
                                className={`fade-in`}
                                imageData={animationPhase1}
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

            <LoggerControls className="fixed top-4 right-4 z-50" />

        </div>
    );
};

export default SedieCup;
