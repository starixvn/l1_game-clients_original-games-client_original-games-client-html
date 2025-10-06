import { useRef, useCallback, useMemo } from 'react';
import { Bodies, Body, Composite, Engine } from 'matter-js';
import { physicsConfig, calculateBallSize, getBallPhysicsTweaks, getMiddleDropPosition } from '../../../../../lib/physics';
import { logger } from '../../../../../services/logger';
import { BallBodyExtension } from '../../../../../types/physics';

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
        // Only log detailed info in development mode
        if (process.env.NODE_ENV === 'development') {
            logger.info('🎯 [HOOK] Spawning service-guided ball:', {
                betValue,
                finalSlot,
                multiplier,
                pathLength: path.length
            });
        }

        if (!engine.current?.world) {
            logger.error('❌ [HOOK] Physics engine not ready');
            return;
        }

        try {
            const { ball } = createBall(betValue, true, 30); // Start higher for service balls to ensure collision
            const ballExtension = ball as unknown as BallBodyExtension;
            ballExtension.servicePath = path;
            ballExtension.currentPathIndex = 0;
            ballExtension.expectedFinalSlot = finalSlot;
            ballExtension.multiplier = multiplier;
            ballExtension.wrongSlotHits = 0;
            ballExtension.pinCollisions = [];

            Composite.add(engine.current.world, ball);

            const allBodies = Composite.allBodies(engine.current.world);
            const pins = allBodies.filter(body => body.label?.includes('pin'));
            const walls = allBodies.filter(body => body.label?.includes('wall'));
            const multipliers = allBodies.filter(body => body.label?.includes('multiplier'));

            console.log('✅ [HOOK] Ball added to physics world:', {
                id: ball.id,
                position: { x: ball.position.x, y: ball.position.y },
                velocity: { x: ball.velocity.x, y: ball.velocity.y },
                label: ball.label,
                isServiceGuided: ballExtension.isServiceGuided,
                servicePath: ballExtension.servicePath,
                expectedFinalSlot: ballExtension.expectedFinalSlot,
                totalBodiesInWorld: allBodies.length,
                pinsCount: pins.length,
                wallsCount: walls.length,
                multipliersCount: multipliers.length,
                samplePin: pins[0] ? { label: pins[0].label, position: { x: Math.round(pins[0].position.x), y: Math.round(pins[0].position.y) } } : 'no pins',
                sampleWall: walls[0] ? { label: walls[0].label, position: { x: Math.round(walls[0].position.x), y: Math.round(walls[0].position.y) } } : 'no walls'
            });

            if (process.env.NODE_ENV === 'development') {
                logger.info('✅ [HOOK] Service-guided ball added to world:', {
                    id: ball.id,
                    position: { x: ball.position.x, y: ball.position.y },
                    label: ball.label,
                    isServiceGuided: ballExtension.isServiceGuided,
                    servicePath: ballExtension.servicePath,
                    expectedFinalSlot: ballExtension.expectedFinalSlot
                });
            }
        } catch (error) {
            logger.error('❌ [HOOK] Error spawning service-guided ball:', error);
        }
    }, [createBall, engine, numberOfRows]);

    return {
        spawnBall,
        spawnBallWithPath,
        createBall
    };
};
