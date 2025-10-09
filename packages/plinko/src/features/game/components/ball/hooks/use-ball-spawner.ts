import { useCallback } from 'react';
import { Engine } from 'matter-js';
import { physicsLogger } from '../physics';
import { logger } from '../../../../../services/logger';
import { BallGameCalculation } from '../physics/calculations/ball-game-calculation';
import { createCalculationFromServiceResponse } from '../physics/calculations/service-integration';
import { BallFactory } from '../physics/ball/ball-factory';

interface UseBallSpawnerProps {
    numberOfRows: number;
    canvasWidth: number;
    engine: React.MutableRefObject<Engine | null>;
}

interface UseBallSpawnerReturn {
    spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number, serverRows?: number) => void;
    spawnBallWithCalculation: (calculation: BallGameCalculation) => void;
}

/**
 * Custom hook for managing ball spawning and creation
 * Handles ball physics properties, spawning logic, and service-guided ball behavior
 */
export const useBallSpawner = ({
    numberOfRows,
    canvasWidth,
    engine
}: UseBallSpawnerProps): UseBallSpawnerReturn => {
    // Pre-calculated ball spawning method - uses pre-calculated physics
    const spawnBallWithCalculation = useCallback((calculation: BallGameCalculation) => {
        if (!engine.current) {
            logger.error('❌ [PRE-CALC] No physics engine available for ball spawning');
            return;
        }

        physicsLogger?.info('🎯 [PRE-CALC] Spawning ball with enhanced pre-calculated physics', {
            component: 'BallSpawner',
            function: 'spawnBallWithCalculation',
            metadata: {
                calculationId: calculation.id,
                betValue: calculation.serviceResult.betValue,
                pathLength: calculation.serviceResult.path.length,
                finalSlot: calculation.expectedFinalSlot,
                winAmount: calculation.winAmount,
                trajectoryPoints: calculation.trajectory.positions.length,
                collisionEvents: calculation.collisions.length
            }
        });

        // Use the BallFactory to create and add the ball to the world
        BallFactory.createBallWithCalculation({
            calculation,
            numberOfRows,
            canvasWidth,
            engine: engine.current
        });

        physicsLogger?.info('✅ [PRE-CALC] Enhanced ball spawn completed', {
            component: 'BallSpawner',
            function: 'spawnBallWithCalculation',
            metadata: {
                calculationId: calculation.id,
                predictionConfidence: calculation.predictionConfidence.toFixed(3),
                calculationTime: calculation.performance.calculationTime.toFixed(2) + 'ms',
                memoryUsage: (calculation.performance.memoryUsage / 1024).toFixed(1) + 'KB',
                physicsEnhanced: true,
                trajectoryGuided: true
            }
        });
    }, [numberOfRows, canvasWidth, engine]);
    // Path-based wrapper: convert inputs to a calculation and delegate to spawnBallWithCalculation
    const spawnBallWithPath = useCallback((
        betValue: number,
        path: number[],
        finalSlot: number,
        multiplier: number,
        serverRows?: number
    ) => {
        physicsLogger?.info('🎯 [PRE-CALC] Wrapping path-based spawn via calculation system', {
            component: 'BallSpawner',
            function: 'spawnBallWithPath',
            metadata: { betValue, pathLength: path.length, finalSlot, multiplier, serverRows }
        });

        const effectiveRows = serverRows || numberOfRows;
        const serviceData = {
            path,
            finalSlot,
            multiplier,
            betValue,
            numberOfRows: effectiveRows
        };

        const calculation = createCalculationFromServiceResponse(serviceData);

        // Clear any existing active balls for single-ball gameplay
        if (engine.current) {
            BallFactory.clearActiveBalls(engine.current);
        }

        spawnBallWithCalculation(calculation);
    }, [numberOfRows, engine, spawnBallWithCalculation]);

    return {
        spawnBallWithPath,
        spawnBallWithCalculation
    };
};
