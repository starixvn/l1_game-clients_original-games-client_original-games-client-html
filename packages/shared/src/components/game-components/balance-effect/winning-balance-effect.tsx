import { FC, useState, useEffect, useCallback, useRef, useMemo } from "react";

import { numberWithCommas } from "@shared/helpers";
import { useGameStore } from "@shared/stores/game-store/game-store";
import { motion } from "motion/react";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { usePopUpWinningSound } from "@shared/react-hooks/use-sound";
import { RoundState } from "@shared/components/game-base/type";
import { useGameContext } from "@shared/react-contexts";
import usePopupStore from "@shared/stores/popup-store/popup-store";

const WinningBalanceEffect: FC = () => {
    const { betWin, showResultInfo, roundState } = useGameStateContext();
    const { durations } = useGameContext();
    const ownBets = useGameStore((state) => state.ownBets);
    const totalBetAmount = Object.values(ownBets).reduce((acc, curr) => acc + curr, 0);
    const [showContent, setShowContent] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const delayFireConfettiAfterShowPopup = 1700;
    const toggleConfetti = usePopupStore((state) => state.toggleConfetti);

    const playPopUpWinningSound = usePopUpWinningSound();
    const playPopUpWinningRef = useRef(playPopUpWinningSound);
    useEffect(() => {
        playPopUpWinningRef.current = playPopUpWinningSound;
    }, [playPopUpWinningSound]);

    const multiplier = useMemo(() => {
        const multiplier = totalBetAmount > 0 ? betWin / totalBetAmount : 0;
        return numberWithCommas(Math.floor(multiplier * 100) / 100, 2);
    }, [betWin, totalBetAmount]);

    useEffect(() => {
        if (showResultInfo && parseFloat(multiplier) > 0) {
            setShowContent(true);
            setIsAnimatingOut(false);
        }
    }, [showResultInfo, multiplier]);

    useEffect(() => {
        if (roundState === RoundState.DisplayResult) {
            setTimeout(() => {
                startExitAnimation();
            }, durations.showResult * 1000);
        }
    }, [roundState]);

    const startExitAnimation = useCallback(() => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setShowContent(false);
            setIsAnimatingOut(false);
        }, 300);
    }, []);

    useEffect(() => {
        if (showContent) {
            setTimeout(() => {
                toggleConfetti(true);
                playPopUpWinningRef.current();
            }, delayFireConfettiAfterShowPopup);
        }
    }, [showContent]);

    return (
        <>          
            {showContent && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isAnimatingOut ? { scale: 0, opacity: 0 } : { scale: 0.93, opacity: 1 }}
                    transition={{
                        duration: isAnimatingOut ? 0.3 : 1,
                        delay: isAnimatingOut ? 0 : 1.2,
                        ease: isAnimatingOut ? [0.2, 1.4, 0.6, 1] : [0, 1.7, 0.5, 1],
                    }}
                    className=" inset-0 z-[100] absolute mt-[240px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-0 animate-fadeIn" />

                    <div className="flex justify-center items-center h-full w-full">
                        <div className="flex z-10 animate-popupIn ">
                            <div className="bg-[#2e3646] relative rounded-2xl" style={{ minWidth: "228px", height: "94px" }}>
                                <div className="flex flex-col items-center justify-center relative size-full">
                                    <div className="box-border content-stretch flex flex-col gap-1 items-center justify-center overflow-clip p-[24px] relative size-full rounded-2xl">
                                        <div
                                            className="absolute size-[276px] top-[-231px] translate-x-[-50%] animate-glowIn"
                                            style={{ left: "calc(50% - 19px)" }}
                                        >
                                            <div className="absolute inset-[-90.58%]">
                                                <svg
                                                    className="block size-full"
                                                    fill="none"
                                                    preserveAspectRatio="none"
                                                    viewBox="0 0 776 776"
                                                >
                                                    <g id="bg">
                                                        <g filter="url(#filter0_f_4_90)">
                                                            <motion.circle
                                                                cx="388"
                                                                cy="388"
                                                                fill="#FFCF31"
                                                                r="138"
                                                                initial={{ r: 0 }}
                                                                animate={{ r: 138 }}
                                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                            />
                                                        </g>
                                                        <g filter="url(#filter1_f_4_90)">
                                                            <motion.circle
                                                                cx="388"
                                                                cy="411"
                                                                fill="#FFC60A"
                                                                r="87"
                                                                initial={{ r: 0 }}
                                                                animate={{ r: 87 }}
                                                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                                            />
                                                        </g>
                                                    </g>
                                                    <defs>
                                                        <filter
                                                            colorInterpolationFilters="sRGB"
                                                            filterUnits="userSpaceOnUse"
                                                            height="776"
                                                            id="filter0_f_4_90"
                                                            width="776"
                                                            x="0"
                                                            y="0"
                                                        >
                                                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                            <feBlend
                                                                in="SourceGraphic"
                                                                in2="BackgroundImageFix"
                                                                mode="normal"
                                                                result="shape"
                                                            />
                                                            <feGaussianBlur result="effect1_foregroundBlur_4_90" stdDeviation="125" />
                                                        </filter>
                                                        <filter
                                                            colorInterpolationFilters="sRGB"
                                                            filterUnits="userSpaceOnUse"
                                                            height="334"
                                                            id="filter1_f_4_90"
                                                            width="334"
                                                            x="221"
                                                            y="244"
                                                        >
                                                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                            <feBlend
                                                                in="SourceGraphic"
                                                                in2="BackgroundImageFix"
                                                                mode="normal"
                                                                result="shape"
                                                            />
                                                            <feGaussianBlur result="effect1_foregroundBlur_4_90" stdDeviation="40" />
                                                        </filter>
                                                    </defs>
                                                </svg>
                                            </div>
                                        </div>

                                        <p className="z-[100] block font-semibold bg-[linear-gradient(180deg,#FFFADD_13.79%,#FFF832_56.9%,#E0C600_100%)] text-[24px] bg-clip-text text-transparent">
                                            {multiplier}x
                                        </p>

                                        <p className="bg-none z-[100] font-semibold bg-white bg-clip-text text-transparent text-[18px]">
                                            {numberWithCommas(betWin, 2)}
                                        </p>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    aria-hidden="true"
                                    className="absolute border-2 border-[#fff153] border-solid inset-[-2px] pointer-events-none rounded-[18px] shadow-[0px_0px_30px_1px_rgba(255,255,255,0.5),0px_0px_100px_3px_#000000]"
                                />

                                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 1, duration: 0.5 }} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
};

export default WinningBalanceEffect;
