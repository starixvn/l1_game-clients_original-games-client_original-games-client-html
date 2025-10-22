"use client";
import React from "react";
import { isMobile } from "react-device-detect";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { usePlinkoGameScaling, usePlinkoGameLayout } from "./hooks";
import { VISUAL_CONSTANTS, CANVAS_CONSTANTS } from "./constants/scaling-constants";
import styles from "./plinko-game.module.scss";

interface PlinkoGameProps {
    gameFrameWrapperWithoutBackgroundRef?: React.RefObject<HTMLDivElement>;
}

const PlinkoGame: React.FC<PlinkoGameProps> = ({
    gameFrameWrapperWithoutBackgroundRef
}) => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);

    const { scaleValue, finalScale, isReady } = usePlinkoGameScaling({
        numberOfRows,
        gameFrameWrapperRef: gameFrameWrapperWithoutBackgroundRef
    });

    const {
        mainContainerRef,
        canvasContainerRef,
        baseGameHeight
    } = usePlinkoGameLayout();

    // Calculate canvas Y translation for consistent positioning
    const canvasYTranslation = (numberOfRows + numberOfRows / VISUAL_CONSTANTS.CANVAS_TRANSFORM_OFFSET_FACTOR) * (baseGameHeight / CANVAS_CONSTANTS.BASE_GAME_HEIGHT);

    // CSS custom properties for dynamic values
    const cssVariables = {
        '--game-height': `${baseGameHeight}px`,
        '--canvas-transform': `translateX(-50%) translateY(${canvasYTranslation}px) scale(${scaleValue})`,
        '--canvas-y-translation': `${canvasYTranslation}px`,
        '--final-scale': finalScale.toString()
    };

    return (
        <div
            ref={mainContainerRef}
            className={`${styles["plinko-game"]} ${isMobile ? styles.mobile : ''} ${!isReady && isMobile ? styles.loading : ''}`}
        >
            {/* Canvas container - handles game area dimensions, frame styling, and canvas positioning */}
            <div
                ref={canvasContainerRef}
                className={`${styles["game-content-container"]} ${styles["game-frame"]} ${styles["canvas-container"]} ${finalScale < 1 ? styles.scaled : ''}`}
                style={cssVariables as React.CSSProperties}
            >
                <PlinkoCanvas />
            </div>
        </div>
    );
};

PlinkoGame.displayName = 'PlinkoGame';
export default PlinkoGame;

