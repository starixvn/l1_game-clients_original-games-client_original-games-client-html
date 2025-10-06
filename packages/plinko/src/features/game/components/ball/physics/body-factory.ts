/**
 * Body Factory Module
 * Creates physics bodies for the Plinko game
 * Follows Single Responsibility Principle - only handles body creation
 */

import { Bodies, Body } from 'matter-js';
import { physicsConfig } from '../../../../../lib/physics';
import { getMultiplierColor } from '../../../../../lib/utils/colors-util';
import { logger } from '../../../../../services/logger';
import { LAYOUT_CONSTANTS } from '@/lib/physics/constants/layout-constants';
import { PHYSICS_CONSTANTS } from '@/lib/physics/constants/physics-constants';

export interface PhysicsBody {
    pins: Body[];
    multipliersBodies: Body[];
    walls: Body[];
}

export interface BodyCreationOptions {
    rows: number;
    multipliers: number[];
    gameMode: number;
    canvasWidth: number;
    canvasHeight: number;
}

/**
 * Create physics bodies for pins in triangular layout
 * Pure function - only creates bodies based on parameters
 */
export function createPinBodies(
    rows: number,
    canvasWidth: number,
    canvasHeight: number
): Body[] {
    const pins: Body[] = [];

    // Scale physics elements based on number of rows
    const scaleFactor = Math.max(LAYOUT_CONSTANTS.SCALE_BOUNDS.MIN_SCALE, Math.min(LAYOUT_CONSTANTS.SCALE_BOUNDS.MAX_SCALE, LAYOUT_CONSTANTS.BOARD.SCALE_FACTOR_BASE_ROWS / rows));
    const pegRadius = Math.max(3, Math.min(12, LAYOUT_CONSTANTS.BOARD.PEG_RADIUS_BASE * scaleFactor));
    const pegGap = Math.max(30, Math.min(55, LAYOUT_CONSTANTS.BOARD.PEG_GAP_BASE * scaleFactor));
    const boardTopMargin = Math.max(40, Math.min(80, 60 * scaleFactor));

    // Create pins in triangular layout
    for (let row = 1; row <= rows; row++) {
        const columnsInRow = 3 + (row - 1); // Start with 3 columns, increase by 1 each row
        const rowWidth = (columnsInRow - 1) * pegGap;
        const startX = (canvasWidth - rowWidth) / 2;
        const y = boardTopMargin + (row - 1) * pegGap;

        for (let col = 0; col < columnsInRow; col++) {
            const x = startX + col * pegGap;
            const pin = Bodies.circle(x, y, pegRadius, {
                label: `pin-${row}-${col}`,
                render: { fillStyle: physicsConfig.colors.pin },
                isStatic: true
            });
            pins.push(pin);

            // Log first few pins for debugging
            if (pins.length <= 5) {
                logger.debug(`📍 [PIN] Created pin-${row}-${col} at x:${Math.round(x)}, y:${Math.round(y)}`);
            }
        }
    }

    return pins;
}

/**
 * Create physics bodies for multiplier slots
 * Pure function - only creates multiplier bodies
 */
export function createMultiplierBodies(
    rows: number,
    multipliers: number[],
    gameMode: number,
    canvasWidth: number,
    canvasHeight: number
): Body[] {
    const multipliersBodies: Body[] = [];

    // Scale physics elements based on number of rows
    const scaleFactor = Math.max(LAYOUT_CONSTANTS.SCALE_BOUNDS.MIN_SCALE, Math.min(LAYOUT_CONSTANTS.SCALE_BOUNDS.MAX_SCALE, LAYOUT_CONSTANTS.BOARD.SCALE_FACTOR_BASE_ROWS / rows));
    const pegGap = Math.max(30, Math.min(55, LAYOUT_CONSTANTS.BOARD.PEG_GAP_BASE * scaleFactor));
    const boardTopMargin = Math.max(40, Math.min(80, 60 * scaleFactor));

    // Create multiplier slots positioned at the same level as the last row, centered between pegs
    const lastRowColumns = rows; // Last row has rows pegs
    const lastRowWidth = (lastRowColumns - 1) * pegGap;
    const lastRowStartX = (canvasWidth - lastRowWidth) / 2;
    const lastRowY = boardTopMargin + (rows - 1) * pegGap; // Y position of last row pegs

    // Create slots including edges: left of first peg, between pegs, and right of last peg
    const numberOfSlots = rows + 1; // Traditional Plinko: N pegs = N+1 slots
    const slotsToCreate = Math.min(multipliers.length, numberOfSlots);

    for (let i = 0; i < slotsToCreate; i++) {
        const multiplier = multipliers[i];
        // Position slots between pegs: left of first, between all pairs, right of last
        const slotX = lastRowStartX + (i - 0.5) * pegGap; // Center between peg positions
        // FIX: Position slots BELOW the physics board, not at the same level
        const slotY = lastRowY + pegGap * 0.8; // Position below last row by 80% of peg gap
        const slotWidth = Math.max(8, Math.min(50, pegGap - 8 * scaleFactor));
        const slotHeight = 1; // Thin slot like demo

        multipliersBodies.push(Bodies.rectangle(
            slotX,
            slotY,
            slotWidth,
            slotHeight,
            {
                label: `multiplier-${multiplier}-${i}`,
                isStatic: true,
                isSensor: true, // Like demo slots
                render: {
                    fillStyle: getMultiplierColor(i, gameMode, rows)
                }
            }
        ));
    }

    return multipliersBodies;
}

/**
 * Create boundary walls for the physics world
 * Pure function - creates wall bodies
 */
export function createWallBodies(canvasWidth: number, canvasHeight: number): Body[] {
    const wallThickness = PHYSICS_CONSTANTS.WALLS.THICKNESS;

    const leftWall = Bodies.rectangle(
        -wallThickness / 2, // Left edge
        canvasHeight / 2,
        wallThickness,
        canvasHeight * 2,
        {
            render: { visible: false },
            isStatic: true
        }
    );

    const rightWall = Bodies.rectangle(
        canvasWidth + wallThickness / 2, // Right edge
        canvasHeight / 2,
        wallThickness,
        canvasHeight * 2,
        {
            render: { visible: false },
            isStatic: true
        }
    );

    const floor = Bodies.rectangle(
        canvasWidth / 2,
        canvasHeight + wallThickness / 2, // Bottom edge
        canvasWidth * 2,
        wallThickness,
        {
            render: { visible: false },
            isStatic: true
        }
    );

    // Temporarily disable triangular walls to see if they interfere with ball path
    return [leftWall, rightWall, floor]; // , ...triangularWalls
}

/**
 * Create all physics bodies for the Plinko board
 * Main factory function that orchestrates body creation
 */
export function createPhysicsBodies(options: BodyCreationOptions): PhysicsBody {
    const { rows, multipliers, gameMode, canvasWidth, canvasHeight } = options;

    const pins = createPinBodies(rows, canvasWidth, canvasHeight);
    const multipliersBodies = createMultiplierBodies(rows, multipliers, gameMode, canvasWidth, canvasHeight);
    const walls = createWallBodies(canvasWidth, canvasHeight);

    return { pins, multipliersBodies, walls };
}
