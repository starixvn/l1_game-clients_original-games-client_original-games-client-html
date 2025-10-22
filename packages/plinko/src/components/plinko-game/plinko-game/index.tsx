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
        baseGameHeight
    } = usePlinkoGameLayout();

    // Calculate canvas Y translation for consistent positioning
    const canvasYTranslation = (numberOfRows + numberOfRows / VISUAL_CONSTANTS.CANVAS_TRANSFORM_OFFSET_FACTOR) * (baseGameHeight / CANVAS_CONSTANTS.BASE_GAME_HEIGHT);

    // CSS custom properties for dynamic values
    const cssVariables = {
        '--game-height': `${baseGameHeight}px`,
        '--canvas-transform': `translateX(-50%) translateY(${canvasYTranslation}px) scale(${scaleValue})`,
        '--canvas-transform-no-scale': `translateX(-50%) translateY(${canvasYTranslation}px)`,
        '--canvas-y-translation': `${canvasYTranslation}px`,
        '--final-scale': finalScale.toString()
    };

    console.log('CSS Variables Debug:');
    console.log(`- --game-height: ${cssVariables['--game-height']}`);
    console.log(`- --canvas-y-translation: ${cssVariables['--canvas-y-translation']}`);
    console.log(`- canvasYTranslation: ${canvasYTranslation}`);

    return (
        <div
            ref={mainContainerRef}
            className={`${styles["plinko-game"]} ${styles["game-content-container"]} ${styles["game-frame"]} ${styles["canvas-container"]} ${isMobile ? styles.mobile : ''} ${!isReady && isMobile ? styles.loading : ''} ${finalScale < 1 ? styles.scaled : ''}`}
            style={cssVariables as React.CSSProperties}
        >
            <PlinkoCanvas totalScale={(() => {
                const calculatedTotalScale = scaleValue * finalScale;
                console.log('PlinkoGame Debug Info:');
                console.log(`- scaleValue: ${scaleValue}`);
                console.log(`- finalScale: ${finalScale}`);
                console.log(`- totalScale passed to canvas: ${calculatedTotalScale}`);
                console.log(`- baseGameHeight: ${baseGameHeight}`);
                return calculatedTotalScale;
            })()} />
        </div>
    );
};

PlinkoGame.displayName = 'PlinkoGame';
export default PlinkoGame;

