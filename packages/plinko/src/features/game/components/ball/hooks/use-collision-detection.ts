import { useCallback } from 'react';
import { Engine } from 'matter-js';
import { logger } from '../../../../../services/logger';
import { setupCollisionDetection } from '../physics';
import { CollisionCooldownManager } from '../physics/collisions/collision-cooldown';

interface UseCollisionDetectionProps {
    onBallLanded?: (success: boolean) => void;
}

interface UseCollisionDetectionReturn {
    setupCollisions: (engine: Engine) => void;
}

/**
 * Custom hook for managing collision detection setup
 * Handles collision event registration and cleanup
 */
export const useCollisionDetection = ({
    onBallLanded
}: UseCollisionDetectionProps = {}): UseCollisionDetectionReturn => {

    // Setup collision detection for the physics engine
    const setupCollisions = useCallback((engine: Engine) => {
        logger.debug('🔧 [COLLISION] Setting up collision detection');

        // Create cooldown manager for collision handling
        const cooldownManager = new CollisionCooldownManager();

        // Setup collision detection using the modular system
        setupCollisionDetection(engine, cooldownManager, onBallLanded);

        logger.debug('✅ [COLLISION] Collision detection setup complete');
    }, [onBallLanded]);

    return {
        setupCollisions
    };
};
