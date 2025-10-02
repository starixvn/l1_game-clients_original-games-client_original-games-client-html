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

    // Simplified board dimensions
    const topMargin = canvasHeight * 0.08;
    const bottomMargin = canvasHeight * 0.15;
    const availableHeight = canvasHeight - topMargin - bottomMargin;
    const verticalSpacing = availableHeight / (rows + 1);

    // Create pins in triangular layout
    for (let l = 0; l < rows; l++) {
        const linePins = l + 2;
        const maxPinsInBottomRow = rows + 1;
        const maxLineWidth = canvasWidth * 0.85;
        const pinSpacing = maxLineWidth / (maxPinsInBottomRow - 1);
        const lineWidth = (linePins - 1) * pinSpacing;
        const rowStartX = (canvasWidth - lineWidth) / 2;

        for (let i = 0; i < linePins; i++) {
            const pinX = rowStartX + i * pinSpacing;
            const pinY = topMargin + (l + 1) * verticalSpacing;

            const pin = Bodies.circle(pinX, pinY, 2, {
                label: `pin-${l}-${i}`,
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

    // Create multiplier slots
    const slotWidth = Math.max(25, Math.min(60, canvasWidth / multipliers.length * 0.85));
    const slotHeight = Math.max(20, Math.min(40, canvasHeight * 0.08));
    const totalSlotWidth = slotWidth * multipliers.length;
    const triangleBoardWidth = canvasWidth * 0.85;
    const triangleBoardX = (canvasWidth - triangleBoardWidth) / 2;
    const startX = triangleBoardX + (triangleBoardWidth - totalSlotWidth) / 2;

    multipliers.forEach((multiplier, index) => {
        const slotX = startX + index * slotWidth + slotWidth / 2;
        const slotY = topMargin + (canvasHeight - topMargin - bottomMargin) + slotHeight / 2;

        const multiplierBody = Bodies.rectangle(slotX, slotY, slotWidth, slotHeight, {
            label: `multiplier-${multiplier}-${index}`,
            isStatic: true,
            render: {
                fillStyle: multiplier >= 10 ? physicsConfig.colors.multiplierHigh :
                    multiplier >= 5 ? physicsConfig.colors.multiplierMedium :
                        multiplier >= 2 ? physicsConfig.colors.multiplierLow :
                            multiplier >= 1 ? physicsConfig.colors.multiplierLoss : '#333'
            }
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
    const ballExtension = ball as Body & BallBodyExtension;
    ballExtension.createdAt = Date.now();
    ballExtension.world = engine.world;
    ballExtension.betValue = betAmount;

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
    const ballExtension = ball as Body & BallBodyExtension;
    ballExtension.servicePath = serviceData.path;
    ballExtension.currentPathIndex = 0;
    ballExtension.expectedFinalSlot = serviceData.finalSlot;
    ballExtension.multiplier = serviceData.multiplier;
    ballExtension.betValue = serviceData.betValue;
    ballExtension.isServiceGuided = true;
    ballExtension.wrongSlotHits = 0;
    ballExtension.pinCollisions = [];

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
            if (ballExtension.isRemoved || (removedBallsRef && removedBallsRef.current.has(ballBody.id))) {
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
