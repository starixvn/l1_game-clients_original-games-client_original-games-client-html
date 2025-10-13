import {
    BallTrajectory,
    CollisionEvent,
    ServiceResult,
    PegConfiguration,
    BoardConfiguration,
    PhysicsFactors,
    EnvironmentalFactors,
    BallProperties
} from './types/calculation-types';
import { calculateBallVelocityWithAirResistance, calculateBallBounce } from '../ball/ball-physics-calculations';

/**
 * Apply physics updates to ball velocity
 */
function applyPhysicsUpdates(
    velocityX: number,
    velocityY: number,
    physicsFactors: PhysicsFactors,
    deltaTime: number
): { velocityX: number; velocityY: number } {
    const newVelocityY = velocityY + physicsFactors.gravity * deltaTime;

    const airResistance = calculateBallVelocityWithAirResistance(
        velocityX, newVelocityY,
        physicsFactors.airResistanceCoefficient,
        deltaTime,
        physicsFactors.ballMass
    );

    return {
        velocityX: airResistance.velocityX,
        velocityY: airResistance.velocityY
    };
}

/**
 * Apply service-guided collision response
 */
function applyServiceGuidedCollision(
    collision: CollisionEvent,
    serviceResult: ServiceResult,
    pathIndex: number,
    pegConfig: PegConfiguration,
    boardConfig: BoardConfiguration,
    physicsFactors: PhysicsFactors,
    x: number
): { velocityX: number; velocityY: number; newPathIndex: number } {
    const direction = serviceResult.path[pathIndex];
    const pegX = pegConfig.positions.find(p => p.row === collision.rowIndex && p.col === collision.columnIndex)?.x || x;
    const canvasCenter = boardConfig.width / 2;

    const targetDirection = direction === 1
        ? (pegX < canvasCenter ? 1 : (x < pegX ? 1 : -1))
        : (pegX > canvasCenter ? -1 : (x > pegX ? -1 : 1));

    const deterministicNudge = physicsFactors.nudgeStrength * 0.8;
    const velocityX = targetDirection * deterministicNudge;
    const velocityY = Math.max(0, physicsFactors.velocityY * 0.3);

    return { velocityX, velocityY, newPathIndex: pathIndex + 1 };
}

/**
 * Apply regular collision response
 */
function applyRegularCollision(
    collision: CollisionEvent,
    velocityX: number,
    velocityY: number,
    physicsFactors: PhysicsFactors
): { velocityX: number; velocityY: number } {
    const bounceResult = calculateBallBounce(
        velocityX, velocityY,
        collision.normalVector.x, collision.normalVector.y,
        physicsFactors.restitution,
        physicsFactors.friction
    );

    return {
        velocityX: bounceResult.velocityX,
        velocityY: bounceResult.velocityY
    };
}

/**
 * Apply boundary constraints
 */
function applyBoundaryConstraints(
    x: number,
    velocityX: number,
    boardConfig: BoardConfiguration,
    physicsFactors: PhysicsFactors
): { x: number; velocityX: number } {
    if (x < 10 || x > boardConfig.width - 10) {
        const newVelocityX = velocityX * -physicsFactors.restitution;
        const newX = Math.max(10, Math.min(boardConfig.width - 10, x));
        return { x: newX, velocityX: newVelocityX };
    }
    return { x, velocityX };
}

/**
 * Calculate complete ball trajectory including all collisions
 */
export function calculateCompleteTrajectory(
    serviceResult: ServiceResult,
    pegConfig: PegConfiguration,
    boardConfig: BoardConfiguration,
    physicsFactors: PhysicsFactors,
    environmentalFactors: EnvironmentalFactors,
    ballProperties: BallProperties
): BallTrajectory {
    const positions: Array<{ x: number; y: number; timestamp: number }> = [];
    const velocities: Array<{ x: number; y: number; timestamp: number }> = [];
    const collisions: CollisionEvent[] = [];

    // Initial conditions
    let x = pegConfig.positions[0]?.x || boardConfig.width / 2;
    let y = 50;
    let velocityX = physicsFactors.velocityX;
    let velocityY = physicsFactors.velocityY;
    let time = 0;
    const deltaTime = 0.008;
    let pathIndex = 0;

    // Simulate trajectory step by step
    while (y < boardConfig.height - 100 && time < 10) {
        positions.push({ x, y, timestamp: time });
        velocities.push({ x: velocityX, y: velocityY, timestamp: time });

        // Apply physics updates
        const physicsResult = applyPhysicsUpdates(velocityX, velocityY, physicsFactors, deltaTime);
        velocityX = physicsResult.velocityX;
        velocityY = physicsResult.velocityY;

        // Check for collisions
        const collision = checkPegCollisions(x, y, velocityX, velocityY, pegConfig, ballProperties, time);
        if (collision) {
            const isServiceGuided = pathIndex < serviceResult.path.length && collision.rowIndex === pathIndex;
            
            if (isServiceGuided) {
                const guidedResult = applyServiceGuidedCollision(
                    collision, serviceResult, pathIndex, pegConfig, boardConfig, physicsFactors, x
                );
                velocityX = guidedResult.velocityX;
                velocityY = guidedResult.velocityY;
                pathIndex = guidedResult.newPathIndex;
            } else {
                const regularResult = applyRegularCollision(collision, velocityX, velocityY, physicsFactors);
                velocityX = regularResult.velocityX;
                velocityY = regularResult.velocityY;
            }

            collisions.push(collision);
        }

        // Update position
        x += velocityX * deltaTime;
        y += velocityY * deltaTime;
        time += deltaTime;

        // Apply boundary constraints
        const boundaryResult = applyBoundaryConstraints(x, velocityX, boardConfig, physicsFactors);
        x = boundaryResult.x;
        velocityX = boundaryResult.velocityX;
    }

    // Calculate final position
    const finalSlot = boardConfig.slots.find(slot => slot.index === serviceResult.finalSlot);
    const finalPosition = finalSlot ? { x: finalSlot.x, y: boardConfig.height - 50 } : { x, y };

    return {
        positions,
        velocities,
        collisions,
        totalTime: time,
        totalDistance: calculateTotalDistance(positions),
        finalPosition
    };
}

/**
 * Check for peg collisions at current position
 */
function checkPegCollisions(
    x: number, y: number,
    velocityX: number, velocityY: number,
    pegConfig: PegConfiguration,
    ballProperties: BallProperties,
    time: number
): CollisionEvent | null {
    for (const peg of pegConfig.positions) {
        const distance = Math.sqrt(Math.pow(x - peg.x, 2) + Math.pow(y - peg.y, 2));
        const minDistance = pegConfig.radius + ballProperties.radius;

        if (distance < minDistance) {
            // Calculate collision normal
            const normalX = (x - peg.x) / distance;
            const normalY = (y - peg.y) / distance;

            // Calculate energy transfer
            const relativeVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            const energyTransfer = 0.5 * ballProperties.mass * relativeVelocity * relativeVelocity;

            return {
                rowIndex: peg.row,
                columnIndex: peg.col,
                position: { x, y },
                velocityBefore: { x: velocityX, y: velocityY },
                velocityAfter: { x: velocityX, y: velocityY }, // Will be updated after bounce calculation
                normalVector: { x: normalX, y: normalY },
                energyTransfer,
                timestamp: time,
                collisionType: 'peg'
            };
        }
    }
    return null;
}

/**
 * Calculate total distance traveled from position array
 */
function calculateTotalDistance(positions: Array<{ x: number; y: number }>): number {
    let totalDistance = 0;

    for (let i = 1; i < positions.length; i++) {
        const dx = positions[i].x - positions[i - 1].x;
        const dy = positions[i].y - positions[i - 1].y;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
    }

    return totalDistance;
}
