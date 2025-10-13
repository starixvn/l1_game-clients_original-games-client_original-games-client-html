/**
 * Drop Positions Module
 * Handles all drop position calculations for the Plinko board
 */

import { LAYOUT_CONSTANTS } from './constants/layout-constants';

/**
 * Calculate the 9 top drop positions for the Plinko board
 * Returns the X coordinates for each of the 9 drop zones
 *
 * @param canvasWidth - Width of the canvas
 * @returns Array of 9 X positions for drop zones
 */
export function calculateDropPositions(canvasWidth: number): number[] {
    const numPositions = LAYOUT_CONSTANTS.DROP_POSITIONS.COUNT; // Always 9 drop positions as per spec
    const spawnMargin = canvasWidth * LAYOUT_CONSTANTS.MARGINS.SPAWN_MARGIN; // 5% margin from edges
    const availableWidth = canvasWidth - (spawnMargin * 2);
    const positionSpacing = availableWidth / (numPositions - 1);

    const positions: number[] = [];
    for (let i = 0; i < numPositions; i++) {
        const position = spawnMargin + (i * positionSpacing);
        positions.push(position);
    }

    return positions;
}

/**
 * Get the middle drop position (5th of 9 positions) for consistent ball spawning
 * This ensures the ball always starts from the center for fair, unpredictable outcomes
 *
 * @param canvasWidth - Width of the canvas
 * @returns X coordinate of the middle (5th) drop position
 */
export function getMiddleDropPosition(canvasWidth: number): number {
    const positions = calculateDropPositions(canvasWidth);
    const middleIndex = LAYOUT_CONSTANTS.DROP_POSITIONS.MIDDLE_INDEX; // 0-based index, 5th position (middle of 9)

    if (positions.length > middleIndex) {
        return positions[middleIndex];
    }

    return canvasWidth / 2;
}

