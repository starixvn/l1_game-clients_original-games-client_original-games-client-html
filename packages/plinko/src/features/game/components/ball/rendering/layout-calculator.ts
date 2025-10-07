/**
 * Layout Calculator Module
 * Handles all layout calculations for the Plinko board
 * Pure functions - no side effects, only calculations
 * Follows Single Responsibility Principle - only handles layout math
 */

import { LAYOUT_CONSTANTS } from "@plinko/lib/physics/constants/layout-constants";

export interface LayoutData {
    scaleFactor: number;
    pegRadius: number;
    pegGap: number;
    boardTopMargin: number;
    lastRowY: number;
    lastRowStartX: number;
    visualSlotHeight: number;
    slotWidth: number;
    numberOfSlots: number;
}

export interface SlotRenderData {
    multiplier: number;
    slotX: number;
    slotY: number;
    slotWidth: number;
    slotHeight: number;
    color: string;
}

/**
 * Calculate layout data for the Plinko board
 * Pure function - only performs calculations based on inputs
 */
export function calculateLayoutData(numberOfRows: number, canvasWidth: number, canvasHeight: number): LayoutData {
    const scaleFactor = Math.max(
        LAYOUT_CONSTANTS.SCALE_BOUNDS.MIN_SCALE,
        Math.min(LAYOUT_CONSTANTS.SCALE_BOUNDS.MAX_SCALE, LAYOUT_CONSTANTS.BOARD.SCALE_FACTOR_BASE_ROWS / numberOfRows)
    );
    const pegRadius = Math.max(3, Math.min(12, LAYOUT_CONSTANTS.BOARD.PEG_RADIUS_BASE * scaleFactor));
    const pegGap = Math.max(30, Math.min(55, LAYOUT_CONSTANTS.BOARD.PEG_GAP_BASE * scaleFactor));
    const boardTopMargin = Math.max(40, Math.min(80, 60 * scaleFactor));

    const lastRowY = boardTopMargin + (numberOfRows - 1) * pegGap;
    const lastRowColumns = numberOfRows;
    const lastRowWidth = (lastRowColumns - 1) * pegGap;
    const lastRowStartX = (canvasWidth - lastRowWidth) / 2;
    const visualSlotHeight = Math.max(15, Math.min(40, (pegGap - 8 * scaleFactor) * 1.5));
    const slotWidth = Math.max(8, Math.min(50, pegGap - 8 * scaleFactor));
    const numberOfSlots = numberOfRows + 1;

    return {
        scaleFactor,
        pegRadius,
        pegGap,
        boardTopMargin,
        lastRowY,
        lastRowStartX,
        visualSlotHeight,
        slotWidth,
        numberOfSlots,
    };
}

/**
 * Calculate slot render data for all multiplier slots
 * Pure function - transforms multipliers array into renderable slot data
 */
export function calculateSlotRenderData(
    multipliers: number[],
    layoutData: LayoutData,
    gameMode: number,
    getMultiplierColor: (slotIndex: number, gameMode: number, numberOfRows: number) => string
): SlotRenderData[] {
    const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
    const slotsToDraw = Math.min(effectiveMultipliers.length, layoutData.numberOfSlots);

    return effectiveMultipliers.slice(0, slotsToDraw).map((multiplier, i) => {
        const slotX = layoutData.lastRowStartX + (i - 0.5) * layoutData.pegGap - layoutData.slotWidth / 2;
        // Position visual slots BELOW the physics board to match physics positioning
        const slotY = layoutData.lastRowY + layoutData.pegGap * 0.8;

        return {
            multiplier,
            slotX,
            slotY,
            slotWidth: layoutData.slotWidth,
            slotHeight: layoutData.visualSlotHeight,
            color: getMultiplierColor(i, gameMode, layoutData.numberOfSlots - 1), // numberOfRows = slots - 1
        };
    });
}

/**
 * Find which slot index corresponds to a mouse position
 * Pure function for slot detection logic
 */
export function findSlotIndex(mouseX: number, lastRowStartX: number, pegGap: number, slotWidth: number, numberOfSlots: number): number {
    // Use same positioning logic as visual slots (between pegs)
    for (let i = 0; i < numberOfSlots; i++) {
        const slotCenterX = lastRowStartX + (i - 0.5) * pegGap; // Center between peg positions
        const slotX = slotCenterX - slotWidth / 2; // Visual slot left edge
        if (mouseX >= slotX && mouseX < slotX + slotWidth) {
            return i;
        }
    }
    return -1;
}

/**
 * Calculate slot calculation data for hover interactions
 * Pure function for hover area calculations
 */
export function calculateSlotCalculationData(layoutData: LayoutData, multipliers: number[], probabilities: number[], betAmount: number) {
    if (multipliers.length === 0) return null;

    const slotHeight = Math.max(15, Math.min(40, (layoutData.pegGap - 8 * layoutData.scaleFactor) * 1.5));
    // Use the same Y position as visual slots for hover detection
    const slotY = layoutData.lastRowY + layoutData.pegGap * 0.8;
    const slotAreaTop = slotY - slotHeight / 2;
    const slotAreaBottom = slotY + slotHeight / 2;

    return {
        slotAreaTop,
        slotAreaBottom,
        lastRowStartX: layoutData.lastRowStartX,
        pegGap: layoutData.pegGap,
        slotWidth: layoutData.slotWidth,
        slotHeight,
        multipliers,
        probabilities,
        betAmount,
        numberOfSlots: layoutData.numberOfSlots,
    };
}
