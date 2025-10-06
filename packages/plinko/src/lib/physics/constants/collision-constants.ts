/**
 * Collision Detection Constants
 * Defines all collision-related hardcoded values for ball interactions
 */

export const COLLISION_CONSTANTS = {
    // Deflection
    DEFLECTION: {
        DEFAULT_STRENGTH: 0.2,
        MIN_STRENGTH: 0.1,
        MAX_STRENGTH: 0.3,
        BASE_STRENGTH_DIVISOR: 5,
        RANDOM_FORCE_MIN: 0.75,
        RANDOM_FORCE_MAX: 1.25,
        RANDOM_FORCE_RANGE: 0.5
    },

    // Collision Timing
    TIMING: {
        LOG_THROTTLE_MS: 200
    },

    // Force Magnitudes
    FORCES: {
        SERVICE_GUIDANCE_FORCE: 0.25,
        SERVICE_GUIDANCE_VELOCITY: 1.5
    },

    // Probabilities
    PROBABILITIES: {
        DEFLECTION_DIRECTION: 0.5 // 50% chance left/right
    }
} as const;
