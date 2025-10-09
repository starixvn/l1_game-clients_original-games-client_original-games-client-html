/**
 * Peg Interaction Module
 * Handles peg geometry and ball-peg interaction relationships
 */

import { PhysicsFactors } from '../factors/core-factors';
import { calculateCollisionProbability, calculatePathControlEffectiveness } from '../factors/factor-relationships';
import { physicsLogger } from '../performance/physics-logger';

/**
 * Peg geometry interface
 */
export interface PegGeometry {
    position: { x: number; y: number };
    radius: number;
    type: 'standard' | 'bumper' | 'spinner';
    material: {
        restitution: number;
        friction: number;
        hardness: number;
    };
}

/**
 * Peg interaction result interface
 */
export interface PegInteractionResult {
    collisionProbability: number;
    pathDeflectionAngle: number;
    energyTransfer: number;
    controlEffectiveness: number;
    interactionZone: {
        center: { x: number; y: number };
        radius: number;
        coverage: number;
    };
}

/**
 * Calculate peg interaction characteristics
 */
export function calculatePegInteraction(
    peg: PegGeometry,
    ballRadius: number,
    ballVelocity: { x: number; y: number },
    physicsFactors: PhysicsFactors
): PegInteractionResult {
    physicsLogger.debug('Calculating peg interaction', {
        component: 'PegInteraction',
        function: 'calculatePegInteraction',
        metadata: {
            peg,
            ballRadius,
            ballVelocity,
            pegSpacing: physicsFactors.pegSpacing
        }
    });

    // Collision probability
    const collisionProbability = calculateCollisionProbability(
        ballRadius,
        peg.radius,
        physicsFactors.pegSpacing
    );

    // Path deflection based on peg position and ball trajectory
    const pathDeflectionAngle = calculatePathDeflectionAngle(peg, ballVelocity);

    // Energy transfer efficiency
    const energyTransfer = calculateEnergyTransferEfficiency(peg, physicsFactors);

    // Path control effectiveness
    const ballDiameter = ballRadius * 2;
    const controlEffectiveness = calculatePathControlEffectiveness(
        ballDiameter,
        physicsFactors.pegSpacing
    );

    // Interaction zone
    const interactionZone = {
        center: peg.position,
        radius: peg.radius + ballRadius,
        coverage: (Math.PI / 4) / (2 * Math.PI), // 45-degree coverage
    };

    const result = {
        collisionProbability,
        pathDeflectionAngle,
        energyTransfer,
        controlEffectiveness,
        interactionZone,
    };

    physicsLogger.debug('Peg interaction calculated', {
        component: 'PegInteraction',
        function: 'calculatePegInteraction',
        metadata: {
            collisionProbability: result.collisionProbability.toFixed(3),
            pathDeflectionAngle: result.pathDeflectionAngle.toFixed(2),
            energyTransfer: result.energyTransfer.toFixed(3),
            controlEffectiveness: result.controlEffectiveness.toFixed(3)
        }
    });

    return result;
}

/**
 * Calculate path deflection angle for peg collision
 */
export function calculatePathDeflectionAngle(
    peg: PegGeometry,
    ballVelocity: { x: number; y: number }
): number {
    const velocityAngle = Math.atan2(ballVelocity.y, ballVelocity.x);
    const pegAngle = Math.atan2(peg.position.y, peg.position.x);

    // Simplified deflection calculation
    const relativeAngle = velocityAngle - pegAngle;
    const deflectionAngle = 2 * relativeAngle; // Elastic collision approximation

    return deflectionAngle;
}

/**
 * Calculate energy transfer efficiency
 */
export function calculateEnergyTransferEfficiency(
    peg: PegGeometry,
    physicsFactors: PhysicsFactors
): number {
    // Combine peg and ball restitution
    const combinedRestitution = (peg.material.restitution + physicsFactors.restitution) / 2;

    // Factor in material hardness
    const hardnessFactor = Math.min(peg.material.hardness, 1.0);

    return combinedRestitution * hardnessFactor;
}

/**
 * Calculate peg placement optimization for board layout
 */
export function optimizePegPlacement(
    rows: number,
    pegSpacing: number,
    canvasWidth: number,
    ballRadius: number
): {
    positions: Array<{ x: number; y: number }>;
    optimalSpacing: number;
    coverage: number;
} {
    const positions: Array<{ x: number; y: number }> = [];
    const startY = 100; // Top margin
    const rowHeight = pegSpacing * 0.866; // Hexagonal spacing

    // Calculate optimal horizontal spacing
    const pegsPerRow = Math.floor(canvasWidth / pegSpacing);
    const actualSpacing = canvasWidth / (pegsPerRow - 1);
    const startX = (canvasWidth - (pegsPerRow - 1) * actualSpacing) / 2;

    for (let row = 0; row < rows; row++) {
        const y = startY + row * rowHeight;
        const rowOffset = (row % 2) * (actualSpacing / 2); // Staggered rows

        for (let col = 0; col < pegsPerRow; col++) {
            const x = startX + col * actualSpacing + rowOffset;
            positions.push({ x, y });
        }
    }

    // Calculate coverage (area covered by peg interaction zones)
    const totalArea = canvasWidth * (rows * rowHeight);
    const pegInteractionArea = positions.length * Math.PI * (ballRadius * 2) ** 2;
    const coverage = Math.min(1, pegInteractionArea / totalArea);

    return {
        positions,
        optimalSpacing: actualSpacing,
        coverage,
    };
}

/**
 * Calculate peg influence zones
 */
export function calculatePegInfluenceZones(
    pegs: PegGeometry[],
    ballRadius: number,
    influenceRadius: number = 50
): Array<{
    pegIndex: number;
    zone: { center: { x: number; y: number }; radius: number };
    overlappingZones: number[];
}> {
    const zones = pegs.map((peg, index) => ({
        pegIndex: index,
        zone: {
            center: peg.position,
            radius: influenceRadius,
        },
        overlappingZones: [] as number[],
    }));

    // Find overlapping zones
    for (let i = 0; i < zones.length; i++) {
        for (let j = i + 1; j < zones.length; j++) {
            const dx = zones[i].zone.center.x - zones[j].zone.center.x;
            const dy = zones[i].zone.center.y - zones[j].zone.center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < zones[i].zone.radius + zones[j].zone.radius) {
                zones[i].overlappingZones.push(j);
                zones[j].overlappingZones.push(i);
            }
        }
    }

    return zones;
}

/**
 * Analyze peg board collision patterns
 */
export function analyzePegBoardCollisions(
    pegs: PegGeometry[],
    physicsFactors: PhysicsFactors
): {
    collisionHotspots: Array<{ x: number; y: number; intensity: number }>;
    pathComplexity: number;
    predictability: number;
} {
    const collisionHotspots: Array<{ x: number; y: number; intensity: number }> = [];

    // Analyze each peg for collision patterns
    pegs.forEach((peg, index) => {
        const interaction = calculatePegInteraction(
            peg,
            physicsFactors.ballSize,
            { x: physicsFactors.velocityX, y: physicsFactors.velocityY },
            physicsFactors
        );

        collisionHotspots.push({
            x: peg.position.x,
            y: peg.position.y,
            intensity: interaction.collisionProbability,
        });
    });

    // Calculate path complexity (based on peg density and interaction)
    const averageInteractions = collisionHotspots.reduce(
        (sum, hotspot) => sum + hotspot.intensity, 0
    ) / collisionHotspots.length;

    const pathComplexity = Math.min(1, averageInteractions * pegs.length / 100);

    // Calculate predictability (inverse of randomness)
    const predictability = 1 - physicsFactors.randomFactor;

    return {
        collisionHotspots,
        pathComplexity,
        predictability,
    };
}

/**
 * Optimize peg properties for gameplay balance
 */
export function optimizePegProperties(
    basePeg: PegGeometry,
    targetDifficulty: number, // 0-1 scale
    physicsFactors: PhysicsFactors
): PegGeometry {
    const optimizedPeg = { ...basePeg };

    // Adjust restitution based on difficulty
    if (targetDifficulty < 0.3) {
        // Easy mode: more bouncy pegs
        optimizedPeg.material.restitution = Math.min(0.9, basePeg.material.restitution * 1.2);
    } else if (targetDifficulty > 0.7) {
        // Hard mode: less bouncy pegs
        optimizedPeg.material.restitution = Math.max(0.1, basePeg.material.restitution * 0.8);
    }

    // Adjust friction based on physics factors
    optimizedPeg.material.friction = physicsFactors.friction * 1.1; // Slightly higher than ball friction

    // Adjust hardness for durability
    optimizedPeg.material.hardness = 0.8; // Standard hardness

    return optimizedPeg;
}

/**
 * Calculate peg wear patterns
 */
export function calculatePegWearPatterns(
    pegs: PegGeometry[],
    collisionHistory: Array<{ pegIndex: number; force: number; timestamp: number }>
): Array<{
    pegIndex: number;
    wearLevel: number;
    stressPoints: number;
    recommendedMaintenance: boolean;
}> {
    const wearPatterns = pegs.map((peg, index) => {
        const pegCollisions = collisionHistory.filter(h => h.pegIndex === index);

        const totalStress = pegCollisions.reduce((sum, collision) => {
            // Wear increases with collision force and frequency
            return sum + collision.force * Math.sqrt(pegCollisions.length);
        }, 0);

        const wearLevel = Math.min(1, totalStress / 10000);
        const stressPoints = pegCollisions.length;
        const recommendedMaintenance = wearLevel > 0.7 || stressPoints > 1000;

        return {
            pegIndex: index,
            wearLevel,
            stressPoints,
            recommendedMaintenance,
        };
    });

    return wearPatterns;
}

/**
 * Generate peg layout variations for different game modes
 */
export function generatePegLayoutVariations(
    baseLayout: PegGeometry[],
    variationType: 'dense' | 'sparse' | 'clustered' | 'random'
): PegGeometry[] {
    switch (variationType) {
        case 'dense':
            return baseLayout.map(peg => ({
                ...peg,
                radius: peg.radius * 1.2,
            }));

        case 'sparse':
            return baseLayout.filter((_, index) => index % 2 === 0);

        case 'clustered':
            // Group pegs into clusters
            return baseLayout.map((peg, index) => ({
                ...peg,
                position: {
                    x: peg.position.x + (index % 3 - 1) * 10,
                    y: peg.position.y + (Math.floor(index / 3) % 3 - 1) * 10,
                },
            }));

        case 'random':
            return baseLayout.map(peg => ({
                ...peg,
                position: {
                    x: peg.position.x + (Math.random() - 0.5) * 20,
                    y: peg.position.y + (Math.random() - 0.5) * 20,
                },
            }));

        default:
            return baseLayout;
    }
}
