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
    const targetSlotY = 567; // Reference position
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

// Test function to demonstrate the fix - shows slot positions remain stable
export const testSlotPositionStability = () => {
    console.log('=== SLOT POSITION STABILITY TEST ===');
    console.log('Testing that slot Y positions remain stable when numberOfRows changes');

    const baseGameHeight = 575;
    const finalScale = 1;

    // Test with different numberOfRows and scaleValue combinations (like in your logs)
    const testCases = [
        { rows: 8, scaleValue: 1.125 },
        { rows: 9, scaleValue: 1 },
        { rows: 10, scaleValue: 0.905 },
        { rows: 11, scaleValue: 0.82 },
        { rows: 12, scaleValue: 0.755 },
        { rows: 13, scaleValue: 0.695 },
        { rows: 14, scaleValue: 0.645 },
        { rows: 15, scaleValue: 0.602 },
    ];

    console.log('Target slot Y position should be: 567');
    console.log('');

    for (const { rows, scaleValue } of testCases) {
        // Calculate slot position using the FIXED formula
        const slotY = mapSlotYToContainerY(0, rows, baseGameHeight, scaleValue, finalScale);

        // Calculate what it would be with the OLD formula for comparison
        const oldCanvasYTranslation = (rows + rows / 8) * (baseGameHeight / 575);
        const oldSlotCanvasY = getSlotCanvasY(0, rows);
        const oldSlotY = (oldSlotCanvasY * scaleValue * finalScale) + oldCanvasYTranslation;

        console.log(`Rows: ${rows.toString().padStart(2)} | Scale: ${scaleValue.toFixed(3).padStart(5)} | Fixed: ${slotY.toFixed(2).padStart(7)} | Old: ${oldSlotY.toFixed(2).padStart(7)} | Diff: ${(slotY - oldSlotY).toFixed(2)}`);
    }

    console.log('=== END TEST ===');
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
    // Target slot position (based on numberOfRows=9, scaleValue=1 reference point: 567)
    const targetSlotY = 567;
    const canvasYTranslation = targetSlotY - (slotCanvasY * totalScale);

    // Calculate and log slot positions for debugging
    const slotContainerY = mapSlotYToContainerY(0, numberOfRows, baseGameHeight, scaleValue, finalScale);

    console.log('Slot Position Analysis:');
    console.log(`- numberOfRows: ${numberOfRows}`);
    console.log(`- slotCanvasY: ${slotCanvasY}`);
    console.log(`- canvasYTranslation: ${canvasYTranslation}`);
    console.log(`- slotContainerY: ${slotContainerY}`);

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

