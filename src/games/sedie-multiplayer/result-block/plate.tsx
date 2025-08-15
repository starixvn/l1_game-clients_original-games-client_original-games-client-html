import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./plate.module.scss";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../../components/game-base/type";
import useResult from "../../../_shared/react-hooks/use-result";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { SeDieResult } from "../sedie-multiplayer-constants";

const BUTTON_SIZE = 38; // Button size in pixels
const PLATE_SIZE = 200; // Plate size in pixels
const BOWL_SIZE = 140; // Bowl size in pixels
const BOUNDARY_SIZE = 130; // Boundary size in pixels
const CIRCLE_RADIUS = BOUNDARY_SIZE / 2; // Half of boundary diameter
const BUTTON_BUFFER = 2; // Buffer between buttons
const SHAKE_DURATION = 2000; // Shake duration in milliseconds
const OPEN_DURATION = 1000; // Open duration in milliseconds
const CLOSE_DURATION = 1000; // Close duration in milliseconds
const MAX_ATTEMPTS = 10000;

type AnimationState = "idle" | "shake" | "open" | "close";
type SeDieResultBlockProps = Partial<GameStateContextModel>;

const PlateButtons: React.FC<SeDieResultBlockProps> = (props: SeDieResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation } = props;
    const [buttonsPosition, setButtonsPosition] = useState<Array<{ x: number; y: number }>>([]);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const [showButtons, setShowButtons] = useState(true);
    const [showBowl, setShowBowl] = useState(true);
    const [buttonsValue, setButtonsValue] = useState<boolean[]>([]);
    const currentResult = useResult<SeDieResult>({ result, roundState, roundHistory });
    const { roundId } = useGameStateContext();

    useEffect(() => {
        if (currentResult) {
            setButtonsValue(Object.values(currentResult));
        }
    }, [currentResult]);

    useEffect(() => {
        const newButtons = generateButtonPositions(roundId);
        setButtonsPosition(newButtons);
    }, [roundId]);

    // Animation handlers
    const handleShake = () => {
        setAnimationState("shake");
        generateButtonPositions(roundId);
        setShowButtons(false);
        setTimeout(() => {
            setAnimationState("idle");
        }, SHAKE_DURATION);
    };

    const handleOpen = () => {
        setAnimationState("open");
        setShowButtons(true);
    };

    const handleClose = () => {
        setAnimationState("close");
        setShowBowl(true);
        setTimeout(() => {
            setShowButtons(false);
        }, CLOSE_DURATION);
    };

    const renderButtons = () => {
        if (!showButtons) return null;

        return (
            <div className={styles["buttons-container"]}>
                {buttonsPosition.map((button, index) => (
                    <div
                        key={index}
                        className={styles["button"]}
                        style={{
                            position: "absolute",
                            left: `${button.x}px`,
                            top: `${button.y}px`,
                            cursor: "pointer",
                            width: `${BUTTON_SIZE}px`,
                            height: `${BUTTON_SIZE}px`,
                        }}
                    >
                        {buttonsValue[index] ? (
                            <Image src={"/static/images/test/red.png"} alt="Red" width={BUTTON_SIZE} height={BUTTON_SIZE} />
                        ) : (
                            <Image src={"/static/images/test/white.png"} alt="White" width={BUTTON_SIZE} height={BUTTON_SIZE} />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (roundState !== RoundState.DisplayResult) {
        return null;
    }

    return (
        <div className="relative w-full">
            <div
                className={`${styles["object"]} absolute p-2 h-[296px] left-[50%] -translate-x-1/2 z-[10] content-center`}
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
                <div className={`${styles["plate-buttons"]} ${styles[`plate-buttons-${animationState}`]}`}>
                    <div className={`${styles["plate"]} ${styles[`plate-${animationState}`]}`}>
                        {renderButtons()}

                    </div>
                </div>
            </div>
        </div>
    );
};

const generateButtonPositions = (seedValue: number, time = 1) => {
    const seededRandom = (min: number, max: number) => {
        const x = Math.sin(seedValue++) * 10000;
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

export default PlateButtons;
