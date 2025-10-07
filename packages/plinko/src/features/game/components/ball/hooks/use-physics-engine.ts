import { useRef, useCallback, useEffect, useState } from 'react';
import { Body, Engine, Runner, World } from 'matter-js';
import { logger } from '../../../../../services/logger';
import {
    initializePhysicsEngine,
    setupCollisionDetection,
    addBodiesToWorld,
    startPhysicsRunner,
    updateCollisionDetection
} from '../physics';


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

    // Physics body creation is now handled by the modular BodyFactory


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

    // Collision handling is now delegated to the modular CollisionHandler

    // Setup collision detection using the modular CollisionHandler
    const setupLocalCollisionDetection = useCallback((engine: Engine) => {
        setupCollisionDetection(engine, removedBallsRef, { onBallHit });
    }, [onBallHit]);

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
            return;
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

            // Use the modular physics system to initialize everything
            const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];

            const physicsState = initializePhysicsEngine({
                numberOfRows,
                multipliers: effectiveMultipliers,
                gameMode,
                canvasWidth,
                canvasHeight,
                containerSize,
                onBallHit
            });

            // Store references
            engineRef.current = physicsState.engine;
            runnerRef.current = physicsState.runner;

            // Update state with created bodies
            setPins(physicsState.pins);
            setMultipliersBodies(physicsState.multipliersBodies);
            setWalls(physicsState.walls);

            // Start the physics runner
            if (physicsState.runner) {
                startPhysicsRunner(physicsState.runner, physicsState.engine);
            }

            // Add bodies to world and setup collision detection
            addBodiesToWorld(physicsState.engine, physicsState.pins, physicsState.multipliersBodies, physicsState.walls);
            setupLocalCollisionDetection(physicsState.engine);

            setIsInitialized(true);

            if (process.env.NODE_ENV === 'development') {
                logger.info('✅ [PHYSICS] Physics engine ready', {
                    pins: physicsState.pins.length,
                    multipliers: physicsState.multipliersBodies.length,
                    walls: physicsState.walls.length,
                    totalBodies: physicsState.pins.length + physicsState.multipliersBodies.length + physicsState.walls.length
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
            updateCollisionDetection(engineRef.current, removedBallsRef, { onBallHit });
        }
    }, [onBallHit, isInitialized]);

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
        setupCollisionDetection: setupLocalCollisionDetection
    };
};
