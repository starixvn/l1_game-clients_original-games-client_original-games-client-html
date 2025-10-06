/**
 * Collision Handler Module
 * Handles all collision detection and response logic
 * Follows Single Responsibility Principle - only handles collisions
 */

import { Body, Engine, World } from 'matter-js';
import { BallBodyExtension } from '../../../../../types/physics';
import { logger } from '../../../../../services/logger';
import { COLLISION_CONSTANTS } from '@/lib/physics/constants/collision-constants';

export interface CollisionHandlerOptions {
    onBallHit?: (multiplier: number, betValue: number) => void;
}

export interface CollisionResult {
    ballBody: Body;
    ballExtension: BallBodyExtension;
    obstacleBody: Body;
    engine: Engine;
}

/**
 * Handle ball collision with multiplier slot
 * Pure function - processes collision result without side effects beyond physics
 */
export function handleMultiplierCollision(result: CollisionResult, options: CollisionHandlerOptions): void {
    const { ballBody, ballExtension, obstacleBody, engine } = result;

    // Extract multiplier data from label
    const labelParts = obstacleBody.label.split("-");
    const multiplier = parseFloat(labelParts[1]) || 1;
    const finalSlot = parseInt(labelParts[2]) || 0;
    const betValue = ballExtension.betValue || 100;

    logger.info('🎯 [COLLISION] Ball hit multiplier - REMOVING BALL:', {
        ballId: ballBody.id,
        ballPosition: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) },
        multiplier,
        finalSlot,
        expectedSlot: ballExtension.expectedFinalSlot,
        isServiceGuided: ballExtension.isServiceGuided,
        label: obstacleBody.label
    });

    // Mark ball as removed
    ballExtension.isRemoved = true;
    ballBody.isSensor = true;
    ballBody.isStatic = true;

    // Remove from physics world
    World.remove(engine.world, ballBody);

    // Handle win logic
    processWinLogic(ballExtension, finalSlot, multiplier, betValue, options);
}

/**
 * Process win logic after ball hits multiplier slot
 * Separated for better testability and single responsibility
 */
export function processWinLogic(
    ballExtension: BallBodyExtension,
    finalSlot: number,
    multiplier: number,
    betValue: number,
    options: CollisionHandlerOptions
): void {
    if (!ballExtension.hasTriggeredWin) {
        ballExtension.hasTriggeredWin = true;

        if (ballExtension.isServiceGuided && ballExtension.expectedFinalSlot !== undefined) {
            handleServiceGuidedWin(ballExtension, finalSlot, multiplier, betValue, options);
        } else {
            // Regular ball
            options.onBallHit?.(multiplier, betValue);
        }
    }
}

/**
 * Handle win logic for service-guided balls
 * Includes retry logic for balls that don't hit the expected slot
 */
export function handleServiceGuidedWin(
    ballExtension: BallBodyExtension,
    finalSlot: number,
    multiplier: number,
    betValue: number,
    options: CollisionHandlerOptions
): void {
    const expectedFinalSlot = ballExtension.expectedFinalSlot!;
    const expectedMultiplier = ballExtension.multiplier;

    if (finalSlot === expectedFinalSlot) {
        if (process.env.NODE_ENV === 'development') {
            logger.info('✅ [PHYSICS] Service-guided ball hit correct slot', {
                finalSlot,
                expectedFinalSlot,
                multiplier,
                betValue
            });
        }
        options.onBallHit?.(multiplier, betValue);
        return;
    }

    // Wrong slot hit
    ballExtension.wrongSlotHits = (ballExtension.wrongSlotHits || 0) + 1;

    if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️ [PHYSICS] Service-guided ball hit wrong slot', {
            finalSlot,
            expectedFinalSlot,
            wrongSlotHits: ballExtension.wrongSlotHits,
            multiplier,
            expectedMultiplier
        });
    }

    if (ballExtension.wrongSlotHits >= 3) {
        if (process.env.NODE_ENV === 'development') {
            logger.error('❌ [PHYSICS] Service-guided ball failed to hit correct slot after 3 attempts, using expected multiplier', {
                finalSlot,
                expectedFinalSlot,
                expectedMultiplier
            });
        }
        options.onBallHit?.(expectedMultiplier || multiplier, betValue);
    }
}

/**
 * Handle ball collision with pin (peg)
 * Implements service-guided path following logic
 */
export function handlePinCollision(result: CollisionResult): void {
    const { ballBody, ballExtension } = result;

    if (ballExtension.isServiceGuided && ballExtension.servicePath && ballExtension.currentPathIndex < ballExtension.servicePath.length) {
        handleServiceGuidedPinCollision(ballBody, ballExtension);
    } else {
        handleRandomPinCollision(ballBody);
    }
}

/**
 * Handle pin collision for service-guided balls
 * Applies deterministic forces based on service path
 */
export function handleServiceGuidedPinCollision(ballBody: Body, ballExtension: BallBodyExtension): void {
    const direction = ballExtension.servicePath[ballExtension.currentPathIndex];

    // In Plinko, each step represents a binary choice: left (0) or right (1)
    // Service uses 1 to indicate "right" movement, 0 for "left" movement
    // Higher count of 1s results in higher slotIndex (further right)
    const targetDirection = direction === 1 ? 1 : -1; // 1 = right, 0 = left

    // Apply stronger, more deterministic force for reliable path following
    const forceMagnitude = COLLISION_CONSTANTS.FORCES.SERVICE_GUIDANCE_FORCE; // Increased for more reliable guidance
    const velocityMagnitude = COLLISION_CONSTANTS.FORCES.SERVICE_GUIDANCE_VELOCITY; // Stronger velocity setting

    Body.setVelocity(ballBody, {
        x: targetDirection * velocityMagnitude,
        y: ballBody.velocity.y
    });
    Body.applyForce(ballBody, ballBody.position, {
        x: targetDirection * forceMagnitude,
        y: 0
    });

    if (process.env.NODE_ENV === 'development') {
        logger.debug('🎯 [PHYSICS] Service-guided ball collision', {
            pathIndex: ballExtension.currentPathIndex,
            direction,
            targetDirection,
            expectedFinalSlot: ballExtension.expectedFinalSlot,
            remainingPath: ballExtension.servicePath.slice(ballExtension.currentPathIndex + 1)
        });
    }

    ballExtension.currentPathIndex++;
}

/**
 * Handle pin collision for regular balls
 * Applies random deflection for unpredictable bounce patterns
 */
export function handleRandomPinCollision(ballBody: Body): void {
    const ballRadius = ballBody.circleRadius || 5;
    const deflectionStrength = Math.max(COLLISION_CONSTANTS.DEFLECTION.MIN_STRENGTH, Math.min(COLLISION_CONSTANTS.DEFLECTION.MAX_STRENGTH, COLLISION_CONSTANTS.DEFLECTION.BASE_STRENGTH_DIVISOR / (ballRadius / 5)));
    const randomForce = (Math.random() < COLLISION_CONSTANTS.PROBABILITIES.DEFLECTION_DIRECTION ? -1 : 1) * deflectionStrength * (Math.random() * COLLISION_CONSTANTS.DEFLECTION.RANDOM_FORCE_RANGE + COLLISION_CONSTANTS.DEFLECTION.RANDOM_FORCE_MIN);
    Body.applyForce(ballBody, ballBody.position, { x: randomForce, y: 0 });
}

/**
 * Process collision between two bodies
 * Main collision processing function that delegates to specific handlers
 */
export function processCollision(
    ballBody: Body,
    obstacleBody: Body,
    engine: Engine,
    removedBallsRef: React.MutableRefObject<Set<number>>,
    options: CollisionHandlerOptions
): void {
    // Skip if ball is already removed
    const ballExtension = ballBody as Body & BallBodyExtension;
    if (ballExtension.isRemoved || removedBallsRef.current.has(ballBody.id)) {
        return;
    }

    const collisionResult: CollisionResult = {
        ballBody,
        ballExtension,
        obstacleBody,
        engine
    };

    logger.debug('🎯 [COLLISION] Processing collision', {
        ballId: ballBody.id,
        ballLabel: ballBody.label,
        obstacleLabel: obstacleBody.label,
        isServiceGuided: ballExtension.isServiceGuided,
        position: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) }
    });

    // Route to appropriate collision handler
    if (obstacleBody.label?.includes("multiplier")) {
        handleMultiplierCollision(collisionResult, options);
    } else if (obstacleBody.label?.includes("pin")) {
        handlePinCollision(collisionResult);
    }
}
