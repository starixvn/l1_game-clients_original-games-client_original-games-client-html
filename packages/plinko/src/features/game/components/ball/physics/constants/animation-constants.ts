/**
 * Animation Constants
 * Defines all animation-related hardcoded values for visual effects
 */

export const ANIMATION_CONSTANTS = {
    // Slot Bounce Animation
    SLOT_BOUNCE: {
        MIN_DISTANCE: 15,
        MAX_DISTANCE: 25, // 15 + 10
        DISTANCE_RANDOM_RANGE: 10,
        DURATION_MS: 300,
        SPRING_FACTOR_MULTIPLIER: 3,
        SPRING_FACTOR_BASE: 1
    },

    // Visual Effects Timing
    VISUAL_EFFECTS: {
        WIN_ANIMATION_DURATION: 2000,
        FLOAT_ANIMATION_OFFSET_Y: 30,
        SCALE_ANIMATION_MAX: 1.2,
        SCALE_ANIMATION_MIN: 0.8
    },

    // Logging Probabilities
    LOGGING: {
        FRAME_LOG_PROBABILITY: 0.001, // ~0.1% of frames
        BALL_RENDER_LOG_PROBABILITY: 0.002, // ~0.2% of frames
        RENDER_LOOP_LOG_PROBABILITY: 0.001 // ~0.1% of frames
    }
} as const;
