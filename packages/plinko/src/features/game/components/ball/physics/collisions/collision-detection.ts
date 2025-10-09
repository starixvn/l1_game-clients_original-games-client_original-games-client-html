/**
 * Collision Detection Module
 * Handles collision detection logic and geometry calculations
 */

import { PhysicsFactors } from '../factors/core-factors';
import { calculateCollisionProbability } from '../factors/factor-relationships';
import { physicsLogger } from '../performance/physics-logger';

/**
 * Collision detection result interface
 */
export interface CollisionDetectionResult {
    hasCollision: boolean;
    collisionPoint: { x: number; y: number };
    normal: { x: number; y: number };
    penetration: number;
    relativeVelocity: { x: number; y: number };
}

/**
 * Circle-peg collision detection
 */
export function detectCirclePegCollision(
    ballPosition: { x: number; y: number },
    ballRadius: number,
    pegPosition: { x: number; y: number },
    pegRadius: number
): CollisionDetectionResult | null {
    physicsLogger.debug('Detecting circle-peg collision', {
        component: 'CollisionDetection',
        function: 'detectCirclePegCollision',
        metadata: {
            ballPos: ballPosition,
            ballRadius,
            pegPos: pegPosition,
            pegRadius
        }
    });

    const dx = ballPosition.x - pegPosition.x;
    const dy = ballPosition.y - pegPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = ballRadius + pegRadius;

    if (distance >= minDistance) {
        physicsLogger.debug('No collision detected', {
            component: 'CollisionDetection',
            function: 'detectCirclePegCollision',
            metadata: { distance: distance.toFixed(2), minDistance: minDistance.toFixed(2) }
        });
        return null; // No collision
    }

    const penetration = minDistance - distance;

    // Calculate collision normal (from peg to ball)
    const normalX = distance > 0 ? dx / distance : 0;
    const normalY = distance > 0 ? dy / distance : 0;

    // Calculate collision point
    const collisionPointX = pegPosition.x + normalX * pegRadius;
    const collisionPointY = pegPosition.y + normalY * pegRadius;

    const result = {
        hasCollision: true,
        collisionPoint: { x: collisionPointX, y: collisionPointY },
        normal: { x: normalX, y: normalY },
        penetration,
        relativeVelocity: { x: 0, y: 0 }, // Will be calculated by caller
    };

    physicsLogger.debug('Collision detected successfully', {
        component: 'CollisionDetection',
        function: 'detectCirclePegCollision',
        metadata: {
            penetration: penetration.toFixed(3),
            collisionPoint: result.collisionPoint,
            normal: result.normal
        }
    });

    return result;
}

/**
 * Advanced collision detection with velocity consideration
 */
export function detectAdvancedCollision(
    ballPosition: { x: number; y: number },
    ballVelocity: { x: number; y: number },
    ballRadius: number,
    pegPosition: { x: number; y: number },
    pegRadius: number,
    deltaTime: number = 0.016
): CollisionDetectionResult | null {
    // Check current position collision
    const currentCollision = detectCirclePegCollision(ballPosition, ballRadius, pegPosition, pegRadius);
    if (currentCollision) {
        return currentCollision;
    }

    // Predictive collision detection
    const futureX = ballPosition.x + ballVelocity.x * deltaTime;
    const futureY = ballPosition.y + ballVelocity.y * deltaTime;

    const futureCollision = detectCirclePegCollision(
        { x: futureX, y: futureY },
        ballRadius,
        pegPosition,
        pegRadius
    );

    if (futureCollision) {
        // Calculate relative velocity at collision point
        futureCollision.relativeVelocity = { ...ballVelocity };
        return futureCollision;
    }

    return null;
}

/**
 * Calculate collision probability for ball-peg interactions
 */
export function calculatePegCollisionProbability(
    ballRadius: number,
    pegRadius: number,
    pegSpacing: number,
    ballVelocity: { x: number; y: number }
): number {
    // Base geometric probability
    const geometricProbability = calculateCollisionProbability(ballRadius, pegRadius, pegSpacing);

    // Velocity-based adjustment
    const speed = Math.sqrt(ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y);
    const velocityFactor = Math.max(0.5, Math.min(1.5, speed / 2)); // Normalize around speed of 2

    return Math.max(0, Math.min(1, geometricProbability * velocityFactor));
}

/**
 * Get collision detection configuration for physics engine
 */
export function getCollisionDetectionConfig(physicsFactors: PhysicsFactors) {
    return {
        collisionDetectionAlgorithm: 'SAT', // Separating Axis Theorem
        broadphaseAlgorithm: 'grid', // Grid-based broadphase for performance
        narrowphaseAlgorithm: 'circle-circle', // Optimized for circular bodies

        // Collision filtering
        collisionFilter: {
            ballCategory: 0x0001,
            pegCategory: 0x0002,
            wallCategory: 0x0004,
            multiplierCategory: 0x0008,
        },

        // Collision thresholds
        minPenetration: 0.1,
        maxPenetration: physicsFactors.ballSize * 0.5,

        // Performance settings
        maxContactsPerBody: 4,
        contactCacheSize: 100,

        // Collision prediction
        predictionDistance: physicsFactors.velocityY * 0.016 * 2, // Predict 2 frames ahead
    };
}

/**
 * Optimize collision detection for performance
 */
export function optimizeCollisionDetection(
    ballCount: number,
    pegCount: number,
    canvasWidth: number,
    canvasHeight: number
): {
    useSpatialPartitioning: boolean;
    gridCellSize: number;
    maxChecksPerFrame: number;
    collisionCacheEnabled: boolean;
} {
    const totalPossibleCollisions = ballCount * pegCount;
    const performanceThreshold = 10000; // Max collisions before optimization needed

    const useSpatialPartitioning = totalPossibleCollisions > performanceThreshold;

    const gridCellSize = useSpatialPartitioning
        ? Math.max(20, Math.min(canvasWidth, canvasHeight) / 20)
        : 0;

    const maxChecksPerFrame = useSpatialPartitioning
        ? Math.max(100, totalPossibleCollisions / 10)
        : totalPossibleCollisions;

    return {
        useSpatialPartitioning,
        gridCellSize,
        maxChecksPerFrame,
        collisionCacheEnabled: ballCount > 5,
    };
}

/**
 * Calculate collision impact zone for a peg
 */
export function calculatePegImpactZone(
    pegPosition: { x: number; y: number },
    pegRadius: number,
    ballRadius: number,
    impactAngle: number = Math.PI / 4 // 45 degrees
): {
    center: { x: number; y: number };
    radius: number;
    angle: number;
    coverage: number;
} {
    const impactRadius = pegRadius + ballRadius;
    const coverage = (impactAngle * 2) / (2 * Math.PI); // Coverage as fraction of circle

    return {
        center: pegPosition,
        radius: impactRadius,
        angle: impactAngle,
        coverage,
    };
}

/**
 * Predict collision sequence for ball path
 */
export function predictCollisionSequence(
    ballPosition: { x: number; y: number },
    ballVelocity: { x: number; y: number },
    pegs: Array<{ x: number; y: number; radius: number }>,
    physicsFactors: PhysicsFactors,
    maxPredictions: number = 10
): Array<{
    pegIndex: number;
    collisionPoint: { x: number; y: number };
    timeToCollision: number;
}> {
    const predictions: Array<{
        pegIndex: number;
        collisionPoint: { x: number; y: number };
        timeToCollision: number;
    }> = [];

    // Sort pegs by proximity to ball path
    const pegsWithDistance = pegs.map((peg, index) => ({
        ...peg,
        index,
        distance: Math.abs(peg.x - ballPosition.x),
    }));

    pegsWithDistance.sort((a, b) => a.distance - b.distance);

    for (const peg of pegsWithDistance.slice(0, maxPredictions)) {
        // Simple time-to-collision calculation
        const dx = peg.x - ballPosition.x;
        const dy = peg.y - ballPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = physicsFactors.ballSize + peg.radius;

        if (distance > minDistance) {
            const timeToCollision = distance / physicsFactors.velocityY;

            predictions.push({
                pegIndex: peg.index,
                collisionPoint: { x: peg.x, y: peg.y },
                timeToCollision,
            });
        }

        if (predictions.length >= maxPredictions) break;
    }

    return predictions.sort((a, b) => a.timeToCollision - b.timeToCollision);
}
