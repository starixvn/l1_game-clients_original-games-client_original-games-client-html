/**
 * Drop Positions Module
 * Handles all drop position calculations for the Plinko board
 */

/**
 * Calculate the 9 top drop positions for the Plinko board
 * Returns the X coordinates for each of the 9 drop zones
 *
 * @param canvasWidth - Width of the canvas
 * @returns Array of 9 X positions for drop zones
 */
export function calculateDropPositions(canvasWidth: number): number[] {
    const numPositions = 9; // Always 9 drop positions as per spec
    const spawnMargin = canvasWidth * 0.05; // 5% margin from edges
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
    const middleIndex = 4; // 0-based index, 5th position (middle of 9)

    if (positions.length > middleIndex) {
        const middlePosition = positions[middleIndex];
        return middlePosition;
    }

    // Fallback to center if calculation fails
    const fallbackPosition = canvasWidth / 2;
    return fallbackPosition;
}

/**
 * Demo function to test drop position calculations and middle position selection
 * Useful for verifying the 9-drop-zone layout and middle spawning behavior
 */
export function demoDropPositions(): void {
    const testCanvasWidths = [400, 600, 800];
    const mockMultipliers = [100, 15.6, 2, 0.9, 0.5, 0.4, 0.5, 0.9, 2, 15.6, 100]; // eslint-disable-line @typescript-eslint/no-unused-vars

    testCanvasWidths.forEach((canvasWidth, index) => {
        const positions = calculateDropPositions(canvasWidth);
        const middlePos = getMiddleDropPosition(canvasWidth);

        // Demo function body (logs removed)
    });
}
