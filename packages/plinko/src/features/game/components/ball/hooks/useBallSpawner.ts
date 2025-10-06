import { useRef, useCallback, useMemo } from 'react';
import { Bodies, Body, Composite, Engine } from 'matter-js';
import { physicsConfig, calculateBallSize, getBallPhysicsTweaks, getMiddleDropPosition } from '../../../../../lib/physics';
import { logger } from '../../../../../services/logger';

interface BallBodyExtension {
    world?: Engine['world'];
    isServiceGuided?: boolean;
    expectedFinalSlot?: number;
    multiplier?: number;
    betValue?: number;
    hasTriggeredWin?: boolean;
    servicePath?: number[];
    currentPathIndex?: number;
    isRemoved?: boolean;
    createdAt?: number;
    wrongSlotHits?: number;
    pinCollisions?: string[];
}

interface UseBallSpawnerProps {
    numberOfRows: number;
    canvasWidth: number;
    engine: React.MutableRefObject<Engine | null>;
}

interface UseBallSpawnerReturn {
    spawnBall: (betValue?: number) => void;
    spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => void;
    createBall: (betValue: number, isServiceGuided?: boolean, startY?: number) => { ball: Body };
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
    // Prevent rapid successive ball drops
    const lastSpawnTimeRef = useRef<number>(0);
    const minSpawnInterval = 500;
    const removedBallsRef = useRef<Set<number>>(new Set());

    // Memoize ball creation parameters to avoid recalculating on every spawn
    const ballCreationParams = useMemo(() => {
        const ballRadius = calculateBallSize(numberOfRows, 1);
        const physicsTweaks = getBallPhysicsTweaks(ballRadius);
        const ballX = getMiddleDropPosition(canvasWidth);

        return {
            ballRadius,
            physicsTweaks,
            ballX
        };
    }, [numberOfRows, canvasWidth]);

    // Helper to create ball with physics properties
    const createBall = useCallback((betValue: number, isServiceGuided = false, startY = 30) => {
        const { ballRadius, physicsTweaks, ballX } = ballCreationParams;
        const ballColor = betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

        const ball = Bodies.circle(ballX, startY, ballRadius, {
            restitution: physicsTweaks.restitution,
            friction: isServiceGuided ? 0.1 : 0.6,
            frictionAir: physicsTweaks.frictionAir,
            density: physicsTweaks.density,
            collisionFilter: { group: -1 },
            render: isServiceGuided ? {
                fillStyle: ballColor,
                strokeStyle: "#FFD700",
                lineWidth: 1,
            } : { fillStyle: ballColor },
            label: isServiceGuided ? "service-guided-ball" : `ball-${betValue}`,
            isStatic: false,
        });

        const ballExtension = ball as unknown as BallBodyExtension;
        ballExtension.createdAt = Date.now();
        ballExtension.world = engine.current?.world;
        ballExtension.betValue = betValue;
        ballExtension.isServiceGuided = isServiceGuided;

        return { ball };
    }, [ballCreationParams, engine]);

    // Memoized spawn methods to prevent unnecessary re-renders
    const spawnBall = useCallback((betValue: number = 1) => {
        const now = Date.now();
        if (now - lastSpawnTimeRef.current < minSpawnInterval) return;

        lastSpawnTimeRef.current = now;
        removedBallsRef.current.clear();

        if (!engine.current) return;

        const { ball } = createBall(betValue);
        ball.position.x += (Math.random() - 0.5) * 4; // Add random offset

        Composite.add(engine.current.world, ball);
    }, [createBall, engine]);

    const spawnBallWithPath = useCallback((betValue: number, path: number[], finalSlot: number, multiplier: number) => {
        logger.info('🎯 [HOOK] SPAWNING BALL WITH SERVICE PATH:', {
            betValue,
            path,
            finalSlot,
            multiplier,
            pathLength: path.length,
            expectedRows: numberOfRows,
            expectedFinalSlot: path.filter(p => p === 1).length,
            engineExists: !!engine.current,
            engineWorldExists: !!engine.current?.world
        });

        if (!engine.current) {
            logger.error('❌ [HOOK] No physics engine available');
            return;
        }

        if (!engine.current.world) {
            logger.error('❌ [HOOK] No physics world available');
            return;
        }

        try {
            const { ball } = createBall(betValue, true, 40); // Start slightly lower for service balls
            const ballExtension = ball as unknown as BallBodyExtension;
            ballExtension.servicePath = path;
            ballExtension.currentPathIndex = 0;
            ballExtension.expectedFinalSlot = finalSlot;
            ballExtension.multiplier = multiplier;
            ballExtension.wrongSlotHits = 0;
            ballExtension.pinCollisions = [];

            logger.info('✅ [HOOK] Ball created:', {
                id: ball.id,
                label: ball.label,
                position: ball.position,
                isServiceGuided: ballExtension.isServiceGuided,
                servicePath: ballExtension.servicePath
            });

            Composite.add(engine.current.world, ball);
            logger.info('✅ [HOOK] Ball added to physics world - now falling!');
        } catch (error) {
            logger.error('❌ [HOOK] Error creating/spawning ball:', error);
        }
    }, [createBall, engine, numberOfRows]);

    return {
        spawnBall,
        spawnBallWithPath,
        createBall
    };
};
