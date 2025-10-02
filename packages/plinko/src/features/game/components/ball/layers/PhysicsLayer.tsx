import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Bodies, Body, Composite, Engine, Events, Runner, World } from 'matter-js';
import { BallLayoutProps } from '../../../../../shared/types';
import { logger } from '../../../../../services/logger';

// Ball Path Trail Layer Component
interface BallPathLayerProps {
    ballPaths: Map<number, Array<{ x: number, y: number, timestamp: number, radius?: number }>>;
    width: number;
    height: number;
    boardDimensions: {
        topMargin: number;
        bottomMargin: number;
        leftMargin: number;
        rightMargin: number;
        boardWidth: number;
        boardHeight: number;
        boardX: number;
        triangleTopX: number;
        triangleTopY: number;
        triangleBottomLeftX: number;
        triangleBottomLeftY: number;
        triangleBottomRightX: number;
        triangleBottomRightY: number;
    } | null;
    className?: string;
}

const BallPathLayer: React.FC<BallPathLayerProps> = ({
    ballPaths,
    width,
    height,
    boardDimensions,
    className = 'ball-path-layer'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Only render if we have board dimensions for clipping
        if (!boardDimensions) return;

        ctx.save();

        // Apply the same triangular clipping as the board layer
        const { triangleTopX, triangleTopY, triangleBottomLeftX, triangleBottomLeftY, triangleBottomRightX, triangleBottomRightY } = boardDimensions;
        ctx.beginPath();
        ctx.moveTo(triangleTopX, triangleTopY);
        ctx.lineTo(triangleBottomLeftX, triangleBottomLeftY);
        ctx.lineTo(triangleBottomRightX, triangleBottomRightY);
        ctx.closePath();
        ctx.clip();

        // Draw ball path lines
        ballPaths.forEach((path) => {
            if (path.length < 2) return;

            // Get ball radius from the first path point (should be consistent for each ball)
            const ballRadius = path[0].radius || 5;
            const trailWidth = Math.max(1, Math.min(4, ballRadius * 0.3)); // Scale trail width with ball size

            // Create gradient for trail effect
            const gradient = ctx.createLinearGradient(
                path[0].x, path[0].y,
                path[path.length - 1].x, path[path.length - 1].y
            );
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)'); // Gold with high opacity at start
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)'); // Gold with low opacity at end

            ctx.strokeStyle = gradient;
            ctx.lineWidth = trailWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);

            // Draw smooth curve through path points
            for (let i = 1; i < path.length - 1; i++) {
                const xc = (path[i].x + path[i + 1].x) / 2;
                const yc = (path[i].y + path[i + 1].y) / 2;
                ctx.quadraticCurveTo(path[i].x, path[i].y, xc, yc);
            }

            // Draw last segment
            if (path.length > 1) {
                ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y);
            }

            ctx.stroke();
        });

        ctx.restore();

    }, [ballPaths, width, height, boardDimensions]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={className}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 6, // Above ball layer
                pointerEvents: 'none'
            }}
        />
    );
};

// Import physics utilities from lib
import {
    physicsConfig,
    calculateBallSize,
    getBallPhysicsTweaks,
    getMiddleDropPosition,
    createPhysicsBodies,
    setupCollisionDetection,
    createWinTextParticle,
    playCollisionSound,
    applyRandomPegDeflection,
    type SlotLayout
} from '../../../../../lib/physics';

// Ball Layer Component
interface BallLayerProps {
    ballPositions: Map<number, { x: number, y: number, radius: number, betValue: number }>;
    width: number;
    height: number;
    boardDimensions: {
        topMargin: number;
        bottomMargin: number;
        leftMargin: number;
        rightMargin: number;
        boardWidth: number;
        boardHeight: number;
        boardX: number;
        triangleTopX: number;
        triangleTopY: number;
        triangleBottomLeftX: number;
        triangleBottomLeftY: number;
        triangleBottomRightX: number;
        triangleBottomRightY: number;
    } | null;
    className?: string;
}

const BallLayer: React.FC<BallLayerProps> = ({
    ballPositions,
    width,
    height,
    boardDimensions,
    className = 'ball-layer'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Only render if we have board dimensions for clipping
        if (!boardDimensions) return;

        ctx.save();

        // Apply the same triangular clipping as the board layer
        const { triangleTopX, triangleTopY, triangleBottomLeftX, triangleBottomLeftY, triangleBottomRightX, triangleBottomRightY } = boardDimensions;
        ctx.beginPath();
        ctx.moveTo(triangleTopX, triangleTopY);
        ctx.lineTo(triangleBottomLeftX, triangleBottomLeftY);
        ctx.lineTo(triangleBottomRightX, triangleBottomRightY);
        ctx.closePath();
        ctx.clip();

        // Draw balls using physics positions
        ballPositions.forEach((ballData) => {
            const { x, y, radius, betValue } = ballData;

            // Color coding based on bet value (similar to physics layer)
            const ballColor = betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

            // Draw ball with glow effect
            ctx.fillStyle = ballColor;
            ctx.strokeStyle = '#FFD700'; // Gold outline
            ctx.lineWidth = Math.max(1, radius * 0.1);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Add inner highlight for 3D effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();

    }, [ballPositions, width, height, boardDimensions]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={className}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 5, // Above physics layer, below ball paths
                pointerEvents: 'none'
            }}
        />
    );
};

export interface PhysicsLayerRef {
    spawnBall: (betValue?: number) => void;
    spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => void;
    isReady: () => boolean;
}

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

/**
 * Layer 3: Physics Simulation (Clipped to Board)
 * Handles all physics interactions and ball movement within the triangular board
 * - Physics bodies (balls, pins, multipliers, walls)
 * - Collision detection
 * - Ball physics (gravity, friction, bounce)
 * - Real-time physics simulation
 * - Clipped to triangular board area
 */
interface PhysicsLayerProps extends BallLayoutProps {
    boardDimensions?: {
        topMargin: number;
        bottomMargin: number;
        leftMargin: number;
        rightMargin: number;
        boardWidth: number;
        boardHeight: number;
        boardX: number;
        triangleTopX: number;
        triangleTopY: number;
        triangleBottomLeftX: number;
        triangleBottomLeftY: number;
        triangleBottomRightX: number;
        triangleBottomRightY: number;
    } | null;
    ballPaths: Map<number, Array<{ x: number, y: number, timestamp: number, radius?: number }>>;
    setBallPaths: React.Dispatch<React.SetStateAction<Map<number, Array<{ x: number, y: number, timestamp: number, radius?: number }>>>>;
    onBallPositionsUpdate?: (ballPositions: Map<number, { x: number, y: number, radius: number, betValue: number }>) => void;
}

const PhysicsLayer = forwardRef<PhysicsLayerRef, PhysicsLayerProps>(
    ({ rows, multipliers = [], probabilities: _probabilities = [], betAmount = 100, onBallHit, boardDimensions, ballPaths: _ballPaths, setBallPaths, onBallPositionsUpdate }, ref) => {

        const canvasRef = useRef<HTMLDivElement>(null);
        const engineRef = useRef<Engine | null>(null);
        const runnerRef = useRef<Runner | null>(null);
        const [isInitialized, setIsInitialized] = useState(false);

        // Prevent rapid successive ball drops
        const lastSpawnTimeRef = useRef<number>(0);
        const minSpawnInterval = 500;

        // Track removed balls to prevent collision processing
        const removedBallsRef = useRef<Set<number>>(new Set());

        // Initialize physics engine with triangular clipping
        useEffect(() => {
            if (!canvasRef.current) {
                return;
            }

            const cleanupPhysics = () => {
                if (runnerRef.current) {
                    Runner.stop(runnerRef.current);
                    runnerRef.current = null;
                }
                if (engineRef.current) {
                    World.clear(engineRef.current.world, true);
                    Engine.clear(engineRef.current);
                    engineRef.current = null;
                }
                removedBallsRef.current.clear();
                setBallPaths(new Map());
            };

            if (isInitialized) {
                cleanupPhysics();
                setIsInitialized(false);
            }

            const initTimeout = setTimeout(() => {
                logger.info('🎯 [PHYSICS LAYER] Starting initialization, canvas available:', !!canvasRef.current);
                if (!canvasRef.current) {
                    logger.info('❌ [PHYSICS LAYER] Canvas not available, skipping initialization');
                    return;
                }

                const element = canvasRef.current;
                const containerRect = element.getBoundingClientRect();
                const canvasWidth = containerRect.width;
                const canvasHeight = containerRect.height;

                // Create physics engine
                const engine = Engine.create();
                const scaleFactor = Math.min(canvasWidth / 400, canvasHeight / 400);
                engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor;
                engineRef.current = engine;

                // Use board dimensions from BoardLayer if available, otherwise calculate defaults
                const boardTopMargin = boardDimensions?.topMargin ?? canvasHeight * 0.08;
                const boardBottomMargin = boardDimensions?.bottomMargin ?? canvasHeight * 0.15;
                const boardHeight = boardDimensions?.boardHeight ?? (canvasHeight - boardTopMargin - boardBottomMargin);
                const boardWidth = boardDimensions?.boardWidth ?? canvasWidth * 0.8;
                const boardX = boardDimensions?.boardX ?? (canvasWidth - boardWidth) / 2;

                // Create physics bodies with triangular boundaries
                // If multipliers is empty, use default multipliers for physics
                const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
                const { pins, multipliersBodies, walls } = createPhysicsBodies(
                    canvasWidth,
                    canvasHeight,
                    rows,
                    effectiveMultipliers
                );

                // Create slot layout for collision handling (used by physics bodies)
                const slotLayout: SlotLayout = {
                    startX: (canvasWidth - effectiveMultipliers.length * Math.max(25, Math.min(60, canvasWidth / effectiveMultipliers.length * 0.85))) / 2,
                    slotWidth: Math.max(25, Math.min(60, canvasWidth / effectiveMultipliers.length * 0.85)),
                    slotHeight: Math.max(20, Math.min(40, canvasHeight * 0.08)),
                    bottomMargin: canvasHeight * 0.15,
                    multipliers: [...effectiveMultipliers]
                };

                const runner = Runner.create();
                runnerRef.current = runner;
                Runner.run(runner, engine);

                // Add all physics bodies to the world
                Composite.add(engine.world, [...pins, ...multipliersBodies, ...walls]);

                // Set up collision detection
                setupCollisionDetection();

                // Track ball positions for path visualization and ball rendering
                Events.on(engine, 'afterUpdate', () => {
                    const allBodies = Composite.allBodies(engine.world);
                    const balls = allBodies.filter(body => body.label?.includes('ball'));

                    setBallPaths(prevPaths => {
                        const newPaths = new Map(prevPaths);

                        balls.forEach(ball => {
                            if (!newPaths.has(ball.id)) {
                                newPaths.set(ball.id, []);
                            }

                            const path = newPaths.get(ball.id)!;
                            const currentTime = Date.now();
                            const ballRadius = ball.circleRadius || 5;

                            // Only add position if enough time has passed (throttle for performance)
                            if (path.length === 0 || currentTime - path[path.length - 1].timestamp > 16) { // ~60fps
                                path.push({
                                    x: ball.position.x,
                                    y: ball.position.y,
                                    timestamp: currentTime,
                                    radius: ballRadius
                                });

                                // Limit path length to prevent memory issues
                                if (path.length > 100) {
                                    path.shift();
                                }
                            }

                            // Check if ball has fallen off the board (below canvas height)
                            const ballExtension = ball as Body & BallBodyExtension;
                            if (ball.position.y > canvasHeight + 50 && ballExtension.isServiceGuided) {
                                // Ball fell off board - no logging needed
                            }
                        });

                        return newPaths;
                    });

                    // Provide ball positions for visual rendering
                    if (onBallPositionsUpdate) {
                        const ballPositions = new Map<number, { x: number, y: number, radius: number, betValue: number }>();
                        balls.forEach(ball => {
                            const ballExtension = ball as Body & BallBodyExtension;
                            ballPositions.set(ball.id, {
                                x: ball.position.x,
                                y: ball.position.y,
                                radius: ball.circleRadius || 5,
                                betValue: ballExtension.betValue || 100
                            });
                        });

                        onBallPositionsUpdate(ballPositions);
                    }
                });

                // Set up collision detection with triangular boundary enforcement
                Events.on(engine, 'collisionActive', (event) => {
                    const pairs = event.pairs;

                    for (const pair of pairs) {
                        const { bodyA, bodyB } = pair;

                        const ballBody = bodyB.label?.includes('ball') ? bodyB : bodyA;
                        const obstacleBody = ballBody === bodyA ? bodyB : bodyA;

                        if (!ballBody?.label?.includes('ball')) continue;

                        const ballExtension = ballBody as Body & BallBodyExtension;

                        if (ballExtension.isRemoved || removedBallsRef.current.has(ballBody.id)) {
                            continue;
                        }

                        // Handle multiplier (payout) collisions
                        if (obstacleBody.label?.includes('multiplier')) {
                            const multiplier = parseFloat(obstacleBody.label.split('-')[1]) || 1;
                            const betValue = ballExtension.betValue || 100;
                            const finalSlot = parseInt(obstacleBody.label.split('-')[2]) || 0;

                            // Debug logging for collision tracking
                            logger.info('🎯 [PHYSICS COLLISION] Ball hit multiplier slot:', {
                                label: obstacleBody.label,
                                multiplier,
                                finalSlot,
                                betValue,
                                ballPosition: { x: ballBody.position.x.toFixed(1), y: ballBody.position.y.toFixed(1) },
                                obstaclePosition: { x: obstacleBody.position.x.toFixed(1), y: obstacleBody.position.y.toFixed(1) },
                                isServiceGuided: ballExtension.isServiceGuided,
                                expectedFinalSlot: ballExtension.expectedFinalSlot
                            });

                            // For service-guided balls, only remove if they hit the CORRECT final slot
                            if (ballExtension.isServiceGuided && ballExtension.expectedFinalSlot !== undefined) {
                                if (finalSlot === ballExtension.expectedFinalSlot) {
                                    logger.info('🎯 [PHYSICS LAYER] Service-guided ball reached correct final slot', { finalSlot, expectedFinalSlot: ballExtension.expectedFinalSlot });
                                    ballExtension.isRemoved = true;
                                    ballBody.isSensor = true;
                                    ballBody.isStatic = true;
                                    removedBallsRef.current.add(ballBody.id);

                                    // Clean up ball path when ball is removed
                                    setBallPaths(prevPaths => {
                                        const newPaths = new Map(prevPaths);
                                        newPaths.delete(ballBody.id);
                                        return newPaths;
                                    });

                                    World.remove(engine.world, ballBody);

                                    if (!ballExtension.hasTriggeredWin) {
                                        ballExtension.hasTriggeredWin = true;

                                        if (onBallHit) {
                                            onBallHit(multiplier, betValue);
                                        }

                                        createWinTextParticle(betValue * multiplier, ballBody.position.x, ballBody.position.y);
                                        playCollisionSound(multiplier);
                                    }
                                } else {
                                    // Track wrong slot hits to prevent infinite loops
                                    ballExtension.wrongSlotHits = (ballExtension.wrongSlotHits || 0) + 1;

                                    if (ballExtension.wrongSlotHits >= 3) {
                                        // Too many wrong collisions - force the ball to finish at the correct slot
                                        logger.info('🎯 [PHYSICS LAYER] Service-guided ball hit too many wrong slots, forcing to correct slot:', ballExtension.expectedFinalSlot);

                                        // Remove the ball and trigger win at correct slot
                                        ballExtension.isRemoved = true;
                                        ballBody.isSensor = true;
                                        ballBody.isStatic = true;
                                        removedBallsRef.current.add(ballBody.id);

                                        // Clean up ball path when ball is removed
                                        setBallPaths(prevPaths => {
                                            const newPaths = new Map(prevPaths);
                                            newPaths.delete(ballBody.id);
                                            return newPaths;
                                        });

                                        World.remove(engine.world, ballBody);

                                        if (!ballExtension.hasTriggeredWin) {
                                            ballExtension.hasTriggeredWin = true;

                                            if (onBallHit) {
                                                onBallHit(ballExtension.multiplier || multiplier, betValue);
                                            }

                                            createWinTextParticle(betValue * (ballExtension.multiplier || multiplier), ballBody.position.x, ballBody.position.y);
                                            playCollisionSound(ballExtension.multiplier || multiplier);
                                        }
                                    } else {
                                        logger.info(`🎯 [PHYSICS LAYER] Service-guided ball hit wrong slot: ${finalSlot} (attempt ${ballExtension.wrongSlotHits}/3), Expected: ${ballExtension.expectedFinalSlot} - Continuing...`);
                                        // Don't remove, let the ball continue following its service path
                                    }
                                }
                            } else {
                                // Regular balls - remove immediately
                                ballExtension.isRemoved = true;
                                ballBody.isSensor = true;
                                ballBody.isStatic = true;
                                removedBallsRef.current.add(ballBody.id);

                                // Clean up ball path when ball is removed
                                setBallPaths(prevPaths => {
                                    const newPaths = new Map(prevPaths);
                                    newPaths.delete(ballBody.id);
                                    return newPaths;
                                });

                                World.remove(engine.world, ballBody);

                                if (!ballExtension.hasTriggeredWin) {
                                    ballExtension.hasTriggeredWin = true;

                                    if (onBallHit) {
                                        onBallHit(multiplier, betValue);
                                    }

                                    createWinTextParticle(betValue * multiplier, ballBody.position.x, ballBody.position.y);
                                    playCollisionSound(multiplier);
                                }
                            }
                        }
                        // Handle pin collisions
                        else if (obstacleBody.label?.includes('pin')) {
                            const servicePath = ballExtension.servicePath;
                            const currentPathIndex = ballExtension.currentPathIndex || 0;
                            const pinPosition = obstacleBody.position;

                            if (ballExtension.isServiceGuided && servicePath && currentPathIndex < servicePath.length) {
                                const direction = servicePath[currentPathIndex];
                                const forceMagnitude = 0.15; // Increased from 0.08 to make forces stronger
                                const forceX = direction === 1 ? forceMagnitude : -forceMagnitude;

                                // Track pin collision sequence
                                ballExtension.pinCollisions = ballExtension.pinCollisions || [];
                                ballExtension.pinCollisions.push(obstacleBody.label);

                                logger.info(`🎯 [PHYSICS LAYER] Pin collision - Path step ${currentPathIndex}/${servicePath.length}: direction=${direction}, forceX=${forceX}, pin=${obstacleBody.label}, ballPos=(${ballBody.position.x.toFixed(1)}, ${ballBody.position.y.toFixed(1)}), collisionSequence=[${ballExtension.pinCollisions.join(',')}]`);

                                // Apply stronger force and also set velocity for more reliable guidance
                                Body.setVelocity(ballBody, { x: forceX * 2, y: ballBody.velocity.y });
                                Body.applyForce(ballBody, ballBody.position, { x: forceX, y: 0 });
                                ballExtension.currentPathIndex = currentPathIndex + 1;

                                // Log remaining path
                                if (currentPathIndex + 1 < servicePath.length) {
                                    logger.info(`🎯 [PHYSICS LAYER] Remaining path: [${servicePath.slice(currentPathIndex + 1).join(',')}]`);
                                } else {
                                    logger.info(`✅ [PHYSICS LAYER] Path completed! Final collision sequence: [${ballExtension.pinCollisions.join(',')}]`);
                                }
                            } else {
                                if (ballExtension.isServiceGuided) {
                                    logger.info(`⚠️ [PHYSICS LAYER] Service-guided ball hit pin but no path available: index=${currentPathIndex}, pathLength=${servicePath?.length}`);
                                }
                                const ballRadius = ballBody.circleRadius || 5;
                                const deflectionStrength = Math.max(0.1, Math.min(0.3, 0.25 / (ballRadius / 5)));

                                applyRandomPegDeflection(ballBody, deflectionStrength);
                            }
                        }
                    }
                });

                setIsInitialized(true);
                logger.info('✅ [PHYSICS LAYER] Initialization completed successfully');

            }, 100);

            return () => {
                clearTimeout(initTimeout);
                cleanupPhysics();
            };
        }, [rows]); // Only re-initialize when rows change, not when boardDimensions or other props change

        // Method to spawn physics ball
        const spawnBall = (betValue: number = 1) => {
            const now = Date.now();
            const timeSinceLastSpawn = now - lastSpawnTimeRef.current;

            if (lastSpawnTimeRef.current > 0 && timeSinceLastSpawn < minSpawnInterval) {
                return;
            }

            lastSpawnTimeRef.current = now;
            removedBallsRef.current.clear();

            if (!engineRef.current || !canvasRef.current) return;

            const containerRect = canvasRef.current.getBoundingClientRect();
            const canvasWidth = containerRect.width || physicsConfig.world.width;
            const canvasHeight = containerRect.height || physicsConfig.world.height;

            const canvasScaleFactor = Math.min(canvasWidth / 400, canvasHeight / 400);
            const ballRadius = calculateBallSize(rows, canvasScaleFactor);
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);

            const ballX = getMiddleDropPosition(canvasWidth);
            const randomOffset = (Math.random() - 0.5) * 4;
            const finalBallX = ballX + randomOffset;

            const ballColor = betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

            const ball = Bodies.circle(finalBallX, 30, ballRadius, {
                restitution: physicsTweaks.restitution,
                friction: 0.6,
                label: `ball-${betValue}`,
                id: new Date().getTime(),
                frictionAir: physicsTweaks.frictionAir,
                density: physicsTweaks.density,
                collisionFilter: {
                    group: -1
                },
                render: {
                    fillStyle: ballColor
                },
                isStatic: false
            });

            Composite.add(engineRef.current.world, ball);
        };

        // Method to spawn ball with service-determined path
        const spawnBallWithPath = (betValue: number, path: number[], finalSlot: number, multiplier: number) => {
            if (!engineRef.current || !canvasRef.current) {
                return;
            }

            const containerRect = canvasRef.current.getBoundingClientRect();
            const canvasWidth = containerRect.width || physicsConfig.world.width;
            const canvasHeight = containerRect.height || physicsConfig.world.height;

            const canvasScaleFactor = Math.min(canvasWidth / 400, canvasHeight / 400);
            const ballRadius = calculateBallSize(rows, canvasScaleFactor);
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);

            const ballX = getMiddleDropPosition(canvasWidth);
            const ballY = ballRadius + 10; // Spawn position from top
            const ballColor = betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

            const ball = Bodies.circle(ballX, ballRadius + 10, ballRadius, {
                restitution: physicsTweaks.restitution,
                friction: 0.1,
                frictionAir: physicsTweaks.frictionAir,
                density: physicsTweaks.density,
                render: {
                    fillStyle: ballColor,
                    strokeStyle: '#FFD700',
                    lineWidth: 1
                },
                label: 'service-guided-ball',
                isStatic: false
            });

            const ballExtension = ball as Body & BallBodyExtension;
            ballExtension.servicePath = path;
            ballExtension.currentPathIndex = 0;
            ballExtension.expectedFinalSlot = finalSlot;
            ballExtension.multiplier = multiplier;
            ballExtension.betValue = betValue;
            ballExtension.isServiceGuided = true;
            ballExtension.wrongSlotHits = 0; // Track wrong slot collisions to prevent infinite loops
            ballExtension.pinCollisions = []; // Track pin collision sequence for debugging

            logger.info(`🎯 [PHYSICS LAYER] Ball spawned with service path: [${path.join(',')}], expectedSlot=${finalSlot}, multiplier=${multiplier}`);

            Composite.add(engineRef.current.world, ball);
        };

        // Expose methods for external use
        useImperativeHandle(ref, () => ({
            isReady: () => {
                const ready = isInitialized && !!engineRef.current;
                logger.info('🎯 [PHYSICS LAYER] isReady called:', { isInitialized, hasEngine: !!engineRef.current, ready });
                return ready;
            },
            spawnBall: (betValue?: number) => {
                logger.info('🎯 [PHYSICS LAYER] spawnBall called:', { betValue, isInitialized, hasEngine: !!engineRef.current });
                if (isInitialized && engineRef.current) {
                    spawnBall(betValue);
                } else {
                    logger.info('❌ [PHYSICS LAYER] Cannot spawn ball - not ready');
                }
            },
            spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => {
                logger.info('🎯 [PHYSICS LAYER] spawnBallWithPath called:', { betValue, path, finalSlot, multiplier, isInitialized, hasEngine: !!engineRef.current });
                if (isInitialized && engineRef.current) {
                    spawnBallWithPath(betValue, path, finalSlot, multiplier);
                } else {
                    logger.info('❌ [PHYSICS LAYER] Cannot spawn ball with path - not ready');
                }
            }
        }), [isInitialized]);

        return (
            <div
                ref={canvasRef}
                className="physics-layer"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1, // Behind all visual layers
                    overflow: 'hidden',
                    pointerEvents: 'none' // Don't interfere with user interactions
                }}
            />
        );
    }
);

PhysicsLayer.displayName = 'PhysicsLayer';

export { BallPathLayer, BallLayer };
export default PhysicsLayer;
