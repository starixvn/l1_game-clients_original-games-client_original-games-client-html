/**
 * Collision Handler Module
 * Handles all collision detection and response logic
 * Follows Single Responsibility Principle - only handles collisions
 */

import { Body, Engine, World } from 'matter-js';
import { BallBodyExtension } from '../../../../../types/physics';
import { logger } from '../../../../../services/logger';
import { COLLISION_CONSTANTS } from '../../../../../features/game/components/ball/physics/constants/collision-constants';

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
    const fullLabel = obstacleBody.label || '';
    const labelParts = fullLabel.split("-");
    const multiplier = parseFloat(labelParts[1]) || 1;
    const finalSlot = parseInt(labelParts[2]) || 0;
    const betValue = ballExtension.betValue || 100;

    const pathCountOfOnes = ballExtension.servicePath?.filter(p => p === 1).length || 0;

    // Calculate what slotIndex should be based on path
    const correctSlotIndex = ballExtension.isServiceGuided ? pathCountOfOnes : null;

    logger.error('🎯 [COLLISION] SLOT INDEX VERIFICATION - 0-BASED INDEXING:', {
        ballId: ballBody.id,
        ballPosition: { x: Math.round(ballBody.position.x), y: Math.round(ballBody.position.y) },

        // What the service says (both start with 0)
        serviceSlotIndex: ballExtension.expectedFinalSlot,  // slotIndex from service
        servicePath: ballExtension.servicePath,
        pathCountOfOnes: pathCountOfOnes,

        // What the physics engine detects
        physicsSlotIndex: finalSlot,  // payout slot index from collision
        physicsLabel: fullLabel,
        physicsMultiplier: multiplier,

        // Verification (both should be equal since both start with 0)
        slotIndicesMatch: ballExtension.expectedFinalSlot === finalSlot,
        pathValidatesSlotIndex: correctSlotIndex === ballExtension.expectedFinalSlot,

        // Issue diagnosis
        issue: ballExtension.expectedFinalSlot !== finalSlot ? 'WRONG_SLOT_LANDED' : 'CORRECT',
        diagnosis: ballExtension.expectedFinalSlot !== finalSlot
            ? `Service says slotIndex ${ballExtension.expectedFinalSlot}, but ball landed on slotIndex ${finalSlot}`
            : `Ball correctly landed on slotIndex ${finalSlot}`,

        // Path execution summary
        pathExecuted: ballExtension.isServiceGuided ? `${ballExtension.currentPathIndex}/${ballExtension.servicePath.length} steps` : 'N/A',
        pegCollisions: ballExtension.pinCollisions?.length || 0,

        // Final conclusion
        conclusion: ballExtension.expectedFinalSlot === finalSlot
            ? `✅ SUCCESS: slotIndex ${ballExtension.expectedFinalSlot} matched correctly`
            : `❌ FAILURE: Expected slotIndex ${ballExtension.expectedFinalSlot}, got ${finalSlot}. Path following issue.`
    });

    // Additional validation logging
    if (ballExtension.isServiceGuided && ballExtension.servicePath) {
        const calculatedSlotIndex = ballExtension.servicePath.filter(p => p === 1).length;
        const pathStepsExecuted = ballExtension.currentPathIndex;
        const expectedPathSteps = ballExtension.servicePath.length;

        logger.info('🔍 [COLLISION] Service-guided ball validation:', {
            calculatedSlotIndex,
            expectedSlotIndex: ballExtension.expectedFinalSlot,
            pathStepsExecuted,
            expectedPathSteps,
            slotIndexMatch: calculatedSlotIndex === ballExtension.expectedFinalSlot,
            pathCompleted: pathStepsExecuted >= expectedPathSteps,
            finalSlotFromLabel: finalSlot,
            slotMatch: finalSlot === ballExtension.expectedFinalSlot
        });
    }

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
    const expectedFinalSlot = ballExtension.expectedFinalSlot;
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
        ballExtension.hasTriggeredWin = true;
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
        ballExtension.hasTriggeredWin = true;
        options.onBallHit?.(expectedMultiplier || multiplier, betValue);
    }
}

/**
 * Handle ball collision with pin (peg)
 * Implements service-guided path following logic
 */
export function handlePinCollision(result: CollisionResult): void {
    const { ballBody, ballExtension, obstacleBody } = result;

    if (ballExtension.isServiceGuided && ballExtension.servicePath && ballExtension.currentPathIndex < ballExtension.servicePath.length) {
        handleServiceGuidedPinCollision(ballBody, ballExtension, obstacleBody);
    } else {
        handleRandomPinCollision(ballBody);
    }
}

/**
 * Handle pin collision for service-guided balls
 * Uses static repositioning method like the demo project for deterministic paths
 */
export function handleServiceGuidedPinCollision(ballBody: Body, ballExtension: BallBodyExtension, obstacleBody: Body): void {
    // Only apply guidance at specific "decision points" based on vertical position
    // This prevents applying guidance on every pin collision (which happens dozens of times)

    // Extract peg info to determine if this is a decision point
    const pegLabel = obstacleBody.label || '';
    const pegParts = pegLabel.split('-');
    const pegRow = parseInt(pegParts[1]) || 0;

    // Only apply guidance when hitting pins in the first few rows
    // This gives the ball initial direction without micro-managing every collision
    const guidanceRows = 3; // Apply guidance only in first 3 rows
    if (pegRow > guidanceRows) {
        return; // Skip guidance for lower rows, let physics take over
    }


    // Only apply guidance if we haven't exceeded the path length
    if (!ballExtension.servicePath || ballExtension.currentPathIndex >= ballExtension.servicePath.length) {
        return;
    }

    // Check if we've already applied guidance for this path step
    // Use a separate tracking array for guidance application
    if (!ballExtension.appliedGuidanceSteps) {
        ballExtension.appliedGuidanceSteps = [];
    }

    const pathStepKey = `step-${ballExtension.currentPathIndex}`;
    if (ballExtension.appliedGuidanceSteps?.includes(pathStepKey)) {
        return;
    }

    const direction = ballExtension.servicePath[ballExtension.currentPathIndex];
    const pegCol = parseInt(pegParts[2]) || 0;

    // Apply a velocity nudge based on the path direction
    // Guide the ball toward the correct trajectory
    const nudgeStrength = 1.0; // Strong nudge for accurate slot landing
    const currentVelocity = ballBody.velocity;

    // Calculate nudge based on direction: 0 = left (negative), 1 = right (positive)
    const nudgeX = direction === 0 ? -nudgeStrength : nudgeStrength;

    // Apply the nudge to the current velocity
    Body.setVelocity(ballBody, {
        x: currentVelocity.x + nudgeX,
        y: currentVelocity.y
    });

    // Track path position for visualization
    if (!ballExtension.pathPositions) {
        ballExtension.pathPositions = [];
    }
    ballExtension.pathPositions.push({
        x: ballBody.position.x,
        y: ballBody.position.y,
        type: 'collision',
        pegRow,
        pegCol,
        pathIndex: ballExtension.currentPathIndex,
        direction
    });

    // Record that we've applied guidance for this path step
    ballExtension.appliedGuidanceSteps.push(pathStepKey);

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
