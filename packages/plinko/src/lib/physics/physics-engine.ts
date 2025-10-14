import React from "react";
import { Bodies, Body, Composite, Engine } from "matter-js";
import { physicsConfig } from "@plinko/features/game/components/ball/physics/physics-config";
import { logger } from "@plinko/services/logger";
import { calculateBallSize, getBallPhysicsTweaks } from "./ball-calculations";
import { getMiddleDropPosition } from "@plinko/features/game/components/ball/physics/drop-positions";
import { PHYSICS_CONSTANTS } from "@plinko/features/game/components/ball/physics/constants/physics-constants";
import { LAYOUT_CONSTANTS } from "@plinko/features/game/components/ball/physics/constants/layout-constants";
import { BALL_CONSTANTS } from "@plinko/features/game/components/ball/physics/constants/ball-constants";
import { RENDERING_CONSTANTS } from "@plinko/features/game/components/ball/physics/constants/rendering-constants";

interface BallBodyExtension {
    world?: Engine["world"];
    isServiceGuided?: boolean;
    expectedFinalSlot?: number;
    multiplier?: number;
    betValue?: number;
    hasTriggeredWin?: boolean;
    servicePath?: number[];
    currentPathIndex?: number;
    isRemoved?: boolean; // Flag to prevent re-processing removed balls
    createdAt?: number; // Timestamp when ball was created
    wrongSlotHits?: number;
    pinCollisions?: string[];
    pathPositions?: { x: number; y: number; type?: string }[]; // Track ball path for visualization
}

export interface CanvasInfo {
    canvasWidth: number;
    canvasHeight: number;
    ballCategory: number;
    defaultCategory: number;
    multiplierCategory: number;
}

export interface ServiceGuidedBallData {
    path: number[];
    finalSlot: number;
    multiplier: number;
    betValue: number;
}

/**
 * Physics Engine Module
 * Manages all physics engine operations, ball creation, and spawning
 */

/**
 * Get current canvas dimensions and physics categories
 */
export function getCanvasInfo(canvasRef: React.RefObject<HTMLDivElement>): CanvasInfo | null {
    logger.logPhysicsEvent('canvas-info-request', {
        hasCanvasRef: !!canvasRef.current,
        canvasElement: canvasRef.current?.tagName,
        deviceInfo: {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            }
        }
    });
    if (!canvasRef.current) {
        return null;
    }

    const containerRect = canvasRef.current.getBoundingClientRect();

    return {
        canvasWidth: containerRect.width || physicsConfig.world.width,
        canvasHeight: containerRect.height || physicsConfig.world.height,
        ballCategory: PHYSICS_CONSTANTS.COLLISION_CATEGORIES.BALL,
        defaultCategory: PHYSICS_CONSTANTS.COLLISION_CATEGORIES.DEFAULT,
        multiplierCategory: PHYSICS_CONSTANTS.COLLISION_CATEGORIES.MULTIPLIER,
    };
}

/**
 * Create physics bodies for the Plinko board
 */
export function createPhysicsBodies(
    canvasWidth: number,
    canvasHeight: number,
    rows: number,
    multipliers: number[]
): {
    pins: Body[];
    multipliersBodies: Body[];
    walls: Body[];
} {
    const pins: Body[] = [];
    const multipliersBodies: Body[] = [];

    /**
     * Helper function to get multiplier color for physics bodies
     */
    function getMultiplierColor(multiplier: number): string {
        if (multiplier >= 10) {
            return physicsConfig.colors.multiplierHigh;
        }
        if (multiplier >= 5) {
            return physicsConfig.colors.multiplierMedium;
        }
        if (multiplier >= 2) {
            return physicsConfig.colors.multiplierLow;
        }
        if (multiplier >= 1) {
            return physicsConfig.colors.multiplierLoss;
        }
        return "#333";
    }

    // Board dimensions based on plinko demo (1100x1100 canvas)
    // Using similar calculations to match the demo layout
    const pegRadius = LAYOUT_CONSTANTS.BOARD.PEG_RADIUS;
    const mapGap = LAYOUT_CONSTANTS.BOARD.PEG_GAP_MULTIPLIER;
    const initialColumns = LAYOUT_CONSTANTS.BOARD.INITIAL_COLUMNS;

    // Create pins in triangular layout (matching plinko demo)
    for (let row = 1; row <= rows; row++) {
        const columnsInRow = initialColumns + (row - 1);
        const gap = pegRadius * 2 * mapGap; // 10 * 2 * 3 = 60
        const space = (canvasWidth - gap * columnsInRow) / 2;

        logger.logPhysicsEvent('peg-row-creation', {
            row,
            totalRows: rows,
            columnsInRow,
            deviceInfo: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            }
        });

        for (let col = 1; col <= columnsInRow; col++) {
            const x = space + col * gap - pegRadius * mapGap;
            const y = row * gap; // row * 60

            const pinLabel = `pin-${row}-${col}`;
            const pin = Bodies.circle(x, y, pegRadius, {
                label: pinLabel,
                render: { fillStyle: physicsConfig.colors.pin },
                isStatic: true,
                collisionFilter: {
                    category: PHYSICS_CONSTANTS.COLLISION_CATEGORIES.DEFAULT,
                },
            });
            pins.push(pin);

            // Log first few pegs for debugging
            if (pins.length <= 10) {
                logger.logPhysicsEvent('peg-position', {
                    pegIndex: pins.length,
                    label: pinLabel,
                    position: { x: Math.round(x), y: Math.round(y) },
                    row,
                    col
                });
            }
        }
    }

    logger.logPhysicsEvent('peg-creation-complete', {
        totalPegs: pins.length,
        rows,
        deviceInfo: {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        }
    });

    // Create invisible walls
    const wallThickness = PHYSICS_CONSTANTS.WALLS.THICKNESS;
    const leftWall = Bodies.rectangle(
        -wallThickness / 2, // Left edge
        canvasHeight / 2,
        wallThickness,
        canvasHeight * 2,
        {
            render: { visible: false },
            isStatic: true,
        }
    );

    const rightWall = Bodies.rectangle(
        canvasWidth + wallThickness / 2, // Right edge
        canvasHeight / 2,
        wallThickness,
        canvasHeight * 2,
        {
            render: { visible: false },
            isStatic: true,
        }
    );

    const floor = Bodies.rectangle(
        canvasWidth / 2,
        canvasHeight + wallThickness / 2, // Bottom edge
        canvasWidth * 2,
        wallThickness,
        {
            render: { visible: false },
            isStatic: true,
        }
    );

    // Create triangular boundary walls using strategic wall placements
    const triangleTopMargin = canvasHeight * LAYOUT_CONSTANTS.MARGINS.TRIANGLE_TOP;
    const triangleBottomMargin = canvasHeight * LAYOUT_CONSTANTS.MARGINS.TRIANGLE_BOTTOM;
    const triangleBoardHeight = canvasHeight - triangleTopMargin - triangleBottomMargin;
    const triangleBoardWidth = canvasWidth * LAYOUT_CONSTANTS.MARGINS.TRIANGLE_BOARD_WIDTH; // Match the board width (85%)

    // Calculate triangular boundaries (matching the visual board)
    const triangleCenterX = canvasWidth / 2; // Top point
    const triangleTopYPos = triangleTopMargin;
    const triangleBottomYPos = triangleTopMargin + triangleBoardHeight;

    // Create boundary walls at key positions to contain balls within triangle
    const triangularWalls: Body[] = [];

    // Create walls at progressive widths to form triangular shape
    const wallLevels = LAYOUT_CONSTANTS.BOARD.WALL_LEVELS; // Number of wall levels from top to bottom
    for (let level = 0; level < wallLevels; level++) {
        const t = level / (wallLevels - 1); // 0 to 1
        const currentY = triangleTopYPos + t * (triangleBottomYPos - triangleTopYPos);
        const currentWidth = (1 - t) * 10 + t * triangleBoardWidth; // Narrow at top, wide at bottom
        const currentX = triangleCenterX - currentWidth / 2;

        // Left wall segment
        const leftWallSegment = Bodies.rectangle(
            currentX - LAYOUT_CONSTANTS.BOARD.TRIANGULAR_WALL_OFFSET,
            currentY,
            LAYOUT_CONSTANTS.BOARD.TRIANGULAR_WALL_THICKNESS, // Thickness
            triangleBoardHeight / wallLevels, // Segment height
            {
                render: { visible: false },
                isStatic: true,
                label: `triangle-left-wall-${level}`,
            }
        );

        // Right wall segment
        const rightWallSegment = Bodies.rectangle(
            currentX + currentWidth + LAYOUT_CONSTANTS.BOARD.TRIANGULAR_WALL_OFFSET,
            currentY,
            LAYOUT_CONSTANTS.BOARD.TRIANGULAR_WALL_THICKNESS, // Thickness
            triangleBoardHeight / wallLevels, // Segment height
            {
                render: { visible: false },
                isStatic: true,
                label: `triangle-right-wall-${level}`,
            }
        );

        triangularWalls.push(leftWallSegment, rightWallSegment);
    }

    const walls = [leftWall, rightWall, floor, ...triangularWalls];

    // Create multiplier slots (matching plinko demo slot layout)
    const numberOfSlots = rows + 1;
    const gap = pegRadius * LAYOUT_CONSTANTS.SLOTS.GAP_MULTIPLIER * mapGap; // Same gap as pegs: 60
    const space = (canvasWidth - gap * numberOfSlots) / 2;
    const y = numberOfSlots * pegRadius * LAYOUT_CONSTANTS.SLOTS.GAP_MULTIPLIER * mapGap - LAYOUT_CONSTANTS.SLOTS.SLOT_Y_OFFSET; // 11 * 10 * 2 * 3 - 40 = 620 for 10 rows
    const slotWidth = gap - LAYOUT_CONSTANTS.SLOTS.SLOT_WIDTH_REDUCTION; // gap - 6 = 54
    const slotHeight = LAYOUT_CONSTANTS.SLOTS.SLOT_HEIGHT; // Thin slot like demo

    multipliers.forEach((multiplier, index) => {
        // slotIndex begins with 0, so index 0 = slotIndex 0, index 4 = slotIndex 4
        const slotIndex = index;
        const x = space + (index + 1) * gap - pegRadius * mapGap;

        const slotLabel = `multiplier-${multiplier}-${slotIndex}`;

        console.log("🏗️ [PHYSICS] Creating multiplier slot - SLOT INDEX MAPPING:", {
            arrayIndex: index,
            slotIndex,
            multiplier,
            slotLabel,
            position: { x: Math.round(x), y: Math.round(y) },
            dimensions: { width: slotWidth, height: slotHeight },
            totalSlots: multipliers.length,
            rows,
            mapping: `arrayIndex ${index} -> slotIndex ${slotIndex} -> label ${slotLabel}`,
        });

        const multiplierBody = Bodies.rectangle(x, y, slotWidth, slotHeight, {
            label: slotLabel,
            isStatic: true,
            isSensor: true, // Like demo slots
            collisionFilter: {
                category: PHYSICS_CONSTANTS.COLLISION_CATEGORIES.MULTIPLIER,
            },
            render: {
                fillStyle: getMultiplierColor(multiplier),
            },
        });
        multipliersBodies.push(multiplierBody);
    });

    // Log final slot layout with detailed mapping
    console.log("✅ [PHYSICS] FINAL SLOT LAYOUT - SLOT INDEX MAPPING:", {
        totalSlots: multipliersBodies.length,
        multipliersArray: multipliers,
        slotMapping: multipliersBodies.map((body, index) => ({
            physicalPosition: index,
            slotIndex: index,
            multiplier: multipliers[index],
            label: body.label,
            position: { x: Math.round(body.position.x), y: Math.round(body.position.y) },
            mapping: `Position ${index} -> slotIndex ${index} -> multiplier ${multipliers[index]}`,
        })),
        slotIndexRange: `0 to ${multipliersBodies.length - 1}`,
        expectedBehavior: `slotIndex N corresponds to slot at physical position N`,
    });

    return { pins, multipliersBodies, walls };
}

/**
 * Set up basic physics world (collision detection is handled by layered PhysicsLayer)
 */
export function setupCollisionDetection(): {
    lastLogTimeRef: { current: number };
    animationState: Map<string, { offsetY: number; startTime: number; duration: number; type: "slotBounce" }>;
    pegCollisionTracker: Set<string>;
} {
    // Physics engine now only handles setup, not collision detection
    // Collision detection is handled by layered PhysicsLayer.tsx for cleaner separation
    const lastLogTimeRef = { current: 0 };
    const animationState = new Map<string, { offsetY: number; startTime: number; duration: number; type: "slotBounce" }>();
    const pegCollisionTracker = new Set<string>();

    return { lastLogTimeRef, animationState, pegCollisionTracker };
}

/**
 * Spawn a regular physics ball
 */
export function spawnBall(
    engine: Engine,
    canvasRef: React.RefObject<HTMLDivElement>,
    rows: number,
    betAmount: number,
    lastSpawnTimeRef: React.MutableRefObject<number>,
    minSpawnInterval: number
): void {
    const now = Date.now();
    const timeSinceLastSpawn = now - lastSpawnTimeRef.current;

    // Prevent rapid successive ball drops (anti-spam protection)
    if (lastSpawnTimeRef.current > 0 && timeSinceLastSpawn < minSpawnInterval) {
        return;
    }

    // Update last spawn time
    lastSpawnTimeRef.current = now;

    if (!engine.world || !canvasRef.current) {
        return;
    }

    // Get current canvas dimensions
    const containerRect = canvasRef.current.getBoundingClientRect();
    const canvasWidth = containerRect.width || physicsConfig.world.width;
    const canvasHeight = containerRect.height || physicsConfig.world.height;

    // Calculate responsive scale factor for canvas size
    const canvasScaleFactor = Math.min(
        canvasWidth / RENDERING_CONSTANTS.CANVAS.SCALE_REFERENCE_WIDTH,
        canvasHeight / RENDERING_CONSTANTS.CANVAS.SCALE_REFERENCE_HEIGHT
    );

    // Calculate dynamic ball size based on rows and canvas scaling
    const ballRadius = calculateBallSize(rows, canvasScaleFactor);

    // Get physics tweaks based on ball size for enhanced gameplay feel
    const physicsTweaks = getBallPhysicsTweaks(ballRadius);

    // Always spawn from the middle drop position (5th of 9 positions) for fair gameplay
    const ballX = getMiddleDropPosition(canvasWidth);

    // Add minimal random offset (±2px) to prevent identical paths while keeping it "middle"
    const randomOffset = (Math.random() - BALL_CONSTANTS.SPAWN.RANDOM_OFFSET_MULTIPLIER) * BALL_CONSTANTS.SPAWN.RANDOM_OFFSET_RANGE; // -2px to +2px
    const finalBallX = ballX + randomOffset;

    const ballColor = betAmount <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

    const ball = Bodies.circle(finalBallX, BALL_CONSTANTS.SPAWN.Y_POSITION, ballRadius, {
        restitution: physicsTweaks.restitution, // Dynamic bounce based on size
        friction: PHYSICS_CONSTANTS.BALL.FRICTION,
        label: `ball-${betAmount}`,
        id: new Date().getTime(),
        frictionAir: physicsTweaks.frictionAir, // Dynamic air resistance for fall speed
        density: physicsTweaks.density, // Dynamic mass for realistic physics
        collisionFilter: {
            group: PHYSICS_CONSTANTS.BALL.COLLISION_FILTER_GROUP,
            mask: PHYSICS_CONSTANTS.COLLISION_CATEGORIES.DEFAULT | PHYSICS_CONSTANTS.COLLISION_CATEGORIES.MULTIPLIER, // Only collide with pins and slots, not other balls
        },
        render: {
            fillStyle: ballColor,
        },
        isStatic: false,
    });

    // Add creation timestamp and world reference for cleanup bookkeeping
    const ballExtension = ball as BallBodyExtension;
    ballExtension.createdAt = Date.now();
    ballExtension.world = engine.world;

    Composite.add(engine.world, ball);
}

/**
 * Spawn a ball with service-determined path
 */
export function spawnBallWithPath(
    engine: Engine,
    canvasRef: React.RefObject<HTMLDivElement>,
    serviceData: ServiceGuidedBallData,
    rows: number
): void {
    // Validate service data consistency
    const calculatedSlot = serviceData.path.filter((p) => p === 1).length;
    console.log("🎯 [PHYSICS] SERVICE BALL CREATION - SLOT INDEX CALCULATION:", {
        path: serviceData.path,
        pathLength: serviceData.path.length,
        countOfOnes: calculatedSlot,
        serviceSlotIndex: serviceData.finalSlot,
        slotIndexMatch: calculatedSlot === serviceData.finalSlot,
        expectedOutcome: `Ball should land on slotIndex ${serviceData.finalSlot}`,
        pathDirections: serviceData.path.map((dir, idx) => `Step ${idx}: ${dir === 0 ? "LEFT" : "RIGHT"}`).join(", "),
        betValue: serviceData.betValue,
        multiplier: serviceData.multiplier,
    });

    if (calculatedSlot !== serviceData.finalSlot) {
        console.warn("⚠️ [PHYSICS] Slot mismatch in service data:", {
            calculatedSlot,
            serviceFinalSlot: serviceData.finalSlot,
            path: serviceData.path,
        });
    }

    // Validate path matches expected rows
    if (serviceData.path.length !== rows) {
        // Path length validation (silenced)
    }

    try {
        const ball = createBallWithServicePath(engine, serviceData, canvasRef, rows);

        // Add ball to physics world
        if (engine.world) {
            Composite.add(engine.world, ball);
            (ball as BallBodyExtension).world = engine.world;
        }
    } catch (error) {
        // Error handling (silenced)
    }
}

/**
 * Create a ball with service path data for physics-guided falling
 */
export function createBallWithServicePath(
    engine: Engine,
    serviceData: ServiceGuidedBallData,
    canvasRef: React.RefObject<HTMLDivElement>,
    rows: number
): Body {
    if (!canvasRef.current) {
        throw new Error("Canvas not ready");
    }

    // Calculate dynamic ball size based on rows and canvas scaling
    const containerRect = canvasRef.current.getBoundingClientRect();
    const canvasScaleFactor = Math.min(
        containerRect.width / RENDERING_CONSTANTS.CANVAS.SCALE_REFERENCE_WIDTH_ALT,
        containerRect.height / RENDERING_CONSTANTS.CANVAS.SCALE_REFERENCE_HEIGHT_ALT
    );
    const ballRadius = calculateBallSize(rows, canvasScaleFactor);

    // Always spawn from the middle drop position (5th of 9 positions)
    const ballX = getMiddleDropPosition(containerRect.width);

    const ballColor = serviceData.betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

    // Create ball body with service path information (match demo physics exactly)
    const ball = Bodies.circle(ballX, ballRadius, ballRadius, {
        restitution: 0, // No bounce like demo
        friction: 0, // No friction like demo
        frictionAir: 0, // No air resistance like demo
        collisionFilter: {
            group: -1, // Match demo collision group
        },
        render: {
            fillStyle: ballColor,
            strokeStyle: RENDERING_CONSTANTS.BALL.BALL_STROKE,
            lineWidth: 1,
        },
        label: "service-guided-ball",
        isStatic: false,
    });

    // Store service path information on the ball
    const ballExtension = ball as BallBodyExtension;
    ballExtension.servicePath = serviceData.path;
    ballExtension.currentPathIndex = 0;
    ballExtension.expectedFinalSlot = serviceData.finalSlot;
    ballExtension.multiplier = serviceData.multiplier;
    ballExtension.betValue = serviceData.betValue;
    ballExtension.isServiceGuided = true;
    ballExtension.createdAt = Date.now(); // Track creation time
    ballExtension.pathPositions = [
        {
            x: ball.position.x,
            y: ball.position.y,
            type: "spawn",
        },
    ]; // Start path tracking

    return ball;
}
