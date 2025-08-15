import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./plate.module.scss";

// Constants for button positioning
const BUTTON_SIZE = 38; // Button size in pixels
const PLATE_SIZE = 200; // Plate size in pixels
const BOWL_SIZE = 140; // Bowl size in pixels
const BOUNDARY_SIZE = 130; // Boundary size in pixels
const CIRCLE_RADIUS = BOUNDARY_SIZE / 2; // Half of boundary diameter
const CIRCLE_DIAMETER = BOUNDARY_SIZE; // Boundary diameter
const MAX_ATTEMPTS = 10000;
const BUTTON_BUFFER = 2; // Buffer between buttons
const SHAKE_DURATION = 2000; // Shake duration in milliseconds
const OPEN_DURATION = 1000; // Open duration in milliseconds
const CLOSE_DURATION = 1000; // Close duration in milliseconds

let interval: NodeJS.Timeout | null = null;
// Animation states
type AnimationState = "idle" | "shake" | "open" | "close";
let count = 29473;
const PlateButtons: React.FC = () => {
    const [buttons, setButtons] = useState<Array<{ id: number; x: number; y: number; isRed: boolean }>>([]);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const [showButtons, setShowButtons] = useState(true);
    const [showBowl, setShowBowl] = useState(true);
    const [seed, setSeed] = useState<number>(0);

    // Generate random positions for buttons within circular boundary
    const generateButtonPositions = (seedValue: number, time = 1) => {
        // Create a seeded random number generator
        const seededRandom = (min: number, max: number) => {
            const x = Math.sin(seedValue) * 10000;
            seedValue++;
            return min + (x - Math.floor(x)) * (max - min);
        };

        const newButtons: Array<{ id: number; x: number; y: number; isRed: boolean }> = [];

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

                    const distance = Math.sqrt(
                        Math.pow(newButtonCenterX - buttonCenterX, 2) + Math.pow(newButtonCenterY - buttonCenterY, 2)
                    );
                    return distance < BUTTON_SIZE + BUTTON_BUFFER;
                });
                if (!overlaps) {
                    position = { x, y };
                    break;
                }
                attempts++;
            }
            if (attempts >= MAX_ATTEMPTS) {
                if (time > 5) {
                    interval && clearInterval(interval);
                    interval = null;
                    return;
                }
                generateButtonPositions(seedValue + 100, time + 1);
                return;
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
                id: i,
                x: position.x,
                y: position.y,
                isRed: seededRandom(0, 1) > 0.5,
            });
        }

        setButtons(newButtons);
    };

    useEffect(() => {
        intervalUpdate();
        return () => {
            interval && clearInterval(interval);
            interval = null;
        };
    }, []);

    const intervalUpdate = () => {
        interval && clearInterval(interval);

        interval = setInterval(() => {
            count++;
            generateButtonPositions(count);
        }, 0);
    };

    // Animation handlers
    const handleShake = () => {
        setAnimationState("shake");
        generateButtonPositions(seed);
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
        setTimeout(() => {
            setShowButtons(false);
        }, CLOSE_DURATION);
    };

    const handleSeedChange = (newSeed: number) => {
        setSeed(newSeed);
    };

    const handleRegenerate = () => {
        generateButtonPositions(seed);
    };

    const renderButtons = () => {
        if (!showButtons) {
            return null;
        }

        return (
            <div className={styles["buttons-container"]}>
                {buttons.map((button) => (
                    <div
                        key={button.id}
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
                        {button.isRed ? (
                            <Image src={"/static/images/test/red.png"} alt="Red" width={BUTTON_SIZE} height={BUTTON_SIZE} />
                        ) : (
                            <Image src={"/static/images/test/white.png"} alt="White" width={BUTTON_SIZE} height={BUTTON_SIZE} />
                        )}
                    </div>
                ))}
            </div>
        );
    };

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
                        "--circle-radius": `${CIRCLE_RADIUS}px`,
                        "--circle-diameter": `${CIRCLE_DIAMETER}px`,
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
            <span className="absolute bottom-[-520px] left-[50%] -translate-x-1/2 ">{count}</span>
            <button
                className="absolute bottom-[-500px] left-[50%] -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                    intervalUpdate();
                }}
            >
                Regenerate {count}
            </button>
            <button
                className="absolute bottom-[-440px] left-[50%] -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                    setAnimationState((prevState) => {
                        switch (prevState) {
                            case "idle":
                                return "shake";
                            case "shake":
                                return "open";
                            case "open":
                                return "close";
                            case "close":
                                return "idle";
                            default:
                                return "idle";
                        }
                    });
                }}
            >
                Change State
            </button>
        </div>
    );
};

export default PlateButtons;
