import { CollisionEvent, BallTrajectory, BallGameCalculation } from './types/calculation-types';
import { PhysicsFactors } from '../../factors/core-factors';

/**
 * Analyze all collisions in trajectory
 */
export function analyzeTrajectoryCollisions(
    trajectory: BallTrajectory,
    pegConfig: any // PegConfiguration type
): CollisionEvent[] {
    // Collisions are already calculated in calculateCompleteTrajectory
    return trajectory.collisions;
}

/**
 * Calculate collision statistics
 */
export function calculateCollisionStats(
    collisions: CollisionEvent[],
    physicsFactors: PhysicsFactors
): BallGameCalculation['collisionStats'] {
    const pegCollisions = collisions.filter(c => c.collisionType === 'peg').length;
    const wallCollisions = collisions.filter(c => c.collisionType === 'wall').length;

    const totalEnergyTransfer = collisions.reduce((sum, c) => sum + c.energyTransfer, 0);
    const averageCollisionForce = collisions.length > 0 ? totalEnergyTransfer / collisions.length : 0;

    // Calculate energy loss as percentage of initial energy
    const initialEnergy = 0.5 * physicsFactors.ballMass *
        (Math.pow(physicsFactors.velocityX, 2) + Math.pow(physicsFactors.velocityY, 2));
    const energyLoss = totalEnergyTransfer / initialEnergy;

    return {
        totalCollisions: collisions.length,
        pegCollisions,
        wallCollisions,
        averageCollisionForce,
        energyLoss
    };
}
