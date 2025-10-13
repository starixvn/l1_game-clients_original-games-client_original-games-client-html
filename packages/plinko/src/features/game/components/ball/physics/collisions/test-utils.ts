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
    logCollisionStart(ballBody, ballExtension, pegBody);
    
    const manager = cooldownManager || new CollisionCooldownManager();
    const isServiceGuided = ballExtension.servicePath && ballExtension.currentPathIndex !== undefined;

    if (!isServiceGuided) {
        if (!handleNonServiceGuidedCollision(ballBody, pegBody, manager)) {
            return;
        }
    } else if (!handleServiceGuidedCollision(ballBody, ballExtension, pegBody, manager)) {
        return;
    }

    manager.registerCollision(ballBody.id, pegBody.id, 50);
}

/**
 * Handle collision for non-service-guided balls
 */
function handleNonServiceGuidedCollision(
    ballBody: Body,
    pegBody: Body,
    manager: CollisionCooldownManager
): boolean {
    if (!manager.canCollide(ballBody.id, pegBody.id, 50)) {
        physicsLogger.debug('Collision blocked by cooldown (test utility)', {
            component: 'CollisionTestUtils',
            function: 'handleNonServiceGuidedCollision',
            metadata: { ballId: ballBody.id, pegId: pegBody.id }
        });
        return false;
    }
    return true;
}

/**
 * Handle collision for service-guided balls
 */
function handleServiceGuidedCollision(
    ballBody: Body,
    ballExtension: BallBodyExtension,
    pegBody: Body,
    manager: CollisionCooldownManager
): boolean {
    if (ballExtension.onFinalTrajectory) {
        logSkipFinalTrajectory(ballBody, ballExtension, pegBody);
        return false;
    }

    const pinLabelMatch = pegBody.label?.match(/pin-(\d+)-(\d+)/);
    if (!pinLabelMatch) { return true; }

    const pinRow = parseInt(pinLabelMatch[1]);
    if (pinRow !== ballExtension.currentPathIndex + 1) {
        logSkipWrongRow(ballBody, ballExtension, pegBody, pinRow);
        return true;
    }

    const currentStep = ballExtension.servicePath[ballExtension.currentPathIndex];
    if (currentStep === undefined) { return true; }

    applyServiceGuidedNudge(ballBody, ballExtension, currentStep, pinRow);
    updatePathProgress(ballExtension, pinRow);
    handleFinalTrajectory(ballBody, ballExtension);

    return true;
}

/**
 * Apply nudge for service-guided balls
 */
function applyServiceGuidedNudge(
    ballBody: Body,
    ballExtension: BallBodyExtension,
    currentStep: number,
    pinRow: number
): void {
    const naturalNudgeStrength = calculateNudgeStrength(ballExtension);
    const direction = currentStep === 1 ? 1 : -1;

    storeGuidanceInfo(ballExtension, direction, naturalNudgeStrength, pinRow);
    applyDeterministicVelocity(ballBody, direction, naturalNudgeStrength);
    markBallBounced(ballExtension);
    logNudgeApplied(ballBody, direction, naturalNudgeStrength);
}

/**
 * Calculate nudge strength based on ball extension data
 */
function calculateNudgeStrength(ballExtension: BallBodyExtension): number {
    const rowRatio = (ballExtension.numberOfRows || 8) / 8;
    const rowCount = ballExtension.numberOfRows || 8;

    if (ballExtension.calculationData) {
        return ballExtension.calculationData.physicsFactors.nudgeStrength * 0.8;
    }

    const baseNudgeStrength = PHYSICS_SCALING_FORMULAS.nudgeStrength(rowRatio, rowCount);
    return baseNudgeStrength * 0.7;
}

/**
 * Store guidance information for delayed application
 */
function storeGuidanceInfo(
    ballExtension: BallBodyExtension,
    direction: number,
    naturalNudgeStrength: number,
    pinRow: number
): void {
    const rowRatio = (ballExtension.numberOfRows || 8) / 8;
    const rowCount = ballExtension.numberOfRows || 8;

    ballExtension.pendingGuidance = {
        direction,
        naturalNudgeStrength,
        rowRatio,
        rowCount,
        pinRow,
        appliedAtFrame: 0
    };
}

/**
 * Apply deterministic velocity to ball
 */
function applyDeterministicVelocity(
    ballBody: Body,
    direction: number,
    naturalNudgeStrength: number
): void {
    const currentVelocity = { x: ballBody.velocity.x, y: ballBody.velocity.y };
    const deterministicVelocityX = direction * naturalNudgeStrength;
    const upwardBounce = 0.5;

    Body.setVelocity(ballBody, {
        x: deterministicVelocityX,
        y: Math.max(currentVelocity.y - upwardBounce, -1.0)
    });
}

/**
 * Mark ball as bounced
 */
function markBallBounced(ballExtension: BallBodyExtension): void {
    ballExtension.justBounced = true;
    ballExtension.bounceTimestamp = Date.now();
}

/**
 * Update path progress
 */
function updatePathProgress(ballExtension: BallBodyExtension, pinRow: number): void {
    if (!ballExtension.appliedGuidanceSteps) {
        ballExtension.appliedGuidanceSteps = [];
    }
    ballExtension.appliedGuidanceSteps.push(`row-${pinRow}-step-${ballExtension.currentPathIndex}`);
    ballExtension.currentPathIndex++;
}

/**
 * Handle final trajectory if this was the last nudge
 */
function handleFinalTrajectory(ballBody: Body, ballExtension: BallBodyExtension): void {
    const isFinalNudge = ballExtension.currentPathIndex >= ballExtension.servicePath.length;
    
    if (!isFinalNudge || ballExtension.expectedFinalSlot === undefined) {
        return;
    }

    ballExtension.onFinalTrajectory = true;
    const finalVelocity = calculateFinalTrajectoryVelocity(ballBody, ballExtension);
    
    Body.setVelocity(ballBody, finalVelocity);
    logFinalTrajectorySet(ballBody, ballExtension, finalVelocity);
}

/**
 * Calculate final trajectory velocity
 */
function calculateFinalTrajectoryVelocity(ballBody: Body, ballExtension: BallBodyExtension): { x: number; y: number } {
    const canvasWidth = 600;
    const numberOfRows = ballExtension.numberOfRows || 8;
    const pegGap = 40;
    const lastRowColumns = numberOfRows;
    const lastRowWidth = (lastRowColumns - 1) * pegGap;
    const lastRowStartX = (canvasWidth - lastRowWidth) / 2;
    const targetX = lastRowStartX + (ballExtension.expectedFinalSlot - 0.5) * pegGap;

    const currentX = ballBody.position.x;
    const distanceX = targetX - currentX;

    const rowRatio = numberOfRows / 8;
    const rowCount = numberOfRows;
    const fallSpeed = PHYSICS_SCALING_FORMULAS.fallSpeed(rowRatio, rowCount);
    const horizontalSpeed = PHYSICS_SCALING_FORMULAS.horizontalSpeed(rowRatio, rowCount);

    const velocityMultiplier = rowCount > 12 ? 1.5 : 2.0;
    const maxVelocityX = horizontalSpeed * velocityMultiplier;
    const minTimeToTarget = 0.2;
    const requiredVelocityX = Math.abs(distanceX) / minTimeToTarget;
    const clampedVelocityX = Math.min(requiredVelocityX, maxVelocityX);
    const velocityX = Math.sign(distanceX) * clampedVelocityX;

    let maxFinalHorizontalVelocity: number;
    if (rowCount > 14) {
        maxFinalHorizontalVelocity = 12;
    } else if (rowCount > 12) {
        maxFinalHorizontalVelocity = 18;
    } else {
        maxFinalHorizontalVelocity = 25;
    }
    const clampedFinalX = Math.max(-maxFinalHorizontalVelocity, Math.min(maxFinalHorizontalVelocity, velocityX));
    const clampedFinalY = Math.max(-3, Math.min(15, fallSpeed));

    return { x: clampedFinalX, y: clampedFinalY };
}

// Logging functions
function logCollisionStart(ballBody: Body, ballExtension: BallBodyExtension, pegBody: Body): void {
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
}

function logSkipFinalTrajectory(ballBody: Body, ballExtension: BallBodyExtension, pegBody: Body): void {
    physicsLogger.debug('Skipping nudge for ball on final trajectory', {
        component: 'CollisionTestUtils',
        function: 'handleServiceGuidedCollision',
        metadata: {
            ballId: ballBody.id,
            pegId: pegBody.id,
            expectedFinalSlot: ballExtension.expectedFinalSlot
        }
    });
}

function logSkipWrongRow(ballBody: Body, ballExtension: BallBodyExtension, pegBody: Body, pinRow: number): void {
    physicsLogger.debug('Skipping nudge - wrong row or already processed', {
        component: 'CollisionTestUtils',
        function: 'handleServiceGuidedCollision',
        metadata: {
            ballId: ballBody.id,
            pinRow,
            expectedRow: ballExtension.currentPathIndex + 1,
            currentPathIndex: ballExtension.currentPathIndex,
            pinLabel: pegBody.label
        }
    });
}

function logNudgeApplied(ballBody: Body, direction: number, naturalNudgeStrength: number): void {
    physicsLogger.info('🎯 DETERMINISTIC PATH GUIDANCE APPLIED', {
        component: 'CollisionTestUtils',
        function: 'applyServiceGuidedNudge',
        metadata: {
            ballId: ballBody.id,
            direction,
            nudgeStrength: naturalNudgeStrength.toFixed(3),
            deterministicVelocityX: (direction * naturalNudgeStrength).toFixed(3),
            upwardBounce: '0.500',
            velocityAfter: { x: ballBody.velocity.x.toFixed(3), y: ballBody.velocity.y.toFixed(3) }
        }
    });
}

function logFinalTrajectorySet(ballBody: Body, ballExtension: BallBodyExtension, finalVelocity: { x: number; y: number }): void {
    physicsLogger.info('🎯 FINAL TRAJECTORY SET - DIRECTING TO TARGET SLOT', {
        component: 'CollisionTestUtils',
        function: 'handleFinalTrajectory',
        metadata: {
            ballId: ballBody.id,
            expectedFinalSlot: ballExtension.expectedFinalSlot,
            currentX: ballBody.position.x.toFixed(1),
            finalVelocity: { x: finalVelocity.x.toFixed(3), y: finalVelocity.y.toFixed(3) },
            pathCompleted: true
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