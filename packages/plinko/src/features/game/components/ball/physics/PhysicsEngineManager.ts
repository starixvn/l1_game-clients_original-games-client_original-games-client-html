/**
 * Physics Engine Manager Module
 * Manages the lifecycle of the Matter.js physics engine
 * Follows Single Responsibility Principle - only handles engine lifecycle
 */

import { Engine, Runner, World, Events, Composite } from 'matter-js';
import { physicsConfig } from '../../../../../lib/physics';
import { BodyFactory, createPhysicsBodies } from './BodyFactory';
import { CollisionHandler, processCollision, CollisionHandlerOptions } from './CollisionHandler';

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
    const { numberOfRows, multipliers, gameMode, canvasWidth, canvasHeight, containerSize } = config;

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
        canvasHeight
    });

    // Create runner
    const runner = Runner.create();

    return {
        engine,
        runner,
        isInitialized: true,
        pins,
        multipliersBodies,
        walls
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
    Composite.add(engine.world, allBodies);
}

/**
 * Start the physics engine runner
 * Side effect function - starts the runner
 */
export function startPhysicsRunner(runner: Runner, engine: Engine): void {
    Runner.run(runner, engine);
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
