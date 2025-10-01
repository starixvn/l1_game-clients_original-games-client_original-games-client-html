/**
 * Middle Drop Position Demo Script
 * Demonstrates the 9-drop-zone layout and middle spawning behavior
 *
 * @format
 */

// Configuration (copied from the main component)
const ballSizingConfig = {
    baseRows: 10, // Reference row count for base sizing
    baseDiameter: 20, // Base ball diameter in pixels at baseRows
    minDiameter: 8, // Minimum ball diameter to prevent invisibility
    maxDiameter: 35, // Maximum ball diameter to prevent overcrowding
    sizeScaleFactor: 0.8, // Additional scaling factor for peg gap consideration
};

/**
 * Calculate the 9 top drop positions for the Plinko board
 * Returns the X coordinates for each of the 9 drop zones
 */
function calculateDropPositions(canvasWidth, multipliers) {
    const numPositions = 9; // Always 9 drop positions as per spec
    const spawnMargin = canvasWidth * 0.05; // 5% margin from edges
    const availableWidth = canvasWidth - spawnMargin * 2;
    const positionSpacing = availableWidth / (numPositions - 1);

    const positions = [];
    for (let i = 0; i < numPositions; i++) {
        positions.push(spawnMargin + i * positionSpacing);
    }

    return positions;
}

/**
 * Get the middle drop position (5th of 9 positions) for consistent ball spawning
 * This ensures the ball always starts from the center for fair, unpredictable outcomes
 */
function getMiddleDropPosition(canvasWidth, multipliers) {
    const positions = calculateDropPositions(canvasWidth, multipliers);
    const middleIndex = 4; // 0-based index, 5th position (middle of 9)

    if (positions.length > middleIndex) {
        return positions[middleIndex];
    }

    // Fallback to center if calculation fails
    console.warn("Could not calculate middle drop position, using canvas center");
    return canvasWidth / 2;
}

/**
 * Demo function to test drop position calculations and middle position selection
 */
function demoDropPositions() {
    const testCanvasWidths = [400, 600, 800];
    const mockMultipliers = [100, 15.6, 2, 0.9, 0.5, 0.4, 0.5, 0.9, 2, 15.6, 100];

    testCanvasWidths.forEach((canvasWidth) => {
        const positions = calculateDropPositions(canvasWidth, mockMultipliers);
        const middlePos = getMiddleDropPosition(canvasWidth, mockMultipliers);
    });

    // Simulate ball spawning with minimal random offset
    const canvasWidth = 600;
    const baseMiddlePos = getMiddleDropPosition(canvasWidth, mockMultipliers);

    for (let i = 0; i < 5; i++) {
        const randomOffset = (Math.random() - 0.5) * 4; // -2px to +2px
        const finalPos = baseMiddlePos + randomOffset;
    }
}

// Run the demo
demoDropPositions();
