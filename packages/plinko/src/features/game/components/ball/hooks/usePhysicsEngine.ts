import { useRef, useCallback, useEffect, useState } from 'react';
import { Bodies, Body, Composite, Engine, Events, Runner, World } from 'matter-js';
import { physicsConfig } from '../../../../../lib/physics';
import { logger } from '../../../../../services/logger';
import { BallBodyExtension } from '../../../../../types/physics';
import { getMultiplierColor } from '../../../../../lib/utils/colors-util';


interface UsePhysicsEngineProps {
    numberOfRows: number;
    multipliers: number[];
    gameMode: number;
    onBallHit?: (multiplier: number, betValue: number) => void;
    canvasWidth: number;
    canvasHeight: number;
    containerSize: { width: number; height: number };
}

interface UsePhysicsEngineReturn {
    engine: React.MutableRefObject<Engine | null>;
    runner: React.MutableRefObject<Runner | null>;
    isInitialized: boolean;
    pins: Body[];
    multipliersBodies: Body[];
    walls: Body[];
    cleanupPhysics: () => void;
    setupCollisionDetection: (engine: Engine) => void;
}

/**
 * Custom hook for managing the Matter.js physics engine
 * Handles engine initialization, cleanup, and collision detection setup
 */
export const usePhysicsEngine = ({
    numberOfRows,
    multipliers,
    gameMode,
    onBallHit,
    canvasWidth,
    canvasHeight,
    containerSize
}: UsePhysicsEngineProps): UsePhysicsEngineReturn => {
    const engineRef = useRef<Engine | null>(null);
    const runnerRef = useRef<Runner | null>(null);
    const removedBallsRef = useRef<Set<number>>(new Set());

    // Create physics bodies for the Plinko board
    const createPhysicsBodies = useCallback((
        canvasWidth: number,
        canvasHeight: number,
        numberOfRows: number,
        multipliers: number[],
        gameMode: number
    ) => {
        const pins: Body[] = [];
        const multipliersBodies: Body[] = [];

        // Scale physics elements based on number of rows
        const scaleFactor = Math.max(0.4, Math.min(1.2, 10 / numberOfRows));
        const pegRadius = Math.max(3, Math.min(12, 8 * scaleFactor));
        const pegGap = Math.max(30, Math.min(55, 45 * scaleFactor));
        const boardTopMargin = Math.max(40, Math.min(80, 60 * scaleFactor));

        // Create pins in triangular layout
        for (let row = 1; row <= numberOfRows; row++) {
            const columnsInRow = 3 + (row - 1); // Start with 3 columns, increase by 1 each row
            const rowWidth = (columnsInRow - 1) * pegGap;
            const startX = (canvasWidth - rowWidth) / 2;
            const y = boardTopMargin + (row - 1) * pegGap;

            for (let col = 0; col < columnsInRow; col++) {
                const x = startX + col * pegGap;
                pins.push(Bodies.circle(x, y, pegRadius, {
                    label: `pin-${row}-${col}`,
                    render: { fillStyle: physicsConfig.colors.pin },
                    isStatic: true
                }));
            }
        }

        // Create walls
        const walls = [
            Bodies.rectangle(-10, canvasHeight / 2, 20, canvasHeight * 2, { render: { visible: false }, isStatic: true }),
            Bodies.rectangle(canvasWidth + 10, canvasHeight / 2, 20, canvasHeight * 2, { render: { visible: false }, isStatic: true }),
            Bodies.rectangle(canvasWidth / 2, canvasHeight + 10, canvasWidth * 2, 20, { render: { visible: false }, isStatic: true })
        ];

        // Create multiplier slots positioned at the same level as the last row, centered between pegs
        const lastRowColumns = numberOfRows; // Last row has numberOfRows pegs
        const lastRowWidth = (lastRowColumns - 1) * pegGap;
        const lastRowStartX = (canvasWidth - lastRowWidth) / 2;
        const lastRowY = boardTopMargin + (numberOfRows - 1) * pegGap; // Y position of last row pegs

        // Create slots including edges: left of first peg, between pegs, and right of last peg
        const numberOfSlots = numberOfRows + 1; // Traditional Plinko: N pegs = N+1 slots
        const slotsToCreate = Math.min(multipliers.length, numberOfSlots);

        for (let i = 0; i < slotsToCreate; i++) {
            const multiplier = multipliers[i];
            // Position slots between pegs: left of first, between all pairs, right of last
            const slotX = lastRowStartX + (i - 0.5) * pegGap; // Center between peg positions
            // FIX: Position slots BELOW the physics board, not at the same level
            const slotY = lastRowY + pegGap * 0.8; // Position below last row by 80% of peg gap
            const slotWidth = Math.max(8, Math.min(50, pegGap - 8 * scaleFactor));

            multipliersBodies.push(Bodies.rectangle(slotX, slotY, slotWidth, 5, {
                label: `multiplier-${multiplier}-${i}`,
                isStatic: true,
                isSensor: true,
                render: { fillStyle: getMultiplierColor(i, gameMode, numberOfRows) }
            }));
        }

        return { pins, multipliersBodies, walls };
    }, [gameMode, numberOfRows]);


    // Cleanup physics function
    const cleanupPhysics = useCallback(() => {
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
    }, []);

    // Handle multiplier collision
    const handleMultiplierCollision = useCallback((
        ballBody: Body,
        ballExtension: BallBodyExtension,
        obstacleBody: Body,
        engine: Engine
    ) => {
        // Extract multiplier data from label
        const labelParts = obstacleBody.label.split("-");
        const multiplier = parseFloat(labelParts[1]) || 1;
        const finalSlot = parseInt(labelParts[2]) || 0;
        const betValue = ballExtension.betValue || 100;

        // Mark ball as removed
        ballExtension.isRemoved = true;
        ballBody.isSensor = true;
        ballBody.isStatic = true;
        removedBallsRef.current.add(ballBody.id);

        // Handle win logic
        World.remove(engine.world, ballBody);
        if (!ballExtension.hasTriggeredWin) {
            ballExtension.hasTriggeredWin = true;
            handleBallWin(ballExtension, finalSlot, multiplier, betValue);
        }
    }, [onBallHit]);

    // Separate function to handle win logic and reduce complexity
    const handleBallWin = useCallback((ballExtension: BallBodyExtension, finalSlot: number, multiplier: number, betValue: number) => {
        if (ballExtension.isServiceGuided && ballExtension.expectedFinalSlot !== undefined) {
            handleServiceGuidedBallWin(ballExtension, finalSlot, multiplier, betValue);
        } else {
            // Regular ball
            onBallHit?.(multiplier, betValue);
        }
    }, [onBallHit]);

    // Handle service-guided ball win logic
    const handleServiceGuidedBallWin = useCallback((ballExtension: BallBodyExtension, finalSlot: number, multiplier: number, betValue: number) => {
        const expectedFinalSlot = ballExtension.expectedFinalSlot;
        const expectedMultiplier = ballExtension.multiplier;

        if (finalSlot === expectedFinalSlot) {
            if (process.env.NODE_ENV === 'development') {
                logger.info('✅ [PHYSICS] Service-guided ball hit correct slot', {
                    finalSlot,
                    expectedFinalSlot,
                    multiplier,
                    betValue
                });
            }
            onBallHit?.(multiplier, betValue);
            return;
        }

        // Wrong slot hit
        ballExtension.wrongSlotHits = (ballExtension.wrongSlotHits || 0) + 1;

        if (process.env.NODE_ENV === 'development') {
            logger.warn('⚠️ [PHYSICS] Service-guided ball hit wrong slot', {
                finalSlot,
                expectedFinalSlot,
                wrongSlotHits: ballExtension.wrongSlotHits,
                multiplier,
                expectedMultiplier
            });
        }

        if (ballExtension.wrongSlotHits >= 3) {
            if (process.env.NODE_ENV === 'development') {
                logger.error('❌ [PHYSICS] Service-guided ball failed to hit correct slot after 3 attempts, using expected multiplier', {
                    finalSlot,
                    expectedFinalSlot,
                    expectedMultiplier
                });
            }
            onBallHit?.(expectedMultiplier || multiplier, betValue);
        }
    }, [onBallHit]);

    // Handle pin collision
    const handlePinCollision = useCallback((ballBody: Body, ballExtension: BallBodyExtension) => {
        if (ballExtension.isServiceGuided && ballExtension.servicePath && ballExtension.currentPathIndex < ballExtension.servicePath.length) {
            // Service-guided ball following path
            const direction = ballExtension.servicePath[ballExtension.currentPathIndex];

            // In Plinko, each step in the path represents a binary choice: left (0) or right (1)
            // The service result array uses 1 to indicate "right" movement and 0 for "left" movement
            // Higher count of 1s results in higher slotIndex (further right)
            const targetDirection = direction === 1 ? 1 : -1; // 1 = right, 0 = left

            // Apply stronger, more deterministic force to ensure correct path following
            const forceMagnitude = 0.25; // Increased from 0.15 for more reliable guidance
            const velocityMagnitude = 1.5; // Stronger velocity setting

            Body.setVelocity(ballBody, {
                x: targetDirection * velocityMagnitude,
                y: ballBody.velocity.y
            });
            Body.applyForce(ballBody, ballBody.position, {
                x: targetDirection * forceMagnitude,
                y: 0
            });

            if (process.env.NODE_ENV === 'development') {
                logger.debug('🎯 [PHYSICS] Service-guided ball collision', {
                    pathIndex: ballExtension.currentPathIndex,
                    direction,
                    targetDirection,
                    expectedFinalSlot: ballExtension.expectedFinalSlot,
                    remainingPath: ballExtension.servicePath.slice(ballExtension.currentPathIndex + 1)
                });
            }

            ballExtension.currentPathIndex++;
        } else {
            // Random deflection for regular balls
            const ballRadius = ballBody.circleRadius || 5;
            const deflectionStrength = Math.max(0.1, Math.min(0.3, 0.25 / (ballRadius / 5)));
            const randomForce = (Math.random() < 0.5 ? -1 : 1) * deflectionStrength * (Math.random() * 0.5 + 0.75);
            Body.applyForce(ballBody, ballBody.position, { x: randomForce, y: 0 });
        }
    }, []);

    // Setup collision detection
    const setupCollisionDetection = useCallback((engine: Engine) => {
        Events.on(engine, "collisionActive", (event) => {
            const pairs = event.pairs;

            for (const pair of pairs) {
                const { bodyA, bodyB } = pair;
                const ballBody = bodyB.label?.includes("ball") ? bodyB : bodyA;
                const obstacleBody = ballBody === bodyA ? bodyB : bodyA;

                if (!ballBody?.label?.includes("ball")) continue;

                const ballExtension = ballBody as Body & BallBodyExtension;

                if (ballExtension.isRemoved || removedBallsRef.current.has(ballBody.id)) {
                    continue;
                }

                // Handle multiplier collisions
                if (obstacleBody.label?.includes("multiplier")) {
                    handleMultiplierCollision(ballBody, ballExtension, obstacleBody, engine);
                }
                // Handle pin collisions
                else if (obstacleBody.label?.includes("pin")) {
                    handlePinCollision(ballBody, ballExtension);
                }
            }
        });
    }, [handleMultiplierCollision, handlePinCollision]);

    // State for tracking initialization
    const [isInitialized, setIsInitialized] = useState(false);
    const [pins, setPins] = useState<Body[]>([]);
    const [multipliersBodies, setMultipliersBodies] = useState<Body[]>([]);
    const [walls, setWalls] = useState<Body[]>([]);

    // Initialize physics engine - only when essential parameters change
    useEffect(() => {
        // Only reinitialize if we don't have an engine or if essential parameters changed
        if (isInitialized && engineRef.current) {
            // Check if we need to reinitialize based on essential parameters only
            const needsReinit = false; // We'll keep the engine stable once initialized
            if (!needsReinit) {
                logger.debug('🔧 [PHYSICS] Engine already initialized, skipping reinitialization');
                return;
            }
        }

        if (isInitialized) {
            cleanupPhysics();
            setIsInitialized(false);
        }

        const initTimeout = setTimeout(() => {
            // Only log initialization in development mode to reduce noise
            if (process.env.NODE_ENV === 'development') {
                logger.info('🔧 [PHYSICS] Initializing physics engine...', {
                    rows: numberOfRows,
                    multipliers: multipliers.length
                });
            }

            // Create physics engine
            const engine = Engine.create();
            const scaleFactor = Math.min(containerSize.width / canvasWidth, containerSize.height / canvasHeight);
            engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor;
            engineRef.current = engine;

            // Create physics bodies using fixed canvas dimensions
            const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];

            const { pins: createdPins, multipliersBodies: createdMultipliersBodies, walls: createdWalls } = createPhysicsBodies(
                canvasWidth,
                canvasHeight,
                numberOfRows,
                effectiveMultipliers,
                gameMode
            );

            // Update state with created bodies
            setPins(createdPins);
            setMultipliersBodies(createdMultipliersBodies);
            setWalls(createdWalls);

            const runner = Runner.create();
            runnerRef.current = runner;
            Runner.run(runner, engine);

            // Add all physics bodies to the world
            const allBodies = [...createdPins, ...createdMultipliersBodies, ...createdWalls];
            Composite.add(engine.world, allBodies);

            // Set up collision detection
            setupCollisionDetection(engine);

            setIsInitialized(true);

            if (process.env.NODE_ENV === 'development') {
                logger.info('✅ [PHYSICS] Physics engine ready', {
                    pins: createdPins.length,
                    multipliers: createdMultipliersBodies.length,
                    walls: createdWalls.length,
                    totalBodies: allBodies.length
                });
            }
        }, 100);

        return () => {
            clearTimeout(initTimeout);
            cleanupPhysics();
        };
    }, [numberOfRows, canvasWidth, canvasHeight]); // Only reinitialize when essential parameters change

    // Update collision detection when onBallHit callback changes
    useEffect(() => {
        if (engineRef.current && isInitialized) {
            // Remove existing collision listeners
            Events.off(engineRef.current, "collisionActive", undefined as any);
            // Re-setup collision detection with new callback
            setupCollisionDetection(engineRef.current);
        }
    }, [onBallHit, isInitialized, setupCollisionDetection]);

    // Handle multiplier changes without reinitializing the entire engine
    useEffect(() => {
        if (engineRef.current && isInitialized && multipliers.length > 0) {
            logger.debug('🔧 [PHYSICS] Updating multipliers without reinitializing engine');
            // The engine is already initialized, we don't need to recreate it
            // The multipliers are handled by the game logic, not the physics engine
        }
    }, [multipliers, isInitialized]);

    return {
        engine: engineRef,
        runner: runnerRef,
        isInitialized,
        pins,
        multipliersBodies,
        walls,
        cleanupPhysics,
        setupCollisionDetection
    };
};
