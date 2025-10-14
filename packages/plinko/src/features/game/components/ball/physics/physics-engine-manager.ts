/**
 * Physics Engine Manager Module
 * Manages the lifecycle of the Matter.js physics engine
 * Follows Single Responsibility Principle - only handles engine lifecycle
 */

import { Engine, Runner, World, Events, Composite } from "matter-js";
import { physicsConfig } from "@plinko/features/game/components/ball/physics/physics-config";
import { createPhysicsBodies } from "./body-factory";
import { processCollision, CollisionHandlerOptions } from "./collision-handler";
import { logger } from "@plinko/services/logger";
import { RENDERING_CONSTANTS } from "@plinko/features/game/components/ball/physics/constants/rendering-constants";
import { CANVAS_CONSTANTS } from "@plinko/features/game/components/ball/physics/constants/canvas-constants";
import { BallBodyExtension } from "@plinko/types/physics";

export interface PhysicsEngineState {
    engine: Engine | null;
    runner: Runner | null;
    isInitialized: boolean;
    pins: any[];
    multipliersBodies: any[];
    walls: any[];
}

export interface PhysicsEngineConfig {
    numberOfRows: number;
    multipliers: number[];
    gameMode: number;
    canvasWidth: number;
    canvasHeight: number;
    containerSize: { width: number; height: number };
    onBallHit?: (multiplier: number, betValue: number) => void;
}

/**
 * Initialize the physics engine with bodies and collision detection
 * Pure function - returns initialized engine state
 */
export function initializePhysicsEngine(config: PhysicsEngineConfig): PhysicsEngineState {
    logger.startWorkflow('physics-engine-manager-init', 'physics', 'Initialize physics engine manager');

    const { numberOfRows, multipliers, gameMode, canvasWidth, canvasHeight, containerSize } = config;

    logger.logPhysicsEvent('physics-engine-init-start', {
        numberOfRows,
        multipliersCount: multipliers.length,
        gameMode,
        canvasWidth,
        canvasHeight,
        containerSize,
        scaleFactor: Math.min(containerSize.width / canvasWidth, containerSize.height / canvasHeight),
        deviceInfo: {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            }
        }
    });

    // Create physics engine
    const engine = Engine.create();
    const scaleFactor = Math.min(containerSize.width / canvasWidth, containerSize.height / canvasHeight);
    engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor;

    // Create physics bodies
    const { pins, multipliersBodies, walls } = createPhysicsBodies({
        rows: numberOfRows,
        multipliers,
        gameMode,
        canvasWidth,
        canvasHeight,
    });

    // Create runner
    const runner = Runner.create();

    logger.logPhysicsEvent('physics-engine-init-complete', {
        engineId: engine.id,
        pinsCount: pins.length,
        multipliersCount: multipliersBodies.length,
        wallsCount: walls.length,
        totalBodies: pins.length + multipliersBodies.length + walls.length,
        gravity: engine.gravity.y,
        scaleFactor
    });

    logger.endWorkflow('physics-engine-manager-init');

    return {
        engine,
        runner,
        isInitialized: true,
        pins,
        multipliersBodies,
        walls,
    };
}

/**
 * Set up collision detection for the physics engine
 * Pure function - configures collision handling
 */
export function setupCollisionDetection(
    engine: Engine,
    removedBallsRef: React.MutableRefObject<Set<number>>,
    options: CollisionHandlerOptions
): void {
    Events.on(engine, "collisionActive", (event) => {
        const pairs = event.pairs;

        for (const pair of pairs) {
            const { bodyA, bodyB } = pair;
            const ballBody = bodyB.label?.includes("ball") ? bodyB : bodyA;
            const obstacleBody = ballBody === bodyA ? bodyB : bodyA;

            if (ballBody?.label?.includes("ball")) {
                processCollision(ballBody, obstacleBody, engine, removedBallsRef, options);
            }
        }
    });
}

/**
 * Add all physics bodies to the engine world
 * Pure function - adds bodies to world
 */
export function addBodiesToWorld(engine: Engine, pins: any[], multipliersBodies: any[], walls: any[]): void {
    const allBodies = [...pins, ...multipliersBodies, ...walls];
    logger.info(
        `🏗️ [PHYSICS] Adding bodies to world: pins=${pins.length}, multipliers=${multipliersBodies.length}, walls=${walls.length}, total=${allBodies.length}`
    );
    Composite.add(engine.world, allBodies);

    // Verify bodies were added
    const worldBodies = Composite.allBodies(engine.world);
    logger.debug(`✅ [PHYSICS] World now has ${worldBodies.length} bodies`);
}

/**
 * Start the physics engine runner
 * Side effect function - starts the runner
 */
export function startPhysicsRunner(runner: Runner, engine: Engine): void {
    logger.info("🚀 [PHYSICS] Starting physics runner");
    Runner.run(runner, engine);

    // Add logging for engine updates
    Events.on(engine, "beforeUpdate", () => {
        const balls = Composite.allBodies(engine.world).filter((body) => body.label?.includes("ball"));
        if (balls.length > 0 && Math.random() < RENDERING_CONSTANTS.LOGGING.UPDATE_LOG_PROBABILITY) {
            // Log ~1% of updates to avoid spam
            logger.debug(
                "⚡ [PHYSICS] Engine update - active balls:",
                balls.map((ball) => ({
                    id: ball.id,
                    position: { x: Math.round(ball.position.x), y: Math.round(ball.position.y) },
                    velocity: { x: Math.round(ball.velocity.x * 100) / 100, y: Math.round(ball.velocity.y * 100) / 100 },
                    label: ball.label,
                }))
            );
        }
    });

    Events.on(engine, "afterUpdate", () => {
        // Check for balls that have fallen outside canvas bounds and remove them
        checkAndRemoveOutOfBoundsBalls(engine);

        // Log ball removals
        const balls = Composite.allBodies(engine.world).filter((body) => body.label?.includes("ball"));
        balls.forEach((ball) => {
            const extension = ball as BallBodyExtension;
            if (extension.isRemoved && !extension.loggedRemoval) {
                logger.debug("🗑️ [PHYSICS] Ball removed from world:", {
                    id: ball.id,
                    position: { x: Math.round(ball.position.x), y: Math.round(ball.position.y) },
                    label: ball.label,
                });
                extension.loggedRemoval = true;
            }
        });
    });
}

/**
 * Check for balls that have fallen outside canvas bounds or are stuck, and remove them
 * Prevents accumulation of problematic balls that can interfere with active physics
 */
function checkAndRemoveOutOfBoundsBalls(engine: Engine): void {
    const balls = Composite.allBodies(engine.world).filter((body) => body.label?.includes("ball") && !body.isStatic);

    // Define reasonable bounds (with some margin beyond canvas)
    const canvasWidth = engine.world.bounds?.max?.x || CANVAS_CONSTANTS.DIMENSIONS.DEFAULT_WIDTH;
    const canvasHeight = engine.world.bounds?.max?.y || CANVAS_CONSTANTS.DIMENSIONS.DEFAULT_HEIGHT;

    const bounds = {
        maxX: canvasWidth * 1.5,
        maxY: canvasHeight * 1.5,
        minX: -canvasWidth * 0.5,
        minY: -canvasHeight * 0.5,
    };

    balls.forEach((ball) => {
        if (isBallOutOfBounds(ball, bounds)) {
            removeBallFromWorld(ball, "outside bounds");
        } else if (isBallStuck(ball, canvasHeight)) {
            handleStuckBall(ball);
        } else {
            resetStuckTimer(ball);
        }
    });
}

function isBallOutOfBounds(ball: any, bounds: any): boolean {
    const { x, y } = ball.position;
    return x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY;
}

function isBallStuck(ball: any, canvasHeight: number): boolean {
    const velocity = ball.velocity;
    const speed = velocity ? Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) : 0;
    return speed < 0.1 && ball.position.y < canvasHeight * 0.8;
}

function handleStuckBall(ball: any): void {
    if (ball.isRemoved) {
        return;
    }

    if (!ball.stuckTime) {
        ball.stuckTime = Date.now();
    } else if (Date.now() - ball.stuckTime > 3000) {
        logger.warn("🚨 [PHYSICS] Ball appears stuck - nudging:", {
            id: ball.id,
            position: { x: Math.round(ball.position.x), y: Math.round(ball.position.y) },
            label: ball.label,
        });

        // Give the ball a nudge
        if (ball.velocity) {
            ball.velocity.x += (Math.random() - 0.5) * 2;
            ball.velocity.y += 0.5;
        }

        ball.stuckTime = Date.now(); // Reset timer
    }
}

function resetStuckTimer(ball: any): void {
    if (ball.stuckTime) {
        ball.stuckTime = undefined;
    }
}

function removeBallFromWorld(ball: any, reason: string): void {
    if (ball.isRemoved) {
        return;
    }

    logger.warn(`🚨 [PHYSICS] Ball ${reason} - removing:`, {
        id: ball.id,
        position: { x: Math.round(ball.position.x), y: Math.round(ball.position.y) },
        label: ball.label,
    });

    ball.isRemoved = true;
    ball.isSensor = true;
    ball.isStatic = true;
    World.remove(ball.world || ball.engine?.world, ball);
}

/**
 * Clean up physics engine resources
 * Side effect function - cleans up resources
 */
export function cleanupPhysicsEngine(engine: Engine | null, runner: Runner | null): void {
    if (runner) {
        Runner.stop(runner);
    }
    if (engine) {
        World.clear(engine.world, true);
        Engine.clear(engine);
    }
}

/**
 * Update collision detection callback
 * Side effect function - updates event listeners
 */
export function updateCollisionDetection(
    engine: Engine,
    removedBallsRef: React.MutableRefObject<Set<number>>,
    options: CollisionHandlerOptions
): void {
    // Remove existing collision listeners
    Events.off(engine, "collisionActive", undefined as any);
    // Re-setup collision detection with new callback
    setupCollisionDetection(engine, removedBallsRef, options);
}
