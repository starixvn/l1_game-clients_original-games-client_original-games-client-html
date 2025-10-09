import { PhysicsFactors } from '../../factors/core-factors';

// Natural Plinko physics factors for realistic arcade experience
// Balls accelerate gradually and bounce naturally like real Plinko
export const DEFAULT_CALCULATION_FACTORS: PhysicsFactors = {
    ballSize: 22,              // Base diameter, will be overridden by dynamic calculation
    ballMass: 0.001,
    gravity: 1.5,              // Extreme gravity for maximum acceleration
    airResistanceCoefficient: 0.01,  // Minimal air resistance for maximum speed
    friction: 0.2,             // Low friction for smooth movement
    restitution: 0.45,         // Natural bounce - not too bouncy, not too dead
    nudgeStrength: 8.0,        // Balanced nudge strength
    velocityX: 0,
    velocityY: 4.0,            // Very fast initial drop for high-speed Plinko
    angularVelocity: 0.05,
    pegSize: 5,
    pegSpacing: 60,
    collisionCooldown: 80,
    momentumFactor: 0.88,
    randomFactor: 0.12,
    speedFactor: 0.9
};

/**
 * Get color for multiplier value
 */
export function getMultiplierColor(multiplier: number): string {
    if (multiplier >= 50) return '#FFD700'; // Gold
    if (multiplier >= 20) return '#FF6B6B'; // Red
    if (multiplier >= 5) return '#4ECDC4';  // Teal
    if (multiplier >= 2) return '#45B7D1';  // Blue
    return '#96CEB4'; // Green
}
