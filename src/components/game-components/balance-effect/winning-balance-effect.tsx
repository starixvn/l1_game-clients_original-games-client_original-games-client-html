import { FC, useState, useEffect, useCallback, useRef, useMemo } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import { useGameStore } from "../../../_shared/stores/game-store/game-store";
import ReactCanvasConfetti from "react-canvas-confetti";
import { motion } from "motion/react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

const WinningBalanceEffect: FC = () => {
    const { betWin, showResultInfo } = useGameStateContext();
    const ownBets = useGameStore((state) => state.ownBets);
    const totalBetAmount = Object.values(ownBets).reduce((acc, curr) => acc + curr, 0);
    const [showContent, setShowContent] = useState(false);
    const animationInstance = useRef(null);
    const delayFireConfettiAfterShowPopup = 1700;
    const getInstance = (instance: any) => {
        animationInstance.current = instance;
    };

    const multiplier = useMemo(() => {
        const multiplier = betWin / totalBetAmount;
        return multiplier.toFixed(2);
    }, [betWin]);

    const fireConfetti = useCallback(() => {
        if (!animationInstance.current) {
            return;
        }

        makeShot(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        makeShot(0.2, {
            spread: 60,
        });

        makeShot(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, []);

    const makeShot = (particleRatio: number, opts: any) => {
        animationInstance.current &&
            animationInstance.current({
                ...opts,
                origin: { y: 0.5, x: 0.5 },
                particleCount: Math.floor(140 * particleRatio),
            });
    };

    useEffect(() => {
        if (showResultInfo && parseFloat(multiplier) > 0) {
            setShowContent(true);
        } else {
            setShowContent(false);
        }
    }, [showResultInfo]);

    useEffect(() => {
        if (showContent) {
            setTimeout(() => {
                fireConfetti();
            }, delayFireConfettiAfterShowPopup);
        }
    }, [showContent, fireConfetti]);

    return (
        <>
            <ReactCanvasConfetti
                refConfetti={getInstance}
                style={{
                    position: "absolute",
                    pointerEvents: "none",
                    width: "100%",
                    height: "100%",
                    top: 50,
                    left: 0,
                    zIndex: 9999,
                }}
            />
            {showContent && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.7,
                        delay: 0.4,
                        ease: [0, 1.7, 0.2, 1],
                    }}
                    className=" inset-0 z-[100] absolute justify-items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-0 animate-fadeIn" />

                    <div className="flex justify-center items-center h-full w-full">
                        <div className="flex z-10 animate-popupIn ">
                            <div className="bg-[#2e3646] relative rounded-2xl" style={{ width: "228px", height: "116px" }}>
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

                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.7, duration: 0.2, ease: "easeOut" }}
                                            className="z-[100]"
                                        >
                                            <p className="block font-semibold bg-[linear-gradient(180deg,#FFFADD_13.79%,#FFF832_56.9%,#E0C600_100%)] text-[36px] bg-clip-text text-transparent">
                                                {multiplier}x
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 1.6, duration: 0.4, ease: "easeOut" }}
                                            className="bg-none z-[100]"
                                        >
                                            <p className="font-semibold bg-white bg-clip-text text-transparent text-[24px]">
                                                {numberWithCommas(betWin, 2)}
                                            </p>
                                        </motion.div>
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
