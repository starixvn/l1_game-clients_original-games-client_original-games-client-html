import { logger } from '../../services/logger';

/**
 * Drop Positions Module
 * Handles all drop position calculations for the Plinko board
 */

logger.info('📍 [DROP_POSITIONS] Drop positions module loaded');

/**
 * Calculate the 9 top drop positions for the Plinko board
 * Returns the X coordinates for each of the 9 drop zones
 *
 * @param canvasWidth - Width of the canvas
 * @returns Array of 9 X positions for drop zones
 */
export function calculateDropPositions(canvasWidth: number): number[] {
    logger.debug('📍 [DROP_POSITIONS] Starting drop position calculation', {
        canvasWidth: canvasWidth.toFixed(1),
        timestamp: new Date().toISOString()
    });

    const numPositions = 9; // Always 9 drop positions as per spec
    const spawnMargin = canvasWidth * 0.05; // 5% margin from edges
    const availableWidth = canvasWidth - (spawnMargin * 2);
    const positionSpacing = availableWidth / (numPositions - 1);

    logger.debug('📍 [DROP_POSITIONS] Drop position parameters calculated', {
        numPositions,
        spawnMargin: spawnMargin.toFixed(1),
        availableWidth: availableWidth.toFixed(1),
        positionSpacing: positionSpacing.toFixed(1),
        calculations: {
            spawnMargin: `${canvasWidth.toFixed(1)} * 0.05 = ${spawnMargin.toFixed(1)}`,
            availableWidth: `${canvasWidth.toFixed(1)} - (${spawnMargin.toFixed(1)} * 2) = ${availableWidth.toFixed(1)}`,
            positionSpacing: `${availableWidth.toFixed(1)} / (${numPositions} - 1) = ${positionSpacing.toFixed(1)}`
        }
    });

    const positions: number[] = [];
    for (let i = 0; i < numPositions; i++) {
        const position = spawnMargin + (i * positionSpacing);
        positions.push(position);
        
        logger.debug('📍 [DROP_POSITIONS] Drop position calculated', {
            index: i,
            position: position.toFixed(1),
            calculation: `${spawnMargin.toFixed(1)} + (${i} * ${positionSpacing.toFixed(1)}) = ${position.toFixed(1)}`
        });
    }

    logger.info('📍 [DROP_POSITIONS] All drop positions calculated', {
        canvasWidth: canvasWidth.toFixed(1),
        numPositions,
        positions: positions.map(p => p.toFixed(1)),
        spawnMargin: spawnMargin.toFixed(1),
        positionSpacing: positionSpacing.toFixed(1)
    });

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
    logger.debug('📍 [DROP_POSITIONS] Getting middle drop position', {
        canvasWidth: canvasWidth.toFixed(1)
    });

    const positions = calculateDropPositions(canvasWidth);
    const middleIndex = 4; // 0-based index, 5th position (middle of 9)

    logger.debug('📍 [DROP_POSITIONS] Middle position calculation', {
        positionsCount: positions.length,
        middleIndex,
        expectedMiddlePosition: positions[middleIndex]?.toFixed(1) || 'undefined'
    });

    if (positions.length > middleIndex) {
        const middlePosition = positions[middleIndex];
        logger.info('📍 [DROP_POSITIONS] Middle drop position found', {
            canvasWidth: canvasWidth.toFixed(1),
            middleIndex,
            middlePosition: middlePosition.toFixed(1),
            allPositions: positions.map(p => p.toFixed(1))
        });
        return middlePosition;
    }

    // Fallback to center if calculation fails
    const fallbackPosition = canvasWidth / 2;
    logger.warn('📍 [DROP_POSITIONS] Could not calculate middle drop position, using canvas center', {
        canvasWidth: canvasWidth.toFixed(1),
        fallbackPosition: fallbackPosition.toFixed(1),
        positionsCount: positions.length,
        middleIndex
    });
    return fallbackPosition;
}

/**
 * Demo function to test drop position calculations and middle position selection
 * Useful for verifying the 9-drop-zone layout and middle spawning behavior
 */
export function demoDropPositions(): void {
    logger.info('📍 [DROP_POSITIONS] Starting drop positions demo');
    logger.info('📍 [DROP_POSITIONS] ' + '='.repeat(50));

    const testCanvasWidths = [400, 600, 800];
    const mockMultipliers = [100, 15.6, 2, 0.9, 0.5, 0.4, 0.5, 0.9, 2, 15.6, 100]; // eslint-disable-line @typescript-eslint/no-unused-vars

    logger.debug('📍 [DROP_POSITIONS] Demo configuration', {
        testCanvasWidths,
        mockMultipliersCount: mockMultipliers.length
    });

    testCanvasWidths.forEach((canvasWidth, index) => {
        logger.info('📍 [DROP_POSITIONS] Testing canvas width', {
            testIndex: index + 1,
            canvasWidth: `${canvasWidth}px`
        });

        const positions = calculateDropPositions(canvasWidth);
        const middlePos = getMiddleDropPosition(canvasWidth);

        logger.info('📍 [DROP_POSITIONS] Drop positions for canvas width', {
            canvasWidth: `${canvasWidth}px`,
            positions: positions.map((pos, i) => ({
                index: i + 1,
                position: `${pos.toFixed(1)}px`,
                isMiddle: i === 4
            })),
            middlePosition: `${middlePos.toFixed(1)}px`
        });

        logger.debug('📍 [DROP_POSITIONS] Detailed position breakdown', {
            canvasWidth: `${canvasWidth}px`,
            positions: positions.map((pos, i) => ({
                index: i + 1,
                position: pos.toFixed(1),
                isMiddle: i === 4,
                marker: i === 4 ? ' ← MIDDLE' : ''
            }))
        });
    });

    logger.info('📍 [DROP_POSITIONS] Drop positions demo completed');
}
