/**
 * Ball Physics Constants
 * Defines all ball-specific hardcoded values for physics and behavior
 */

export const BALL_CONSTANTS = {
    // Spawn Configuration
    SPAWN: {
        Y_POSITION: 30,
        SERVICE_Y_OFFSET: 10,
        MIN_SPAWN_INTERVAL: 0, // Will be set by caller
        RANDOM_OFFSET_RANGE: 4, // -2px to +2px
        RANDOM_OFFSET_MULTIPLIER: 0.5
    },

    // Physics Tweaks (already partially in ball-calculations.ts)
    PHYSICS_TWEAKS: {
        FRICTION_SERVICE: 0.1, // Different friction for service-guided balls
        SIZE_RATIO_BASE_DIAMETER: 18 // Used in calculations
    },

    // Size Constraints
    SIZE_CONSTRAINTS: {
        MIN_RADIUS: 2,
        MAX_ROWS: 50,
        MIN_ROWS: 1
    },

    // Default Values
    DEFAULTS: {
        BET_VALUE: 1,
        CIRCLE_RADIUS_FALLBACK: 5
    }
} as const;
