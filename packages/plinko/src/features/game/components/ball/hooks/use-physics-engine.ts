import { useRef, useCallback, useEffect, useState } from 'react';
import { Body, Engine, Runner } from 'matter-js';
import { logger } from '../../../../../services/logger';
import { usePhysicsScaler } from './use-physics-scaler';
import { useCollisionDetection } from './use-collision-detection';
import { usePhysicsInitialization } from './use-physics-initialization';


interface UsePhysicsEngineProps {
    numberOfRows: number;
    multipliers: number[];
    gameMode: number;
    onBallHit?: (multiplier: number, betValue: number) => void;
    onBallLanded?: (success: boolean) => void;
    canvasWidth: number;
    canvasHeight: number;
    containerSize: { width: number; height: number };
    baseRows?: number;
}

interface UsePhysicsEngineReturn {
    engine: React.MutableRefObject<Engine | null>;
    runner: React.MutableRefObject<Runner | null>;
    isInitialized: boolean;
    pins: Body[];
    multipliersBodies: Body[];
    walls: Body[];
    cleanupPhysics: () => void;
    forceReinitialize: (newRows: number) => void;
}

/**
 * Custom hook for managing the Matter.js physics engine
 * Orchestrates physics initialization, scaling, and collision detection
 */
export const usePhysicsEngine = ({
    numberOfRows,
    multipliers,
    gameMode,
    onBallHit,
    onBallLanded,
    canvasWidth,
    canvasHeight,
    containerSize,
    baseRows = 8
}: UsePhysicsEngineProps): UsePhysicsEngineReturn => {
    // Use modular hooks for separated concerns
    const { scaler, updateGravity } = usePhysicsScaler({ baseRows });
    const { setupCollisions } = useCollisionDetection({ onBallLanded });
    const { engine, runner, initializeEngineAndBodies, cleanup } = usePhysicsInitialization({
        canvasWidth,
        canvasHeight
    });

    const removedBallsRef = useRef<Set<number>>(new Set());

    // Cleanup physics function
    const cleanupPhysics = useCallback(() => {
        cleanup();
        removedBallsRef.current.clear();
    }, [cleanup]);

    // State for tracking initialization
    const [isInitialized, setIsInitialized] = useState(false);
    const [pins, setPins] = useState<Body[]>([]);
    const [multipliersBodies, setMultipliersBodies] = useState<Body[]>([]);
    const [walls, setWalls] = useState<Body[]>([]);

    // Store previous numberOfRows to detect changes
    const prevRowsRef = useRef(numberOfRows);

    // Initialize physics engine - only when essential parameters change
    useEffect(() => {
        // Check if we need to reinitialize based on row count changes
        const rowsChanged = prevRowsRef.current !== numberOfRows;
        prevRowsRef.current = numberOfRows;

        // Only reinitialize if we don't have an engine or if essential parameters changed
        if (isInitialized && engine.current && !rowsChanged) {
            logger.debug('🔧 [PHYSICS] Engine already initialized and rows unchanged, skipping reinitialization');
            return;
        }

        if (rowsChanged && isInitialized) {
            logger.info('🔄 [PHYSICS] Row count changed, reinitializing physics engine', {
                oldRows: prevRowsRef.current,
                newRows: numberOfRows
            });
        }

        if (isInitialized) {
            cleanupPhysics();
            setIsInitialized(false);
        }

        // Initialize immediately without timeout for better responsiveness
        const initPhysics = () => {
            // Only log initialization in development mode to reduce noise
            if (process.env.NODE_ENV === 'development') {
                logger.info('🔧 [PHYSICS] Initializing physics engine...', {
                    rows: numberOfRows,
                    multipliers: multipliers.length
                });
            }

            // Update scaler with current rows
            scaler.current?.setRows(numberOfRows);

            // Calculate gravity with current scaling
            const currentGravity = updateGravity(containerSize, { width: canvasWidth, height: canvasHeight });

            // Create body options
            const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
            const bodyOptions = {
                rows: numberOfRows,
                multipliers: effectiveMultipliers,
                gameMode,
                canvasWidth,
                canvasHeight
            };

            // Initialize engine with proper gravity
            const { pins: newPins, multipliersBodies: newMultipliersBodies, walls: newWalls } = initializeEngineAndBodies(bodyOptions, { x: 0, y: currentGravity });

            // Setup collision detection
            if (engine.current) {
                setupCollisions(engine.current);
            }

            // Update state
            setPins(newPins);
            setMultipliersBodies(newMultipliersBodies);
            setWalls(newWalls);
            setIsInitialized(true);

            if (process.env.NODE_ENV === 'development') {
                logger.info('✅ [PHYSICS] Physics engine ready', {
                    pins: newPins.length,
                    multipliers: multipliers.length,
                    walls: newWalls.length,
                    totalBodies: newPins.length + multipliers.length + newWalls.length
                });
            }
        };

        // Execute initialization immediately
        initPhysics();

        return () => {
            cleanupPhysics();
        };
    }, [numberOfRows, canvasWidth, canvasHeight, scaler, updateGravity, containerSize, multipliers, gameMode]);

    // Update row-based scaling when number of rows changes
    useEffect(() => {
        if (scaler.current) {
            scaler.current.setRows(numberOfRows);
            logger.debug('🔧 [PHYSICS] Row scaling updated', {
                rows: numberOfRows,
                baseRows,
                rowRatio: numberOfRows / baseRows
            });
        }
    }, [numberOfRows, baseRows, scaler]);

    // Handle multiplier changes without reinitializing the entire engine
    useEffect(() => {
        if (engine.current && isInitialized && multipliers.length > 0) {
            logger.debug('🔧 [PHYSICS] Updating multipliers without reinitializing engine');
            // The engine is already initialized, we don't need to recreate it
            // The multipliers are handled by the game logic, not the physics engine
        }
    }, [multipliers, isInitialized, engine]);

    // Force reinitialization with specific row count (for server sync)
    const forceReinitialize = useCallback((newRows: number) => {
        logger.info('🔄 [PHYSICS] Force reinitializing physics engine with new row count', {
            oldRows: numberOfRows,
            newRows
        });

        // Update the stored row count
        prevRowsRef.current = newRows;

        // Force cleanup and reinitialization
        if (isInitialized) {
            cleanupPhysics();
            setIsInitialized(false);
        }

        // Update scaler with new row count
        scaler.current?.setRows(newRows);

        // Calculate gravity for forced reinitialization
        const currentGravity = updateGravity(containerSize, { width: canvasWidth, height: canvasHeight });

        // Create body options with new row count
        const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
        const bodyOptions = {
            rows: newRows,
            multipliers: effectiveMultipliers,
            gameMode,
            canvasWidth,
            canvasHeight
        };

        // Reinitialize engine with new configuration
        const { pins: newPins, multipliersBodies: newMultipliersBodies, walls: newWalls } = initializeEngineAndBodies(bodyOptions, { x: 0, y: currentGravity });

        // Setup collision detection
        if (engine.current) {
            setupCollisions(engine.current);
        }

        // Update state
        setPins(newPins);
        setMultipliersBodies(newMultipliersBodies);
        setWalls(newWalls);
        setIsInitialized(true);

        logger.info('✅ [PHYSICS] Force reinitialization complete', {
            newRows,
            pins: newPins.length,
            multipliers: multipliers.length,
            walls: newWalls.length,
            totalBodies: newPins.length + multipliers.length + newWalls.length
        });
    }, [numberOfRows, multipliers, gameMode, canvasWidth, canvasHeight, containerSize, scaler, updateGravity]);

    return {
        engine,
        runner,
        isInitialized,
        pins,
        multipliersBodies,
        walls,
        cleanupPhysics,
        forceReinitialize
    };
};
