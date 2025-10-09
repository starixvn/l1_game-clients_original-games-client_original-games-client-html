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
    let x = pegConfig.positions[0]?.x || boardConfig.width / 2; // Start at first peg row center
    let y = 50; // Start above first peg row
    let velocityX = physicsFactors.velocityX;
    let velocityY = physicsFactors.velocityY;
    let time = 0;
    const deltaTime = 0.008; // 120 FPS for more accurate trajectory calculation

    // Path index for service-guided movement
    let pathIndex = 0;

    // Simulate trajectory step by step
    while (y < boardConfig.height - 100 && time < 10) { // Stop near bottom or after 10 seconds
        // Store current state
        positions.push({ x, y, timestamp: time });
        velocities.push({ x: velocityX, y: velocityY, timestamp: time });

        // Apply physics
        velocityY += physicsFactors.gravity * deltaTime;

        // Apply air resistance
        const airResistance = calculateBallVelocityWithAirResistance(
            velocityX, velocityY,
            physicsFactors.airResistanceCoefficient,
            deltaTime,
            physicsFactors.ballMass
        );
        velocityX = airResistance.velocityX;
        velocityY = airResistance.velocityY;

        // Check for peg collisions
        const collision = checkPegCollisions(x, y, velocityX, velocityY, pegConfig, ballProperties, time);
        if (collision) {
            // Get the current row from the collision
            const currentRow = collision.rowIndex;

            // Apply service-guided direction for this row if available
            if (pathIndex < serviceResult.path.length && currentRow === pathIndex) {
                const direction = serviceResult.path[pathIndex]; // 0 = left, 1 = right

                // Calculate deterministic direction based on service path
                const pegX = pegConfig.positions.find(p => p.row === currentRow && p.col === collision.columnIndex)?.x || x;
                const canvasCenter = boardConfig.width / 2;

                // Determine target direction based on service path
                let targetDirection;
                if (direction === 1) {
                    // Go right - target should be to the right of current position
                    targetDirection = pegX < canvasCenter ? 1 : (x < pegX ? 1 : -1);
                } else {
                    // Go left - target should be to the left of current position
                    targetDirection = pegX > canvasCenter ? -1 : (x > pegX ? -1 : 1);
                }

                // Apply stronger deterministic guidance to ensure path follows service result
                const deterministicNudge = physicsFactors.nudgeStrength * 0.8; // Stronger guidance
                velocityX = targetDirection * deterministicNudge;

                // Add upward bounce for natural feel
                velocityY = Math.max(velocityY * 0.7, physicsFactors.velocityY * 0.3);

                pathIndex++;
            } else {
                // Apply collision response with realistic bounce for non-guided collisions
                const bounceResult = calculateBallBounce(
                    velocityX, velocityY,
                    collision.normalVector.x, collision.normalVector.y,
                    physicsFactors.restitution,
                    physicsFactors.friction
                );

                velocityX = bounceResult.velocityX;
                velocityY = bounceResult.velocityY;
            }

            collisions.push(collision);
        }

        // Update position
        x += velocityX * deltaTime;
        y += velocityY * deltaTime;
        time += deltaTime;

        // Boundary checks
        if (x < 10 || x > boardConfig.width - 10) {
            velocityX *= -physicsFactors.restitution; // Bounce off walls
            x = Math.max(10, Math.min(boardConfig.width - 10, x));
        }
    }

    // Calculate final position based on service result
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
