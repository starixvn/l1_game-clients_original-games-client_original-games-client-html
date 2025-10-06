import { useRef, useCallback, useEffect, useState } from 'react';
import { Bodies, Body, Composite, Engine, Events, Runner, World } from 'matter-js';
import { physicsConfig } from '../../../../../lib/physics';
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

interface UsePhysicsEngineProps {
    numberOfRows: number;
    multipliers: number[];
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
        multipliers: number[]
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
                render: { fillStyle: getMultiplierColor(multiplier) }
            }));
        }

        return { pins, multipliersBodies, walls };
    }, []);

    // Helper function to get multiplier color for physics bodies
    const getMultiplierColor = (multiplier: number): string => {
        if (multiplier >= 10) return physicsConfig.colors.multiplierHigh;
        if (multiplier >= 5) return physicsConfig.colors.multiplierMedium;
        if (multiplier >= 2) return physicsConfig.colors.multiplierLow;
        if (multiplier >= 1) return physicsConfig.colors.multiplierLoss;
        return '#333';
    };

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

            if (ballExtension.isServiceGuided && ballExtension.expectedFinalSlot !== undefined) {
                // Service-guided ball logic
                if (finalSlot === ballExtension.expectedFinalSlot) {
                    onBallHit?.(multiplier, betValue);
                } else {
                    ballExtension.wrongSlotHits = (ballExtension.wrongSlotHits || 0) + 1;
                    if (ballExtension.wrongSlotHits >= 3) {
                        onBallHit?.(ballExtension.multiplier || multiplier, betValue);
                    }
                }
            } else {
                // Regular ball
                onBallHit?.(multiplier, betValue);
            }
        }
    }, [onBallHit]);

    // Handle pin collision
    const handlePinCollision = useCallback((ballBody: Body, ballExtension: BallBodyExtension) => {
        if (ballExtension.isServiceGuided && ballExtension.servicePath && ballExtension.currentPathIndex < ballExtension.servicePath.length) {
            // Service-guided ball following path
            const direction = ballExtension.servicePath[ballExtension.currentPathIndex];
            const forceX = direction === 1 ? 0.15 : -0.15;
            Body.setVelocity(ballBody, { x: forceX * 2, y: ballBody.velocity.y });
            Body.applyForce(ballBody, ballBody.position, { x: forceX, y: 0 });
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
            logger.info('🔧 [PHYSICS] Initializing physics engine...', {
                canvasWidth,
                canvasHeight,
                numberOfRows,
                containerSize,
                multipliers: multipliers.length
            });

            // Create physics engine
            const engine = Engine.create();
            const scaleFactor = Math.min(containerSize.width / canvasWidth, containerSize.height / canvasHeight);
            engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor;
            engineRef.current = engine;

            logger.info('✅ [PHYSICS] Engine created:', {
                engineId: engine.id,
                gravity: engine.gravity,
                worldBodies: engine.world.bodies.length
            });

            // Create physics bodies using fixed canvas dimensions
            const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];

            const { pins: createdPins, multipliersBodies: createdMultipliersBodies, walls: createdWalls } = createPhysicsBodies(
                canvasWidth,
                canvasHeight,
                numberOfRows,
                effectiveMultipliers
            );

            logger.info('✅ [PHYSICS] Bodies created:', {
                pins: createdPins.length,
                multipliers: createdMultipliersBodies.length,
                walls: createdWalls.length
            });

            // Update state with created bodies
            setPins(createdPins);
            setMultipliersBodies(createdMultipliersBodies);
            setWalls(createdWalls);

            const runner = Runner.create();
            runnerRef.current = runner;
            Runner.run(runner, engine);

            // Add all physics bodies to the world
            const allBodies = [...createdPins, ...createdMultipliersBodies, ...createdWalls];
            logger.info('🔧 [PHYSICS] About to add bodies to world:', {
                pins: createdPins.length,
                multipliers: createdMultipliersBodies.length,
                walls: createdWalls.length,
                totalBodies: allBodies.length,
                worldBodiesBefore: engine.world.bodies.length
            });

            // Add bodies individually to ensure they're added
            allBodies.forEach((body, index) => {
                Composite.add(engine.world, body);
                if (index < 5) { // Log first 5 bodies for debugging
                    logger.debug(`🔧 [PHYSICS] Added body ${index}:`, {
                        id: body.id,
                        label: body.label,
                        position: body.position
                    });
                }
            });

            logger.info('✅ [PHYSICS] Bodies added to world:', {
                totalBodies: engine.world.bodies.length,
                worldBodies: engine.world.bodies.map(b => ({ id: b.id, label: b.label }))
            });

            // Set up collision detection
            setupCollisionDetection(engine);

            setIsInitialized(true);
            logger.info('🎉 [PHYSICS] Physics engine fully initialized!');
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
