import { ServiceResult, BoardConfiguration } from './types/calculation-types';
import { PhysicsFactors } from '../factors/core-factors';
import { calculatePathPredictability } from '../ball/ball-physics-calculations';
import { calculateFinalSlotFromPath } from './utils/calculation-utils';

/**
 * Analyze alternative paths and their probabilities
 */
export function analyzePathAlternatives(
    serviceResult: ServiceResult,
    boardConfig: BoardConfiguration,
    physicsFactors: PhysicsFactors
): { alternatives: Array<{ path: number[]; probability: number; finalSlot: number }>; confidence: number } {
    // Generate alternative paths with slight variations
    const alternatives: Array<{ path: number[]; probability: number; finalSlot: number }> = [];

    // Add the main path with high probability
    alternatives.push({
        path: serviceResult.path,
        probability: 0.85,
        finalSlot: serviceResult.finalSlot
    });

    // Generate variations
    for (let i = 0; i < 3; i++) {
        const variation = [...serviceResult.path];
        // Flip one random decision
        const flipIndex = Math.floor(Math.random() * variation.length); // NOSONAR
        variation[flipIndex] = 1 - variation[flipIndex];

        const finalSlot = calculateFinalSlotFromPath(variation, boardConfig.slotCount);
        alternatives.push({
            path: variation,
            probability: 0.05, // Lower probability for variations
            finalSlot
        });
    }

    // Calculate confidence based on physics predictability
    const confidence = calculatePathPredictability(physicsFactors, 100);

    return { alternatives, confidence };
}

/**
 * Calculate path confidence scores
 */
export function calculatePathConfidence(path: number[], physicsFactors: PhysicsFactors): number[] {
    // Calculate confidence for each step based on physics factors
    return path.map((decision, index) => {
        // Higher confidence for stable physics, lower for chaotic
        const baseConfidence = 1 - physicsFactors.randomFactor;
        // Reduce confidence as path progresses (accumulated uncertainty)
        const timeFactor = Math.exp(-index * 0.1);
        return baseConfidence * timeFactor;
    });
}
