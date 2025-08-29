import React, { useState, useEffect } from "react";
import styles from "./sedie-plate.module.scss";
import { RoundState } from "../../../components/game-base/type";
import useResult from "../../../_shared/react-hooks/use-result";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { SeDieResult } from "../sedie-multiplayer-constants";
import { SedieButtons } from "./sedie-buttons";
import { useGameContext } from "../../../_shared/react-contexts";
import { BgCachedImage } from "../../../components/game-components/cached-image/bg-cached-image";

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

const SediePlate: React.FC = () => {
    const { durations } = useGameContext();
    const { roundHistory, result, roundState, roundId } = useGameStateContext();
    const [isShow, setIsShow] = useState(false);
    const [buttonsPosition, setButtonsPosition] = useState<Array<{ x: number; y: number }>>([]);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const [showButtons, setShowButtons] = useState(false);
    const [buttonsValue, setButtonsValue] = useState<boolean[]>([]);
    const currentResult = useResult<SeDieResult>({ result, roundState, roundHistory });

    useEffect(() => {
        if (currentResult) {
            setButtonsValue(Object.values(currentResult));
        }
    }, [currentResult]);

    useEffect(() => {
        const newButtons = generateButtonPositions(roundId);
        animationState !== "open" && setButtonsPosition(newButtons);
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

    const renderButtons = () => {
        if (!showButtons) {
            return null;
        }

        return <SedieButtons buttonsPosition={buttonsPosition} buttonsValue={buttonsValue} size={BUTTON_SIZE} />;
    };

    if (!isShow) {
        return null;
    }

    const classBowlAnimation = styles[`bowl-${animationState}`];
    return (
        <div className="relative w-full">
            <div
                className={`${styles["object"]} absolute p-2 h-[296px] left-[50%] -translate-x-1/2 z-[var(--result-animation-index)] content-center`}
                style={
                    {
                        "--button-size": `${BUTTON_SIZE}px`,
                        "--plate-size": `${PLATE_SIZE}px`,
                        "--bowl-size": `${BOWL_SIZE}px`,
                        "--boundary-size": `${BOUNDARY_SIZE}px`,
                        "--shake-duration": `${SHAKE_DURATION}ms`,
                        "--open-duration": `${OPEN_DURATION}ms`,
                        "--close-duration": `${CLOSE_DURATION}ms`,
                    } as React.CSSProperties
                }
            >
                <div className={`${styles["plate-buttons"]} ${styles["plate-buttons-" + animationState]}`}>
                    <BgCachedImage
                        pathImage={"/static/images/sedie-multiplayer/result/plate.png"}
                        backgroundPosition="center"
                        backgroundSize="cover"
                        backgroundRepeat="no-repeat"
                        className={`${styles["plate"]} ${styles["plate-" + animationState]}`}
                    >
                        {renderButtons()}
                        <BgCachedImage
                            pathImage={"/static/images/sedie-multiplayer/result/bowl.png"}
                            backgroundPosition="center"
                            backgroundSize="cover"
                            backgroundRepeat="no-repeat"
                            className={`${styles["bowl"]} ${classBowlAnimation}`}
                        />
                    </BgCachedImage>
                </div>
            </div>
        </div>
    );
};

const generateButtonPositions = (seedValue: number, time = 1) => {
    const seededRandom = (min: number, max: number) => {
        const x = Math.sin(seedValue) * 10000;
        seedValue++;
        return min + (x - Math.floor(x)) * (max - min);
    };

    const newButtons: Array<{ x: number; y: number }> = [];
    let isOverlap = false;
    for (let i = 0; i < 4; i++) {
        let attempts = 0;
        let position: { x: number; y: number } | null = null;
        while (attempts < MAX_ATTEMPTS) {
            const angle = seededRandom(0, 2 * Math.PI);
            const radius = seededRandom(0, CIRCLE_RADIUS - BUTTON_SIZE / 2);
            const centerX = CIRCLE_RADIUS + radius * Math.cos(angle);
            const centerY = CIRCLE_RADIUS + radius * Math.sin(angle);
            const x = centerX - BUTTON_SIZE / 2;
            const y = centerY - BUTTON_SIZE / 2;
            const overlaps = newButtons.some((button) => {
                const buttonCenterX = button.x + BUTTON_SIZE / 2;
                const buttonCenterY = button.y + BUTTON_SIZE / 2;
                const newButtonCenterX = centerX;
                const newButtonCenterY = centerY;

                const distance = Math.sqrt(Math.pow(newButtonCenterX - buttonCenterX, 2) + Math.pow(newButtonCenterY - buttonCenterY, 2));
                return distance < BUTTON_SIZE + BUTTON_BUFFER;
            });
            if (!overlaps) {
                position = { x, y };
                break;
            }
            attempts++;
        }

        if (attempts >= MAX_ATTEMPTS) {
            isOverlap = true;
            break;
        }

        if (!position) {
            const angle = seededRandom(0, 2 * Math.PI);
            const radius = seededRandom(0, CIRCLE_RADIUS - BUTTON_SIZE / 2);
            const centerX = CIRCLE_RADIUS + radius * Math.cos(angle);
            const centerY = CIRCLE_RADIUS + radius * Math.sin(angle);
            position = {
                x: centerX - BUTTON_SIZE / 2,
                y: centerY - BUTTON_SIZE / 2,
            };
        }
        newButtons.push({
            x: position.x,
            y: position.y,
        });
    }
    if (time > 5) {
        return newButtons;
    }
    if (isOverlap) {
        const newSeed = seedValue + 100;
        return generateButtonPositions(newSeed, time + 1);
    }
    return newButtons;
};

export default SediePlate;
