import React from 'react';
import { Bodies, Body, Composite, Engine } from 'matter-js';
import { physicsConfig } from './physics-config';
import { calculateBallSize, getBallPhysicsTweaks } from './ball-calculations';
import { getMiddleDropPosition } from './drop-positions';

/**
 * Physics Engine Module
 * Manages all physics engine operations, ball creation, and spawning
 */

interface BallBodyExtension {
    world?: Engine['world'];
    isServiceGuided?: boolean;
    expectedFinalSlot?: number;
    multiplier?: number;
    betValue?: number;
    hasTriggeredWin?: boolean;
    servicePath?: number[];
    currentPathIndex?: number;
    isRemoved?: boolean; // Flag to prevent re-processing removed balls
    createdAt?: number; // Timestamp when ball was created
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
 * Get current canvas dimensions and physics categories
 */
export function getCanvasInfo(canvasRef: React.RefObject<HTMLDivElement>): CanvasInfo | null {
    if (!canvasRef.current) return null;

    const containerRect = canvasRef.current.getBoundingClientRect();

    // Define Matter.js collision categories (powers of 2)
    const ballCategory = 0x0001;      // 1
    const defaultCategory = 0x0002;   // 2
    const multiplierCategory = 0x0004; // 4

    return {
        canvasWidth: containerRect.width || physicsConfig.world.width,
        canvasHeight: containerRect.height || physicsConfig.world.height,
        ballCategory,
        defaultCategory,
        multiplierCategory
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
        if (multiplier >= 10) return physicsConfig.colors.multiplierHigh;
        if (multiplier >= 5) return physicsConfig.colors.multiplierMedium;
        if (multiplier >= 2) return physicsConfig.colors.multiplierLow;
        if (multiplier >= 1) return physicsConfig.colors.multiplierLoss;
        return '#333';
    }

    // Board dimensions based on plinko demo (1100x1100 canvas)
    // Using similar calculations to match the demo layout
    const pegRadius = 10;
    const mapGap = 3;
    const initialColumns = 3;

    // Create pins in triangular layout (matching plinko demo)
    for (let row = 1; row <= rows; row++) {
        const columnsInRow = initialColumns + (row - 1);
        const gap = pegRadius * 2 * mapGap; // 10 * 2 * 3 = 60
        const space = (canvasWidth - gap * columnsInRow) / 2;

        for (let col = 1; col <= columnsInRow; col++) {
            const x = space + col * gap - pegRadius * mapGap;
            const y = row * gap; // row * 60

            const pin = Bodies.circle(x, y, pegRadius, {
                label: `pin-${row}-${col}`,
                render: { fillStyle: physicsConfig.colors.pin },
                isStatic: true
            });
            pins.push(pin);
        }
    }

    // Create invisible walls
    const wallThickness = 20;
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

    // Create triangular boundary walls using strategic wall placements
    const triangleTopMargin = canvasHeight * 0.08;
    const triangleBottomMargin = canvasHeight * 0.15;
    const triangleBoardHeight = canvasHeight - triangleTopMargin - triangleBottomMargin;
    const triangleBoardWidth = canvasWidth * 0.85; // Match the board width (85%)

    // Calculate triangular boundaries (matching the visual board)
    const triangleCenterX = canvasWidth / 2; // Top point
    const triangleTopYPos = triangleTopMargin;
    const triangleBottomYPos = triangleTopMargin + triangleBoardHeight;

    // Create boundary walls at key positions to contain balls within triangle
    const triangularWalls: Body[] = [];

    // Create walls at progressive widths to form triangular shape
    const wallLevels = 6; // Number of wall levels from top to bottom
    for (let level = 0; level < wallLevels; level++) {
        const t = level / (wallLevels - 1); // 0 to 1
        const currentY = triangleTopYPos + t * (triangleBottomYPos - triangleTopYPos);
        const currentWidth = (1 - t) * 10 + t * triangleBoardWidth; // Narrow at top, wide at bottom
        const currentX = triangleCenterX - currentWidth / 2;

        // Left wall segment
        const leftWallSegment = Bodies.rectangle(
            currentX - 5,
            currentY,
            10, // Thickness
            triangleBoardHeight / wallLevels, // Segment height
            {
                render: { visible: false },
                isStatic: true,
                label: `triangle-left-wall-${level}`
            }
        );

        // Right wall segment
        const rightWallSegment = Bodies.rectangle(
            currentX + currentWidth + 5,
            currentY,
            10, // Thickness
            triangleBoardHeight / wallLevels, // Segment height
            {
                render: { visible: false },
                isStatic: true,
                label: `triangle-right-wall-${level}`
            }
        );

        triangularWalls.push(leftWallSegment, rightWallSegment);
    }

    const walls = [leftWall, rightWall, floor, ...triangularWalls];

    // Create multiplier slots (matching plinko demo slot layout)
    const numberOfSlots = rows + 1;
    const gap = pegRadius * 2 * mapGap; // Same gap as pegs: 60
    const space = (canvasWidth - gap * numberOfSlots) / 2;
    const y = numberOfSlots * pegRadius * 2 * 3 - 40; // 11 * 10 * 2 * 3 - 40 = 620 for 10 rows
    const slotWidth = gap - 6; // gap - 6 = 54
    const slotHeight = 1; // Thin slot like demo

    multipliers.forEach((multiplier, index) => {
        const col = index + 1; // Slots are 1-indexed in demo
        const x = space + col * gap - pegRadius * mapGap;

        const multiplierBody = Bodies.rectangle(
            x,
            y,
            slotWidth,
            slotHeight,
            {
                label: `multiplier-${multiplier}-${index}`,
                isStatic: true,
                isSensor: true, // Like demo slots
                render: {
                    fillStyle: getMultiplierColor(multiplier)
                }
            }
        );
        multipliersBodies.push(multiplierBody);
    });

    return { pins, multipliersBodies, walls };
}

/**
 * Set up basic physics world (collision detection is handled by layered PhysicsLayer)
 */
export function setupCollisionDetection(): {
    lastLogTimeRef: { current: number };
    animationState: Map<string, { offsetY: number; startTime: number; duration: number; type: 'slotBounce' }>;
    pegCollisionTracker: Set<string>;
} {
    // Physics engine now only handles setup, not collision detection
    // Collision detection is handled by layered PhysicsLayer.tsx for cleaner separation
    const lastLogTimeRef = { current: 0 };
    const animationState = new Map<string, { offsetY: number; startTime: number; duration: number; type: 'slotBounce' }>();
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

    if (!engine.world || !canvasRef.current) return;

    // Get current canvas dimensions
    const containerRect = canvasRef.current.getBoundingClientRect();
    const canvasWidth = containerRect.width || physicsConfig.world.width;
    const canvasHeight = containerRect.height || physicsConfig.world.height;

    // Calculate responsive scale factor for canvas size
    const canvasScaleFactor = Math.min(canvasWidth / 400, canvasHeight / 400);

    // Calculate dynamic ball size based on rows and canvas scaling
    const ballRadius = calculateBallSize(rows, canvasScaleFactor);

    // Get physics tweaks based on ball size for enhanced gameplay feel
    const physicsTweaks = getBallPhysicsTweaks(ballRadius);

    // Always spawn from the middle drop position (5th of 9 positions) for fair gameplay
    const ballX = getMiddleDropPosition(canvasWidth);

    // Add minimal random offset (±2px) to prevent identical paths while keeping it "middle"
    const randomOffset = (Math.random() - 0.5) * 4; // -2px to +2px
    const finalBallX = ballX + randomOffset;

    const ballColor = betAmount <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

    const ball = Bodies.circle(finalBallX, 30, ballRadius, {
        restitution: physicsTweaks.restitution, // Dynamic bounce based on size
        friction: 0.6,
        label: `ball-${betAmount}`,
        id: new Date().getTime(),
        frictionAir: physicsTweaks.frictionAir, // Dynamic air resistance for fall speed
        density: physicsTweaks.density, // Dynamic mass for realistic physics
        collisionFilter: {
            group: -1
        },
        render: {
            fillStyle: ballColor
        },
        isStatic: false
    });

    // Add creation timestamp and world reference for cleanup bookkeeping
    const ballExtension = ball as Body & BallBodyExtension;
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
    const calculatedSlot = serviceData.path.filter(p => p === 1).length;
    if (calculatedSlot !== serviceData.finalSlot) {
        // Slot mismatch validation (silenced)
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
            (ball as Body & BallBodyExtension).world = engine.world;
        }
    } catch (error) {
        // Error handling (silenced)
    }
}

/**
 * Create a ball with service path data for physics-guided falling
 */
function createBallWithServicePath(
    engine: Engine,
    serviceData: ServiceGuidedBallData,
    canvasRef: React.RefObject<HTMLDivElement>,
    rows: number
): Body {
    if (!canvasRef.current) throw new Error('Canvas not ready');

    // Calculate dynamic ball size based on rows and canvas scaling
    const containerRect = canvasRef.current.getBoundingClientRect();
    const canvasScaleFactor = Math.min(containerRect.width / 480, containerRect.height / 400);
    const ballRadius = calculateBallSize(rows, canvasScaleFactor);

    // Get physics tweaks based on ball size
    const physicsTweaks = getBallPhysicsTweaks(ballRadius);

    // Always spawn from the middle drop position (5th of 9 positions)
    const ballX = getMiddleDropPosition(containerRect.width);

    const ballColor = serviceData.betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

    // Create ball body with service path information
    const ball = Bodies.circle(ballX, ballRadius + 10, ballRadius, {
        restitution: physicsTweaks.restitution,
        friction: 0.1,
        frictionAir: physicsTweaks.frictionAir,
        density: physicsTweaks.density,
        render: {
            fillStyle: ballColor,
            strokeStyle: '#FFD700',
            lineWidth: 1
        },
        label: 'service-guided-ball',
        isStatic: false
    });

    // Store service path information on the ball
    const ballExtension = ball as Body & BallBodyExtension;
    ballExtension.servicePath = serviceData.path;
    ballExtension.currentPathIndex = 0;
    ballExtension.expectedFinalSlot = serviceData.finalSlot;
    ballExtension.multiplier = serviceData.multiplier;
    ballExtension.betValue = serviceData.betValue;
    ballExtension.isServiceGuided = true;
    ballExtension.createdAt = Date.now(); // Track creation time

    return ball;
}
