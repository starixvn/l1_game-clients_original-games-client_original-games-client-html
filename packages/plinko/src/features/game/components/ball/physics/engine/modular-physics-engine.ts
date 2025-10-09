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
        const pairs = event.pairs;
        physicsLogger.info('Collision event triggered', {
            component: 'ModularPhysicsEngine',
            function: 'collisionStart',
            metadata: { pairCount: pairs.length, worldId: engine.world.id }
        });

        for (const pair of pairs) {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            physicsLogger.info('🔍 PROCESSING COLLISION PAIR - DETAILED', {
                component: 'ModularPhysicsEngine',
                function: 'collisionStart',
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

            // Check if this is a service-guided ball that has completed its path
            // Include both "service-guided-ball" and "pre-calculated-ball" labels
            const ballBody = (bodyA.label === 'service-guided-ball' || bodyA.label === 'pre-calculated-ball') ? bodyA :
                            ((bodyB.label === 'service-guided-ball' || bodyB.label === 'pre-calculated-ball') ? bodyB : null);
            const ballExtension = ballBody ? ballBody as unknown as BallBodyExtension : null;
            const hasCompletedPath = ballExtension && ballExtension.currentPathIndex >= ballExtension.servicePath?.length;

            // Skip ALL collisions for service-guided balls that have completed their path,
            // except for multiplier slots (to detect the final landing)
            const isMultiplierCollision = bodyA.label?.startsWith('multiplier-') || bodyB.label?.startsWith('multiplier-');

            if (hasCompletedPath && !isMultiplierCollision) {
                physicsLogger.debug('Skipping collision - service-guided ball has completed path', {
                    component: 'ModularPhysicsEngine',
                    function: 'collisionStart',
                    metadata: {
                        ballId: ballBody?.id,
                        currentPathIndex: ballExtension?.currentPathIndex,
                        servicePathLength: ballExtension?.servicePath?.length,
                        expectedFinalSlot: ballExtension?.expectedFinalSlot,
                        collisionType: 'skipped',
                        reason: 'Path completed, preventing trajectory interference'
                    }
                });
                return; // Skip this collision entirely
            }

            // Skip static body collisions unless it's a service-guided ball colliding with pins or multipliers
            const isServiceGuidedBallLabel = (label: string) => label === 'service-guided-ball' || label === 'pre-calculated-ball';
            const isServiceGuidedBallCollision = (isServiceGuidedBallLabel(bodyA.label) || isServiceGuidedBallLabel(bodyB.label)) &&
                (bodyA.label?.startsWith('pin-') || bodyB.label?.startsWith('pin-'));

            if ((bodyA.isStatic || bodyB.isStatic) && !isServiceGuidedBallCollision && !isMultiplierCollision) {
                physicsLogger.debug('Skipping collision with static body (not service-guided)', {
                    component: 'ModularPhysicsEngine',
                    function: 'collisionStart',
                    metadata: {
                        staticBody: bodyA.isStatic ? 'bodyA' : 'bodyB',
                        bodyALabel: bodyA.label,
                        bodyBLabel: bodyB.label,
                        isServiceGuidedCollision: isServiceGuidedBallCollision
                    }
                });
                continue;
            }

            // Check if collision is allowed by cooldown system
            if (!cooldownManager.canCollide(bodyA.id, bodyB.id, 50)) { // 50ms cooldown
                physicsLogger.debug('Collision blocked by cooldown system', {
                    component: 'ModularPhysicsEngine',
                    function: 'collisionStart',
                    metadata: { bodyAId: bodyA.id, bodyBId: bodyB.id }
                });
                continue;
            }

            // Determine collision type
            const bodyAExtension = bodyA as unknown as BallBodyExtension;
            const bodyBExtension = bodyB as unknown as BallBodyExtension;

            physicsLogger.info('⚡ COLLISION PARTICIPANTS IDENTIFIED', {
                component: 'ModularPhysicsEngine',
                function: 'collisionStart',
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

            // Handle ball-peg collisions using new system
            if (isServiceGuidedBallLabel(bodyA.label) || isServiceGuidedBallLabel(bodyB.label)) {
                physicsLogger.info('🎯 SERVICE-GUIDED BALL COLLISION DETECTED', {
                    component: 'ModularPhysicsEngine',
                    function: 'collisionStart',
                    metadata: {
                        ballBody: isServiceGuidedBallLabel(bodyA.label) ? 'bodyA' : 'bodyB',
                        otherBody: isServiceGuidedBallLabel(bodyA.label) ? bodyB.label : bodyA.label,
                        ballLabel: isServiceGuidedBallLabel(bodyA.label) ? bodyA.label : bodyB.label,
                        otherLabel: isServiceGuidedBallLabel(bodyA.label) ? bodyB.label : bodyA.label
                    }
                });

                if (isMultiplierCollision) {
                    physicsLogger.info('🎯 ROUTING TO MULTIPLIER COLLISION HANDLER', {
                        component: 'ModularPhysicsEngine',
                        function: 'collisionStart',
                        metadata: {
                            multiplierBody: bodyA.label?.startsWith('multiplier-') ? bodyA.label : bodyB.label,
                            hasCompletedPath,
                            ballId: ballBody?.id,
                            expectedFinalSlot: ballExtension?.expectedFinalSlot
                        }
                    });
                    handleBallMultiplierCollision(pair, engine, onBallLanded);
                } else {
                    physicsLogger.info('🎯 ROUTING TO PEG COLLISION HANDLER', {
                        component: 'ModularPhysicsEngine',
                        function: 'collisionStart',
                        metadata: {
                            pegBody: !bodyA.label?.startsWith('multiplier-') ? bodyA.label : bodyB.label
                        }
                    });
                    handleBallPegCollision(pair, cooldownManager, engine);
                }
            } else {
                physicsLogger.info('❌ NON-SERVICE-GUIDED COLLISION - SKIPPING SERVICE LOGIC', {
                    component: 'ModularPhysicsEngine',
                    function: 'collisionStart',
                    metadata: {
                        bodyALabel: bodyA.label,
                        bodyBLabel: bodyB.label,
                        reason: 'Neither body is service-guided ball'
                    }
                });
            }
        }
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
    if (bodyA.label === 'service-guided-ball') {
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
    if (bodyA.label === 'service-guided-ball') {
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

        // Check if this body has pending guidance to apply
        if (ballExtension.pendingGuidance && !ballExtension.pendingGuidance.appliedAtFrame) {
            const guidance = ballExtension.pendingGuidance;

            physicsLogger.info('🎯 APPLYING DELAYED NATURAL GUIDANCE - AFTER NATURAL PHYSICS', {
                component: 'ModularPhysicsEngine',
                function: 'applyPendingGuidance',
                metadata: {
                    ballId: body.id,
                    pinRow: guidance.pinRow,
                    direction: guidance.direction > 0 ? 'RIGHT' : 'LEFT',
                    naturalNudgeStrength: guidance.naturalNudgeStrength.toFixed(3),
                    ballVelocityBefore: { x: body.velocity.x.toFixed(3), y: body.velocity.y.toFixed(3) }
                }
            });

            // Check if ball just bounced - delay guidance to let bounce take effect
            const timeSinceBounce = ballExtension.bounceTimestamp ?
                Date.now() - ballExtension.bounceTimestamp : Infinity;
            const bounceDelayMs = 300; // 300ms delay after bounce before applying guidance

            if (ballExtension.justBounced && timeSinceBounce < bounceDelayMs) {
                physicsLogger.debug('⏳ DELAYING GUIDANCE - Ball just bounced, letting bounce settle', {
                    component: 'ModularPhysicsEngine',
                    function: 'applyPendingGuidance',
                    metadata: {
                        ballId: body.id,
                        timeSinceBounce: Math.round(timeSinceBounce),
                        bounceDelay: bounceDelayMs,
                        remainingDelay: Math.round(bounceDelayMs - timeSinceBounce)
                    }
                });
                return; // Skip guidance application this frame
            }

            // Clear bounce flag after delay
            if (ballExtension.justBounced && timeSinceBounce >= bounceDelayMs) {
                ballExtension.justBounced = false;
                ballExtension.bounceTimestamp = undefined;
            }

            // Enhanced: Use pre-calculated trajectory data for ultra-realistic Plinko behavior
            let blendedX: number;
            let blendedY: number;

            if (ballExtension.calculationData) {
                // 🚀 PRE-CALCULATED TRAJECTORY GUIDANCE - Most realistic approach
                const calcData = ballExtension.calculationData;
                const currentPathIndex = ballExtension.currentPathIndex || 0;

                // Find the expected trajectory point for current path step
                const trajectoryLength = calcData.trajectory?.positions?.length || 0;
                const expectedTrajectoryIndex = Math.min(
                    currentPathIndex * 10, // Approximate trajectory point for this path step
                    trajectoryLength - 1
                );

                const expectedPosition = calcData.trajectory?.positions?.[expectedTrajectoryIndex];
                const expectedVelocity = calcData.trajectory?.velocities?.[expectedTrajectoryIndex];

                if (expectedPosition && expectedVelocity) {
                    // Calculate position error and velocity correction
                    const positionErrorX = expectedPosition.x - body.position.x;
                    const velocityErrorX = expectedVelocity.x - body.velocity.x;

                    // Use physics-based correction with pre-calculated stability factors
                    const nudgeStrength = calcData.physicsFactors?.nudgeStrength || 8.0;
                    const controlResponsiveness = calcData.stabilityMetrics?.controlResponsiveness || 1.0;
                    const correctionStrength = nudgeStrength * controlResponsiveness;
                    const positionCorrection = positionErrorX * 0.005; // Ultra-gentle position correction
                    const velocityCorrection = velocityErrorX * 0.01; // Minimal velocity correction

                    // Apply minimal path direction guidance
                    const pathGuidance = guidance.direction * guidance.naturalNudgeStrength * 0.05;

                    // Blend all corrections - arcade natural physics with minimal guidance
                    const naturalWeight = 0.95; // Ultra-natural physics (95%)
                    const guidanceWeight = 0.05; // Minimal guidance only (5%)
                    blendedX = body.velocity.x + positionCorrection + velocityCorrection + pathGuidance;
                    blendedY = body.velocity.y; // Preserve natural vertical physics

                    physicsLogger.debug('🎯 PRE-CALCULATED TRAJECTORY GUIDANCE APPLIED', {
                        component: 'ModularPhysicsEngine',
                        function: 'applyPendingGuidance',
                        metadata: {
                            ballId: body.id,
                            calculationId: calcData.id,
                            pathIndex: currentPathIndex,
                            trajectoryIndex: expectedTrajectoryIndex,
                            positionError: positionErrorX.toFixed(3),
                            velocityError: velocityErrorX.toFixed(3),
                            naturalWeight,
                            guidanceWeight,
                            corrections: {
                                position: positionCorrection.toFixed(3),
                                velocity: velocityCorrection.toFixed(3),
                                path: pathGuidance.toFixed(3)
                            },
                            finalVelocity: { x: blendedX.toFixed(3), y: blendedY.toFixed(3) }
                        }
                    });
                } else {
                    // Fallback to standard guidance if trajectory data unavailable
                    const naturalWeight = 0.9; // Even more natural for fallback
                    const guidanceWeight = 0.1; // Very gentle guidance
                    blendedX = (body.velocity.x * naturalWeight) + (guidance.direction * guidance.naturalNudgeStrength * guidanceWeight);
                    blendedY = body.velocity.y;

                    physicsLogger.debug('🎯 FALLBACK GUIDANCE APPLIED', {
                        component: 'ModularPhysicsEngine',
                        function: 'applyPendingGuidance',
                        metadata: {
                            ballId: body.id,
                            naturalWeight,
                            guidanceWeight,
                            finalVelocity: { x: blendedX.toFixed(3), y: blendedY.toFixed(3) }
                        }
                    });
                }
            } else {
                // Standard guidance for balls without pre-calculation
                const currentX = body.velocity.x;
                const currentY = body.velocity.y;

                // Calculate desired correction
                const desiredCorrection = guidance.direction * guidance.naturalNudgeStrength;

                // Blend natural velocity with very gentle guidance (90% natural, 10% guided)
                const naturalWeight = 0.9;
                const guidanceWeight = 0.1;

                blendedX = (currentX * naturalWeight) + (desiredCorrection * guidanceWeight);
                blendedY = currentY; // Don't interfere with vertical velocity

                physicsLogger.debug('🎯 STANDARD GUIDANCE APPLIED', {
                    component: 'ModularPhysicsEngine',
                    function: 'applyPendingGuidance',
                    metadata: {
                        ballId: body.id,
                        naturalWeight,
                        guidanceWeight,
                        finalVelocity: { x: blendedX.toFixed(3), y: blendedY.toFixed(3) }
                    }
                });
            }

            // Apply FAST velocity preservation for realistic Plinko falling speed
            let preservedYVelocity: number;
            if (ballExtension.calculationData) {
                // Use pre-calculated physics for faster, more natural falling
                const terminalVelocity = Math.sqrt(
                    2 * ballExtension.calculationData.physicsFactors.ballMass * ballExtension.calculationData.physicsFactors.gravity /
                    ballExtension.calculationData.physicsFactors.airResistanceCoefficient
                );
                // Allow maximum falling speeds (100% of terminal velocity for extreme descent)
                preservedYVelocity = Math.min(Math.abs(blendedY), terminalVelocity * 1.0);
                // Ensure minimum falling speed for fast Plinko experience
                preservedYVelocity = Math.max(preservedYVelocity, 1.5);
            } else {
                // Fallback to scaling formulas but with faster preservation
                const yVelocityPreservation = PHYSICS_SCALING_FORMULAS.yVelocityPreservation(guidance.rowRatio, guidance.rowCount);
                preservedYVelocity = Math.abs(blendedY) * yVelocityPreservation;
                // Ensure minimum speed even in fallback
                preservedYVelocity = Math.max(preservedYVelocity, 1.5);
            }

            // Allow faster falling speeds for realistic Plinko experience
            const maxHorizontalVelocity = guidance.rowCount > 14 ? 15 : guidance.rowCount > 12 ? 18 : 25;
            const clampedX = Math.max(-maxHorizontalVelocity, Math.min(maxHorizontalVelocity, blendedX));
            // Allow extremely fast downward velocities for high-speed Plinko experience
            const clampedY = Math.max(-15, Math.min(40, preservedYVelocity));

            // Apply the blended velocity
            Body.setVelocity(body, {
                x: clampedX,
                y: clampedY
            });

            // Mark guidance as applied
            ballExtension.pendingGuidance.appliedAtFrame = engine.timing.timestamp;

            // Clear the pending guidance
            ballExtension.pendingGuidance = undefined;
        }
    }
}

/**
 * Calculate the target X position for a given slot index
 */
function calculateSlotTargetX(slotIndex: number, canvasWidth: number = 600, numberOfRows: number = 8): number {
    // Use same positioning logic as physics world creation in body-factory.ts
    const pegGap = 40; // Same peg gap used in body factory
    const lastRowColumns = numberOfRows; // Last row has numberOfRows pegs
    const lastRowWidth = (lastRowColumns - 1) * pegGap;
    const lastRowStartX = (canvasWidth - lastRowWidth) / 2;

    // Position slots between pegs: center between peg positions (same as body factory)
    return lastRowStartX + (slotIndex - 0.5) * pegGap;
}
