import { BallTrajectory, CollisionEvent, BallGameCalculation, BoardConfiguration } from '../types/calculation-types';
import { PhysicsFactors } from '../../factors/core-factors';
import { calculateTerminalVelocity } from '../../factors/factor-relationships';

/**
 * Calculate total distance traveled from position array
 */
export function calculateTotalDistance(positions: Array<{ x: number; y: number }>): number {
    let totalDistance = 0;

    for (let i = 1; i < positions.length; i++) {
        const dx = positions[i].x - positions[i - 1].x;
        const dy = positions[i].y - positions[i - 1].y;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
    }

    return totalDistance;
}

/**
 * Calculate memory usage estimate for trajectory and collisions
 */
export function calculateMemoryUsage(trajectory: BallTrajectory, collisions: CollisionEvent[]): number {
    // Rough estimate: positions + velocities + collisions
    const positionSize = trajectory.positions.length * (2 * 8 + 8); // x, y, timestamp (doubles)
    const velocitySize = trajectory.velocities.length * (2 * 8 + 8); // x, y, timestamp
    const collisionSize = collisions.length * (4 * 8 + 4 * 8 + 8 + 4); // Various numbers + string enum

    return positionSize + velocitySize + collisionSize;
}

/**
 * Calculate final slot from path decisions
 */
export function calculateFinalSlotFromPath(path: number[], slotCount: number): number {
    let position = slotCount / 2; // Start in middle

    for (const decision of path) {
        if (decision === 1) {
            position += 0.5; // Move right
        } else {
            position -= 0.5; // Move left
        }

        // Keep within bounds
        position = Math.max(0, Math.min(slotCount - 1, position));
    }

    return Math.round(position);
}

/**
 * Calculate physics stability metrics
 */
export function calculateStabilityMetrics(physicsFactors: PhysicsFactors): BallGameCalculation['stabilityMetrics'] {
    // Reuse existing stability calculation logic
    const terminalVelocity = calculateTerminalVelocity(
        physicsFactors.ballMass,
        physicsFactors.gravity,
        physicsFactors.airResistanceCoefficient
    );

    const terminalVelocityRatio = terminalVelocity / physicsFactors.velocityY;
    const bounceStability = 1 / (1 + physicsFactors.restitution * physicsFactors.friction);
    const controlResponsiveness = 1 / (1 + physicsFactors.airResistanceCoefficient * physicsFactors.velocityY);
    const collisionArea = Math.PI * Math.pow(physicsFactors.ballSize, 2);
    const collisionSafety = collisionArea / (physicsFactors.ballMass * 1000);

    return {
        terminalVelocityRatio,
        bounceStability,
        controlResponsiveness,
        collisionSafety
    };
}

/**
 * Create a default board configuration for standard Plinko games
 */
export function createDefaultBoardConfig(slotCount: number = 9, rows?: number): BoardConfiguration {
    const slots: Array<{ index: number; x: number; multiplier: number; color: string }> = [];
    const multipliers = [0.5, 1, 2, 5, 10, 20, 50, 100, 200]; // Standard multipliers
    const { getMultiplierColor } = require('../config/calculation-config');

    // If rows not specified, assume rows = slotCount - 1 (standard Plinko)
    const numRows = rows !== undefined ? rows : slotCount - 1;

    for (let i = 0; i < slotCount; i++) {
        const x = (i + 0.5) * (600 / slotCount); // Distribute across width
        slots.push({
            index: i,
            x,
            multiplier: multipliers[i] || 1,
            color: getMultiplierColor(multipliers[i] || 1)
        });
    }

    return {
        width: 600,
        height: 800,
        layout: 'pyramid',
        rows: numRows,
        slotCount,
        slots
    };
}
