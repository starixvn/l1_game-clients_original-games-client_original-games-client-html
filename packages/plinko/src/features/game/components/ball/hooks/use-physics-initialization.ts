import { useRef, useCallback } from 'react';
import { Engine, Runner, Composite } from 'matter-js';
import { logger } from '../../../../../services/logger';
import { initializePhysicsEngine, addBodiesToWorld, startPhysicsRunner } from '../physics';

interface UsePhysicsInitializationProps {
    canvasWidth: number;
    canvasHeight: number;
}

interface BodyCreationOptions {
    rows: number;
    multipliers: number[];
    gameMode: number;
    canvasWidth: number;
    canvasHeight: number;
}

interface UsePhysicsInitializationReturn {
    engine: React.MutableRefObject<Engine | null>;
    runner: React.MutableRefObject<Runner | null>;
    initializeEngineAndBodies: (
        bodyOptions: BodyCreationOptions,
        gravity: { x: number; y: number }
    ) => {
        pins: any[];
        multipliersBodies: any[];
        walls: any[];
    };
    cleanup: () => void;
}

/**
 * Custom hook for physics engine initialization and body management
 * Handles engine creation, body setup, and cleanup
 */
export const usePhysicsInitialization = ({
    canvasWidth,
    canvasHeight
}: UsePhysicsInitializationProps): UsePhysicsInitializationReturn => {
    const engineRef = useRef<Engine | null>(null);
    const runnerRef = useRef<Runner | null>(null);

    // Initialize physics engine with given configuration
    const initializeEngineAndBodies = useCallback((bodyOptions: BodyCreationOptions, gravity: { x: number; y: number }) => {
        logger.debug('🔧 [INIT] Initializing physics engine', {
            gravity,
            bodyOptions
        });

        // Initialize the physics engine with gravity config
        const physicsState = initializePhysicsEngine({
            gravity,
            enableSleeping: false,
            constraintIterations: 6,
            positionIterations: 8,
            velocityIterations: 10
        });

        // Store references
        engineRef.current = physicsState.engine;
        runnerRef.current = physicsState.runner;

        // Add bodies to the world
        addBodiesToWorld(physicsState.engine, bodyOptions);

        // Start the physics runner
        if (physicsState.runner) {
            startPhysicsRunner(physicsState.runner, physicsState.engine);
        }

        // Get body references
        const allBodies = Composite.allBodies(physicsState.engine.world);
        const pins = allBodies.filter(body => body.label?.startsWith('pin'));
        const multipliersBodies = allBodies.filter(body => body.label?.startsWith('multiplier'));
        const walls = allBodies.filter(body => body.label?.startsWith('wall'));

        logger.info('✅ [INIT] Physics engine initialized', {
            pins: pins.length,
            multipliers: multipliersBodies.length,
            walls: walls.length,
            totalBodies: pins.length + multipliersBodies.length + walls.length
        });

        return {
            pins,
            multipliersBodies,
            walls
        };
    }, []); // No dependencies since gravity is a parameter

    // Cleanup physics resources
    const cleanup = useCallback(() => {
        if (runnerRef.current) {
            Runner.stop(runnerRef.current);
            runnerRef.current = null;
        }
        if (engineRef.current) {
            Engine.clear(engineRef.current);
            engineRef.current = null;
        }
    }, []);

    return {
        engine: engineRef,
        runner: runnerRef,
        initializeEngineAndBodies,
        cleanup
    };
};
