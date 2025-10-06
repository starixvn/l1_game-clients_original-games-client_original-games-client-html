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
    const fullLabel = obstacleBody.label || '';
    const labelParts = fullLabel.split("-");
    const multiplier = parseFloat(labelParts[1]) || 1;
    const finalSlot = parseInt(labelParts[2]) || 0;
    const betValue = ballExtension.betValue || 100;

    const slotMatch = finalSlot === ballExtension.expectedFinalSlot;
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
    const pegLabel = obstacleBody.label || '';

    // Check if we've already visited this peg (like demo project)
    if (ballExtension.pinCollisions?.includes(pegLabel)) {
        if (process.env.NODE_ENV === 'development') {
            logger.debug('⏭️ [PHYSICS] Service-guided ball already visited this peg, skipping', {
                pegLabel,
                visitedPegs: ballExtension.pinCollisions
            });
        }
        return;
    }

    // Check if we're currently processing a collision (prevent rapid-fire collisions)
    if (ballExtension.isProcessingCollision) {
        console.log('⏳ [COLLISION] Ball is already processing a collision, skipping', {
            pegLabel,
            currentPathIndex: ballExtension.currentPathIndex
        });
        return;
    }

    ballExtension.isProcessingCollision = true;

    // Only apply guidance if we haven't exceeded the path length
    if (ballExtension.currentPathIndex >= ballExtension.servicePath.length) {
        if (process.env.NODE_ENV === 'development') {
            logger.warn('⚠️ [PHYSICS] Service-guided ball exceeded path length', {
                pathIndex: ballExtension.currentPathIndex,
                pathLength: ballExtension.servicePath.length,
                expectedFinalSlot: ballExtension.expectedFinalSlot
            });
        }
        return;
    }

    const direction = ballExtension.servicePath[ballExtension.currentPathIndex];
    const pegRadius = obstacleBody.circleRadius || 10; // Get from obstacle body or default
    const offsetVelocity = 1.2; // Slightly higher velocity for better control
    const downwardVelocity = -3.5; // Stronger downward velocity

    // Extract row and column from peg label for debugging
    const pegParts = pegLabel.split('-');
    const pegRow = parseInt(pegParts[1]) || 0;
    const pegCol = parseInt(pegParts[2]) || 0;

    console.log('🎯 [COLLISION] PEG COLLISION EXECUTION:', {
        pegLabel,
        pegRow,
        pegCol,
        ballPosition: { x: ballBody.position.x.toFixed(2), y: ballBody.position.y.toFixed(2) },
        pathIndex: ballExtension.currentPathIndex,
        directionFromPath: direction,
        directionText: direction === 0 ? 'LEFT' : 'RIGHT',
        fullPath: ballExtension.servicePath,
        pathProgress: `${ballExtension.currentPathIndex + 1}/${ballExtension.servicePath.length}`,
        remainingInstructions: ballExtension.servicePath.length - ballExtension.currentPathIndex - 1,
        totalPegCollisions: ballExtension.pinCollisions?.length || 0,
        expectedFinalSlot: ballExtension.expectedFinalSlot
    });

    // Temporarily make ball static to control its movement (like demo project)
    Body.setStatic(ballBody, true);

    // Calculate new position directly above the peg (like demo)
    const newX = obstacleBody.position.x; // Position directly above the peg
    const newY = obstacleBody.position.y - (pegRadius * 2); // Position above the peg

    // Set position above the peg
    Body.setPosition(ballBody, { x: newX, y: newY });

    // Track path position for visualization (record both collision point and reposition point)
    if (!ballExtension.pathPositions) {
        ballExtension.pathPositions = [];
    }
    // Record the collision point (where ball hit the peg)
    ballExtension.pathPositions.push({
        x: ballBody.position.x,
        y: ballBody.position.y,
        type: 'collision',
        pegRow,
        pegCol,
        pathIndex: ballExtension.currentPathIndex
    });

    // Apply velocity after a short delay to ensure position is set (like demo)
    setTimeout(() => {
        const velocityX = direction === 0 ? -offsetVelocity : offsetVelocity; // 0 = left, 1 = right
        const velocityY = downwardVelocity; // Controlled downward velocity

        Body.setVelocity(ballBody, {
            x: velocityX,
            y: velocityY,
        });

        // Make ball dynamic again
        Body.setStatic(ballBody, false);

        // Record the launch position (directly above the peg)
        ballExtension.pathPositions.push({
            x: newX,
            y: newY,
            type: 'launch',
            direction,
            pathIndex: ballExtension.currentPathIndex,
            pegRow,
            pegCol
        });

        console.log('🚀 [COLLISION] Ball launched after repositioning:', {
            launchPosition: { x: newX.toFixed(2), y: newY.toFixed(2) },
            velocity: { x: velocityX.toFixed(3), y: velocityY.toFixed(3) },
            direction: direction === 0 ? 'LEFT' : 'RIGHT',
            pathIndex: ballExtension.currentPathIndex,
            totalPathPositions: ballExtension.pathPositions.length
        });
    }, 10);

    // Record that we've visited this peg (like demo project)
    if (!ballExtension.pinCollisions) {
        ballExtension.pinCollisions = [];
    }
    ballExtension.pinCollisions.push(pegLabel);

    ballExtension.currentPathIndex++;

    // Clear processing flag after a delay to allow next collision
    setTimeout(() => {
        ballExtension.isProcessingCollision = false;
    }, 50);
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
