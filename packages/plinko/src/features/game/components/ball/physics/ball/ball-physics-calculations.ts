/**
 * Ball Physics Calculations Module
 * Implements ball-specific physics calculations and relationships
 */

import { PhysicsFactors } from '../factors/core-factors';
import { calculateAirResistanceForce, calculateTerminalVelocity } from '../factors/factor-relationships';

/**
 * Calculate ball velocity with air resistance
 * Applies air resistance damping to velocity components
 */
export function calculateBallVelocityWithAirResistance(
    velocityX: number,
    velocityY: number,
    airResistanceCoefficient: number,
    deltaTime: number,
    mass: number
): { velocityX: number; velocityY: number } {
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    if (speed === 0) {
        return { velocityX: 0, velocityY: 0 };
    }

    // Calculate air resistance force
    const airResistanceForce = calculateAirResistanceForce(airResistanceCoefficient, speed);

    // Calculate acceleration due to air resistance
    const airResistanceAcceleration = airResistanceForce / mass;

    // Calculate damping factor
    const dampingFactor = Math.max(0.9, 1 - (airResistanceAcceleration * deltaTime) / speed);

    return {
        velocityX: velocityX * dampingFactor,
        velocityY: velocityY * dampingFactor,
    };
}

/**
 * Calculate ball bounce behavior
 */
export function calculateBallBounce(
    velocityX: number,
    velocityY: number,
    normalX: number,
    normalY: number,
    restitution: number,
    friction: number
): { velocityX: number; velocityY: number; angularVelocity: number } {
    // Natural Plinko bounce - more realistic energy conservation and direction
    const dotProduct = velocityX * normalX + velocityY * normalY;

    // Normal component (perpendicular to surface) - primary bounce
    const normalVelocity = dotProduct;
    const reflectedNormal = -normalVelocity * restitution; // Bounce with energy loss

    // Tangential component (parallel to surface) - sliding/friction
    const tangentX = -normalY;
    const tangentY = normalX;
    const tangentVelocity = velocityX * tangentX + velocityY * tangentY;

    // Natural friction - reduces tangential velocity more realistically
    const frictionCoefficient = friction * 0.6; // Softer friction for natural feel
    const frictionReduction = Math.abs(tangentVelocity) * frictionCoefficient;
    const reducedTangentVelocity = tangentVelocity * (1 - frictionCoefficient);

    // Reconstruct velocity components with natural bounce
    const newVelocityX = (reflectedNormal * normalX) + (reducedTangentVelocity * tangentX);
    const newVelocityY = (reflectedNormal * normalY) + (reducedTangentVelocity * tangentY);

    // Angular velocity from friction - subtle spin like real balls
    const angularVelocity = frictionReduction * 0.08; // Reduced for natural feel

    return {
        velocityX: newVelocityX,
        velocityY: newVelocityY,
        angularVelocity,
    };
}

/**
 * Calculate ball trajectory prediction
 */
export function predictBallTrajectory(
    initialX: number,
    initialY: number,
    initialVelocityX: number,
    initialVelocityY: number,
    physicsFactors: PhysicsFactors,
    timeSteps: number = 100,
    deltaTime: number = 0.016
): Array<{ x: number; y: number; velocityX: number; velocityY: number }> {
    const trajectory: Array<{ x: number; y: number; velocityX: number; velocityY: number }> = [];

    let x = initialX;
    let y = initialY;
    let velocityX = initialVelocityX;
    let velocityY = initialVelocityY;

    for (let i = 0; i < timeSteps; i++) {
        // Store current position
        trajectory.push({ x, y, velocityX, velocityY });

        // Apply gravity
        velocityY += physicsFactors.gravity * deltaTime;

        // Apply air resistance
        const airResistance = calculateBallVelocityWithAirResistance(
            velocityX,
            velocityY,
            physicsFactors.airResistanceCoefficient,
            deltaTime,
            physicsFactors.ballMass
        );

        velocityX = airResistance.velocityX;
        velocityY = airResistance.velocityY;

        // Update position
        x += velocityX * deltaTime;
        y += velocityY * deltaTime;

        // Break if ball has fallen too far
        if (y > initialY + 1000) break;
    }

    return trajectory;
}

/**
 * Calculate optimal nudge strength for ball control
 */
export function calculateOptimalNudgeStrength(
    ballMass: number,
    targetVelocityChange: number,
    timeWindow: number
): number {
    // Formula: F = (m × Δv) / t
    return (ballMass * targetVelocityChange) / timeWindow;
}

/**
 * Calculate ball stability metrics
 */
export function calculateBallStabilityMetrics(
    physicsFactors: PhysicsFactors
): {
    terminalVelocityRatio: number;
    bounceStability: number;
    controlResponsiveness: number;
    collisionSafety: number;
} {
    const terminalVelocity = calculateTerminalVelocity(
        physicsFactors.ballMass,
        physicsFactors.gravity,
        physicsFactors.airResistanceCoefficient
    );

    const terminalVelocityRatio = terminalVelocity / physicsFactors.velocityY;

    const bounceStability = 1 / (1 + physicsFactors.restitution * physicsFactors.friction);

    const controlResponsiveness = 1 / (1 + physicsFactors.airResistanceCoefficient * physicsFactors.velocityY);

    const collisionArea = Math.PI * Math.pow(physicsFactors.ballSize, 2);
    const collisionSafety = collisionArea / (physicsFactors.ballMass * 1000); // Normalized safety metric

    return {
        terminalVelocityRatio,
        bounceStability,
        controlResponsiveness,
        collisionSafety,
    };
}

/**
 * Calculate ball path predictability score
 */
export function calculatePathPredictability(
    physicsFactors: PhysicsFactors,
    trajectoryLength: number = 100
): number {
    // Simulate multiple trajectories with slight variations
    const baseTrajectory = predictBallTrajectory(
        0, 0, physicsFactors.velocityX, physicsFactors.velocityY,
        physicsFactors, trajectoryLength
    );

    const variations = 10;
    const variationMagnitude = physicsFactors.randomFactor * 0.1;

    let totalDeviation = 0;

    for (let i = 0; i < variations; i++) {
        const variedVelocityX = physicsFactors.velocityX + (Math.random() - 0.5) * variationMagnitude;
        const variedVelocityY = physicsFactors.velocityY + (Math.random() - 0.5) * variationMagnitude;

        const variedTrajectory = predictBallTrajectory(
            0, 0, variedVelocityX, variedVelocityY,
            physicsFactors, trajectoryLength
        );

        // Calculate average deviation
        for (let j = 0; j < Math.min(baseTrajectory.length, variedTrajectory.length); j++) {
            const dx = baseTrajectory[j].x - variedTrajectory[j].x;
            const dy = baseTrajectory[j].y - variedTrajectory[j].y;
            totalDeviation += Math.sqrt(dx * dx + dy * dy);
        }
    }

    const averageDeviation = totalDeviation / (variations * trajectoryLength);

    // Convert to predictability score (0-1, higher is more predictable)
    return Math.max(0, 1 - averageDeviation / 10);
}

/**
 * Calculate ball energy dissipation rate
 */
export function calculateEnergyDissipationRate(
    physicsFactors: PhysicsFactors,
    timeSpan: number = 1.0
): number {
    const initialEnergy = 0.5 * physicsFactors.ballMass *
        (Math.pow(physicsFactors.velocityX, 2) + Math.pow(physicsFactors.velocityY, 2));

    // Simulate energy loss over time
    let currentVelocityX = physicsFactors.velocityX;
    let currentVelocityY = physicsFactors.velocityY;
    let time = 0;
    const deltaTime = 0.016;

    while (time < timeSpan) {
        // Apply gravity
        currentVelocityY += physicsFactors.gravity * deltaTime;

        // Apply air resistance
        const airResistance = calculateBallVelocityWithAirResistance(
            currentVelocityX,
            currentVelocityY,
            physicsFactors.airResistanceCoefficient,
            deltaTime,
            physicsFactors.ballMass
        );

        currentVelocityX = airResistance.velocityX;
        currentVelocityY = airResistance.velocityY;

        time += deltaTime;
    }

    const finalEnergy = 0.5 * physicsFactors.ballMass *
        (Math.pow(currentVelocityX, 2) + Math.pow(currentVelocityY, 2));

    // Return dissipation rate (energy lost per second)
    return (initialEnergy - finalEnergy) / timeSpan;
}
