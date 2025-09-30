import { logger } from '../../services/logger';

/**
 * Physics Configuration for Plinko Ball Layout
 * Defines all physics-related constants and configuration
 */

logger.info('⚙️ [PHYSICS_CONFIG] Physics configuration module loaded');

export interface PhysicsConfig {
    pins: {
        startPins: number;
        pinSize: number;
        pinGap: number;
    };
    ball: {
        ballSize: number;
    };
    engine: {
        engineGravity: number;
    };
    world: {
        width: number;
        height: number;
    };
    colors: {
        background: string;
        ball: string;
        pin: string;
        multiplierHigh: string;
        multiplierMedium: string;
        multiplierLow: string;
        multiplierLoss: string;
    };
}

/**
 * Main physics configuration for the Plinko game
 */
export const physicsConfig: PhysicsConfig = {
    pins: {
        startPins: 3,
        pinSize: 2,
        pinGap: 20
    },
    ball: {
        ballSize: 8 // Base radius for 10 rows (dynamically scaled for other row counts)
    },
    engine: {
        engineGravity: 1.0
    },
    world: {
        width: 480,  // Matches payout display width: 9 slots × 50px min-width + 8 × 2px gaps = 466px, rounded up
        height: 400
    },
    colors: {
        background: '#1a1a2e',
        ball: '#ff6b6b',
        pin: '#F5DCFF',
        multiplierHigh: '#ffd700',
        multiplierMedium: '#ff6b6b',
        multiplierLow: '#4ecdc4',
        multiplierLoss: '#666'
    }
};

logger.info('⚙️ [PHYSICS_CONFIG] Main physics configuration created', {
    pins: {
        startPins: physicsConfig.pins.startPins,
        pinSize: physicsConfig.pins.pinSize,
        pinGap: physicsConfig.pins.pinGap
    },
    ball: {
        ballSize: physicsConfig.ball.ballSize
    },
    engine: {
        engineGravity: physicsConfig.engine.engineGravity
    },
    world: {
        width: physicsConfig.world.width,
        height: physicsConfig.world.height
    },
    colors: {
        background: physicsConfig.colors.background,
        ball: physicsConfig.colors.ball,
        pin: physicsConfig.colors.pin,
        multiplierHigh: physicsConfig.colors.multiplierHigh,
        multiplierMedium: physicsConfig.colors.multiplierMedium,
        multiplierLow: physicsConfig.colors.multiplierLow,
        multiplierLoss: physicsConfig.colors.multiplierLoss
    }
});

/**
 * Dynamic Ball Sizing Configuration
 * Adjusts ball size based on number of rows for optimal visual balance and gameplay
 */
export const ballSizingConfig = {
    baseRows: 10,           // Reference row count for base sizing
    baseDiameter: 16,       // Base ball diameter in pixels at baseRows (reduced for better proportions)
    minDiameter: 6,         // Minimum ball diameter to prevent invisibility
    maxDiameter: 28,        // Maximum ball diameter to prevent overcrowding
    sizeScaleFactor: 0.8    // Additional scaling factor for peg gap consideration
};

logger.info('⚙️ [PHYSICS_CONFIG] Ball sizing configuration created', {
    baseRows: ballSizingConfig.baseRows,
    baseDiameter: ballSizingConfig.baseDiameter,
    minDiameter: ballSizingConfig.minDiameter,
    maxDiameter: ballSizingConfig.maxDiameter,
    sizeScaleFactor: ballSizingConfig.sizeScaleFactor
});

logger.info('✅ [PHYSICS_CONFIG] Physics configuration module completed');
