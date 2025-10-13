/**
 * Modular Physics Engine Manager
 * Integrates the new modular physics system with Matter.js engine
 * Replaces the legacy physics-engine-manager with modular components
 */

import { Engine, Runner, World, Events, Body } from 'matter-js';
import { physicsLogger } from '../performance/physics-logger';
import { createPhysicsBodies, BodyCreationOptions } from '../body-factory';
import { detectCirclePegCollision } from '../collisions/collision-detection';
import { CollisionCooldownManager } from '../collisions/collision-cooldown';
import { BallBodyExtension } from '../../../../../../types/physics';
import { handleServiceGuidedPinCollision } from '../collisions/test-utils';
import { PHYSICS_SCALING_FORMULAS } from '../scaling/row-based-scaling';

export interface PhysicsEngineConfig {
    gravity: { x: number; y: number };
    enableSleeping: boolean;
    constraintIterations: number;
    positionIterations: number;
    velocityIterations: number;
}

export interface PhysicsEngineState {
    engine: Engine;
    runner: Runner;
    world: World;
    cooldownManager: CollisionCooldownManager;
    isInitialized: boolean;
}

const serviceGuidedBallLabel = 'service-guided-ball';
const preCalculatedBallLabel = 'pre-calculated-ball';
const multiplierLabel = 'multiplier-';

/**
 * Initialize modular physics engine with new collision system
 */
export function initializePhysicsEngine(config: PhysicsEngineConfig): PhysicsEngineState {
    physicsLogger.info('Initializing modular physics engine', {
        component: 'ModularPhysicsEngine',
        function: 'initializePhysicsEngine',
        metadata: config
    });

    // Create Matter.js engine
    const engine = Engine.create({
        gravity: config.gravity,
        enableSleeping: config.enableSleeping,
        constraintIterations: config.constraintIterations,
        positionIterations: config.positionIterations,
        velocityIterations: config.velocityIterations
    });

    // Create runner
    const runner = Runner.create();

    // Create collision cooldown manager
    const cooldownManager = new CollisionCooldownManager();

    const state: PhysicsEngineState = {
        engine,
        runner,
        world: engine.world,
        cooldownManager,
        isInitialized: true
    };

    physicsLogger.info('Modular physics engine initialized successfully', {
        component: 'ModularPhysicsEngine',
        function: 'initializePhysicsEngine',
        metadata: { worldId: engine.world.id }
    });

    return state;
}

/**
 * Setup collision detection using new modular collision system
 */
export function setupCollisionDetection(
    engine: Engine,
    cooldownManager: CollisionCooldownManager,
    onBallLanded?: (success: boolean) => void
): void {
    physicsLogger.info('🔧 SETTING UP MODULAR COLLISION DETECTION', {
        component: 'ModularPhysicsEngine',
        function: 'setupCollisionDetection',
        metadata: { worldId: engine.world.id, engineId: engine.id }
    });

    // Temporarily set logger to DEBUG level for detailed collision logging
    physicsLogger.configure({ level: 0 }); // DEBUG level

    // Set up collision event handlers
    Events.on(engine, 'collisionStart', (event) => {
        processCollisionPairs(event.pairs, engine, cooldownManager, onBallLanded);
    });

    // Setup delayed guidance system for natural physics
    Events.on(engine, 'afterUpdate', () => {
        applyPendingGuidance(engine);
    });

    physicsLogger.info('Modular collision detection setup complete', {
        component: 'ModularPhysicsEngine',
        function: 'setupCollisionDetection'
    });
}

/**
 * Process all collision pairs
 */
function processCollisionPairs(
    pairs: any[],
    engine: Engine,
    cooldownManager: CollisionCooldownManager,
    onBallLanded?: (success: boolean) => void
): void {
    physicsLogger.info('Collision event triggered', {
        component: 'ModularPhysicsEngine',
        function: 'processCollisionPairs',
        metadata: { pairCount: pairs.length, worldId: engine.world.id }
    });

    for (const pair of pairs) {
        processCollisionPair(pair, engine, cooldownManager, onBallLanded);
    }
}

/**
 * Process a single collision pair
 */
function processCollisionPair(
    pair: any,
    engine: Engine,
    cooldownManager: CollisionCooldownManager,
    onBallLanded?: (success: boolean) => void
): void {
    const { bodyA, bodyB } = pair;
    
    logCollisionPairDetails(bodyA, bodyB);

    if (shouldSkipCollision(bodyA, bodyB, cooldownManager)) {
        return;
    }

    handleCollisionByType(bodyA, bodyB, pair, engine, cooldownManager, onBallLanded);
}

/**
 * Log detailed collision pair information
 */
function logCollisionPairDetails(bodyA: Body, bodyB: Body): void {
    physicsLogger.info('🔍 PROCESSING COLLISION PAIR - DETAILED', {
        component: 'ModularPhysicsEngine',
        function: 'logCollisionPairDetails',
        metadata: {
            bodyA: {
                id: bodyA.id,
                label: bodyA.label,
                isStatic: bodyA.isStatic,
                position: { x: Math.round(bodyA.position.x), y: Math.round(bodyA.position.y) },
                velocity: { x: bodyA.velocity.x.toFixed(3), y: bodyA.velocity.y.toFixed(3) }
            },
            bodyB: {
                id: bodyB.id,
                label: bodyB.label,
                isStatic: bodyB.isStatic,
                position: { x: Math.round(bodyB.position.x), y: Math.round(bodyB.position.y) },
                velocity: { x: bodyB.velocity.x.toFixed(3), y: bodyB.velocity.y.toFixed(3) }
            }
        }
    });
}

/**
 * Determine if collision should be skipped
 */
function shouldSkipCollision(bodyA: Body, bodyB: Body, cooldownManager: CollisionCooldownManager): boolean {
    const ballBody = getServiceGuidedBall(bodyA, bodyB);
    const ballExtension = ballBody ? ballBody as unknown as BallBodyExtension : null;
    const hasCompletedPath = ballExtension && ballExtension.currentPathIndex >= ballExtension.servicePath?.length;
    const isMultiplierCollision = bodyA.label?.startsWith(multiplierLabel) || bodyB.label?.startsWith(multiplierLabel);

    // Skip collisions for completed path balls (except multipliers)
    if (hasCompletedPath && !isMultiplierCollision) {
        logSkipCompletedPath(ballBody, ballExtension);
        return true;
    }

    // Skip static body collisions unless service-guided
    if (shouldSkipStaticCollision(bodyA, bodyB, isMultiplierCollision)) {
        return true;
    }

    // Check cooldown
    if (!cooldownManager.canCollide(bodyA.id, bodyB.id, 50)) {
        logSkipCooldown(bodyA, bodyB);
        return true;
    }

    return false;
}

/**
 * Get service-guided ball from collision pair
 */
function getServiceGuidedBall(bodyA: Body, bodyB: Body): Body | null {
    const isServiceGuided = (label: string) => label === serviceGuidedBallLabel || label === preCalculatedBallLabel;
    
    if (isServiceGuided(bodyA.label)) { return bodyA; }
    if (isServiceGuided(bodyB.label)) { return bodyB; }
    return null;
}

/**
 * Check if static collision should be skipped
 */
function shouldSkipStaticCollision(bodyA: Body, bodyB: Body, isMultiplierCollision: boolean): boolean {
    const isServiceGuidedBallLabel = (label: string) => label === serviceGuidedBallLabel || label === preCalculatedBallLabel;
    const isServiceGuidedBallCollision = (isServiceGuidedBallLabel(bodyA.label) || isServiceGuidedBallLabel(bodyB.label)) &&
        (bodyA.label?.startsWith('pin-') || bodyB.label?.startsWith('pin-'));

    if ((bodyA.isStatic || bodyB.isStatic) && !isServiceGuidedBallCollision && !isMultiplierCollision) {
        logSkipStaticCollision(bodyA, bodyB, isServiceGuidedBallCollision);
        return true;
    }

    return false;
}

/**
 * Handle collision based on type
 */
function handleCollisionByType(
    bodyA: Body,
    bodyB: Body,
    pair: any,
    engine: Engine,
    cooldownManager: CollisionCooldownManager,
    onBallLanded?: (success: boolean) => void
): void {
    const isServiceGuidedBallLabel = (label: string) => label === serviceGuidedBallLabel || label === preCalculatedBallLabel;
    const isMultiplierCollision = bodyA.label?.startsWith(multiplierLabel) || bodyB.label?.startsWith(multiplierLabel);

    logCollisionParticipants(bodyA, bodyB, isServiceGuidedBallLabel);

    if (isServiceGuidedBallLabel(bodyA.label) || isServiceGuidedBallLabel(bodyB.label)) {
        handleServiceGuidedCollision(bodyA, bodyB, pair, engine, cooldownManager, onBallLanded, isMultiplierCollision);
    } else {
        logNonServiceGuidedCollision(bodyA, bodyB);
    }
}

/**
 * Handle service-guided ball collisions
 */
function handleServiceGuidedCollision(
    bodyA: Body,
    bodyB: Body,
    pair: any,
    engine: Engine,
    cooldownManager: CollisionCooldownManager,
    onBallLanded: (success: boolean) => void | undefined,
    isMultiplierCollision: boolean
): void {
    const isServiceGuidedBallLabel = (label: string) => label === serviceGuidedBallLabel || label === preCalculatedBallLabel;
    
    logServiceGuidedCollision(bodyA, bodyB, isServiceGuidedBallLabel);

    if (isMultiplierCollision) {
        logMultiplierCollisionRouting(bodyA, bodyB);
        handleBallMultiplierCollision(pair, engine, onBallLanded);
    } else {
        logPegCollisionRouting(bodyA, bodyB);
        handleBallPegCollision(pair, cooldownManager, engine);
    }
}

// Logging functions
function logSkipCompletedPath(ballBody: Body | null, ballExtension: BallBodyExtension | null): void {
    physicsLogger.debug('Skipping collision - service-guided ball has completed path', {
        component: 'ModularPhysicsEngine',
        function: 'shouldSkipCollision',
        metadata: {
            ballId: ballBody?.id,
            currentPathIndex: ballExtension?.currentPathIndex,
            servicePathLength: ballExtension?.servicePath?.length,
            expectedFinalSlot: ballExtension?.expectedFinalSlot,
            collisionType: 'skipped',
            reason: 'Path completed, preventing trajectory interference'
        }
    });
}

function logSkipStaticCollision(bodyA: Body, bodyB: Body, isServiceGuidedBallCollision: boolean): void {
    physicsLogger.debug('Skipping collision with static body (not service-guided)', {
        component: 'ModularPhysicsEngine',
        function: 'shouldSkipStaticCollision',
        metadata: {
            staticBody: bodyA.isStatic ? 'bodyA' : 'bodyB',
            bodyALabel: bodyA.label,
            bodyBLabel: bodyB.label,
            isServiceGuidedBallCollision
        }
    });
}

function logSkipCooldown(bodyA: Body, bodyB: Body): void {
    physicsLogger.debug('Collision blocked by cooldown system', {
        component: 'ModularPhysicsEngine',
        function: 'shouldSkipCollision',
        metadata: { bodyAId: bodyA.id, bodyBId: bodyB.id }
    });
}

function logCollisionParticipants(bodyA: Body, bodyB: Body, isServiceGuidedBallLabel: (label: string) => boolean): void {
    const bodyAExtension = bodyA as unknown as BallBodyExtension;
    const bodyBExtension = bodyB as unknown as BallBodyExtension;

    physicsLogger.info('⚡ COLLISION PARTICIPANTS IDENTIFIED', {
        component: 'ModularPhysicsEngine',
        function: 'logCollisionParticipants',
        metadata: {
            bodyA: {
                label: bodyA.label,
                isServiceGuided: bodyAExtension.isServiceGuided,
                servicePath: bodyAExtension.servicePath,
                expectedFinalSlot: bodyAExtension.expectedFinalSlot
            },
            bodyB: {
                label: bodyB.label,
                isServiceGuided: bodyBExtension.isServiceGuided,
                servicePath: bodyBExtension.servicePath,
                expectedFinalSlot: bodyBExtension.expectedFinalSlot
            },
            checkingServiceGuided: {
                bodyA_isServiceGuided: isServiceGuidedBallLabel(bodyA.label),
                bodyB_isServiceGuided: isServiceGuidedBallLabel(bodyB.label),
                eitherIsServiceGuided: isServiceGuidedBallLabel(bodyA.label) || isServiceGuidedBallLabel(bodyB.label)
            }
        }
    });
}

function logServiceGuidedCollision(bodyA: Body, bodyB: Body, isServiceGuidedBallLabel: (label: string) => boolean): void {
    physicsLogger.info('🎯 SERVICE-GUIDED BALL COLLISION DETECTED', {
        component: 'ModularPhysicsEngine',
        function: 'handleServiceGuidedCollision',
        metadata: {
            ballBody: isServiceGuidedBallLabel(bodyA.label) ? 'bodyA' : 'bodyB',
            otherBody: isServiceGuidedBallLabel(bodyA.label) ? bodyB.label : bodyA.label,
            ballLabel: isServiceGuidedBallLabel(bodyA.label) ? bodyA.label : bodyB.label,
            otherLabel: isServiceGuidedBallLabel(bodyA.label) ? bodyB.label : bodyA.label
        }
    });
}

function logMultiplierCollisionRouting(bodyA: Body, bodyB: Body): void {
    physicsLogger.info('🎯 ROUTING TO MULTIPLIER COLLISION HANDLER', {
        component: 'ModularPhysicsEngine',
        function: 'handleServiceGuidedCollision',
        metadata: {
            multiplierBody: bodyA.label?.startsWith(multiplierLabel) ? bodyA.label : bodyB.label
        }
    });
}

function logPegCollisionRouting(bodyA: Body, bodyB: Body): void {
    physicsLogger.info('🎯 ROUTING TO PEG COLLISION HANDLER', {
        component: 'ModularPhysicsEngine',
        function: 'handleServiceGuidedCollision',
        metadata: {
            pegBody: !bodyA.label?.startsWith(multiplierLabel) ? bodyA.label : bodyB.label
        }
    });
}

function logNonServiceGuidedCollision(bodyA: Body, bodyB: Body): void {
    physicsLogger.info('❌ NON-SERVICE-GUIDED COLLISION - SKIPPING SERVICE LOGIC', {
        component: 'ModularPhysicsEngine',
        function: 'handleCollisionByType',
        metadata: {
            bodyALabel: bodyA.label,
            bodyBLabel: bodyB.label,
            reason: 'Neither body is service-guided ball'
        }
    });
}

/**
 * Handle ball-multiplier collisions for win detection
 */
function handleBallMultiplierCollision(
    pair: any,
    engine: Engine,
    onBallLanded?: (success: boolean) => void
): void {
    const { bodyA, bodyB } = pair;

    // Determine which is ball and which is multiplier
    let ballBody: Body, multiplierBody: Body;
    if (bodyA.label === serviceGuidedBallLabel) {
        ballBody = bodyA;
        multiplierBody = bodyB;
    } else {
        ballBody = bodyB;
        multiplierBody = bodyA;
    }

    const ballExtension = ballBody as unknown as BallBodyExtension;

    // Extract multiplier data from label (format: "multiplier-2.5-3" for multiplier 2.5 at slot 3)
    const fullLabel = multiplierBody.label || '';
    const labelParts = fullLabel.split("-");
    const multiplier = parseFloat(labelParts[1]) || 1;
    const finalSlot = parseInt(labelParts[2]) || 0;
    const betValue = ballExtension.betValue || 100;

    // Calculate expected physical position for debugging
    // Use the actual number of rows from the ball extension to calculate correct slot positions
    const rowCount = ballExtension.numberOfRows || 8;
    const expectedX = calculateSlotTargetX(ballExtension.expectedFinalSlot || 0, 600, rowCount);
    const actualX = ballBody.position.x;
    const positionDifference = Math.abs(actualX - expectedX);

    // For service-guided balls, override the finalSlot to match expected slot if close enough
    let correctedFinalSlot = finalSlot;
    if (ballExtension.isServiceGuided && ballExtension.expectedFinalSlot !== undefined) {
        // If the ball is within 200 pixels of its expected slot, count it as landing in the expected slot
        // Increased threshold for faster falling speeds and physics simulation differences
        if (positionDifference <= 200) {
            correctedFinalSlot = ballExtension.expectedFinalSlot;
            physicsLogger.info('🎯 SLOT CORRECTION APPLIED - Ball close to expected slot', {
                component: 'ModularPhysicsEngine',
                function: 'handleBallMultiplierCollision',
                metadata: {
                    ballId: ballBody.id,
                    originalSlot: finalSlot,
                    correctedSlot: correctedFinalSlot,
                    positionDifference: Math.round(positionDifference),
                    threshold: 200
                }
            });
        } else if (positionDifference > 200) {
            // Log when correction is NOT applied due to distance
            physicsLogger.warn('🎯 SLOT CORRECTION SKIPPED - Ball too far from expected slot', {
                component: 'ModularPhysicsEngine',
                function: 'handleBallMultiplierCollision',
                metadata: {
                    ballId: ballBody.id,
                    expectedSlot: ballExtension.expectedFinalSlot,
                    detectedSlot: finalSlot,
                    positionDifference: Math.round(positionDifference),
                    threshold: 200,
                    actualX: Math.round(actualX),
                    expectedX: Math.round(expectedX)
                }
            });
        }
    }

    physicsLogger.info('🎯 BALL HIT MULTIPLIER SLOT - FINAL POSITION CHECK', {
        component: 'ModularPhysicsEngine',
        function: 'handleBallMultiplierCollision',
        metadata: {
            ballId: ballBody.id,
            multiplier,
            originalSlot: finalSlot,
            finalSlot: correctedFinalSlot,
            expectedSlot: ballExtension.expectedFinalSlot,
            expectedX: Math.round(expectedX),
            actualX: Math.round(actualX),
            positionDifference: Math.round(positionDifference),
            betValue,
            ballPosition: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) },
            servicePath: ballExtension.servicePath,
            pathIndex: ballExtension.currentPathIndex,
            totalPathLength: ballExtension.servicePath?.length
        }
    });

    // Handle ball landing based on type
    if (ballExtension.isServiceGuided && ballExtension.expectedFinalSlot !== undefined) {
        // Service-guided ball: Check if landed in correct slot (use corrected slot)
        const correctSlot = ballExtension.expectedFinalSlot === correctedFinalSlot;

        if (correctSlot) {
            physicsLogger.info('🎯✅ SERVICE-GUIDED BALL LANDED IN CORRECT SLOT - SUCCESS!', {
                component: 'ModularPhysicsEngine',
                function: 'handleBallMultiplierCollision',
                metadata: {
                    ballId: ballBody.id,
                    expectedSlot: ballExtension.expectedFinalSlot,
                    actualSlot: finalSlot,
                    multiplier,
                    winAmount: betValue * multiplier,
                    servicePath: ballExtension.servicePath,
                    finalPathIndex: ballExtension.currentPathIndex,
                    status: 'SUCCESS'
                }
            });


            onBallLanded?.(true);
        } else {
            physicsLogger.error('🎯❌ SERVICE-GUIDED BALL LANDED IN WRONG SLOT - FAILURE!', {
                component: 'ModularPhysicsEngine',
                function: 'handleBallMultiplierCollision',
                metadata: {
                    ballId: ballBody.id,
                    expectedSlot: ballExtension.expectedFinalSlot,
                    actualSlot: correctedFinalSlot,
                    originalMultiplierSlot: finalSlot,
                    multiplier,
                    servicePath: ballExtension.servicePath,
                    finalPathIndex: ballExtension.currentPathIndex,
                    status: 'FAILED',
                    slotDifference: Math.abs(ballExtension.expectedFinalSlot - correctedFinalSlot)
                }
            });

            // Notify UI of failed landing
            onBallLanded?.(false);
        }
    } else {
        // Regular ball: Just log the landing
        physicsLogger.info('🎯 BALL LANDED IN SLOT', {
            component: 'ModularPhysicsEngine',
            function: 'handleBallMultiplierCollision',
            metadata: {
                ballId: ballBody.id,
                slot: finalSlot,
                multiplier,
                winAmount: betValue * multiplier,
                ballType: 'regular'
            }
        });
    }

    // Mark the ball as removed but delay actual removal to allow landing signal to show
    physicsLogger.info('🗑️ MARKING BALL FOR REMOVAL AFTER LANDING', {
        component: 'ModularPhysicsEngine',
        function: 'handleBallMultiplierCollision',
        metadata: {
            ballId: ballBody.id,
            finalSlot: correctedFinalSlot,
            originalMultiplierSlot: finalSlot,
            multiplier: multiplier,
            position: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) },
            ballType: ballExtension.isServiceGuided ? 'service-guided' : 'regular'
        }
    });

    // Mark ball as removed in the extension (prevents further collisions)
    ballExtension.isRemoved = true;

    // Delay actual removal to allow landing signal animation to complete
    setTimeout(() => {
        physicsLogger.debug('🗑️ REMOVING BALL FROM PHYSICS WORLD', {
            component: 'ModularPhysicsEngine',
            function: 'handleBallMultiplierCollision',
            metadata: { ballId: ballBody.id, delay: '500ms' }
        });
        World.remove(engine.world, ballBody);
    }, 500); // 500ms delay to allow landing signal to show

    // Note: Ball removal is handled by the collision event system
    // The ball will be removed when it comes to rest or hits the bottom

    physicsLogger.info('Multiplier collision processed', {
        component: 'ModularPhysicsEngine',
        function: 'handleBallMultiplierCollision',
        metadata: { ballId: ballBody.id, multiplier, finalSlot: correctedFinalSlot, originalMultiplierSlot: finalSlot }
    });
}

/**
 * Handle ball-peg collisions using new modular system
 */
function handleBallPegCollision(pair: any, cooldownManager: CollisionCooldownManager, engine: Engine): void {
    const { bodyA, bodyB } = pair;

    // Determine which is ball and which is peg
    let ballBody: Body, pegBody: Body;
    if (bodyA.label === serviceGuidedBallLabel) {
        ballBody = bodyA;
        pegBody = bodyB;
    } else {
        ballBody = bodyB;
        pegBody = bodyA;
    }

    const ballExtension = ballBody as unknown as BallBodyExtension;

    // For balls that have completed their path, skip physics entirely to prevent trajectory interference
    if (ballExtension.currentPathIndex >= ballExtension.servicePath?.length) {
        physicsLogger.debug('Skipping peg collision physics - ball has completed path', {
            component: 'ModularPhysicsEngine',
            function: 'handleBallPegCollision',
            metadata: {
                ballId: ballBody.id,
                currentPathIndex: ballExtension.currentPathIndex,
                servicePathLength: ballExtension.servicePath?.length,
                expectedFinalSlot: ballExtension.expectedFinalSlot,
                reason: 'Preventing trajectory interference'
            }
        });
        return; // Skip physics entirely for completed path balls
    }

    // Check for collision using new detection system
    const collisionResult = detectCirclePegCollision(
        { x: ballBody.position.x, y: ballBody.position.y },
        ballBody.circleRadius || 10,
        { x: pegBody.position.x, y: pegBody.position.y },
        pegBody.circleRadius || 5
    );

    if (collisionResult) {
        const ballExtension = ballBody as unknown as BallBodyExtension;

        physicsLogger.info('Ball-peg collision detected - BEFORE correction', {
            component: 'ModularPhysicsEngine',
            function: 'handleBallPegCollision',
            metadata: {
                ballId: ballBody.id,
                pegId: pegBody.id,
                penetration: collisionResult.penetration,
                ballPosition: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) },
                ballVelocity: { x: ballBody.velocity.x.toFixed(3), y: ballBody.velocity.y.toFixed(3) },
                isServiceGuided: ballExtension.isServiceGuided,
                currentPathIndex: ballExtension.currentPathIndex,
                servicePath: ballExtension.servicePath,
                expectedFinalSlot: ballExtension.expectedFinalSlot
            }
        });

        // Use service-guided collision handling for deterministic path following
        handleServiceGuidedPinCollision(ballBody, ballExtension, pegBody, engine, cooldownManager);

        physicsLogger.info('Ball-peg collision handled - AFTER correction', {
            component: 'ModularPhysicsEngine',
            function: 'handleBallPegCollision',
            metadata: {
                ballId: ballBody.id,
                ballPosition: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) },
                ballVelocity: { x: ballBody.velocity.x.toFixed(3), y: ballBody.velocity.y.toFixed(3) },
                updatedPathIndex: ballExtension.currentPathIndex,
                servicePath: ballExtension.servicePath,
                expectedFinalSlot: ballExtension.expectedFinalSlot
            }
        });
    } else {
        physicsLogger.debug('No collision detected between ball and peg', {
            component: 'ModularPhysicsEngine',
            function: 'handleBallPegCollision',
            metadata: {
                ballId: ballBody.id,
                pegId: pegBody.id,
                ballPos: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) },
                pegPos: { x: Math.round(pegBody.position.x), y: Math.round(pegBody.position.y) }
            }
        });
    }
}

/**
 * Add bodies to world using new body factory
 */
export function addBodiesToWorld(engine: Engine, options: BodyCreationOptions): void {
    physicsLogger.info('Adding bodies to world using modular factory', {
        component: 'ModularPhysicsEngine',
        function: 'addBodiesToWorld',
        metadata: options
    });

    const bodies = createPhysicsBodies(options);

    // Add all bodies to world
    World.add(engine.world, [
        ...bodies.pins,
        ...bodies.multipliersBodies,
        ...bodies.walls
    ]);

    physicsLogger.info('Bodies added to world successfully', {
        component: 'ModularPhysicsEngine',
        function: 'addBodiesToWorld',
        metadata: {
            pinsCount: bodies.pins.length,
            multipliersCount: bodies.multipliersBodies.length,
            wallsCount: bodies.walls.length,
            totalBodies: bodies.pins.length + bodies.multipliersBodies.length + bodies.walls.length
        }
    });
}

/**
 * Start physics runner
 */
export function startPhysicsRunner(runner: Runner, engine: Engine): void {
    physicsLogger.info('Starting physics runner', {
        component: 'ModularPhysicsEngine',
        function: 'startPhysicsRunner',
        metadata: { worldId: engine.world.id }
    });

    Runner.run(runner, engine);

    physicsLogger.info('Physics runner started successfully', {
        component: 'ModularPhysicsEngine',
        function: 'startPhysicsRunner'
    });
}

/**
 * Update collision detection (called regularly)
 */
export function updateCollisionDetection(cooldownManager: CollisionCooldownManager): void {
    // Update cooldown system
    cooldownManager.update();

    // Log cooldown stats periodically
    const stats = cooldownManager.getStats();
    physicsLogger.debug('Collision cooldown system updated', {
        component: 'ModularPhysicsEngine',
        function: 'updateCollisionDetection',
        metadata: stats
    });
}

/**
 * Clean up physics engine
 */
export function cleanupPhysicsEngine(engine: Engine | null, runner: Runner | null): void {
    physicsLogger.info('Cleaning up physics engine', {
        component: 'ModularPhysicsEngine',
        function: 'cleanupPhysicsEngine'
    });

    if (runner) {
        Runner.stop(runner);
    }

    if (engine) {
        World.clear(engine.world, false);
        Engine.clear(engine);
    }

    physicsLogger.info('Physics engine cleanup completed', {
        component: 'ModularPhysicsEngine',
        function: 'cleanupPhysicsEngine'
    });
}

/**
 * Apply pending deterministic guidance for natural physics behavior
 * This allows natural collision physics to resolve before applying guidance
 */
function applyPendingGuidance(engine: Engine): void {
    const worldBodies = engine.world.bodies;

    for (const body of worldBodies) {
        const ballExtension = body as unknown as BallBodyExtension;

        if (shouldApplyGuidance(ballExtension)) {
            applyGuidanceToBall(body, ballExtension, engine);
        }
    }
}

/**
 * Check if guidance should be applied to a ball
 */
function shouldApplyGuidance(ballExtension: BallBodyExtension): boolean {
    return ballExtension.pendingGuidance && !ballExtension.pendingGuidance.appliedAtFrame;
}

/**
 * Apply guidance to a specific ball
 */
function applyGuidanceToBall(body: Body, ballExtension: BallBodyExtension, engine: Engine): void {
    const guidance = ballExtension.pendingGuidance;

    logGuidanceApplication(body, guidance);

    if (shouldDelayGuidance(ballExtension)) {
        return;
    }

    clearBounceFlag(ballExtension);
    const blendedVelocity = calculateBlendedVelocity(body, ballExtension, guidance);
    const finalVelocity = applyVelocityPreservation(blendedVelocity, ballExtension, guidance);
    applyFinalVelocity(body, finalVelocity);
    markGuidanceApplied(ballExtension, engine);
}

/**
 * Check if guidance should be delayed due to bounce
 */
function shouldDelayGuidance(ballExtension: BallBodyExtension): boolean {
    const timeSinceBounce = ballExtension.bounceTimestamp ?
        Date.now() - ballExtension.bounceTimestamp : Infinity;
    const bounceDelayMs = 300;

    if (ballExtension.justBounced && timeSinceBounce < bounceDelayMs) {
        logGuidanceDelay(ballExtension, timeSinceBounce, bounceDelayMs);
        return true;
    }

    return false;
}

/**
 * Clear bounce flag after delay
 */
function clearBounceFlag(ballExtension: BallBodyExtension): void {
    const timeSinceBounce = ballExtension.bounceTimestamp ?
        Date.now() - ballExtension.bounceTimestamp : Infinity;
    const bounceDelayMs = 300;

    if (ballExtension.justBounced && timeSinceBounce >= bounceDelayMs) {
        ballExtension.justBounced = false;
        ballExtension.bounceTimestamp = undefined;
    }
}

/**
 * Calculate blended velocity based on guidance type
 */
function calculateBlendedVelocity(body: Body, ballExtension: BallBodyExtension, guidance: any): { x: number; y: number } {
    if (ballExtension.calculationData) {
        return calculatePreCalculatedVelocity(body, ballExtension, guidance);
    } else {
        return calculateStandardVelocity(body, guidance);
    }
}

/**
 * Calculate velocity using pre-calculated trajectory data
 */
function calculatePreCalculatedVelocity(body: Body, ballExtension: BallBodyExtension, guidance: any): { x: number; y: number } {
    const calcData = ballExtension.calculationData;
    const currentPathIndex = ballExtension.currentPathIndex || 0;
    const trajectoryLength = calcData.trajectory?.positions?.length || 0;
    const expectedTrajectoryIndex = Math.min(currentPathIndex * 10, trajectoryLength - 1);

    const expectedPosition = calcData.trajectory?.positions?.[expectedTrajectoryIndex];
    const expectedVelocity = calcData.trajectory?.velocities?.[expectedTrajectoryIndex];

    if (expectedPosition && expectedVelocity) {
        return calculateTrajectoryBasedVelocity(body, calcData, guidance, expectedPosition, expectedVelocity, currentPathIndex, expectedTrajectoryIndex);
    } else {
        return calculateFallbackVelocity(body, guidance);
    }
}

/**
 * Calculate velocity based on trajectory data
 */
function calculateTrajectoryBasedVelocity(
    body: Body,
    calcData: any,
    guidance: any,
    expectedPosition: any,
    expectedVelocity: any,
    currentPathIndex: number,
    expectedTrajectoryIndex: number
): { x: number; y: number } {
    const positionErrorX = expectedPosition.x - body.position.x;
    const velocityErrorX = expectedVelocity.x - body.velocity.x;

    // Use physics-based correction with pre-calculated stability factors
    const positionCorrection = positionErrorX * 0.005;
    const velocityCorrection = velocityErrorX * 0.01;
    const pathGuidance = guidance.direction * guidance.naturalNudgeStrength * 0.05;

    const naturalWeight = 0.95;
    const guidanceWeight = 0.05;
    const blendedX = body.velocity.x + positionCorrection + velocityCorrection + pathGuidance;
    const blendedY = body.velocity.y;

    const guidanceData = {
        body,
        calcData,
        currentPathIndex,
        expectedTrajectoryIndex,
        positionErrorX,
        velocityErrorX,
        naturalWeight,
        guidanceWeight,
        positionCorrection,
        velocityCorrection,
        pathGuidance,
        blendedX,
        blendedY
    };
    logPreCalculatedGuidance(guidanceData);

    return { x: blendedX, y: blendedY };
}

/**
 * Calculate fallback velocity when trajectory data is unavailable
 */
function calculateFallbackVelocity(body: Body, guidance: any): { x: number; y: number } {
    const naturalWeight = 0.9;
    const guidanceWeight = 0.1;
    const blendedX = (body.velocity.x * naturalWeight) + (guidance.direction * guidance.naturalNudgeStrength * guidanceWeight);
    const blendedY = body.velocity.y;

    logFallbackGuidance(body, naturalWeight, guidanceWeight, blendedX, blendedY);

    return { x: blendedX, y: blendedY };
}

/**
 * Calculate standard velocity for balls without pre-calculation
 */
function calculateStandardVelocity(body: Body, guidance: any): { x: number; y: number } {
    const desiredCorrection = guidance.direction * guidance.naturalNudgeStrength;
    const naturalWeight = 0.9;
    const guidanceWeight = 0.1;
    const blendedX = (body.velocity.x * naturalWeight) + (desiredCorrection * guidanceWeight);
    const blendedY = body.velocity.y;

    logStandardGuidance(body, naturalWeight, guidanceWeight, blendedX, blendedY);

    return { x: blendedX, y: blendedY };
}

/**
 * Apply velocity preservation for realistic falling speed
 */
function applyVelocityPreservation(blendedVelocity: { x: number; y: number }, ballExtension: BallBodyExtension, guidance: any): { x: number; y: number } {
    const preservedYVelocity = calculatePreservedYVelocity(blendedVelocity.y, ballExtension, guidance);
    const maxHorizontalVelocity = calculateMaxHorizontalVelocity(guidance.rowCount);
    const clampedX = Math.max(-maxHorizontalVelocity, Math.min(maxHorizontalVelocity, blendedVelocity.x));
    const clampedY = Math.max(-15, Math.min(40, preservedYVelocity));

    return { x: clampedX, y: clampedY };
}

/**
 * Calculate preserved Y velocity
 */
function calculatePreservedYVelocity(blendedY: number, ballExtension: BallBodyExtension, guidance: any): number {
    if (ballExtension.calculationData) {
        const terminalVelocity = Math.sqrt(
            2 * ballExtension.calculationData.physicsFactors.ballMass * ballExtension.calculationData.physicsFactors.gravity /
            ballExtension.calculationData.physicsFactors.airResistanceCoefficient
        );
        const preservedYVelocity = Math.min(Math.abs(blendedY), terminalVelocity * 1.0);
        return Math.max(preservedYVelocity, 1.5);
    } else {
        const yVelocityPreservation = PHYSICS_SCALING_FORMULAS.yVelocityPreservation(guidance.rowRatio, guidance.rowCount);
        const preservedYVelocity = Math.abs(blendedY) * yVelocityPreservation;
        return Math.max(preservedYVelocity, 1.5);
    }
}

/**
 * Calculate maximum horizontal velocity based on row count
 */
function calculateMaxHorizontalVelocity(rowCount: number): number {
    if (rowCount > 14) { return 15; }
    if (rowCount > 12) { return 18; }
    return 25;
}

/**
 * Apply final velocity to body
 */
function applyFinalVelocity(body: Body, finalVelocity: { x: number; y: number }): void {
    Body.setVelocity(body, finalVelocity);
}

/**
 * Mark guidance as applied and clear pending guidance
 */
function markGuidanceApplied(ballExtension: BallBodyExtension, engine: Engine): void {
    ballExtension.pendingGuidance.appliedAtFrame = engine.timing.timestamp;
    ballExtension.pendingGuidance = undefined;
}

// Logging functions
function logGuidanceApplication(body: Body, guidance: any): void {
    physicsLogger.info('🎯 APPLYING DELAYED NATURAL GUIDANCE - AFTER NATURAL PHYSICS', {
        component: 'ModularPhysicsEngine',
        function: 'applyGuidanceToBall',
        metadata: {
            ballId: body.id,
            pinRow: guidance.pinRow,
            direction: guidance.direction > 0 ? 'RIGHT' : 'LEFT',
            naturalNudgeStrength: guidance.naturalNudgeStrength.toFixed(3),
            ballVelocityBefore: { x: body.velocity.x.toFixed(3), y: body.velocity.y.toFixed(3) }
        }
    });
}

function logGuidanceDelay(ballExtension: BallBodyExtension, timeSinceBounce: number, bounceDelayMs: number): void {
    physicsLogger.debug('⏳ DELAYING GUIDANCE - Ball just bounced, letting bounce settle', {
        component: 'ModularPhysicsEngine',
        function: 'shouldDelayGuidance',
        metadata: {
            ballId: (ballExtension as any).id,
            timeSinceBounce: Math.round(timeSinceBounce),
            bounceDelay: bounceDelayMs,
            remainingDelay: Math.round(bounceDelayMs - timeSinceBounce)
        }
    });
}

function logPreCalculatedGuidance(guidanceData: any): void {
    const metadata = {
        ballId: guidanceData.body.id,
        calculationId: guidanceData.calcData.id,
        pathIndex: guidanceData.currentPathIndex,
        trajectoryIndex: guidanceData.expectedTrajectoryIndex,
        positionError: guidanceData.positionErrorX.toFixed(3),
        velocityError: guidanceData.velocityErrorX.toFixed(3),
        naturalWeight: guidanceData.naturalWeight,
        guidanceWeight: guidanceData.guidanceWeight,
        corrections: {
            position: guidanceData.positionCorrection.toFixed(3),
            velocity: guidanceData.velocityCorrection.toFixed(3),
            path: guidanceData.pathGuidance.toFixed(3)
        },
        finalVelocity: { x: guidanceData.blendedX.toFixed(3), y: guidanceData.blendedY.toFixed(3) }
    };

    physicsLogger.debug('🎯 PRE-CALCULATED TRAJECTORY GUIDANCE APPLIED', {
        component: 'ModularPhysicsEngine',
        function: 'calculateTrajectoryBasedVelocity',
        metadata
    });
}

function logFallbackGuidance(body: Body, naturalWeight: number, guidanceWeight: number, blendedX: number, blendedY: number): void {
    physicsLogger.debug('🎯 FALLBACK GUIDANCE APPLIED', {
        component: 'ModularPhysicsEngine',
        function: 'calculateFallbackVelocity',
        metadata: {
            ballId: body.id,
            naturalWeight,
            guidanceWeight,
            finalVelocity: { x: blendedX.toFixed(3), y: blendedY.toFixed(3) }
        }
    });
}

function logStandardGuidance(body: Body, naturalWeight: number, guidanceWeight: number, blendedX: number, blendedY: number): void {
    physicsLogger.debug('🎯 STANDARD GUIDANCE APPLIED', {
        component: 'ModularPhysicsEngine',
        function: 'calculateStandardVelocity',
        metadata: {
            ballId: body.id,
            naturalWeight,
            guidanceWeight,
            finalVelocity: { x: blendedX.toFixed(3), y: blendedY.toFixed(3) }
        }
    });
}

/**
 * Calculate the target X position for a given slot index
 */
function calculateSlotTargetX(slotIndex: number, canvasWidth = 600, numberOfRows = 8): number {
    // Use same positioning logic as physics world creation in body-factory.ts
    const pegGap = 40; // Same peg gap used in body factory
    const lastRowColumns = numberOfRows; // Last row has numberOfRows pegs
    const lastRowWidth = (lastRowColumns - 1) * pegGap;
    const lastRowStartX = (canvasWidth - lastRowWidth) / 2;

    // Position slots between pegs: center between peg positions (same as body factory)
    return lastRowStartX + (slotIndex - 0.5) * pegGap;
}
