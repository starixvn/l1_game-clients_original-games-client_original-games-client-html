import { Bodies, Body, Composite, Engine, Events, Runner, World } from 'matter-js';
import { physicsConfig } from './physics-config';
import { calculateBallSize, getBallPhysicsTweaks } from './ball-calculations';
import { getMiddleDropPosition } from './drop-positions';

/**
 * Simplified Physics Engine Module
 * 
 * This replaces the complex physics system with a streamlined version that:
 * - Reduces complexity while maintaining functionality
 * - Improves performance by eliminating unnecessary calculations
 * - Simplifies collision handling
 * - Maintains all core physics behaviors
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
    isRemoved?: boolean;
    createdAt?: number;
    wrongSlotHits?: number;
    pinCollisions?: string[];
}

export interface ServiceGuidedBallData {
    path: number[];
    finalSlot: number;
    multiplier: number;
    betValue: number;
}

/**
 * Create physics bodies for the Plinko board with simplified logic
 */
export function createSimplifiedPhysicsBodies(
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

    // Create simplified walls
    const wallThickness = 20;
    const walls = [
        Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, {
            render: { visible: false },
            isStatic: true
        }),
        Bodies.rectangle(canvasWidth + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, {
            render: { visible: false },
            isStatic: true
        }),
        Bodies.rectangle(canvasWidth / 2, canvasHeight + wallThickness / 2, canvasWidth * 2, wallThickness, {
            render: { visible: false },
            isStatic: true
        })
    ];

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

        // Calculate slot color based on multiplier value
        let fillStyle = '#333'; // default
        if (multiplier >= 10) {
            fillStyle = physicsConfig.colors.multiplierHigh;
        } else if (multiplier >= 5) {
            fillStyle = physicsConfig.colors.multiplierMedium;
        } else if (multiplier >= 2) {
            fillStyle = physicsConfig.colors.multiplierLow;
        } else if (multiplier >= 1) {
            fillStyle = physicsConfig.colors.multiplierLoss;
        }

        const multiplierBody = Bodies.rectangle(x, y, slotWidth, slotHeight, {
            label: `multiplier-${multiplier}-${index}`,
            isStatic: true,
            isSensor: true, // Like demo slots
            render: { fillStyle }
        });
        multipliersBodies.push(multiplierBody);
    });

    return { pins, multipliersBodies, walls };
}

/**
 * Simplified ball spawning with reduced complexity
 */
export function spawnSimplifiedBall(
    engine: Engine,
    canvasWidth: number,
    canvasHeight: number,
    rows: number,
    betAmount: number,
    lastSpawnTimeRef: React.MutableRefObject<number>,
    minSpawnInterval: number = 500
): void {
    const now = Date.now();
    const timeSinceLastSpawn = now - lastSpawnTimeRef.current;

    // Prevent rapid successive ball drops
    if (lastSpawnTimeRef.current > 0 && timeSinceLastSpawn < minSpawnInterval) {
        return;
    }

    lastSpawnTimeRef.current = now;

    if (!engine.world) return;

    // Calculate ball properties
    const canvasScaleFactor = Math.min(canvasWidth / 400, canvasHeight / 400);
    const ballRadius = calculateBallSize(rows, canvasScaleFactor);
    const physicsTweaks = getBallPhysicsTweaks(ballRadius);

    // Spawn position
    const ballX = getMiddleDropPosition(canvasWidth);
    const randomOffset = (Math.random() - 0.5) * 4;
    const finalBallX = ballX + randomOffset;

    const ballColor = betAmount <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

    const ball = Bodies.circle(finalBallX, 30, ballRadius, {
        restitution: physicsTweaks.restitution,
        friction: 0.6,
        label: `ball-${betAmount}`,
        id: new Date().getTime(),
        frictionAir: physicsTweaks.frictionAir,
        density: physicsTweaks.density,
        collisionFilter: { group: -1 },
        render: { fillStyle: ballColor },
        isStatic: false,
    });

    // Add ball extension properties
    (ball as Body & BallBodyExtension).createdAt = Date.now();
    (ball as Body & BallBodyExtension).world = engine.world;
    (ball as Body & BallBodyExtension).betValue = betAmount;

    Composite.add(engine.world, ball);
}

/**
 * Simplified service-guided ball spawning
 */
export function spawnSimplifiedBallWithPath(
    engine: Engine,
    canvasWidth: number,
    canvasHeight: number,
    rows: number,
    serviceData: ServiceGuidedBallData
): void {
    if (!engine.world) return;

    // Calculate ball properties
    const canvasScaleFactor = Math.min(canvasWidth / 400, canvasHeight / 400);
    const ballRadius = calculateBallSize(rows, canvasScaleFactor);
    const physicsTweaks = getBallPhysicsTweaks(ballRadius);

    // Spawn position
    const ballX = getMiddleDropPosition(canvasWidth);
    const ballColor = serviceData.betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

    const ball = Bodies.circle(ballX, ballRadius + 10, ballRadius, {
        restitution: physicsTweaks.restitution,
        friction: 0.1,
        frictionAir: physicsTweaks.frictionAir,
        density: physicsTweaks.density,
        render: {
            fillStyle: ballColor,
            strokeStyle: "#FFD700",
            lineWidth: 1,
        },
        label: "service-guided-ball",
        isStatic: false,
    });

    // Add service path information
    (ball as Body & BallBodyExtension).servicePath = serviceData.path;
    (ball as Body & BallBodyExtension).currentPathIndex = 0;
    (ball as Body & BallBodyExtension).expectedFinalSlot = serviceData.finalSlot;
    (ball as Body & BallBodyExtension).multiplier = serviceData.multiplier;
    (ball as Body & BallBodyExtension).betValue = serviceData.betValue;
    (ball as Body & BallBodyExtension).isServiceGuided = true;
    (ball as Body & BallBodyExtension).wrongSlotHits = 0;
    (ball as Body & BallBodyExtension).pinCollisions = [];

    Composite.add(engine.world, ball);
}

/**
 * Simplified collision handling with reduced complexity
 */
export function setupSimplifiedCollisionDetection(
    engine: Engine,
    onBallHit?: (multiplier: number, betValue: number) => void,
    removedBallsRef?: React.MutableRefObject<Set<number>>
): void {
    Events.on(engine, "collisionActive", (event) => {
        const pairs = event.pairs;

        for (const pair of pairs) {
            const { bodyA, bodyB } = pair;
            const ballBody = bodyB.label?.includes("ball") ? bodyB : bodyA;
            const obstacleBody = ballBody === bodyA ? bodyB : bodyA;

            if (!ballBody?.label?.includes("ball")) continue;

            const ballExtension = ballBody as Body & BallBodyExtension;

            // Skip if ball is already removed
            if (ballExtension.isRemoved || removedBallsRef?.current.has(ballBody.id)) {
                continue;
            }

            // Handle multiplier collisions
            if (obstacleBody.label?.includes("multiplier")) {
                const multiplier = parseFloat(obstacleBody.label.split("-")[1]) || 1;
                const betValue = ballExtension.betValue || 100;
                const finalSlot = parseInt(obstacleBody.label.split("-")[2]) || 0;

                // Mark ball as removed
                ballExtension.isRemoved = true;
                ballBody.isSensor = true;
                ballBody.isStatic = true;

                if (removedBallsRef) {
                    removedBallsRef.current.add(ballBody.id);
                }

                // Handle service-guided balls
                if (ballExtension.isServiceGuided && ballExtension.expectedFinalSlot !== undefined) {
                    if (finalSlot === ballExtension.expectedFinalSlot) {
                        // Correct slot hit
                        World.remove(engine.world, ballBody);
                        if (!ballExtension.hasTriggeredWin) {
                            ballExtension.hasTriggeredWin = true;
                            if (onBallHit) {
                                onBallHit(multiplier, betValue);
                            }
                        }
                    } else {
                        // Wrong slot hit
                        ballExtension.wrongSlotHits = (ballExtension.wrongSlotHits || 0) + 1;
                        if (ballExtension.wrongSlotHits >= 3) {
                            // Force completion after too many wrong hits
                            World.remove(engine.world, ballBody);
                            if (!ballExtension.hasTriggeredWin) {
                                ballExtension.hasTriggeredWin = true;
                                if (onBallHit) {
                                    onBallHit(ballExtension.multiplier || multiplier, betValue);
                                }
                            }
                        }
                    }
                } else {
                    // Regular ball
                    World.remove(engine.world, ballBody);
                    if (!ballExtension.hasTriggeredWin) {
                        ballExtension.hasTriggeredWin = true;
                        if (onBallHit) {
                            onBallHit(multiplier, betValue);
                        }
                    }
                }
            }
            // Handle pin collisions
            else if (obstacleBody.label?.includes("pin")) {
                const servicePath = ballExtension.servicePath;
                const currentPathIndex = ballExtension.currentPathIndex || 0;

                if (ballExtension.isServiceGuided && servicePath && currentPathIndex < servicePath.length) {
                    // Service-guided ball following path
                    const direction = servicePath[currentPathIndex];
                    const forceMagnitude = 0.15;
                    const forceX = direction === 1 ? forceMagnitude : -forceMagnitude;

                    Body.setVelocity(ballBody, { x: forceX * 2, y: ballBody.velocity.y });
                    Body.applyForce(ballBody, ballBody.position, { x: forceX, y: 0 });
                    ballExtension.currentPathIndex = currentPathIndex + 1;
                } else {
                    // Random deflection for regular balls
                    const ballRadius = ballBody.circleRadius || 5;
                    const deflectionStrength = Math.max(0.1, Math.min(0.3, 0.25 / (ballRadius / 5)));
                    const randomDirection = Math.random() < 0.5 ? -1 : 1;
                    const randomForce = randomDirection * deflectionStrength * (Math.random() * 0.5 + 0.75);
                    Body.applyForce(ballBody, ballBody.position, { x: randomForce, y: 0 });
                }
            }
        }
    });
}

/**
 * Create and configure a simplified physics engine
 */
export function createSimplifiedPhysicsEngine(
    canvasWidth: number,
    canvasHeight: number,
    rows: number,
    multipliers: number[]
): {
    engine: Engine;
    runner: Runner;
    bodies: { pins: Body[]; multipliersBodies: Body[]; walls: Body[] };
} {
    // Create engine
    const engine = Engine.create();
    const scaleFactor = Math.min(canvasWidth / 400, canvasHeight / 400);
    engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor;

    // Create bodies
    const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
    const bodies = createSimplifiedPhysicsBodies(canvasWidth, canvasHeight, rows, effectiveMultipliers);

    // Add bodies to world
    Composite.add(engine.world, [...bodies.pins, ...bodies.multipliersBodies, ...bodies.walls]);

    // Create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    return { engine, runner, bodies };
}
