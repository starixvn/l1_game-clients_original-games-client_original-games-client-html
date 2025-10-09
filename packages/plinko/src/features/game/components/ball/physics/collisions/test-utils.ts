/**
 * Collision Test Utilities
 * Provides testing utilities for collision system
 * Bridges old test interface with new modular collision system
 */

import { Body, Engine } from 'matter-js';
import { BallBodyExtension } from '../../../../../../types/physics';
import { physicsLogger } from '../performance/physics-logger';
import { CollisionCooldownManager } from './collision-cooldown';
import { PHYSICS_SCALING_FORMULAS } from '../scaling/row-based-scaling';

/**
 * Test utility to manually handle service-guided pin collisions
 * Provides backward compatibility for existing tests
 */
export function handleServiceGuidedPinCollision(
    ballBody: Body,
    ballExtension: BallBodyExtension,
    pegBody: Body,
    engine: Engine,
    cooldownManager?: CollisionCooldownManager
): void {
    physicsLogger.info('🎯 SERVICE-GUIDED PIN COLLISION - STARTING', {
        component: 'CollisionTestUtils',
        function: 'handleServiceGuidedPinCollision',
        metadata: {
            ballId: ballBody.id,
            pegId: pegBody.id,
            ballPosition: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) },
            pegPosition: { x: Math.round(pegBody.position.x), y: Math.round(pegBody.position.y) },
            currentPathIndex: ballExtension.currentPathIndex,
            servicePath: ballExtension.servicePath,
            expectedFinalSlot: ballExtension.expectedFinalSlot,
            ballVelocityBefore: { x: ballBody.velocity.x.toFixed(3), y: ballBody.velocity.y.toFixed(3) }
        }
    });

    // Create cooldown manager if not provided
    const manager = cooldownManager || new CollisionCooldownManager();

    // Service-guided logic: Apply deterministic path correction
    // Check if this is a service-guided ball that needs deterministic nudges
    const isServiceGuided = ballExtension.servicePath && ballExtension.currentPathIndex !== undefined;

    // For service-guided balls, bypass cooldown to ensure deterministic path following
    if (!isServiceGuided) {
        // Check if collision is allowed for non-guided balls
        if (!manager.canCollide(ballBody.id, pegBody.id, 50)) { // 50ms cooldown
            physicsLogger.debug('Collision blocked by cooldown (test utility)', {
                component: 'CollisionTestUtils',
                function: 'handleServiceGuidedPinCollision',
                metadata: { ballId: ballBody.id, pegId: pegBody.id }
            });
            return;
        }
    }

    // Apply deterministic path correction for service-guided balls
    if (isServiceGuided) {
        // Skip collision nudges for balls already on final trajectory to prevent disruption
        if (ballExtension.onFinalTrajectory) {
            physicsLogger.debug('Skipping nudge for ball on final trajectory', {
                component: 'CollisionTestUtils',
                function: 'handleServiceGuidedPinCollision',
                metadata: {
                    ballId: ballBody.id,
                    pegId: pegBody.id,
                    expectedFinalSlot: ballExtension.expectedFinalSlot
                }
            });
            // Still register cooldown for physics stability
            manager.registerCollision(ballBody.id, pegBody.id, 50);
            return;
        }

        // Extract pin row from label (format: "pin-ROW-COLUMN")
        const pinLabelMatch = pegBody.label?.match(/pin-(\d+)-(\d+)/);
        if (pinLabelMatch) {
            const pinRow = parseInt(pinLabelMatch[1]);

            // Only apply nudge if this is the next row in sequence
            // currentPathIndex corresponds to the row we should be processing
            if (pinRow === ballExtension.currentPathIndex + 1) {
                const currentStep = ballExtension.servicePath[ballExtension.currentPathIndex];

                if (currentStep !== undefined) {
                    // Enhanced: Use pre-calculated physics factors for realistic Plinko behavior
                    let naturalNudgeStrength: number;

                    // Define rowRatio and rowCount for guidance
                    const rowRatio = (ballExtension.numberOfRows || 8) / 8;
                    const rowCount = ballExtension.numberOfRows || 8;

                    if (ballExtension.calculationData) {
                        // 🚀 Use PRE-CALCULATED nudge strength for authentic physics
                        naturalNudgeStrength = ballExtension.calculationData.physicsFactors.nudgeStrength * 0.8; // Stronger guidance for deterministic path

                        physicsLogger.debug('🎯 USING PRE-CALCULATED PHYSICS FOR COLLISION', {
                            component: 'CollisionTestUtils',
                            function: 'handleServiceGuidedPinCollision',
                            metadata: {
                                ballId: ballBody.id,
                                calculationId: ballExtension.calculationData.id,
                                preCalculatedNudgeStrength: ballExtension.calculationData.physicsFactors.nudgeStrength.toFixed(3),
                                adjustedNudgeStrength: naturalNudgeStrength.toFixed(3),
                                physicsStability: ballExtension.calculationData.stabilityMetrics.controlResponsiveness.toFixed(3)
                            }
                        });
                    } else {
                        // Fallback to generic scaling formulas
                        const baseNudgeStrength = PHYSICS_SCALING_FORMULAS.nudgeStrength(rowRatio, rowCount);
                        naturalNudgeStrength = baseNudgeStrength * 0.7; // Stronger guidance for deterministic path
                    }

                    const direction = currentStep === 1 ? 1 : -1; // 1 = right, 0 = left

                    // Store guidance information for delayed application
                    ballExtension.pendingGuidance = {
                        direction,
                        naturalNudgeStrength,
                        rowRatio,
                        rowCount,
                        pinRow,
                        appliedAtFrame: 0 // Will be set when applied
                    };

                    // Deterministic Plinko bounce - ensure ball follows service path exactly
                    const currentVelocity = { x: ballBody.velocity.x, y: ballBody.velocity.y };

                    // Calculate deterministic direction based on service path
                    // Override current velocity with strong directional guidance
                    const deterministicVelocityX = direction * naturalNudgeStrength;
                    const upwardBounce = 0.5; // Gentle upward bounce for natural feel

                    // Apply deterministic velocity to ensure path follows service result
                    Body.setVelocity(ballBody, {
                        x: deterministicVelocityX,
                        y: Math.max(currentVelocity.y - upwardBounce, -1.0) // Ensure upward movement
                    });

                    // Mark the ball to prevent immediate velocity overrides
                    ballExtension.justBounced = true;
                    ballExtension.bounceTimestamp = Date.now();

                    physicsLogger.info('🎯 DETERMINISTIC PATH GUIDANCE APPLIED', {
                        component: 'CollisionTestUtils',
                        function: 'handleServiceGuidedPinCollision',
                        metadata: {
                            ballId: ballBody.id,
                            direction,
                            nudgeStrength: naturalNudgeStrength.toFixed(3),
                            deterministicVelocityX: deterministicVelocityX.toFixed(3),
                            upwardBounce: upwardBounce.toFixed(3),
                            velocityBefore: { x: currentVelocity.x.toFixed(3), y: currentVelocity.y.toFixed(3) },
                            velocityAfter: { x: ballBody.velocity.x.toFixed(3), y: ballBody.velocity.y.toFixed(3) }
                        }
                    });

                    physicsLogger.info('🎯 SCHEDULING NATURAL DETERMINISTIC GUIDANCE - DELAYED APPLICATION', {
                        component: 'CollisionTestUtils',
                        function: 'handleServiceGuidedPinCollision',
                        metadata: {
                            ballId: ballBody.id,
                            pinRow,
                            expectedRow: ballExtension.currentPathIndex + 1,
                            currentPathIndex: ballExtension.currentPathIndex,
                            currentStep,
                            direction: direction > 0 ? 'RIGHT' : 'LEFT',
                            naturalNudgeStrength: naturalNudgeStrength.toFixed(3),
                            ballVelocityBefore: { x: ballBody.velocity.x.toFixed(3), y: ballBody.velocity.y.toFixed(3) },
                            guidanceScheduled: true
                        }
                    });

                    // Don't apply velocity changes here - let natural physics resolve first
                    // Guidance will be applied in the next physics update cycle

                    // Mark this step as applied and increment path index
                    if (!ballExtension.appliedGuidanceSteps) {
                        ballExtension.appliedGuidanceSteps = [];
                    }
                    ballExtension.appliedGuidanceSteps.push(`row-${pinRow}-step-${ballExtension.currentPathIndex}`);
                    ballExtension.currentPathIndex++;

                    // Check if this was the final nudge - if so, set trajectory to target slot
                    const isFinalNudge = ballExtension.currentPathIndex >= ballExtension.servicePath.length;

                    if (isFinalNudge && ballExtension.expectedFinalSlot !== undefined) {
                        // Mark the ball as being on final trajectory to prevent further collision disruptions
                        ballExtension.onFinalTrajectory = true;
                        // Calculate target X position for the expected slot
                        const canvasWidth = 600; // Assuming standard canvas width
                        const numberOfRows = ballExtension.numberOfRows || 8; // Use stored row count or default to 8
                        // Use same positioning logic as physics world creation
                        const pegGap = 40; // Same peg gap used in body factory
                        const lastRowColumns = numberOfRows; // Last row has numberOfRows pegs
                        const lastRowWidth = (lastRowColumns - 1) * pegGap;
                        const lastRowStartX = (canvasWidth - lastRowWidth) / 2;
                        // Position slots between pegs: center between peg positions (same as body factory)
                        const targetX = lastRowStartX + (ballExtension.expectedFinalSlot - 0.5) * pegGap;

                        // Set velocity to go straight to target X position
                        const currentX = ballBody.position.x;
                        const distanceX = targetX - currentX;

                        // Use tiered scaling formulas for trajectory correction
                        const rowRatio = (ballExtension.numberOfRows || 8) / 8;
                        const rowCount = ballExtension.numberOfRows || 8;
                        const fallSpeed = PHYSICS_SCALING_FORMULAS.fallSpeed(rowRatio, rowCount);
                        const horizontalSpeed = PHYSICS_SCALING_FORMULAS.horizontalSpeed(rowRatio, rowCount);

                        // Calculate required horizontal velocity to reach target within reasonable time
                        // Limit maximum velocity more aggressively for higher row counts
                        const velocityMultiplier = rowCount > 12 ? 1.5 : 2.0; // More conservative for many rows
                        const maxVelocityX = horizontalSpeed * velocityMultiplier;
                        const minTimeToTarget = 0.2; // Minimum 0.2 seconds to reach target
                        const requiredVelocityX = Math.abs(distanceX) / minTimeToTarget;
                        const clampedVelocityX = Math.min(requiredVelocityX, maxVelocityX);
                        const velocityX = Math.sign(distanceX) * clampedVelocityX;

                        // Clamp final trajectory velocities to prevent out-of-bounds
                        // Use progressively more restrictive clamping for higher row counts
                        const maxFinalHorizontalVelocity = rowCount > 14 ? 12 : rowCount > 12 ? 18 : 25; // Very strict for 15+ rows
                        const clampedFinalX = Math.max(-maxFinalHorizontalVelocity, Math.min(maxFinalHorizontalVelocity, velocityX));
                        const clampedFinalY = Math.max(-3, Math.min(15, fallSpeed)); // More restrictive for high rows

                        Body.setVelocity(ballBody, {
                            x: clampedFinalX,
                            y: clampedFinalY
                        });

                        physicsLogger.info('🎯 FINAL TRAJECTORY SET - DIRECTING TO TARGET SLOT', {
                            component: 'CollisionTestUtils',
                            function: 'handleServiceGuidedPinCollision',
                            metadata: {
                                ballId: ballBody.id,
                                expectedFinalSlot: ballExtension.expectedFinalSlot,
                                currentX: currentX.toFixed(1),
                                targetX: targetX.toFixed(1),
                                distanceX: distanceX.toFixed(1),
                                finalVelocity: { x: velocityX.toFixed(3), y: fallSpeed.toFixed(3) },
                                pathCompleted: true
                            }
                        });
                    }

                    physicsLogger.info('🎯 DETERMINISTIC NUDGE APPLIED - PATH ADVANCED', {
                        component: 'CollisionTestUtils',
                        function: 'handleServiceGuidedPinCollision',
                        metadata: {
                            ballId: ballBody.id,
                            pinRow,
                            newPathIndex: ballExtension.currentPathIndex,
                            ballVelocityAfter: { x: ballBody.velocity.x.toFixed(3), y: ballBody.velocity.y.toFixed(3) },
                            totalStepsApplied: ballExtension.appliedGuidanceSteps?.length,
                            isFinalNudge
                        }
                    });

                    // Register collision cooldown
                    manager.registerCollision(ballBody.id, pegBody.id, 50);

                    physicsLogger.debug('Service-guided pin collision handled successfully', {
                        component: 'CollisionTestUtils',
                        function: 'handleServiceGuidedPinCollision',
                        metadata: {
                            ballId: ballBody.id,
                            finalPathIndex: ballExtension.currentPathIndex,
                            finalVelocity: { x: ballBody.velocity.x.toFixed(3), y: ballBody.velocity.y.toFixed(3) },
                            finalPosition: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) }
                        }
                    });
                    return;
                }
            } else {
                physicsLogger.debug('Skipping nudge - wrong row or already processed', {
                    component: 'CollisionTestUtils',
                    function: 'handleServiceGuidedPinCollision',
                    metadata: {
                        ballId: ballBody.id,
                        pinRow,
                        expectedRow: ballExtension.currentPathIndex + 1,
                        currentPathIndex: ballExtension.currentPathIndex,
                        pinLabel: pegBody.label
                    }
                });
            }
        }
    }

    // Handle non-service-guided balls with basic collision response
    // Register collision cooldown for physics stability
    manager.registerCollision(ballBody.id, pegBody.id, 50);

    physicsLogger.debug('Non-service-guided pin collision handled (cooldown only)', {
        component: 'CollisionTestUtils',
        function: 'handleServiceGuidedPinCollision',
        metadata: {
            ballId: ballBody.id,
            pegId: pegBody.id,
            isServiceGuided: false
        }
    });
}

/**
 * Test utility to handle pin collisions (wrapper for service-guided handler)
 * Provides backward compatibility for existing tests
 */
export function handlePinCollision(result: {
    ballBody: Body;
    ballExtension: BallBodyExtension;
    obstacleBody: Body;
    engine: Engine;
}): void {
    handleServiceGuidedPinCollision(
        result.ballBody,
        result.ballExtension,
        result.obstacleBody,
        result.engine
    );
}

/**
 * Test utility to handle multiplier collisions
 * Provides backward compatibility for existing tests
 */
export function handleMultiplierCollision(
    result: {
        ballBody: Body;
        ballExtension: BallBodyExtension;
        obstacleBody: Body;
        engine: Engine;
    },
    options?: { onBallHit?: (multiplier: number, betValue: number) => void; multiplier?: number }
): void {
    const { ballBody, ballExtension, obstacleBody } = result;
    const multiplier = options?.multiplier || 1;

    physicsLogger.info('🎯 MULTIPLIER COLLISION HANDLED', {
        component: 'CollisionTestUtils',
        function: 'handleMultiplierCollision',
        metadata: {
            ballId: ballBody.id,
            multiplier,
            ballPosition: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) },
            multiplierPosition: { x: Math.round(obstacleBody.position.x), y: Math.round(obstacleBody.position.y) },
            ballVelocity: { x: ballBody.velocity.x.toFixed(3), y: ballBody.velocity.y.toFixed(3) }
        }
    });

    // Simple multiplier collision response - just slow down the ball slightly
    Body.setVelocity(ballBody, {
        x: ballBody.velocity.x * 0.95,
        y: ballBody.velocity.y * 0.95
    });

    // Extract multiplier from obstacle label (e.g., 'multiplier-2-3' -> 2)
    const multiplierMatch = obstacleBody.label?.match(/multiplier-([0-9.]+)-(\d+)/);
    if (multiplierMatch) {
        const actualMultiplier = parseFloat(multiplierMatch[1]);

        // Call onBallHit callback if provided
        if (options?.onBallHit) {
            // Extract bet value from ball extension or use default
            const betValue = (ballExtension as any).betValue || 100;
            options.onBallHit(actualMultiplier, betValue);
        }

        // Mark ball as having hit multiplier for testing purposes
        if (ballExtension) {
            (ballExtension as any).hitMultiplier = true;
            (ballExtension as any).multiplierValue = actualMultiplier;
        }
    } else if (ballExtension) {
        // Handle wrong slot case
        (ballExtension as any).wrongSlotHits = ((ballExtension as any).wrongSlotHits || 0) + 1;
    }
}