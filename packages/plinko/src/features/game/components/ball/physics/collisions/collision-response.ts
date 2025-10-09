/**
 * Collision Response Module
 * Handles collision response calculations and physics
 */

import { PhysicsFactors } from '../factors/core-factors';
import { calculateCollisionForce, calculateForcePerUnitArea, calculateDirectionChange } from '../factors/factor-relationships';
import { physicsLogger } from '../performance/physics-logger';

/**
 * Collision response result interface
 */
export interface CollisionResponse {
    velocityChange: { x: number; y: number };
    angularVelocityChange: number;
    energyLoss: number;
    impulse: { x: number; y: number };
    frictionForce: number;
}

/**
 * Calculate collision response between ball and peg
 */
export function calculateCollisionResponse(
    ballVelocity: { x: number; y: number },
    ballAngularVelocity: number,
    ballMass: number,
    ballRadius: number,
    pegVelocity: { x: number; y: number },
    pegMass: number,
    collisionNormal: { x: number; y: number },
    physicsFactors: PhysicsFactors
): CollisionResponse {
    physicsLogger.debug('Calculating collision response', {
        component: 'CollisionResponse',
        function: 'calculateCollisionResponse',
        metadata: {
            ballVelocity,
            ballAngularVelocity,
            ballMass,
            ballRadius,
            pegVelocity,
            pegMass,
            collisionNormal,
            restitution: physicsFactors.restitution
        }
    });

    // Calculate relative velocity
    const relativeVelocityX = ballVelocity.x - pegVelocity.x;
    const relativeVelocityY = ballVelocity.y - pegVelocity.y;

    // Calculate relative velocity along collision normal
    const relativeVelocityNormal = relativeVelocityX * collisionNormal.x +
        relativeVelocityY * collisionNormal.y;

    // If objects are separating, no collision response needed
    if (relativeVelocityNormal > 0) {
        return {
            velocityChange: { x: 0, y: 0 },
            angularVelocityChange: 0,
            energyLoss: 0,
            impulse: { x: 0, y: 0 },
            frictionForce: 0,
        };
    }

    // Calculate restitution (coefficient of restitution)
    const restitution = physicsFactors.restitution;

    // Calculate impulse scalar
    const impulseScalar = -(1 + restitution) * relativeVelocityNormal /
        (1 / ballMass + 1 / pegMass);

    // Calculate impulse vector
    const impulseX = impulseScalar * collisionNormal.x;
    const impulseY = impulseScalar * collisionNormal.y;

    // Calculate velocity change for ball
    const velocityChangeX = impulseX / ballMass;
    const velocityChangeY = impulseY / ballMass;

    // Calculate friction effects
    const tangentX = -collisionNormal.y;
    const tangentY = collisionNormal.x;

    const relativeVelocityTangent = relativeVelocityX * tangentX +
        relativeVelocityY * tangentY;

    const frictionImpulse = Math.min(
        Math.abs(relativeVelocityTangent) * physicsFactors.friction,
        Math.abs(impulseScalar) * physicsFactors.friction
    );

    const frictionDirection = relativeVelocityTangent > 0 ? -1 : 1;
    const frictionImpulseX = frictionImpulse * tangentX * frictionDirection;
    const frictionImpulseY = frictionImpulse * tangentY * frictionDirection;

    // Apply friction to velocity change
    const finalVelocityChangeX = velocityChangeX + frictionImpulseX / ballMass;
    const finalVelocityChangeY = velocityChangeY + frictionImpulseY / ballMass;

    // Calculate angular velocity change (simplified)
    const contactPointDistance = ballRadius; // Assume collision at edge
    const torque = frictionImpulse * contactPointDistance;
    const angularVelocityChange = torque / (ballMass * ballRadius * ballRadius * 0.4); // Simplified moment of inertia

    // Calculate energy loss
    const initialEnergy = 0.5 * ballMass *
        (ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y);
    const finalEnergy = 0.5 * ballMass *
        ((ballVelocity.x + finalVelocityChangeX) * (ballVelocity.x + finalVelocityChangeX) +
            (ballVelocity.y + finalVelocityChangeY) * (ballVelocity.y + finalVelocityChangeY));
    const energyLoss = Math.max(0, initialEnergy - finalEnergy);

    const result = {
        velocityChange: { x: finalVelocityChangeX, y: finalVelocityChangeY },
        angularVelocityChange,
        energyLoss,
        impulse: { x: impulseX + frictionImpulseX, y: impulseY + frictionImpulseY },
        frictionForce: frictionImpulse,
    };

    physicsLogger.debug('Collision response calculated', {
        component: 'CollisionResponse',
        function: 'calculateCollisionResponse',
        metadata: {
            velocityChange: result.velocityChange,
            angularVelocityChange: result.angularVelocityChange.toFixed(3),
            energyLoss: result.energyLoss.toFixed(3),
            impulse: result.impulse
        }
    });

    return result;
}

/**
 * Calculate collision force and pressure
 */
export function calculateCollisionForceAndPressure(
    collisionResponse: CollisionResponse,
    collisionArea: number,
    collisionTime: number
): {
    force: number;
    pressure: number;
    forcePerUnitArea: number;
} {
    const totalImpulse = Math.sqrt(
        collisionResponse.impulse.x * collisionResponse.impulse.x +
        collisionResponse.impulse.y * collisionResponse.impulse.y
    );

    const force = totalImpulse / collisionTime;
    const forcePerUnitArea = calculateForcePerUnitArea(force, collisionArea);
    const pressure = force / collisionArea;

    return {
        force,
        pressure,
        forcePerUnitArea,
    };
}

/**
 * Apply collision damage or wear calculations
 */
export function calculateCollisionWear(
    collisionForce: number,
    materialHardness: number = 1.0,
    collisionCount: number = 1
): {
    wearRate: number;
    durability: number;
    damage: number;
} {
    const baseWearRate = collisionForce / (materialHardness * 1000);
    const wearRate = baseWearRate * Math.sqrt(collisionCount); // Wear increases with repeated collisions

    const durability = 1 / (1 + wearRate);
    const damage = wearRate * 0.01; // Convert to damage percentage

    return {
        wearRate,
        durability,
        damage,
    };
}

/**
 * Calculate collision sound parameters
 */
export function calculateCollisionSound(
    collisionForce: number,
    ballMass: number,
    restitution: number
): {
    volume: number;
    frequency: number;
    duration: number;
} {
    const baseVolume = Math.min(1.0, collisionForce / 100);
    const volume = baseVolume * (1 + restitution) * 0.5; // Higher restitution = louder sound

    const frequency = 200 + (collisionForce / ballMass) * 50; // Higher force/mass ratio = higher pitch
    const clampedFrequency = Math.max(100, Math.min(2000, frequency));

    const duration = 0.1 + (collisionForce / 1000) * 0.2; // Stronger collisions = longer sound
    const clampedDuration = Math.max(0.05, Math.min(0.5, duration));

    return {
        volume,
        frequency: clampedFrequency,
        duration: clampedDuration,
    };
}

/**
 * Calculate collision particle effects
 */
export function calculateCollisionParticles(
    collisionPoint: { x: number; y: number },
    collisionForce: number,
    collisionNormal: { x: number; y: number }
): {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    count: number;
    size: number;
    lifetime: number;
} {
    const particleCount = Math.max(1, Math.min(10, Math.floor(collisionForce / 20)));
    const particleSize = Math.max(1, Math.min(5, collisionForce / 50));
    const particleLifetime = Math.max(0.2, Math.min(1.0, collisionForce / 200));

    // Particles spread in direction opposite to collision normal
    const spreadAngle = Math.PI / 6; // 30 degrees spread
    const baseSpeed = collisionForce / 100;

    return {
        position: collisionPoint,
        velocity: {
            x: -collisionNormal.x * baseSpeed + (Math.random() - 0.5) * spreadAngle,
            y: -collisionNormal.y * baseSpeed + (Math.random() - 0.5) * spreadAngle,
        },
        count: particleCount,
        size: particleSize,
        lifetime: particleLifetime,
    };
}

/**
 * Calculate post-collision ball trajectory stability
 */
export function calculatePostCollisionStability(
    preCollisionVelocity: { x: number; y: number },
    postCollisionVelocity: { x: number; y: number },
    physicsFactors: PhysicsFactors
): {
    stability: number;
    predictability: number;
    energyRetention: number;
} {
    const preSpeed = Math.sqrt(preCollisionVelocity.x ** 2 + preCollisionVelocity.y ** 2);
    const postSpeed = Math.sqrt(postCollisionVelocity.x ** 2 + postCollisionVelocity.y ** 2);

    const energyRetention = postSpeed / preSpeed;

    // Calculate direction change
    const directionChange = calculateDirectionChange(
        preCollisionVelocity.x, preCollisionVelocity.y,
        postCollisionVelocity.x, postCollisionVelocity.y
    );

    // Stability is higher when energy retention is close to restitution coefficient
    const stability = 1 - Math.abs(energyRetention - physicsFactors.restitution);

    // Predictability decreases with high direction changes
    const predictability = Math.max(0, 1 - Math.abs(directionChange) / Math.PI);

    return {
        stability: Math.max(0, Math.min(1, stability)),
        predictability: Math.max(0, Math.min(1, predictability)),
        energyRetention: Math.max(0, Math.min(1, energyRetention)),
    };
}

/**
 * Advanced collision response with material properties
 */
export function calculateAdvancedCollisionResponse(
    ballMaterial: {
        restitution: number;
        friction: number;
        hardness: number;
        density: number;
    },
    pegMaterial: {
        restitution: number;
        friction: number;
        hardness: number;
        density: number;
    },
    collisionForce: number
): CollisionResponse {
    // Combine material properties
    const combinedRestitution = Math.min(ballMaterial.restitution, pegMaterial.restitution);
    const combinedFriction = (ballMaterial.friction + pegMaterial.friction) / 2;

    // Simplified response calculation
    const energyLoss = collisionForce * (1 - combinedRestitution) / 1000;
    const frictionForce = collisionForce * combinedFriction / 100;

    return {
        velocityChange: { x: 0, y: 0 }, // Would need full collision calculation
        angularVelocityChange: 0,
        energyLoss,
        impulse: { x: 0, y: 0 },
        frictionForce,
    };
}
