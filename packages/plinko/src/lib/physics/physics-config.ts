
/**
 * Physics Configuration for Plinko Ball Layout
 * Defines all physics-related constants and configuration
 */

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
        ballSize: 12 // Base radius for 10 rows (dynamically scaled for other row counts)
    },
    engine: {
        engineGravity: 1.8
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

/**
 * Dynamic Ball Sizing Configuration
 * Adjusts ball size based on number of rows for optimal visual balance and gameplay
 */
export const ballSizingConfig = {
    baseRows: 10,           // Reference row count for base sizing
    baseDiameter: 18,       // INCREASED: Base ball diameter in pixels at baseRows (wider peg area allows larger balls for better collision)
    minDiameter: 7,         // INCREASED: Minimum ball diameter to prevent invisibility
    maxDiameter: 30,        // INCREASED: Maximum ball diameter to prevent overcrowding
    sizeScaleFactor: 0.9    // INCREASED: Additional scaling factor for peg gap consideration (wider peg area)
};
