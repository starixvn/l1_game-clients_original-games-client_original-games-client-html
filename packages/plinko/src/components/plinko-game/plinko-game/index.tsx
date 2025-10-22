"use client";
import React from "react";
import { isMobile } from "react-device-detect";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { usePlinkoGameScaling, usePlinkoGameLayout } from "./hooks";
import { PlinkoCanvasConfig } from "./canvas/constant";
import styles from "./plinko-game.module.scss";

interface PlinkoGameProps {
    gameFrameWrapperWithoutBackgroundRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Maps a Y position from canvas coordinates to main container coordinates
 * @param canvasY - Y position in the original canvas coordinate system (unscaled)
 * @param numberOfRows - Number of rows in the Plinko game
 * @param baseGameHeight - Base game height from usePlinkoGameLayout
 * @param scaleValue - Scale value from usePlinkoGameScaling
 * @param finalScale - Final scale from usePlinkoGameScaling
 * @returns Y position in main container coordinate system
 */
export const mapCanvasYToContainerY = (
    canvasY: number,
    numberOfRows: number,
    baseGameHeight: number,
    scaleValue: number,
    finalScale: number
): number => {
    // Calculate canvas Y translation to keep slots at consistent position
    const totalScale = scaleValue * finalScale;
    const slotCanvasY = getSlotCanvasY(0, numberOfRows);
    const targetSlotY = 567 * finalScale; // Scale target position by finalScale
    const canvasYTranslation = targetSlotY - (slotCanvasY * totalScale);

    // Apply canvas scaling transformation
    const scaledCanvasY = canvasY * totalScale;

    // Apply CSS translation (canvas is translated vertically by canvasYTranslation)
    const containerY = scaledCanvasY + canvasYTranslation;

    return containerY;
};

/**
 * Gets the Y position of payout slots in canvas coordinates
 * @param slotIndex - Index of the slot (0-based)
 * @param numberOfRows - Number of rows in the Plinko game
 * @returns Y position in original canvas coordinate system
 */
export const getSlotCanvasY = (slotIndex: number, numberOfRows: number): number => {
    const { pegRadius, mapGap } = PlinkoCanvasConfig;
    const gap = pegRadius * 2 * mapGap;
    // Position slots below pegs with 1.5 gap spacing for better visual separation
    return (numberOfRows + 1.5) * gap;
};

/**
 * Maps a payout slot's Y position to main container coordinates
 * @param slotIndex - Index of the slot (0-based)
 * @param numberOfRows - Number of rows in the Plinko game
 * @param baseGameHeight - Base game height from usePlinkoGameLayout
 * @param scaleValue - Scale value from usePlinkoGameScaling
 * @param finalScale - Final scale from usePlinkoGameScaling
 * @returns Y position of the slot in main container coordinate system
 */
export const mapSlotYToContainerY = (
    slotIndex: number,
    numberOfRows: number,
    baseGameHeight: number,
    scaleValue: number,
    finalScale: number
): number => {
    const canvasY = getSlotCanvasY(slotIndex, numberOfRows);
    return mapCanvasYToContainerY(canvasY, numberOfRows, baseGameHeight, scaleValue, finalScale);
};


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

    // Calculate canvas Y translation for consistent slot positioning
    // We want slots to appear at a consistent Y position in the container regardless of numberOfRows
    const totalScale = scaleValue * finalScale;
    const slotCanvasY = getSlotCanvasY(0, numberOfRows);
    // Target slot position scaled by finalScale to account for mobile/desktop differences
    const targetSlotY = 567 * finalScale;
    const canvasYTranslation = targetSlotY - (slotCanvasY * totalScale);

    // CSS custom properties for dynamic values
    const cssVariables = {
        '--game-height': `${baseGameHeight}px`,
        '--canvas-transform': `translateX(-50%) translateY(${canvasYTranslation}px) scale(${scaleValue})`,
        '--canvas-transform-no-scale': `translateX(-50%) translateY(${canvasYTranslation}px)`,
        '--canvas-y-translation': `${canvasYTranslation}px`,
        '--final-scale': finalScale.toString()
    };

    return (
        <div
            ref={mainContainerRef}
            className={`${styles["plinko-game"]} ${styles["game-content-container"]} ${styles["game-frame"]} ${styles["canvas-container"]} ${isMobile ? styles.mobile : ''} ${!isReady && isMobile ? styles.loading : ''} ${finalScale < 1 ? styles.scaled : ''}`}
            style={cssVariables as React.CSSProperties}
        >
            <PlinkoCanvas totalScale={scaleValue * finalScale} />
        </div>
    );
};

PlinkoGame.displayName = 'PlinkoGame';
export default PlinkoGame;

